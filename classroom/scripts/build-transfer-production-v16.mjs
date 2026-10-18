import fs from'node:fs';
const shots=JSON.parse(fs.readFileSync('media/shots.json','utf8'));
for(const s of shots){
 if(s.id==='C-V07'){s.exit='点选或拖曳石堆装船，再点可卸下。故事可在相同机位切换第一次留线与这一次船况：只回看，不改变当前装载。装石头或请阿舟上下船后回到当前画面；找出阿舟不自动搬人。水线相同仍要核对人物，重复拖入不卸货。实验沿用核载与差额解释。';s.interactionRevision='1.6';}
 if(s.id==='C-L03'){s.exit='配对两栏同一艘船，辨认320克砝码替代书箱和20克工具。可自选展开重量尺，把320克分成工具与书箱两份，按10克调节、核对或重置；这是账面分配，实际船况不变。重量尺不自动填写答案、不设新门槛。学生自行输入重量并说明减去工具的理由，记录保留是否使用试分及核对状态。';s.interactionRevision='1.6';}
}
fs.writeFileSync('media/shots.json',JSON.stringify(shots,null,2)+'\n');
const spec={version:'1.6',newVideoShots:0,story:{phase:'load',shot:'C-V07',imageFile:'artwork/CC-UNLOADED-v001.png',referenceShot:'C-V05',referenceImage:'artwork/CC-BOARDING-v002.png',reference:'同一船与岸坐标，大象及阿舟在船上，平稳自由浮着，金线齐水面；固定不随当前操作改变',current:'取实时cargo与crewPresent，现有模型给出水线',switch:'第一次/这一次原位切换，按钮、键盘等效；动货物或人回当前视图',handoff:'影片停于空船与阿舟在右岸；回看是界面图，不重播上岸剧情；图片、参考图和动态图分工明确',completion:'沿用水线相合进入称重、结尾核对全条件，不追加回看门槛'},lab:{phase:'source',shot:'C-L03',imageFile:'artwork/CC-BOOK-TRIAL-v001.png',objectAtlas:'learning/CC-OBJECTS-v002.png',objects:'书箱、短铅笔和两块木楔合计20克、砝码共320克、同一小船',scaffold:'配对同船并选全书箱与工具后，可选展开重量尺；工具0..320克步10，书箱=320-工具；合计固定320',input:['原生拖尺','触摸推尺','加减10克按钮','方向键/Home/End'],judgement:'手动核对仅判试分工具是否20克；修改与重置撤销旧肯定，学生数值不代填',scope:'计算表征，不改变题设实物及水线，不在影片中烧录条形图或答案',feedback:'空白、320、340、其他数值分别提示下一步检查；保留输入',completion:'沿用同船配对、书箱与工具组、300克及减去20克理由；重量尺可跳过',record:'只记录使用过的试分，区分未核对、未对上、已对上；不称为独立掌握'},compatibility:{learningRevision:'5→6',storageKey:'caochong-waterline-v1',oldProgress:'保留猜想、记录、图注、首次结局和原数值；新增状态从空白开始'},assets:'沿用17场景图、2透明伙伴表情、6物品图集、19段朗读和38句对白；无新增视频任务'};
fs.writeFileSync('media/transfer-bridge-scenes.json',JSON.stringify(spec,null,2)+'\n');
console.log('v1.6 interaction handoffs synchronized: C-V07 + C-L03.');
