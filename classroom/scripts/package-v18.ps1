param([string]$OutputPath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (-not $OutputPath) { $OutputPath = Join-Path (Split-Path $taskRoot -Parent) '曹冲称象-一线之差-课堂交付版-v1.8.zip' }
$taskOutput = [IO.Path]::GetFullPath($OutputPath)
if (Test-Path -LiteralPath $taskOutput) { throw '输出文件已存在。请选择新文件名，以保留现有交付包。' }
$taskManifest = Get-Content -LiteralPath (Join-Path $taskRoot 'DELIVERY-MANIFEST.json') -Raw | ConvertFrom-Json
$taskNames = [IO.File]::ReadAllLines((Join-Path $taskRoot 'delivery-files.txt'))
$taskZip = [IO.Compression.ZipFile]::Open($taskOutput, [IO.Compression.ZipArchiveMode]::Create)
try {
 foreach ($taskName in $taskNames) {
  if (-not $taskName) { continue }
  $taskSource = [IO.Path]::GetFullPath((Join-Path $taskRoot $taskName))
  if (-not $taskSource.StartsWith($taskRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw '清单路径越出项目目录' }
  [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskZip, $taskSource, $taskName.Replace('\','/'), [IO.Compression.CompressionLevel]::Optimal) | Out-Null
 }
} finally { $taskZip.Dispose() }
$taskRead = [IO.Compression.ZipFile]::OpenRead($taskOutput)
try {
 if ($taskRead.Entries.Count -ne ($taskManifest.files.Count + 1)) { throw '压缩包条目数量不匹配' }
 foreach ($taskFile in $taskManifest.files) {
  $taskEntry = $taskRead.GetEntry($taskFile.path)
  if (-not $taskEntry) { throw ('压缩包缺少：' + $taskFile.path) }
  $taskStream = $taskEntry.Open()
  try { $taskHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($taskStream)).ToLowerInvariant() } finally { $taskStream.Dispose() }
  if ($taskHash -ne $taskFile.sha256 -or $taskEntry.Length -ne $taskFile.bytes) { throw ('文件校验失败：' + $taskFile.path) }
 }
 $taskEntries = $taskRead.Entries.Count
} finally { $taskRead.Dispose() }
$taskResult = [ordered]@{ version='1.8.0'; file=$taskOutput; entries=$taskEntries; verifiedFiles=$taskManifest.files.Count; bytes=(Get-Item -LiteralPath $taskOutput).Length; sha256=(Get-FileHash -LiteralPath $taskOutput -Algorithm SHA256).Hash.ToLowerInvariant(); allPassed=$true }
$taskResult | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskRoot 'artifacts/package-v18.json') -Encoding utf8
$taskResult | ConvertTo-Json
