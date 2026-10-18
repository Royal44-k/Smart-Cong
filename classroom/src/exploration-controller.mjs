export function installExploration({dispatch,announce}){
 let stroke=null,suppress=false,keyboardInput=true;
 document.addEventListener('pointerdown',()=>{keyboardInput=false;},true);
 document.addEventListener('keydown',()=>{keyboardInput=true;},true);
 const clear=()=>{if(stroke?.node.hasPointerCapture?.(stroke.id))stroke.node.releasePointerCapture(stroke.id);stroke=null;document.querySelectorAll('.mark-canvas.drawing').forEach(x=>x.classList.remove('drawing'));document.querySelector('.mark-ink path')?.removeAttribute('d');};
 document.addEventListener('click',e=>{
  if(suppress&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();return;}
  const jump=e.target.closest('[data-desk-jump]');if(jump){const target=document.querySelector('#desk-'+jump.dataset.deskJump);target?.focus({preventScroll:true});target?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});return;}
  const surface=e.target.closest('[data-mark-surface]');if(surface&&e.detail===0){clear();dispatch(surface.dataset.markSurface);}
 },true);
 document.addEventListener('pointerdown',e=>{if(stroke){clear();return;}const node=e.target.closest('[data-mark-surface]');if(!node||e.isPrimary===false)return;if(e.button!==0)return;const canvas=node.closest('.mark-canvas'),svg=canvas.querySelector('.mark-ink'),path=svg.querySelector('path');const point=()=>{const m=svg.getScreenCTM();return m?new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()):null;};const p=point();if(!p)return;stroke={node,canvas,svg,path,id:e.pointerId,x:e.clientX,y:e.clientY,points:['M'+p.x+' '+p.y],moved:false};node.setPointerCapture(e.pointerId);});
 document.addEventListener('pointermove',e=>{if(!stroke||e.pointerId!==stroke.id)return;if(!stroke.node.isConnected){clear();return;}if(Math.hypot(e.clientX-stroke.x,e.clientY-stroke.y)>6)stroke.moved=true;if(!stroke.moved)return;e.preventDefault();const m=stroke.svg.getScreenCTM();if(!m)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());stroke.points.push('L'+p.x+' '+p.y);if(stroke.points.length>400)stroke.points.splice(1,1);stroke.path.setAttribute('d',stroke.points.join(' '));stroke.canvas.classList.add('drawing');},{passive:false});
 document.addEventListener('pointerup',e=>{if(!stroke||e.pointerId!==stroke.id)return;const node=stroke.node,value=node.dataset.markSurface,r=stroke.canvas.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;clear();e.preventDefault();suppress=true;setTimeout(()=>suppress=false,0);if(inside&&node.isConnected){node.focus({preventScroll:true});dispatch(value);}else announce?.('这道线还没留下。可以回到图上再画，也可以点下面的按钮。');});
 document.addEventListener('pointercancel',clear);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')clear();});
 window.addEventListener('blur',clear);

 // Keep keyboard focus clear of the step guide and every visible part of the companion.
 // Pointer focus is deliberately untouched: moving a touch target before click loses the tap.
 document.addEventListener('focusin',e=>{
  const target=e.target;if(!keyboardInput||!target.closest('#app')||!target.matches(':focus-visible'))return;
  const overlaps=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
  const nav=document.querySelector('.desk-guide');
  let rect=target.getBoundingClientRect(),bar=nav?.getBoundingClientRect();
  if(bar&&!target.closest('.desk-guide')&&overlaps(rect,bar)){window.scrollBy({top:rect.top-bar.bottom-16,behavior:'instant'});rect=target.getBoundingClientRect();}
  const covers=[...document.querySelectorAll('.companion-bubble,.companion-portrait,.companion-settings')].filter(x=>x.getClientRects().length&&getComputedStyle(x).visibility!=='hidden').map(x=>x.getBoundingClientRect());
  const hits=covers.filter(x=>overlaps(rect,x));
  if(hits.length){
   const ceiling=Math.min(...covers.filter(x=>x.left<rect.right&&x.right>rect.left).map(x=>x.top))-16;
   window.scrollBy({top:rect.bottom-ceiling,behavior:'instant'});
  }
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
}
