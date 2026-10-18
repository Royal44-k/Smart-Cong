import {canShowcase,showcaseFrame} from './showcase-views.mjs';
export function installShowcase({getState,quiet=()=>{}}){
 const dialog=document.createElement('dialog');dialog.id='showcase';dialog.setAttribute('aria-labelledby','showcase-title');document.body.append(dialog);
 let page=0,opener=null;
 function paint(focus){
  dialog.dataset.mode=getState().mode;dialog.innerHTML=showcaseFrame(getState(),page);
  const same=focus?dialog.querySelector('[data-showcase="'+focus.action+'"]'+(focus.page===undefined?'':'[data-page="'+focus.page+'"]')):null;
  (same&&!same.disabled?same:dialog.querySelector('h2')).focus({preventScroll:true});
  dialog.querySelector('.showcase-content').scrollTop=0;
 }
 function open(button){
  if(dialog.open||!canShowcase(getState()))return;
  opener=button;page=0;quiet();for(const media of document.querySelectorAll('audio,video'))media.pause();
  document.body.classList.add('showcase-open');paint();dialog.showModal();dialog.querySelector('h2').focus({preventScroll:true});
 }
 function restore(){if(dialog.open)return;document.body.classList.remove('showcase-open');if(opener?.isConnected)opener.focus({preventScroll:true});}
 function close(){if(dialog.open){dialog.close();restore();}}
 dialog.addEventListener('close',restore);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-showcase-open]');if(b)open(b);});
 dialog.addEventListener('click',e=>{
  const b=e.target.closest('[data-showcase]');if(!b)return;
  const action=b.dataset.showcase;if(action==='close'){close();return;}
  const next=action==='prev'?page-1:action==='next'?page+1:action==='page'?Number(b.dataset.page):page;
  if(next>=0&&next<4&&next!==page){page=next;paint({action,page:b.dataset.page});}
 });
 dialog.addEventListener('keydown',e=>{
  if(e.key==='Tab'){
   const stops=[...dialog.querySelectorAll('button:not(:disabled),summary')].filter(el=>el.getClientRects().length);
   const first=stops[0],last=stops.at(-1);
   if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
   return;
  }
  if(e.altKey||e.ctrlKey||e.metaKey||e.target.matches('input,textarea,[contenteditable]'))return;
  if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
  e.preventDefault();const next=page+(e.key==='ArrowLeft'?-1:1);
  if(next>=0&&next<4){page=next;paint();}
 });
 return {close};
}
