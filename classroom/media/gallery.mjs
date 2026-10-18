const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grid=document.querySelector('#grid'),result=document.querySelector('#result');
try{
 const [catalog,shots]=await Promise.all(['catalog.json','shots.json'].map(async u=>{const r=await fetch(u);if(!r.ok)throw Error(u);return r.json();}));
 function render(view){
  const list=view==='shots'?shots:view==='characters'?catalog.assets.filter(a=>a.id==='CC-CHARACTERS'):catalog.assets;
  result.textContent=(view==='shots'?'镜头制作卡':'实际采用图片')+' · '+list.length+'项';
  grid.innerHTML=list.map(a=>view==='shots'?'<article class="card"><a href="'+esc(a.imageFile)+'" target="_blank"><img src="'+esc(a.imageFile)+'" alt="'+esc(a.title)+'的参考图" loading="lazy"></a><div class="card-copy"><small>'+esc(a.id)+' / '+esc(a.node)+' / '+a.seconds+'秒目标</small><h2>'+esc(a.title)+'</h2><p>'+esc(a.voice.join(' / '))+'</p><audio controls preload="none" src="'+esc(a.expectedAudio)+'" aria-label="本镜对白朗读"></audio><p class="muted">互动：'+esc(a.exit)+'</p><details><summary>镜头、状态与提示词</summary><p>'+esc(a.camera)+'</p><p>'+esc(a.beats)+'</p><p>适用路线：'+esc(a.modeDifference)+'</p><p>'+esc(a.state)+'</p><p>入场：'+esc(a.entryFrame)+'</p><p>接出：'+esc(a.exitFrame)+'</p><p>场记：'+esc(a.continuity)+'</p><p>'+esc(a.prompt)+'</p></details><a href="'+esc(a.captionFile)+'" download>对白字幕 ↓</a></div></article>':'<article class="card"><a href="'+esc(a.file)+'" target="_blank"><img src="'+esc(a.file)+'" alt="'+esc(a.role)+'，场景参考图" loading="lazy"></a><div class="card-copy"><small>'+esc(a.id)+' / '+a.width+'×'+a.height+'</small><h2>'+esc(a.role)+'</h2><p class="muted">'+(a.shots.length?'镜头：'+esc(a.shots.join(' / ')):'角色参考，不直接作为剧情节点')+'</p><a href="'+esc(a.file)+'" download>保存原图 ↓</a></div></article>').join('');
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)render(b.dataset.view);});render('assets');
}catch{result.textContent='素材目录暂未读到，请检查本地服务。上方剧本与交接文件仍可直接打开。';}
