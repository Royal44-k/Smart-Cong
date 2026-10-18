# 最新版资产导航

当前版本为 v1.8.0。完整清单见 [CSV](../catalog/asset-manifest.csv)、[JSON](../catalog/asset-manifest.json)，每份文件登记原路径、用途、大小和 SHA256。

|工作内容|主要入口|
|---|---|
|教师备课与课堂使用|[课堂说明](../classroom/README.md)、[教师手册](../classroom/docs/04-teaching-and-acceptance.md)、[两版教学研究](../classroom/docs/16-mode-pedagogy-research.md)|
|编剧与交互设计|[分支剧本](../classroom/docs/02-branching-script.md)、[模式设计](../classroom/docs/17-mode-redesign.md)、[v1.8 互动制作稿](../classroom/docs/40-peer-challenge-production-v18.md)|
|美术与角色一致性|[美术规范](../classroom/docs/08-art-direction.md)、[采用清单](../classroom/media/catalog.json)、[伙伴表情](../classroom/media/companions/catalog.json)、[六物品图集](../classroom/media/learning/gallery.html)|
|视频生产|[视频入口](VIDEO-PRODUCTION.md)、[导演手册](../classroom/docs/13-director-production-bible.md)、[镜头卡](../classroom/media/shots.json)、[任务表](../classroom/media/video-task-list.csv)|
|配音与字幕|[对白](../classroom/media/voiceover.csv)、[声音清单](../classroom/media/audio/manifest.json)、[字幕](../classroom/media/captions/)|
|应用与模型接口|[源码](../classroom/src/)、[服务入口](../classroom/server.mjs)、[伙伴接口配置](../classroom/docs/21-companion-api.md)|
|测试与交付|[测试](../classroom/tests/)、[v1.8 验收](../classroom/docs/41-acceptance-v18.md)、[原始交付清单](../classroom/DELIVERY-MANIFEST.json)、[复验方法](../VERIFYING.md)|

## 资源使用顺序

1. 以当前剧本、模式路线和互动状态为依据，确定镜头在什么操作前后播放。
2. 从采用清单取场景和角色图，保持服装、道具、站位、水线与人员状态一致。
3. 用镜卡、对白、字幕和互动场记制作视频；学生自己的文字、答案和实际结果留给网页呈现。
4. 按回片表核验，再接入媒体配置。原应用已有静帧、朗读和完整互动。

## 研究与版本编号

15 份课程研究原件保存在 [artifacts](../classroom/artifacts/) 中，以 research- 开头；来源与页码见[分层研究](../classroom/docs/16-mode-pedagogy-research.md)。

文件名的 v13、v14 等记录该功能或资料的形成阶段。只要它仍被 v1.8 正式交付采用，就继续保留。当前使用名单由 media/catalog.json、生产数据和 DELIVERY-MANIFEST.json 确定。

最新版原始课堂 ZIP 有 667 项；仓库另有打包输入清单、研究原件及本次导航文件，体积与文件数因此不同。
