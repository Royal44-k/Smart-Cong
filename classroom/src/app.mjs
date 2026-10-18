import{installPeer}from'./peer-controller.mjs';
import {installShowcase} from './showcase-controller.mjs';
import{refreshSplit}from'./transfer-bridge-views.mjs';
import{installExploration}from'./exploration-controller.mjs';
import{repairSummary}from'./workshop-views.mjs';
import{installComparison}from'./reasoning-views.mjs';
installComparison();
import{createCompanion}from'./companion.mjs';
import{installPlay}from'./play-controller.mjs';
import{playAction}from'./play-state.mjs';
import {activeLearning} from './learning-state.mjs';
import {learn} from './learning-actions.mjs';
import {storyLearningView,labLearningView,learningJournal,learningReflection,learningPrint} from './learning-views.mjs';
import {inquire} from './inquiry.mjs';
import {journal} from './inquiry-views.mjs';
import {act,canLeave} from './narrative.mjs';
import {storyView,storyPhases} from './story-views.mjs';
import {createState,measurements,issues,ISSUE_TEXT,saveDraft,resolveEnding} from './engine.mjs';
import {STORAGE_KEY,restore,persist} from './storage.mjs';
import {home,game,endingView,reflection,teacherView,printView,esc} from './views.mjs';
import {endings} from './content.mjs';
import {audioElement,chime,installMediaFallbacks} from './media.mjs';
installMediaFallbacks();
const app=document.querySelector('#app'),status=document.querySelector('#status'),dialog=document.querySelector('#dialog');
let state=createState(),homeView=false,storageEnabled=true,initialMessage='';
try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const saved=restore(raw);if(saved)state=saved;else initialMessage='上次存档无法读取，已回到码头。可以开始新的观察。';}}catch{storageEnabled=false;initialMessage='本机存储不可用。仍可体验，结束时请导出学习记录。';}
const companion=createCompanion({getState:()=>state});
installPeer({getState:()=>state,save,quiet:()=>companion.quiet(),onClose:()=>render()});
installShowcase({getState:()=>state,quiet:()=>companion.quiet()});
const play=installPlay({getState:()=>state,announce:say,dispatch:(channel,type,value)=>{const phase=state.phase;let changed=false;if(channel==='play')changed=playAction(state,type,value);if(channel==='learn')changed=learn(state,type,value);if(channel==='cargo'&&state.phase==='load'&&!state.cargo[value]){state.cargo[value]=true;state.claimedMass=null;changed=true;}if(changed){log('我的操作：'+({ 'book-place':'调整故事图卡','challenge-answer':'比较两幅图','challenge-next':'查看下一组变化','book-page':'翻看故事页','book-prev':'翻看故事前一页','book-next':'翻看故事后一页','repair-weight':'调整练习木块','repair-crew':'调整练习小人','repair-depth':'调整练习水深','repair-reason':'说明练习依据','repair-check':'检查修复的比较','repair-next':'打开下一组修理任务','repair-reset':'重新摆放本组练习',stone:'移动木块','bench-weight':'改变木块数量',cargo:'把石头放上船',stamp:'选取称重条',paste:'连接称重记录'}[type]||type));save();render({focus:state.phase!==phase});}}});
installExploration({announce:say,dispatch:value=>{if(learn(state,'line',value)){log('画记号：'+({hull:'船身',shore:'岸柱',wave:'浪花'}[value]));save();render();}}});
function say(text){status.textContent=text;}
function save(){let ok=false;try{ok=persist(localStorage,state);}catch{}if(!ok&&storageEnabled){storageEnabled=false;say('本机存储不可用，进度只在当前页面保留。请在结束时导出记录。');}return ok;}
function log(text){state.trail.push({at:new Date().toISOString(),text});if(state.trail.length>500)state.trail.shift();}
function render({focus=false}={}){
 const active=document.activeElement,repairFocus=!!active?.closest('.repair-workshop');
 const priorAudio=app.querySelector('audio'),priorPhase=app.dataset.phase;
 const openDetails=[...app.querySelectorAll('details')].map((d,i)=>d.open?i:-1).filter(i=>i>=0);
 const focusKeys=active?.matches('button,input,textarea')?[...active.attributes].filter(a=>a.name.startsWith('data-')&&a.name!=='data-play-drag'&&a.name!=='data-play-value'&&!(active.hasAttribute('data-split-adjust')&&a.name==='data-value')):[];
 app.dataset.phase=homeView?'start':state.phase;
 app.dataset.experience=activeLearning(state)?state.mode:'classic';
 document.body.dataset.lessonMode=state.mode;document.body.dataset.screen=homeView||state.phase==='start'?'cover':'lesson';
 document.body.dataset.experience=homeView?'cover':app.dataset.experience;
 if(!homeView&&state.phase==='ending')app.dataset.ending=state.ending;else delete app.dataset.ending;
 const special=!homeView&&state.phase!=='start'&&activeLearning(state)?(state.phase==='reflect'?learningReflection(state):state.mode==='story'?storyLearningView(state):labLearningView(state)):null;
 app.innerHTML=special??(homeView||state.phase==='start'?home(state):state.phase==='ending'?endingView(state):state.phase==='reflect'?reflection(state):storyPhases.includes(state.phase)?storyView(state):game(state));
 if(!activeLearning(state)&&!homeView&&state.phase==='reflect')app.insertAdjacentHTML('beforeend',repairSummary(state));
 if(activeLearning(state)&&state.mode==='lab'&&!special&&!homeView&&state.phase!=='start')app.insertAdjacentHTML('afterbegin','<div class="lab-ribbon"><span>称象实验 / 把小船上的发现用起来</span><button data-action="journal">查看我的对比试验 ↗</button></div>');
 const key=activeLearning(state)&&state.mode==='lab'&&['prologue','observe','source'].includes(state.phase)?({prologue:'lab_plan',observe:'lab_bench',source:'lab_transfer'})[state.phase]:homeView||['start','reflect'].includes(state.phase)?null:state.phase==='ending'?state.ending:state.phase==='route-lab'?state.route:state.phase==='prologue'?'harbor':state.phase==='mark'?'boarding':state.phase;
 if(key){const target=app.querySelector('.notebook')||app.querySelector('.ending-copy');if(target){const heading=target.querySelector('h1');if(heading)heading.insertAdjacentHTML('afterend',audioElement(key));else target.insertAdjacentHTML('afterbegin',audioElement(key));}}
 const newAudio=app.querySelector('audio');
 if(priorAudio&&priorPhase===app.dataset.phase&&newAudio?.dataset.shot===priorAudio.dataset.shot)newAudio.replaceWith(priorAudio);else if(priorAudio){priorAudio.pause();priorAudio.removeAttribute('src');priorAudio.load();}
 document.querySelector('#mode-label').textContent=state.mode==='lab'?'实验版':'故事版';
 const sound=document.querySelector('[data-action=sound]');sound.setAttribute('aria-pressed',String(state.sound));sound.textContent=state.sound?'声效已开':'开启声效';
 play.enhance();refreshSplit(state);
 for(const i of priorPhase===app.dataset.phase?openDetails:[]){const detail=app.querySelectorAll('details')[i];if(detail)detail.open=true;}
 companion.update({homeView});
 if(focus){app.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 else if(focusKeys.length){const selector=focusKeys.map(a=>'['+a.name+'='+JSON.stringify(a.value)+']').join('');const kept=active?.hasAttribute('data-split-adjust')?(app.querySelector(selector+':not(:disabled)')||app.querySelector('[data-split-weight]')):app.querySelector(selector);(kept&&!kept.disabled?kept:(repairFocus?(app.querySelector('.repair-workshop [data-play=repair-next]')||app.querySelector('.repair-controls button:not(:disabled)')||app.querySelector('.repair-workshop>summary')):(app.querySelector('.notebook button:not([disabled])')||app.querySelector('h1'))))?.focus({preventScroll:true});}
}
function go(phase){say('');state.inquiry.feedback='';state.phase=phase;state.learning.reasoning.message='';state.learning.reasoning.mood='idle';homeView=false;save();render({focus:true});}
function showDialog(html){dialog.querySelector('.dialog-body').innerHTML=html;dialog.showModal();}
function recordDraft(){
 const last=state.drafts.at(-1);
 const now={claimedMass:state.claimedMass,cargo:state.cargo,counts:state.counts,crewPresent:state.crewPresent,accountCrew:state.accountCrew,issues:issues(state)};
 if(!last||Object.keys(now).some(k=>JSON.stringify(now[k])!==JSON.stringify(last[k])))saveDraft(state);
}
function finish(confirmed){
 if(state.phase!=='report')return;
 if(confirmed&&state.inquiry.reportReason===null){say('请补上你的判断理由，也可以选择继续验证。');return;}
 if(confirmed&&state.claimedMass===null){say(state.mode==='lab'?'请先填写一个有效的质量数值，或选择暂不确认。':'请先选择怎样比较，或选择暂不确认。');return;}
 if(confirmed)recordDraft();
 const id=resolveEnding(state,confirmed);state.ending=id;state.firstEnding??=id;
 log((confirmed?'呈报结论':'暂不确认')+'：'+endings[id].title);
 go('ending');
}
document.addEventListener('click',event=>{
 const target=event.target.closest('button');if(!target||target.disabled)return;
 if(target.hasAttribute('data-learning')){const kind=target.dataset.learning;const value=['stone','cargo','weigh','stamp','paste','bench-weight','split-weight'].includes(kind)?Number(target.dataset.value):target.dataset.value;const before=state.phase;if(learn(state,kind,value)){log('我的操作：'+target.textContent.trim().slice(0,100));if(['stone','cargo','paste','sample'].includes(kind))chime(state.sound);save();say('');render({focus:state.phase!==before});}return;}
 if(target.hasAttribute('data-inquiry')){const type=target.dataset.inquiry;const value=['model-select','support','weigh-batch'].includes(type)?Number(target.dataset.value):target.dataset.value;if(inquire(state,type,value)){log('我的操作：'+target.textContent.trim().slice(0,110));say('');save();render();}return;}
 if(target.hasAttribute('data-journey')&&state.phase==='start'){state.journey=target.dataset.journey==='core'?'core':'full';save();render();return;}
 if(target.hasAttribute('data-story')||target.hasAttribute('data-classify')){
  const type=target.dataset.story||'classify';
  const value=type==='classify'?{id:target.dataset.classify,value:target.dataset.value}:['pool-weight','weigh-small'].includes(type)?Number(target.dataset.value):target.dataset.value;
  if(act(state,type,value)){log('探究操作：'+target.textContent.trim().slice(0,110));save();render();}return;
 }
 if(target.hasAttribute('data-mode')&&state.phase==='start'){state.mode=target.dataset.mode;state.journey=state.mode==='story'?'full':'core';save();render();return;}
 if(target.hasAttribute('data-route')&&state.phase==='idea'){state.route=target.dataset.route;log('先研究：'+(state.route==='split'?'分批合计':'大秤与支撑'));save();render();return;}
 if(target.hasAttribute('data-substitute')&&state.phase==='load'){state.substitute=target.dataset.substitute;save();render();return;}
 if(target.hasAttribute('data-cargo')&&state.phase==='load'){
  const i=Number(target.dataset.cargo);if(!Number.isInteger(i)||i<0||i>4)return;
  state.cargo[i]=!state.cargo[i];state.claimedMass=null;log((state.cargo[i]?'装上':'卸下')+'第'+(i+1)+'批');chime(state.sound);save();render();return;
 }
 for(const attr of ['record','unrecord'])if(target.hasAttribute('data-'+attr)&&state.phase==='ledger'){
  const i=Number(target.dataset[attr]);if(!Number.isInteger(i)||i<0||i>4)return;
  if(attr==='record'&&!state.inquiry.weighed[i])return;
  state.counts[i]=Math.max(0,Math.min(2,state.counts[i]+(attr==='record'?1:-1)));state.claimedMass=null;save();render();return;
 }
 if(target.hasAttribute('data-answer')&&state.phase==='report'){
  state.accountCrew=target.dataset.answer==='adjust';
  const m=measurements(state);state.claimedMass=state.accountCrew?m.corrected:m.recordedMass;
  if(state.claimedMass<0)state.claimedMass=null;
  save();render();return;
 }
 const action=target.dataset.action;
 switch(action){
  case 'start':if(state.phase==='start'){log('开始'+(state.mode==='lab'?'实验版':'故事版'));go(state.journey==='full'?'prologue':'idea');}break;
  case 'continue':homeView=false;render({focus:true});break;
  case 'home':homeView=true;render({focus:true});break;
  case 'journal':showDialog((activeLearning(state)?learningJournal(state):journal(state)+repairSummary(state))+'<button data-action="export">保存当前学习记录</button>');break;
  case 'teacher':showDialog(teacherView());break;
  case 'close':dialog.close();break;
  case 'sound':state.sound=!state.sound;chime(state.sound);save();render();break;
  case 'next':if(state.phase==='idea'&&state.route){state.calm=false;go(state.journey==='full'?'route-lab':'mark');}break;
  case 'story-next':if(canLeave(state)){const next={prologue:'idea','route-lab':'observe',observe:'reference',reference:'mark',materials:'load',review:'report',source:'reflect'}[state.phase];if(state.phase==='reference'){state.calm=false;if(state.mode==='lab'){state.balanced=false;state.free=false;}}log('完成探究场景：'+state.phase);if(next)go(next);}break;
  case 'review-load':if(state.phase==='review')go('load');break;
  case 'review-ledger':if(state.phase==='review')go('ledger');break;
  case 'capture':if(state.phase==='mark'&&state.calm&&state.balanced&&state.free){state.referenceCaptured=true;state.crewPresent=false;log('记录第一次水线：象与阿舟均在船上；船平稳、自由漂浮。');go(activeLearning(state)?'load':state.journey==='full'?'materials':'load');say('水线和配置已留下。阿舟去岸上取秤了，继续观察。');}break;
  case 'crew':if(state.phase==='load'){state.crewPresent=!state.crewPresent;state.claimedMass=null;log('阿舟'+(state.crewPresent?'回到船上':'回到岸上'));save();render();}break;
  case 'to-ledger':if(state.phase==='load'&&measurements(state).aligned){log('到达同水线，开始记筹。');go('ledger');}break;
  case 'to-report':if(state.phase==='ledger'){log('本次记录次数：'+state.counts.join('、'));go(activeLearning(state)?'report':state.journey==='full'?'review':'report');}break;
  case 'edit-load':if(['ledger','report'].includes(state.phase))go('load');break;
  case 'edit-ledger':if(state.phase==='report')go('ledger');break;
  case 'draft':if(state.phase==='report'){recordDraft();log('保存第'+state.drafts.length+'版草稿。');save();render();say('草稿已保存。它记录你的当前判断，尚未替你完成复核。');}break;
  case 'review-drafts':showDialog('<h2>我的草稿</h2>'+(state.drafts.length?state.drafts.map((d,i)=>'<article class="draft"><h3>第'+(i+1)+'版 · '+(d.claimedMass===null?'未填结论':number(d.claimedMass)+' kg')+'</h3><p>'+(d.issues.length?d.issues.map(k=>ISSUE_TEXT[k]).join(' '):'本版条件与记录相符。')+'</p></article>').join(''):'<p>还没有保存草稿。可以先留下判断，再去复核。</p>'));break;
  case 'confirm':finish(true);break;
  case 'defer':finish(false);break;
  case 'repair':if(state.phase==='ending'){log('从结局返回复核，保留首次记录。');go('report');}break;
  case 'redo-experiment':if(activeLearning(state)&&state.mode==='lab'){go('observe');}break;
  case 'ending-load':if(state.phase==='ending')go('load');break;
  case 'ending-ledger':if(state.phase==='ending')go('ledger');break;
  case 'reflect':if(state.phase==='ending')go(state.journey==='full'?'source':'reflect');break;
  case 'export':if(state.phase!=='start'){
   const record={title:'曹冲称象：一线之差',exportedAt:new Date().toISOString(),note:'本课实验数据与学习过程记录。',inProgress:state.phase!=='reflect',state,measurement:measurements(state),unresolved:issues(state).map(k=>ISSUE_TEXT[k])};
   const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'}));
   const a=document.createElement('a');a.href=url;a.download='曹冲称象-学习记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('学习记录已生成，保存在浏览器下载中。');
  }break;
  case 'print':if(state.phase==='reflect'){document.querySelector('#print-sheet').innerHTML=(activeLearning(state)?learningPrint(state):printView(state)+repairSummary(state));window.print();}break;
  case 'restart':showDialog('<h2>开始一次新尝试</h2><p>开始后会换成一本新的学习记录。可以先把现在的发现保存下来，再选择故事版或实验版。</p><div class="kid-choices"><button data-action="export">先保存当前记录</button><button class="primary" data-action="reset-confirm">开始新版学习</button></div>');break;
  case 'reset-confirm':{dialog.close();state=createState(state.mode);state.journey=state.mode==='story'?'full':'core';log('开始新的尝试。');go('start');break;}
 }
});
function number(n){return n.toLocaleString('zh-CN');}
document.addEventListener('change',event=>{
 const target=event.target;
 if(target.matches('[data-split-weight]')){log('试分重量：工具'+state.learning.bridge.tools+'克');save();return;}
 if(target.matches('[data-condition]')&&['mark','load'].includes(state.phase)){const key=target.dataset.condition;if(!['calm','balanced','free'].includes(key))return;state[key]=target.checked;save();render();return;}
 if(target.matches('[data-account]')&&state.phase==='report'){state.accountCrew=target.checked;save();}
});
document.addEventListener('input',event=>{
 const target=event.target;
 if(target.matches('[data-split-weight]')){if(learn(state,'split-weight',Number(target.value))){save();refreshSplit(state);companion.update({homeView});}return;}
 if(target.matches('[data-caption-page]')){const page=Number(target.dataset.captionPage);if(playAction(state,'caption',{page,text:target.value})){const ok=save();if(!event.isComposing&&target.value!==state.learning.workshop.captions[page])target.value=state.learning.workshop.captions[page];app.querySelector('[data-written-pages]').textContent='已写下 '+state.learning.workshop.captions.filter(t=>t.trim()).length+' / 4 页';app.querySelector('[data-caption-count]').textContent=target.value.length+' / 160 字';app.querySelector('[data-caption-status]').textContent=ok?'这一页已经留在本机。':'这一页暂留在页面里，记得保存学习记录。';}return;}
 if(target.matches('[data-learning-input]')){learn(state,target.dataset.learningInput,target.value);target.value=state.learning.lab.transferNumber;save();return;}
 if(target.id==='claim'&&state.phase==='report'){
  const v=target.value.trim(),n=Number(v);state.claimedMass=v!==''&&Number.isInteger(n)&&n>=0&&n<=10000?n:null;save();
 }
 if(target.matches('[data-reflect]')&&state.phase==='reflect'){const i=Number(target.dataset.reflect);if(i>=0&&i<3){state.reflections[i]=target.value.slice(0,2000);save();}}
});
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
render();if(initialMessage)say(initialMessage);


