param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))
$resolvedProject = (Resolve-Path -LiteralPath $ProjectRoot).Path
$shots = Get-Content -LiteralPath (Join-Path $resolvedProject 'media\shots.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$linesDir = Join-Path $resolvedProject 'media\audio\lines'
New-Item -ItemType Directory -Path $linesDir -Force | Out-Null
Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050,[System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,[System.Speech.AudioFormat.AudioChannel]::Mono)
try {
 foreach ($shot in $shots) {
  for ($i=0; $i -lt $shot.voice.Count; $i++) {
   $dialogue = [string]$shot.voice[$i]
   $voiceName = if ($dialogue -match '^(曹冲|新伙伴)：') { 'Microsoft Yaoyao' } else { 'Microsoft Kangkang' }
   $speaker.SelectVoice($voiceName)
   $speaker.Rate = -1
   $speaker.SetOutputToWaveFile((Join-Path $linesDir ($shot.id + '-' + ($i+1) + '.wav')),$format)
   $speaker.Speak(($dialogue -split '：',2)[1])
   $speaker.SetOutputToNull()
  }
 }
} finally { $speaker.Dispose() }
Write-Output '逐句音频已生成。请在项目目录依次运行 node scripts/build-audio.mjs 和 node scripts/build-classroom-production.mjs，再检查字幕和音轨。'
