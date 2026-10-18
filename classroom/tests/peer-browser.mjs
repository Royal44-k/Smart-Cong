import{chromium}from'playwright';import assert from'node:assert/strict';import fs from'node:fs';import{finishedState}from'./showcase-fixtures.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true}),checks=[],errors=[],dir='tests/artifacts/v18';fs.mkdirSync(dir,{recursive:true});
const ok=t=>{checks.push(t);console.log('PASS '+t);},raw=p=>p.evaluate(()=>localStorage.getItem('caochong-waterline-v1')),data=async p=>JSON.parse(await raw(p));
async function page(mode='story',width=1440,setup=null,s=finishedState(mode)){
 const p=await browser.newPage({viewport:{width,height:1000},hasTouch:width===390,isMobile:width===390,reducedMotion:'reduce'});
 p.on('pageerror',e=>errors.push(e.message));if(setup)await setup(p);
 await p.addInitScript(s=>{if(!localStorage.getItem('caochong-waterline-v1'))localStorage.setItem('caochong-waterline-v1',JSON.stringify(s));},s);
 await p.goto('http://127.0.0.1:4184/');await p.locator('h1').waitFor();return p;
}
const action=(p,a,v)=>p.locator('#peer-workshop [data-peer="'+a+'"]'+(v===undefined?'':'[data-value="'+v+'"]')).click();
const open=p=>p.locator('[data-peer-open]').click();
const visibleFeedback=p=>p.locator('.peer-feedback').evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!h&&(h===e||e.contains(h));});
const unchanged=s=>{const t=structuredClone(s);delete t.learning.peer;t.learning.revision=0;return t;};
try{
 const p=await page();const old=data(p);await p.locator('[data-peer-open]').focus();await p.keyboard.press('Enter');
 assert.equal(await p.locator('#peer-title').evaluate(e=>e===document.activeElement),true);
 await action(p,'hide',2);await action(p,'prepare');
 assert.equal(await p.locator('#peer-workshop img').count(),0);
 assert.equal(await p.locator('[data-peer=guess]').count(),0);
 assert.match(await p.locator('#peer-title').innerText(),/交给同桌/);
 await action(p,'solve');assert.equal(await p.locator('.peer-storyboard figure.peer-gap img').count(),0);
 assert.equal(await p.locator('[data-peer=reason]').count(),0);
 ok('出题、交棒与解题分屏，交棒不泄漏题图，选图前不显示理由');
 await action(p,'guess',0);await action(p,'check');
 assert.equal((await data(p)).learning.peer.story.guess,0);assert.equal(await visibleFeedback(p),true);
 await action(p,'peek');assert.equal(await p.locator('.peer-gap img').count(),1);
 assert.equal((await data(p)).learning.peer.story.stage,'solve');
 await action(p,'guess',2);await action(p,'check');assert.equal((await data(p)).learning.peer.story.stage,'explain');
 await action(p,'reason','hurry');await action(p,'check');assert.equal((await data(p)).learning.peer.story.stage,'explain');
 await action(p,'reason','purpose');await action(p,'check');assert.equal((await data(p)).learning.peer.story.stage,'done');
 assert.deepEqual(unchanged(await data(p)),unchanged(await old));
 ok('错误图与理由可修订，纸帘只帮助不代答，反馈在视野内，原结局和作品未改变');
 await action(p,'close');assert.equal(await p.locator('[data-peer-open]').evaluate(e=>e===document.activeElement),true);
 await p.locator('#app .peer-records summary').click();assert.match(await p.locator('#app .peer-records').innerText(),/看过提示/);
 await p.evaluate(()=>window.print=()=>{});await p.locator('[data-action=print]').click();assert.match(await p.locator('#print-sheet').innerText(),/小游戏里的几次尝试/);
 const download=p.waitForEvent('download');await p.locator('[data-action=export]').click();const d=await download;const exported=JSON.parse(fs.readFileSync(await d.path(),'utf8'));assert.equal(exported.state.learning.peer.story.stage,'done');
 await p.reload();await open(p);assert.match(await p.locator('#peer-title').innerText(),/完整/);
 await action(p,'edit');assert.equal((await data(p)).learning.peer.story.guess,null);assert.equal((await data(p)).learning.peer.story.peeked,false);
 assert.ok((await data(p)).learning.peer.story.records.length>0);
 ok('核对记录可查看、打印和导出，刷新恢复；换题清空当前答案但保留实际尝试');
 const q=await page('lab');await open(q);await action(q,'position','second');await action(q,'prepare');await action(q,'solve');
 await action(q,'relation','more');await q.locator('[data-peer-number]').fill('300');await action(q,'check');
 assert.match(await q.locator('.peer-proof').innerText(),/第一次\s*300克/);assert.match(await q.locator('.peer-proof').innerText(),/320 \+ 20 = 340（克）/);assert.match(await q.locator('.peer-proof').innerText(),/差40克/);
 assert.equal(await visibleFeedback(q),true);
 await q.locator('[data-peer-number]').fill('340');assert.equal(await q.locator('.peer-proof').count(),0);
 assert.equal(await q.locator('.peer-feedback').getAttribute('data-mood'),'thinking');
 await action(q,'check');assert.equal((await data(q)).learning.peer.lab.stage,'done');assert.match(await q.locator('.peer-proof').innerText(),/两次一样重/);
 ok('只在第二次的工具要加上，回代显示真实差值；改数撤销旧试算和成功反馈');
 for(const[pos,rel,n]of [['both','same','320'],['first','less','300']]){
  await action(q,'edit');await action(q,'position',pos);await action(q,'prepare');await action(q,'solve');await action(q,'relation',rel);await q.locator('[data-peer-number]').fill(n);await action(q,'check');assert.equal((await data(q)).learning.peer.lab.stage,'done');
 }
 const count=(await data(q)).learning.peer.lab.records.length;
 await action(q,'edit');await action(q,'prepare');await action(q,'solve');await action(q,'relation','less');await q.locator('[data-peer-number]').fill('300');assert.equal(await q.locator('.peer-proof').count(),0);await action(q,'check');assert.equal((await data(q)).learning.peer.lab.records.length,count+1);
 ok('相同题目换人再解需要本轮重新核对，记录不复用或遗漏');
 await action(q,'close');assert.match(await q.locator('#app .peer-records').textContent(),/只在第一次/);
 ok('工具两次都在和只在第一次分别支持相等与减法，三种题各自记录原条件');
 await open(q);await action(q,'edit');await action(q,'total',420);await action(q,'tool',60);await action(q,'prepare');await action(q,'solve');await action(q,'relation','more');
 await q.locator('[data-peer-number]').focus();await q.keyboard.type('3');
 assert.equal(await q.locator('[data-peer-number]').evaluate(e=>e===document.activeElement),true);
 await q.locator('[data-peer-number]').evaluate(el=>{el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));el.value='３６０';el.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));});
 assert.equal((await data(q)).learning.peer.lab.answer,'3');
 await q.locator('[data-peer-number]').evaluate(el=>el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true})));
 assert.equal((await data(q)).learning.peer.lab.answer,'360');
 await action(q,'close');await q.reload();await open(q);assert.equal(await q.locator('[data-peer-number]').inputValue(),'360');
 assert.equal((await data(q)).learning.peer.lab.total,420);assert.equal((await data(q)).learning.peer.lab.tool,60);
 ok('输入不重绘失焦，中文输入法结束后接收全角数字，刷新保留冻结题目和未完答案');
 const legacy=finishedState('lab');legacy.learning.revision=6;delete legacy.learning.peer;
 const l=await page('lab',1440,null,legacy);await open(l);await action(l,'tool',40);assert.equal((await data(l)).learning.revision,7);assert.equal((await data(l)).firstEnding,legacy.firstEnding);assert.deepEqual((await data(l)).reflections,legacy.reflections);
 ok('revision6旧存档无损接入，原猜想、图注、反思和首次结局保留');
 for(const mode of ['story','lab'])for(const width of [320,390,768,1440]){
  const r=await page(mode,width);await open(r);
  for(const stage of ['make','pass','solve']){
   if(stage==='pass')await action(r,'prepare');if(stage==='solve')await action(r,'solve');
   assert.equal(await r.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   assert.equal(await r.locator('.peer-content').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,mode+' '+width+' '+stage);
   for(const x of await r.locator('#peer-workshop button,#peer-workshop input').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))))assert.ok(x.w>=43&&x.h>=43,JSON.stringify({mode,width,stage,...x}));
   await r.locator('[data-peer=close]').focus();
   for(let i=0;i<13;i++){await r.keyboard.press('Tab');assert.equal(await r.evaluate(()=>!!document.activeElement.closest('#peer-workshop')),true);assert.equal(await r.evaluate(()=>{const e=document.activeElement,b=e.getBoundingClientRect(),h=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return !!h&&(h===e||e.contains(h));}),true,'focus '+mode+' '+width+' '+stage);}
  }
  if(mode==='lab'){await action(r,'relation','less');await r.locator('[data-peer-number]').fill('999');await action(r,'check');assert.equal(await r.locator('.peer-proof').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'proof '+width);assert.equal(await visibleFeedback(r),true,'feedback '+width);}
  if(width===390){await r.locator('[data-peer=edit]').tap();await r.locator('[data-peer=prepare]').tap();await r.locator('[data-peer=solve]').tap();assert.equal((await data(r)).learning.peer[mode].stage,'solve');}
  await r.keyboard.press('Escape');assert.equal(await r.locator('#peer-workshop').evaluate(e=>e.open),false);assert.equal(await r.locator('[data-peer-open]').evaluate(e=>e===document.activeElement),true,'Escape focus '+mode+' '+width);
  await r.close();
 }
 ok('两版320/390/768/1440出题交棒解题均无溢出，44像素目标、键盘循环和手机点按可用');
 const missing=await page('story',1440,async r=>r.route('**/media/artwork/**',route=>route.abort()));await open(missing);await missing.locator('#peer-workshop .media-fallback').first().waitFor();await action(missing,'prepare');await action(missing,'solve');await action(missing,'guess',1);await action(missing,'check');assert.equal((await data(missing)).learning.peer.story.stage,'explain');
 ok('缺少图片仍有文字描述，补图和说明用处可继续');
 const noSave=await page('lab',1440,async r=>r.addInitScript(()=>{window.__block=false;const put=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(window.__block)throw Error('quota');return put.call(this,k,v);};}));
 await open(noSave);await noSave.evaluate(()=>window.__block=true);await action(noSave,'prepare');assert.match(await noSave.locator('.peer-content').innerText(),/暂时不能保存/);await action(noSave,'solve');await action(noSave,'relation','less');
 ok('保存空间不可用时可继续操作，交棒无反馈节点时也能显示保存说明');
 assert.deepEqual(errors,[]);ok('新工坊无页面脚本异常');
 fs.writeFileSync(dir+'/peer-browser.json',JSON.stringify({checks,errors},null,2)+'\n');
}finally{await browser.close();}
