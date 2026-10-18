import {blankLearning,activeLearning,labReady} from './learning-state.mjs';
import {blankInquiry} from './inquiry.mjs';
import {blankNarrative} from './narrative.mjs';
export const BATCHES = [450,600,750,900,60];
export const PHASES = ['start','prologue','idea','route-lab','observe','reference','mark','materials','load','ledger','review','report','ending','source','reflect'];
export const ISSUE_TEXT = {
 experiment:'还没有完成两次可以比较的试验，或没有说明观察到的变化。',
 reason:'请再解释：水线帮助我们比较的是同一艘船前后的总载荷，物品外形不能代替称量。',
 reference:'还没有记录大象上船时的水线。',
 aligned:'换载后还没有回到记录的水线。请调整船上总载荷。',
 calm:'水面尚未平稳，不能把浪峰当作读数。',
 balanced:'船倾斜了。单侧碰线不能代表姿态相同。',
 free:'船受到托举或触底，当前不是自由漂浮。',
 crew:'阿舟第一次在船上、第二次不在。需要恢复人员，或把差额计入比较。',
 ledger:'账页与实际装载不一致：有漏记、重复，或记下了未上船的物品。',
 answer:'这份结论还不能由当前记录支持，请检查合计与人员差额。'
};
export function createState(mode='story') {
 return {version:3,learning:blankLearning(),inquiry:blankInquiry(),journey:'full',narrative:blankNarrative(),mode:mode==='lab'?'lab':'story',phase:'start',route:null,
 referenceCaptured:false,crewPresent:false,cargo:[false,false,false,false,false],counts:[0,0,0,0,0],
 calm:true,balanced:true,free:true,accountCrew:false,claimedMass:null,substitute:'stone',
 drafts:[],firstEnding:null,ending:null,reflections:['','',''],trail:[],sound:false};
}
export function measurements(s) {
 const cargoMass=BATCHES.reduce((n,m,i)=>n+(s.cargo[i]?m:0),0);
 const recordedMass=BATCHES.reduce((n,m,i)=>n+m*s.counts[i],0);
 const total=1000+cargoMass+(s.crewPresent?60:0);
 return {cargoMass,recordedMass,total,difference:total-3760,aligned:total===3760,
 corrected:recordedMass+(s.crewPresent?60:0)-60};
}
export function issues(s) {
 const m=measurements(s), out=[];
 if(activeLearning(s)&&s.mode==='lab'&&s.phase!=='start'&&!labReady(s.learning))out.push('experiment');
 if(!s.referenceCaptured)out.push('reference');
 if(!m.aligned)out.push('aligned');
 for(const k of ['calm','balanced','free'])if(!s[k])out.push(k);
 if(!s.crewPresent&&!s.accountCrew)out.push('crew');
 if(s.cargo.some((v,i)=>s.counts[i]!==Number(v)))out.push('ledger');
 if(!Number.isFinite(s.claimedMass)||s.claimedMass!==2700||s.claimedMass!==(s.accountCrew?m.corrected:m.recordedMass))out.push('answer');
 if(s.inquiry?.reportReason==='appearance')out.push('reason');
 return out;
}
export function saveDraft(s) {
 const snapshot={at:new Date().toISOString(),claimedMass:s.claimedMass,cargo:[...s.cargo],counts:[...s.counts],crewPresent:s.crewPresent,accountCrew:s.accountCrew,issues:issues(s)};
 if(s.drafts.length>=100)s.drafts.shift();
 s.drafts.push(snapshot);return snapshot;
}
export function resolveEnding(s,confirmed) {
 if(!confirmed)return 'E3';
 if(issues(s).length)return 'E4';
 return s.drafts.some(d=>d.issues.length)?'E2':'E1';
}


