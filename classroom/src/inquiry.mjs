export const ROLES={observer:'观察伙伴',recorder:'记筹伙伴',checker:'复核伙伴'};
export function blankInquiry(){return {role:'observer',hints:{},modelBlock:0,modelUnits:0,modelReadings:[false,false,false],support:2,scaleTrials:[],prediction:null,pondEvidence:[],trials:[],observation:null,material:'stone',materialChecks:{stone:0,bag:0,leak:0},weighed:[false,false,false,false,false],activeBatch:null,configFound:[],reportReason:null,transfer:null,feedback:''};}
const member=(v,a)=>a.includes(v),int=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
export function validInquiry(q){return !!q&&typeof q==='object'&&member(q.role,Object.keys(ROLES))&&q.hints&&Object.entries(q.hints).length<=20&&Object.entries(q.hints).every(([k,v])=>/^[a-z-]+$/.test(k)&&int(v,0,3))&&int(q.modelBlock,0,2)&&int(q.modelUnits,0,4)&&Array.isArray(q.modelReadings)&&q.modelReadings.length===3&&q.modelReadings.every(x=>typeof x==='boolean')&&int(q.support,1,4)&&Array.isArray(q.scaleTrials)&&q.scaleTrials.length<=20&&q.scaleTrials.every(x=>int(x,1,4))&&member(q.prediction,[null,'lower','higher'])&&Array.isArray(q.pondEvidence)&&q.pondEvidence.length<=5&&q.pondEvidence.every(v=>int(v,0,4))&&new Set(q.pondEvidence).size===q.pondEvidence.length&&Array.isArray(q.trials)&&q.trials.length<=30&&q.trials.every(t=>int(t.weight,0,4)&&typeof t.free==='boolean')&&member(q.observation,[null,'load','shape'])&&member(q.material,['stone','bag','leak'])&&q.materialChecks&&['stone','bag','leak'].every(k=>int(q.materialChecks[k],0,2))&&Array.isArray(q.weighed)&&q.weighed.length===5&&q.weighed.every(x=>typeof x==='boolean')&&member(q.activeBatch,[null,0,1,2,3,4])&&Array.isArray(q.configFound)&&q.configFound.length<=3&&q.configFound.every(x=>member(x,['crew','boat','tools']))&&member(q.reportReason,[null,'total','appearance'])&&member(q.transfer,[null,'sameboat','otherboat'])&&typeof q.feedback==='string'&&q.feedback.length<=400;}
export function pondReady(s){const q=s.inquiry;return q.prediction!==null&&q.pondEvidence.includes(3)&&q.pondEvidence.length>=2&&q.observation==='load'&&s.narrative.poolFree&&s.narrative.poolWeights===3;}
export function inquire(s,type,v){const q=s.inquiry,n=s.narrative;if(!q)return false;q.feedback='';
 if(type==='role'&&s.phase==='start'&&Object.hasOwn(ROLES,v)){q.role=v;return true;}
 if(type==='hint'){q.hints[s.phase]=Math.min(3,(q.hints[s.phase]||0)+1);return true;}
 if(s.phase==='route-lab'){
  if(type==='model-select'&&int(v,0,2)){q.modelBlock=v;q.modelUnits=0;return true;}
  if(type==='model-add'||type==='model-remove'){q.modelUnits=Math.max(0,Math.min(4,q.modelUnits+(type==='model-add'?1:-1)));return true;}
  if(type==='model-read'){if(q.modelUnits===q.modelBlock+1){q.modelReadings[q.modelBlock]=true;n.smallWeighed=[0,1,2].filter(i=>q.modelReadings[i]);q.feedback='平衡了！这块木块的称量结果已留在观察册。';}else q.feedback='天平还倾着。比较两边高低，再调整砝码。';return true;}
  if(type==='support'&&int(v,1,4)){q.support=v;return true;}
  if(type==='support-test'){if(q.scaleTrials.length>=20)q.scaleTrials.shift();q.scaleTrials.push(q.support);n.scaleChecked=n.scaleChecked||q.scaleTrials.some(x=>x<3)&&q.scaleTrials.some(x=>x>=3);q.feedback=q.support<3?'支撑不足，红线提醒暂停。模型由安全托架接住。':'支撑足够，模型通过了这一项检验。真的大秤还要检验材料、量程和场地。';return true;}
 }
 if(s.phase==='observe'){
  if(type==='predict'&&member(v,['lower','higher'])&&q.prediction===null){q.prediction=v;n.poolPrediction=v;return true;}
  if(type==='pond-add'||type==='pond-remove'){if(q.prediction===null)return false;n.poolWeights=Math.max(0,Math.min(4,n.poolWeights+(type==='pond-add'?1:-1)));return true;}
  if(type==='pond-depth'){n.poolFree=!n.poolFree;return true;}
  if(type==='pond-sample'&&q.prediction!==null){const t={weight:n.poolWeights,free:n.poolFree};if(q.trials.length>=30)q.trials.shift();q.trials.push(t);if(t.free&&!q.pondEvidence.includes(t.weight))q.pondEvidence.push(t.weight);q.feedback=t.free?'这一刻已记下。试试另一种载荷，比较两条记录。':'记下了触底现象：船底受到支撑，这一条不能拿来比较自由漂浮的状态。';return true;}
  if(type==='observation'&&member(v,['load','shape'])){q.observation=v;q.feedback=v==='load'?'船的载荷改变了吃水。请把船调回金线与水面相合的状态。':'先看同一艘船：它的形状没变，变的是船里装了多少。';return true;}
 }
 if(s.phase==='materials'){
  if(type==='material-select'&&member(v,['stone','bag','leak'])){q.material=v;n.materialConfirmed=false;return true;}
  if(type==='material-check'){q.materialChecks[q.material]=Math.min(2,q.materialChecks[q.material]+1);if(!n.materialsTried.includes(q.material))n.materialsTried.push(q.material);return true;}
  if(type==='material-use'){n.materialConfirmed=q.materialChecks[q.material]===2&&q.material!=='leak';if(n.materialConfirmed){s.substitute=q.material;q.feedback='两次称量相同。带着它去换载！';}else q.feedback=q.materialChecks[q.material]<2?'再称一次，看看放一会儿会不会变轻。':'前后称量变了，换载期间不能保持这份质量。可以换一种材料再试。';return true;}
 }
 if(['mark','load'].includes(s.phase)&&type==='condition'&&member(v,['wait','balance','deep','wave','tilt','shallow'])){const change={wait:['calm',true],balance:['balanced',true],deep:['free',true],wave:['calm',false],tilt:['balanced',false],shallow:['free',false]}[v];s[change[0]]=change[1];q.feedback={wait:'风停了，水面平静了，可以看水线了。',balance:'石头放匀了，船身不再歪斜。',deep:'船到了深水处，船底不再碰到河床。',wave:'小波浪经过。现在读到的瞬间高度会变。',tilt:'载荷偏向一侧，船身倾斜了。',shallow:'船进入浅处，河床开始托住船底。'}[v];s.claimedMass=null;return true;}
 if(s.phase==='load'&&type==='config-find'&&member(v,['crew','boat','tools'])){if(!q.configFound.includes(v))q.configFound.push(v);q.feedback=v==='crew'?'你发现了阿舟的位置变化！可以请他回到船上，也可以在计算时减去他那一份重量。':'这一项与留线时相同。再找找谁的位置变了。';return true;}
 if(s.phase==='ledger'&&type==='weigh-batch'&&int(v,0,4)&&s.cargo[v]){q.weighed[v]=true;q.activeBatch=v;q.feedback='这一批称好了。把结果写到记录表里，再看看有没有漏记。';return true;}
 if(s.phase==='report'&&type==='reason'&&member(v,['total','appearance'])){q.reportReason=v;return true;}
 if(s.phase==='source'&&type==='transfer'&&member(v,['sameboat','otherboat'])){q.transfer=v;n.sourceChecked=false;return true;}
 return false;
}
