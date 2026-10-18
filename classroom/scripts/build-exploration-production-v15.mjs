import fs from'node:fs';
const shots=JSON.parse(fs.readFileSync('media/shots.json','utf8'));
for(const s of shots){
 if(s.id==='C-V05'){s.exit='故事：在图上点选或划线选择岸柱、浪花、船身；也可用下方按钮和键盘。按所选物体给出反馈，船身记号由界面沿水面呈现，不按笔迹打分；选船身并继续才记录参考状态。实验：等水稳、摆匀、移深，三条件满足才留线。';s.interactionRevision='1.5';}
 if(s.id==='C-L02'){s.exit='在操作桌摆放小船，分别记入A/B；可照任一栏摆回，仅改变当前小船，已存两次记录与推理不变。步骤导航依据实际记录定位，不自动答题。推拉比较窗或分别看两栏，判断从A到B的船位变化，再按题意对照最初猜想，最后说明比较条件。覆盖记录会撤销旧观察与结论。找变化和三组实验修理为独立可选练习。';s.interactionRevision='1.5';}
}
fs.writeFileSync('media/shots.json',JSON.stringify(shots,null,2)+'\n');
const spec={version:'1.5',newVideoShots:0,story:{phase:'mark',shot:'C-V05',imageFile:'artwork/CC-BOARDING-v002.png',inputs:['图上轻点','自由划线','键盘选择','原有文字按钮'],choices:['shore','wave','hull'],judgement:'判断记号所依附的物体；精确水面高度由界面表达，本轮不另设高度测试',stroke:'选择起笔物体；松开时仍在画布内即完成表达，不按轨迹平直度、长度或速度判分',cancel:['Esc','pointercancel','画布外松开','第二根手指无论落点','失去窗口焦点'],progress:'line=hull且主动继续，才记录参考并进入load',video:'留线前停止；金线与笔迹不烧录视频'},lab:{phase:'observe',shot:'C-L02',imageFile:'artwork/CC-STUDY-v003.png',steps:['摆试验','比记录','说发现'],navigation:'只定位和转移焦点，不改变学习数据',restore:'复制所选A/B的weight、crew、free到当前小船，不改samples、hypothesis、finding、reasoning或ending',sample:'主动记入后才覆盖，依原规则清空过期观察及结论',recordOrder:'A或B均可先记录',video:'交出空船操作桌；实际载荷、A/B数据、动态反馈由界面绘制'},assets:'复用17张采用场景、2张透明伙伴表情和学习物品图集',audio:'沿用19段朗读及38句对白；C-L02先A后B是建议顺序，不作为软件门槛'};
fs.writeFileSync('media/exploration-scenes.json',JSON.stringify(spec,null,2)+'\n');console.log('v1.5 interaction handoffs synchronized: C-V05 + C-L02.');
