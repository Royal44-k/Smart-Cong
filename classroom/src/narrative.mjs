import {pondReady} from './inquiry.mjs';
export const sequenceCards={config:'留存人员与器具配置',elephant:'象上船，等待稳定',mark:'在船舷记下水痕',replace:'换载，到同样吃水状态',weigh:'分批称量，逐批记录'};
export function blankNarrative(){return {prologue:null,scaleChecked:false,smallWeighed:[],poolWeights:0,poolPrediction:null,poolFree:false,referenceChoice:null,referenceAttempts:[],materialsTried:[],materialConfirmed:false,reviewChoice:null,sequence:[],classifications:{method:null,crew:null,number:null},sourceChecked:false,sourceAttempts:0};}
export function validSequence(v){return Array.isArray(v)&&['config,elephant,mark,replace,weigh','config,elephant,mark,weigh,replace'].includes(v.join(','));}
export function canLeave(s){const n=s.narrative;switch(s.phase){case 'prologue':return n.prologue==='capacity';case 'route-lab':return s.route==='scale'?n.scaleChecked:s.route==='split'&&n.smallWeighed.length===3;case 'observe':return pondReady(s);case 'reference':return n.referenceChoice==='hull';case 'materials':return n.materialConfirmed;case 'review':return n.reviewChoice!==null;case 'source':return n.sourceChecked&&validSequence(n.sequence)&&s.inquiry.transfer==='sameboat';default:return false;}}
export function act(s,type,value){const n=s.narrative;
 if(type==='prologue'&&s.phase==='prologue'&&['capacity','stronger'].includes(value)){n.prologue=value;return true;}
 if(type==='reference'&&s.phase==='reference'&&['shore','wave','hull'].includes(value)){n.referenceChoice=value;if(n.referenceAttempts.at(-1)!==value&&n.referenceAttempts.length<50)n.referenceAttempts.push(value);return true;}
 if(type==='review'&&s.phase==='review'&&['crew','ledger','float','method'].includes(value)){n.reviewChoice=value;return true;}
 if(s.phase==='source'){
  if(type==='sequence-add'&&Object.hasOwn(sequenceCards,value)&&!n.sequence.includes(value)){n.sequence.push(value);n.sourceChecked=false;return true;}
  if(type==='sequence-undo'){n.sequence.pop();n.sourceChecked=false;return true;}
  if(type==='source-check'){n.sourceAttempts=Math.min(100,n.sourceAttempts+1);n.sourceChecked=validSequence(n.sequence)&&s.inquiry.transfer==='sameboat';return true;}
 }
 return false;
}
export function validNarrative(n){
 const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x),bool=x=>typeof x==='boolean';
 const list=(x,allowed,max,unique=false)=>Array.isArray(x)&&x.length<=max&&x.every(v=>allowed.includes(v))&&(!unique||new Set(x).size===x.length);
 if(!obj(n)||!Object.keys(blankNarrative()).every(k=>Object.hasOwn(n,k)))return false;
 return [null,'capacity','stronger'].includes(n.prologue)&&bool(n.scaleChecked)&&list(n.smallWeighed,[0,1,2],3,true)&&Number.isInteger(n.poolWeights)&&n.poolWeights>=0&&n.poolWeights<=4&&[null,'lower','higher'].includes(n.poolPrediction)&&bool(n.poolFree)&&[null,'shore','wave','hull'].includes(n.referenceChoice)&&list(n.referenceAttempts,['shore','wave','hull'],50)&&list(n.materialsTried,['stone','bag','leak'],3,true)&&bool(n.materialConfirmed)&&[null,'crew','ledger','float','method'].includes(n.reviewChoice)&&list(n.sequence,Object.keys(sequenceCards),5,true)&&obj(n.classifications)&&['method','crew','number'].every(k=>[null,'source','simulation'].includes(n.classifications[k]))&&bool(n.sourceChecked)&&(!n.sourceChecked||validSequence(n.sequence))&&Number.isInteger(n.sourceAttempts)&&n.sourceAttempts>=0&&n.sourceAttempts<=100;
}
