# Smart-Cong · 曹冲称象：一线之差

《曹冲称象》AI 影游教学项目，当前正式版本 **v1.8.0**。本仓库按最新版整理完整代码、剧本、课程资料、美术、声音字幕、视频前期、制作工具和验收文件。整理日期：2026-10-18。

![河畔来客](classroom/media/artwork/CC-HARBOR-v002.png)

[下载 v1.8 课堂包](https://github.com/Royal44-k/Smart-Cong/releases/tag/v1.8) · [全部资产导航](docs/ASSET-GUIDE.md) · [视频制作入口](docs/VIDEO-PRODUCTION.md) · [完整清单](catalog/asset-manifest.csv)

## 两种学习经历

| |故事版 · 二至三年级|实验版 · 四至六年级|
|---|---|---|
|学生身份|曹冲的小帮手|小小研究员|
|学习方式|看变化、动手称象、按顺序讲述|提问题、做 A/B 试验、核对条件、修订结论|
|学习成果|四格故事书、看图放映、同桌补图与解释|实际试验记录、书箱迁移、研究展示与同桌出题|
|伙伴|小曹冲|小象|

包含选择、连线、拖曳、拼图、图上留线、实验修理、重量尺、作品展示和同桌出题。反馈随真实操作变化，支持键盘、触摸、暂停动态及按需朗读。四种结尾由实际选择和执行条件决定。

## 运行

需要 Node.js 24 或以上；课堂应用无需安装第三方依赖。

```sh
git clone https://github.com/Royal44-k/Smart-Cong.git
cd Smart-Cong
npm start
```

打开 http://127.0.0.1:4184/ 。Windows 也可以双击 [启动体验.cmd](classroom/启动体验.cmd)。下载课堂 ZIP 后，解压并运行其中的同名文件。

AI 问答可按[接口配置](classroom/docs/21-companion-api.md)设置 classroom/.env；本地互动和伙伴提示可以直接使用。当前视频位置配有静帧与朗读，影片由外部工具制作后接入。

## 资产入口

|用途|文件|
|---|---|
|项目要求与版本范围|[项目说明](docs/PROJECT-BRIEF.md)|
|课堂使用|[课堂说明](classroom/README.md)、[教师手册](classroom/docs/04-teaching-and-acceptance.md)|
|剧情、分支与教学差异|[分支剧本](classroom/docs/02-branching-script.md)、[两版设计](classroom/docs/17-mode-redesign.md)|
|拍摄与视频生产|[导演手册](classroom/docs/13-director-production-bible.md)、[镜头卡](classroom/media/shots.json)、[视频任务表](classroom/media/video-task-list.csv)|
|图片和声音|[采用图清单](classroom/media/catalog.json)、[图片图集](classroom/media/gallery.html)、[音频清单](classroom/media/audio/manifest.json)|
|研究依据|[研究索引](classroom/docs/01-research.md)、[分层教学研究](classroom/docs/16-mode-pedagogy-research.md)|
|验收与维护|[v1.8 验收](classroom/docs/41-acceptance-v18.md)、[设计验收](classroom/design-qa.md)、[复验方法](VERIFYING.md)|
|全量盘点|[JSON](catalog/asset-manifest.json)、[CSV](catalog/asset-manifest.csv)、[SHA256](catalog/SHA256SUMS)|
|正式版本包|[v1.8 下载与校验](releases/README.md)|

采用资源包括 **17 张场景与角色参考图、2 张透明伙伴表情图、1 张六物品图集、19 镜制作卡、38 句对白、19 段合并朗读、38 段逐句源音频和 19 份 VTT 字幕**。图集、试听和学习单需启动本地服务后使用，GitHub 预览 HTML 时显示源码。

## 目录

```text
classroom/       最新 v1.8 可运行项目，保留原始文件内容与相对路径
  src/ server/   教学状态、互动、伙伴和模型接口
  media/         采用图、表情、声音、字幕及视频生产数据
  docs/          剧本、研究、教学和生产手册
  scripts/       制作、校验与打包工具
  tests/         测试和最新版交付中保留的验证证据
  artifacts/     验收记录及课程研究原件
docs/            本次项目总览与资产使用导航
catalog/         来源、用途、字节数和 SHA256 清单
releases/        最新正式课堂包下载说明
scripts/         全库资产校验
```

收录范围以 v1.8 正式交付清单为基础，补入复用打包所需的 delivery-files.txt 和 15 份课程研究原件。部分制作文件沿用其创建时的版本编号，仍服务当前功能；不发布旧版本安装包或弃用候选图。影片生成由外部工具完成。
