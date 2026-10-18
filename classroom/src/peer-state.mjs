const stages=['make','pass','solve','explain','done'];
const moods=['idle','thinking','encourage','happy'];
const int=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
const choose=(n,values)=>values.includes(n);
export const blankPeer=()=>({story:{hidden:1,stage:'make',guess:null,reason:null,peeked:false,message:'',mood:'idle',checked:null,records:[]},lab:{total:320,tool:20,position:'first',stage:'make',relation:null,answer:'',peeked:false,message:'',mood:'idle',checked:null,records:[]}});
export function peerSnapshot(mode,g){return mode==='story'?{hidden:g.hidden,guess:g.guess,reason:g.reason,peeked:g.peeked}:{total:g.total,tool:g.tool,position:g.position,relation:g.relation,answer:g.answer,peeked:g.peeked};}
export function peerResult(mode,g){
 if(mode==='story')return{correct:g.guess===g.hidden&&g.reason==='purpose',picture:g.guess===g.hidden};
 const sign={first:-1,both:0,second:1}[g.position],expected=g.total+sign*g.tool,relation={first:'less',both:'same',second:'more'}[g.position];
 return {expected,relation,relationCorrect:g.relation===relation,numberCorrect:g.answer!==''&&Number(g.answer)===expected,correct:g.relation===relation&&g.answer!==''&&Number(g.answer)===expected};
}
function recordValid(mode,r){
 if(!r||typeof r.peeked!=='boolean')return false;
 if(mode==='story')return int(r.hidden,0,3)&&int(r.guess,0,3)&&choose(r.reason,[null,'purpose','pretty','hurry']);
 return choose(r.total,[220,320,420])&&choose(r.tool,[20,40,60])&&choose(r.position,['first','both','second'])&&choose(r.relation,['less','same','more'])&&typeof r.answer==='string'&&/^\d{1,3}$/.test(r.answer);
}
export function validPeer(p){
 if(!p)return false;
 return ['story','lab'].every(mode=>{
  const g=p[mode];if(!g||!stages.includes(g.stage)||!moods.includes(g.mood)||typeof g.message!=='string'||g.message.length>300||typeof g.peeked!=='boolean'||!Array.isArray(g.records)||g.records.length>6||g.records.some(r=>!recordValid(mode,r)))return false;
  if(g.checked!==null&&(!recordValid(mode,g.checked)||JSON.stringify(g.checked)!==JSON.stringify(g.records.at(-1))))return false;
  if(mode==='story'){
   if(!int(g.hidden,0,3)||!choose(g.guess,[null,0,1,2,3])||!choose(g.reason,[null,'purpose','pretty','hurry']))return false;
   if(g.stage==='explain'&&g.guess!==g.hidden)return false;
   if(g.stage==='solve'&&g.reason!==null)return false;
  }else if(!choose(g.total,[220,320,420])||!choose(g.tool,[20,40,60])||!choose(g.position,['first','both','second'])||!choose(g.relation,[null,'less','same','more'])||typeof g.answer!=='string'||!/^\d{0,3}$/.test(g.answer)||g.stage==='explain')return false;
  if(['make','pass'].includes(g.stage)&&(g.peeked||(mode==='story'?g.guess!==null||g.reason!==null:g.relation!==null||g.answer!=='')))return false;
  if(['make','pass'].includes(g.stage)&&g.checked!==null)return false;
  if(g.stage==='done'&&(g.checked===null||!peerResult(mode,g).correct||JSON.stringify(g.records.at(-1))!==JSON.stringify(peerSnapshot(mode,g))))return false;
  return true;
 });
}
function clearAnswer(mode,g){g.checked=null;g.peeked=false;if(mode==='story'){g.guess=null;g.reason=null;}else{g.relation=null;g.answer='';}g.mood='idle';g.message='';}
function record(mode,g){const r=peerSnapshot(mode,g);if(JSON.stringify(g.checked)!==JSON.stringify(r)){g.records.push(r);g.records=g.records.slice(-6);}g.checked=r;}
export function peerAction(s,type,value){
 if(!s.learning?.enabled||s.journey!=='full'||s.phase!=='reflect'||!s.learning.peer)return false;
 const mode=s.mode,g=s.learning.peer[mode],say=(message,mood='thinking')=>{g.message=message;g.mood=mood;};
 if(type==='edit'){clearAnswer(mode,g);g.stage='make';say(mode==='story'?'再选一幅，也可以交换出题人。':'每换一题，就换一箱书。先选好条件，再交给同桌。');return true;}
 if(g.stage==='make'){
  if(mode==='story'&&type==='hide'&&/^[0-3]$/.test(String(value))){g.hidden=Number(value);say('选好了：藏起第'+(g.hidden+1)+'幅。准备好，就交给同桌吧。');return true;}
  if(mode==='lab'&&((type==='total'&&choose(Number(value),[220,320,420]))||(type==='tool'&&choose(Number(value),[20,40,60])))){g[type]=Number(value);say('条件改好了。看看两次船上有什么，再交给同桌。');return true;}
  if(mode==='lab'&&type==='position'&&choose(value,['first','both','second'])){g.position=value;say('工具的位置选好了。这是一道新题，书箱的重量也要重新想。');return true;}
  if(type==='prepare'){clearAnswer(mode,g);g.stage='pass';return true;}
  return false;
 }
 if(g.stage==='pass'){if(type==='solve'){g.stage='solve';say(mode==='story'?'少了哪幅图？看看留下的三幅，再选一张补回来。':'看看工具在哪一次上船，再想书箱该有多重。');return true;}return false;}
 if(g.stage==='done')return false;
 if(type==='peek'){if(!g.peeked)g.checked=null;g.peeked=true;say(mode==='story'?'纸帘打开了。看一看，再亲手选一张补回去。':'工具两次都在，可以先不看它；只在第一次，要从砝码中减去；只在第二次，书箱要和砝码、工具一起比。');return true;}
 if(mode==='story'){
  if(g.stage==='solve'&&type==='guess'&&/^[0-3]$/.test(String(value))){if(g.guess===Number(value))return true;g.checked=null;g.guess=Number(value);say('图选好了。点“补回这幅”，看看故事能不能接上。');return true;}
  if(g.stage==='explain'&&type==='reason'&&choose(value,['purpose','pretty','hurry'])){if(g.reason===value)return true;g.checked=null;g.reason=value;say('想法选好了。再说说这一步能帮大家做什么。');return true;}
  if(type==='check'){
   if(g.stage==='solve'){if(g.guess===null){say('先选一张图，再把它补回故事里。');return true;}record(mode,g);if(g.guess===g.hidden){g.stage='explain';say('画面接上啦！这一步有什么用？','happy');}else say(g.hidden===0?'故事还没接上。看看后面的三幅，想想一开始要请谁上船。':g.hidden===3?'故事还没接上。石头已经装上船，最后怎样知道它们一共有多重呢？':'故事还没接上。看看纸帘前后的图：前面做了什么，后面要做什么？','encourage');return true;}
   if(g.reason===null){say('选一句话，说说这一步的用处。');return true;}
   record(mode,g);if(peerResult(mode,g).correct){g.stage='done';say('图和理由对上啦！把这一步的用处讲给出题人听听。','happy');}else say('再想想这一步的用处。它怎样帮大家把大象称出来？','encourage');return true;
  }
 }else{
  if(type==='relation'&&choose(value,['less','same','more'])){if(g.relation===value)return true;g.checked=null;g.relation=value;say('这个想法先留下，再自己算一算。');return true;}
  if(type==='number'&&typeof value==='string'){const n=value.replace(/[０-９]/g,c=>String(c.charCodeAt(0)-65296)).trim();if(!/^\d{0,3}$/.test(n))return false;if(g.answer===n)return true;g.checked=null;g.answer=n;g.mood='thinking';g.message='数改好了，别忘了再核对一次。';return true;}
  if(type==='check'){
   if(!g.relation||g.answer===''){say(!g.relation?'先选一选：书箱比砝码轻、一样重，还是更重？':'还差书箱的重量。把你算出的数填进去吧。');return true;}
   record(mode,g);const r=peerResult(mode,g);
   if(!r.relationCorrect)say({first:'第一次除了书箱，还有工具。这些砝码都只替书箱吗？',both:'工具两次都在船上。先把一样的工具放在一边，剩下谁和谁比？',second:'第二次除了砝码，还有工具。书箱要和哪两样东西一起比？'}[g.position],'encourage');
   else if(!r.numberCorrect)say({first:'轻重关系找对了。再算一次：从砝码重量里减去工具这份。',both:'轻重关系找对了。工具两次都在，书箱就和砝码一样重。',second:'轻重关系找对了。再算一次：把砝码和工具的重量加起来。'}[g.position],'encourage');
   else{g.stage='done';say('这道题的关系和数字都对上啦！指着两幅图，说说为什么。','happy');}
   return true;
  }
 }
 return false;
}
