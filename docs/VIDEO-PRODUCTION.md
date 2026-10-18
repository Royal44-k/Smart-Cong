# 视频制作资产入口

当前以19个镜头任务组织外部视频制作。主线先选故事或实验；影片在互动前停住，页面承接学生操作，不能让视频代答或固定显示成功。

1. 阅读[导演剧本与生产手册](../classroom/docs/13-director-production-bible.md)：两版路线、角色衣着、轴线、道具、数量、入场与接出。
2. 查看[采用图清单](../classroom/media/catalog.json)与[美术规范](../classroom/docs/08-art-direction.md)；以采用图为准，不误用历史候选。
3. 使用[镜头JSON](../classroom/media/shots.json)、[视频任务CSV](../classroom/media/video-task-list.csv)和[对白CSV](../classroom/media/voiceover.csv)组织生产。
4. 试听[19段朗读及38逐句源音频清单](../classroom/media/audio/manifest.json)，配合[字幕目录](../classroom/media/captions/)。
5. 对照[互动场记](../classroom/media/peer-challenge-scenes.json)及[当前出题玩法制作稿](../classroom/docs/40-peer-challenge-production-v18.md)，不要把学生的实际答案、图注或成功反应烧入影片。
6. 回片后填写[回片验收表](../classroom/media/receipts-template.csv)，按[图生视频交接](../classroom/docs/09-image-to-video-handoff.md)校准声音字幕，并设置[classroom/src/media.mjs](../classroom/src/media.mjs)中的video路径。

## 路线

- 故事：C-V01 → C-V03 → C-V05 → C-V07 → C-V08 → C-V10 → 相应C-VE1/2/3/4 → C-V11 → 故事书、放映与可选藏图。
- 实验：C-L01 → C-L02 → C-V05 → C-V07 → C-V08 → C-V10 → 相应C-VE1/2/3/4 → C-L03 → 实验报告、研究展示与可选出题。
- 其余共用镜头保留为旧路线或补充探究素材。最新modeBindings与镜卡为执行依据。

影片不是本次上传新增的内容：classroom/media/video/保留接入说明，现有画面、声音与互动可独立使用。
