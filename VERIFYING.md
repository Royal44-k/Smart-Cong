# 复验与维护

在仓库根目录执行：

```sh
npm run verify
npm test
```

verify 核对全部源资产的字节数和 SHA256、原 v1.8 交付清单以及本次导航的本地链接。test 在此基础上运行课堂单元测试。学生运行和单元测试都无需第三方依赖。

下载 [v1.8 正式课堂包](releases/README.md) 后，按 [版本清单](catalog/release-manifest.json) 核对 SHA256。GitHub 自动生成的 Source code 是仓库快照，正式课堂包请选附带的 caochong-waterline-v1.8.zip。

远端文件、v1.8 发布包及 SHA256 附件的核对结果见[上传回执](catalog/publication.json)。

## 浏览器验证

完整浏览器测试需 Microsoft Edge 和 Playwright 1.63.0。先启动本仓库应用，再运行：

```sh
npm install --no-save playwright@1.63.0
npm start
```

另开终端：

```sh
cd classroom
npm run test:browser
```

测试默认连接 127.0.0.1:4184。请确保该端口对应本仓库应用。原 v1.8 完整浏览器验收和本次上传复验分别记录于[正式验收](classroom/docs/41-acceptance-v18.md)和[本次验证记录](catalog/archive-validation.json)。

## 配置与生产

模型密钥配置在 classroom/.env；公开模板为 classroom/.env.example。根目录 npm start 会加载配置文件（如果存在）。本地教学与伙伴提示无需模型。

打包脚本读取 classroom/delivery-files.txt，与原交付清单一起保留。再次打包应指定新输出名，避免覆盖原始正式包。视频接入见[制作导航](docs/VIDEO-PRODUCTION.md)。
