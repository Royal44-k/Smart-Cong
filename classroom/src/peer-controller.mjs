import{peerAction}from'./peer-state.mjs';
import{peerFrame,peerProof}from'./peer-views.mjs';
export function installPeer({getState,save,quiet=()=>{},onClose=()=>{}}){
 const dialog=document.createElement('dialog');dialog.id='peer-workshop';dialog.setAttribute('aria-labelledby','peer-title');document.body.append(dialog);const surface=document.createElement('div');surface.className='peer-shell';const live=document.createElement('p');live.className='peer-announcer';live.setAttribute('role','status');live.setAttribute('aria-live','polite');live.setAttribute('aria-atomic','true');dialog.append(surface,live);let active=false;
 function paint(reset=false,key=null){
  const scroll=dialog.querySelector('.peer-content')?.scrollTop||0;dialog.dataset.mode=getState().mode;dialog.classList.toggle('peer-still',document.querySelector('.learning-companion')?.classList.contains('still'));surface.innerHTML=peerFrame(getState());
  dialog.querySelector('.peer-content').scrollTop=reset?0:scroll;
  const same=key?dialog.querySelector('[data-peer="'+key.action+'"][data-value="'+key.value+'"]'):null;
  (reset?dialog.querySelector('h2'):same||dialog.querySelector('h2'))?.focus({preventScroll:true});
 }
 function restore(){if(dialog.open||!active)return;active=false;document.body.classList.remove('peer-open');onClose();document.querySelector('[data-peer-open]')?.focus({preventScroll:true});}
 function close(){if(dialog.open){dialog.close();restore();}}
 dialog.addEventListener('close',restore);
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 document.addEventListener('click',e=>{
  if(!e.target.closest('[data-peer-open]'))return;
  const s=getState();if(dialog.open||!s.learning?.enabled||s.journey!=='full'||s.phase!=='reflect')return;
  active=true;quiet();for(const m of document.querySelectorAll('audio,video'))m.pause();document.body.classList.add('peer-open');paint(true);dialog.showModal();dialog.querySelector('h2').focus({preventScroll:true});
 });
 dialog.addEventListener('click',e=>{
  const b=e.target.closest('[data-peer]');if(!b)return;if(b.dataset.peer==='close'){close();return;}
  const s=getState(),stage=s.learning.peer[s.mode].stage;
  if(peerAction(s,b.dataset.peer,b.dataset.value)){const ok=save();paint(stage!==s.learning.peer[s.mode].stage,{action:b.dataset.peer,value:b.dataset.value});const g=s.learning.peer[s.mode];if(live.textContent!==g.message)live.textContent=g.message;if(stage===g.stage&&['check','peek'].includes(b.dataset.peer))dialog.querySelector('.peer-feedback')?.scrollIntoView({block:'nearest',behavior:'instant'});if(!ok){let note=dialog.querySelector('[data-peer-feedback]');if(!note){note=document.createElement('p');note.setAttribute('role','status');dialog.querySelector('.peer-content').append(note);}note.textContent+=' 本机暂时不能保存，离开前请保存学习记录。';}}
 });
 function input(e){
  if(!e.target.matches('[data-peer-number]')||e.isComposing)return;
  const s=getState(),field=e.target,g=s.learning.peer[s.mode];
  if(peerAction(s,'number',field.value)){const ok=save();field.value=g.answer;dialog.querySelector('[data-peer-feedback]').textContent=g.message+(ok?'':' 本机暂时不能保存，离开前请保存学习记录。');dialog.querySelector('[data-peer-proof]').innerHTML=peerProof(g);dialog.querySelector('.peer-feedback').dataset.mood=g.mood;dialog.querySelector('.companion-sprite').dataset.mood=g.mood;}
  else{field.value=g.answer;dialog.querySelector('[data-peer-feedback]').textContent='这里只填数字，“克”已经写在旁边啦。';}
 }
 dialog.addEventListener('input',input);dialog.addEventListener('compositionend',input);
 dialog.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const stops=[...dialog.querySelectorAll('button:not(:disabled),input,summary')].filter(x=>x.getClientRects().length),first=stops[0],last=stops.at(-1);
  if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 });
 return{close};
}
