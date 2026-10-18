import {benchLevel,comparePair} from './learning-state.mjs';
import {measurements} from './engine.mjs';
export const directionText={lower:'B栏的船沉得更深',higher:'B栏的船浮得更高',same:'两栏的船一样高'};
export const hypothesisText={lower:'会沉得更深',higher:'会浮得更高',same:'位置不会变'};
export function blankReasoning(required=true){return{required,evidence:[],observation:null,reflection:null,boats:[],group:null,message:'',mood:'idle'};}
export function validReasoning(r){const list=(a,values,max)=>Array.isArray(a)&&a.length<=max&&new Set(a).size===a.length&&a.every(x=>values.includes(x));return !!r&&typeof r.required==='boolean'&&list(r.evidence,['boat','line','people'],3)&&[null,'lower','higher','same'].includes(r.observation)&&[null,'agree','revise'].includes(r.reflection)&&list(r.boats,['A','B'],2)&&[null,'box','box-tool'].includes(r.group)&&typeof r.message==='string'&&r.message.length<=500&&['idle','happy','thinking','encourage'].includes(r.mood);}
export function observationOf(l){if(!comparePair(l).valid)return null;const d=benchLevel(l.lab.samples.B)-benchLevel(l.lab.samples.A);return Math.abs(d)<.01?'same':d>0?'lower':'higher';}
export function canonicalDirection(l){return comparePair(l).valid?(l.lab.question==='bottom'?'higher':'lower'):null;}
export const reflectionOf=l=>canonicalDirection(l)===l.lab.hypothesis?'agree':'revise';
export const reasoningReady=l=>!l.reasoning.required||(observationOf(l)!==null&&l.reasoning.observation===observationOf(l)&&l.reasoning.reflection===reflectionOf(l));
export const storyEvidenceReady=l=>!l.reasoning.required||['boat','line','people'].every(k=>l.reasoning.evidence.includes(k));
export const transferReady=l=>!l.reasoning.required||(l.reasoning.boats.length===2&&l.reasoning.group==='box-tool');
export function resetLabReasoning(l){l.reasoning.observation=null;l.reasoning.reflection=null;l.reasoning.message='';l.reasoning.mood='idle';}
export function reasoningAction(s,type,value){if(!s.learning?.enabled||s.journey!=='full')return false;const l=s.learning,r=l.reasoning;const say=(text,mood='thinking')=>{r.message=text;r.mood=mood;l.message='';};
 if(s.mode==='story'&&s.phase==='report'&&type==='evidence'){
  if(!['boat','line','people','shape'].includes(value))return false;
  if(value==='shape'){say('石头堆得像大象，也不一定一样重。找找小船和记号给的线索。','encourage');return true;}
  if(!r.evidence.includes(value))r.evidence.push(value);
  const m=measurements(s);say(value==='boat'?'两次都是这艘船。船没有换，才能接着比。':value==='line'?(m.aligned?'水面碰到同一道记号啦。接着看看船上的人。':'水面还没碰到记号。回船边调一调石头。'):(s.crewPresent?'阿舟两次都在船上。人和船桨都一样。':'你发现了：阿舟第一次在船上，现在却在岸上！回船边请他回来，再看水线。'),value==='boat'||value==='people'&&s.crewPresent||value==='line'&&m.aligned?'happy':'thinking');return true;
 }
 if(s.mode==='lab'&&s.phase==='observe'){
  if(type==='observation'&&['lower','same','higher'].includes(value)){if(!comparePair(l).valid){say(comparePair(l).message,'encourage');return true;}r.observation=value;r.reflection=null;say(value===observationOf(l)?'你从两栏船位里找到了变化。再回头看看最初的猜想。':'先看同一条水面，再比船身。推一推比较窗，或分别看A、B栏。','thinking');return true;}
  if(type==='reflection'&&['agree','revise'].includes(value)){if(!observationOf(l)||r.observation!==observationOf(l)){say('先用A、B两栏，说清你看到了什么。','encourage');return true;}r.reflection=value;const good=value===reflectionOf(l);say(good?(value==='revise'?'你愿意根据记录修改猜想，这就是新的发现！':'这次的记录支持你的猜想。说出依据，比猜对更有意思。'):'把最初猜想和记录放在一起读一读：它们说的是同一种变化吗？',good?'happy':'encourage');return true;}
 }
 if(s.mode==='lab'&&s.phase==='source'){
  if(type==='transfer-boat'&&['A','B'].includes(value)){if(!r.boats.includes(value))r.boats.push(value);say(r.boats.length===2?'两次都有同一艘船，可以先不看船。剩下的两边分别有什么？':'找到一艘船了，再点另一边的同一艘船。',r.boats.length===2?'happy':'thinking');return true;}
  if(type==='transfer-group'&&['box','box-tool'].includes(value)){if(r.boats.length!==2){say('先把两次都在的船配成一对。','encourage');return true;}r.group=value;say(value==='box-tool'?'找全了！砝码替代的是书箱和工具。现在想想，怎样只留下书箱的重量。':'再看第一次：书箱旁边还放着什么？它也有重量。',value==='box-tool'?'happy':'encourage');return true;}
  if(type==='transfer-reset'){r.boats=[];r.group=null;say('船又回到两边了。可以重新配一配。');return true;}
 }
 return false;
}
