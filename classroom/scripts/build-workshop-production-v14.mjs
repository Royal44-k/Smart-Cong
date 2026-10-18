import fs from'node:fs';import{storyPages}from'../src/workshop-views.mjs';import{repairCases}from'../src/workshop-state.mjs';import{media}from'../src/media.mjs';
const shots=JSON.parse(fs.readFileSync('media/shots.json','utf8'));
for(const s of shots){
 if(s.id==='C-V11'){s.exit='点选或拖入四张图卡，按顺序重排并选好动作词，进入自己的小书；可逐页翻看、口头讲述或自写160字以内图注，参考讲法与自己的话分开。';s.next='故事 reflect：逐页讲述、自写图注、同桌追问、打印或导出';s.interactionRevision='1.4';}
 if(s.id==='C-L02'){s.exit=s.exit.replace('可选找变化小游戏不替代正式实验。','可选找变化和实验修理铺不替代正式实验；修理固定A、动手调B、核对实际条件并说明理由，3组练习单独保存。');s.interactionRevision='1.4';}
}
fs.writeFileSync('media/shots.json',JSON.stringify(shots,null,2)+'\n');
const result={version:'1.4',type:'interface-workshops',newVideoShots:0,story:{phase:'reflect',entryShot:'C-V11',required:false,captionLimit:160,privacy:'学生图注仅保存在本机记录和主动下载文件，不进入模型上下文或固定对白',pages:storyPages.map((p,i)=>({id:'W-S'+(i+1),...p,imageKey:p.image,imageFile:media[p.image].image,sourceShot:media[p.image].shot,render:'still-only'}))},repair:{phases:['observe','load'],entryShot:'C-L02',required:false,formalExperiment:'不修改正式A/B、原猜想、结论或结局',cases:repairCases.map((c,i)=>({id:'W-L'+(i+1),...c,render:'实时教学图，沿用已有miniBoat',gate:'研究项不同；无关项相同；非触底题均自由漂浮；理由为只改研究项'}))}};
fs.writeFileSync('media/workshop-scenes.json',JSON.stringify(result,null,2)+'\n');console.log('v1.4: four story pages and three optional repair cases linked to existing shots.');
