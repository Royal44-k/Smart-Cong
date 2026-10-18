import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {finishedState} from './showcase-fixtures.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true}),checks=[],errors=[],dir='tests/artifacts/v17';
fs.mkdirSync(dir,{recursive:true});
const ok=t=>{checks.push(t);console.log('PASS '+t);};
async function page(s=finishedState(),width=1440,touch=false,setup=null){
 const p=await browser.newPage({viewport:{width,height:1000},hasTouch:touch,isMobile:touch,reducedMotion:'reduce'});
 p.on('pageerror',e=>errors.push(e.message));
 if(setup)await setup(p);
 await p.addInitScript(s=>{if(!localStorage.getItem('caochong-waterline-v1'))localStorage.setItem('caochong-waterline-v1',JSON.stringify(s));},s);
 await p.goto('http://127.0.0.1:4184/');await p.locator('h1').waitFor();return p;
}
const raw=p=>p.evaluate(()=>localStorage.getItem('caochong-waterline-v1'));
const open=p=>p.locator('[data-showcase-open]').click();
const nav=(p,a)=>p.locator('#showcase [data-showcase="'+a+'"]');
const jump=(p,n)=>p.locator('#showcase [data-page="'+n+'"]').click();
try{
 const p=await page();const original=await raw(p);
 await p.locator('[data-showcase-open]').focus();await p.keyboard.press('Enter');
 assert.equal(await p.locator('#showcase').evaluate(e=>e.open),true);
 assert.equal(await p.locator('#showcase h2').evaluate(e=>e===document.activeElement),true);
 assert.equal(await nav(p,'prev').isDisabled(),true);
 assert.equal(await p.locator('#showcase details[open]').count(),0);
 await p.locator('#showcase .own-fold summary').focus();await p.keyboard.press('Space');
 assert.match(await p.locator('#showcase .showcase-own').innerText(),/等水面静下来/);
 await p.locator('#showcase .own-fold summary').press('Space');
 assert.equal(await p.locator('#showcase .showcase-own').isVisible(),false);
 ok('键盘进入，学生图注按需展开或收起，参考与学生文字分开');
 await nav(p,'next').click();assert.equal(await nav(p,'next').evaluate(e=>e===document.activeElement),true);
 await p.keyboard.press('ArrowRight');assert.match(await p.locator('.showcase-position').innerText(),/第3页/);
 await p.keyboard.press('ArrowRight');assert.equal(await nav(p,'next').isDisabled(),true);
 await p.keyboard.press('ArrowRight');assert.match(await p.locator('.showcase-position').innerText(),/第4页/);
 await jump(p,0);assert.equal(await p.locator('#showcase details[open]').count(),0);
 await p.waitForTimeout(1200);assert.match(await p.locator('.showcase-position').innerText(),/第1页/);
 ok('按钮、页码与方向键翻页，边界不越界，提示逐页收起，不自动轮播');
 for(let i=0;i<14;i++){await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>!!document.activeElement.closest('#showcase')),true);}
 await p.keyboard.press('Escape');assert.equal(await p.locator('#showcase').evaluate(e=>e.open),false);
 assert.equal(await p.locator('[data-showcase-open]').evaluate(e=>e===document.activeElement),true);
 assert.equal(await raw(p),original);
 await p.reload();assert.match(await p.locator('h1').innerText(),/小书/);assert.equal(await raw(p),original);
 ok('模态焦点不越界，Esc回到入口；打开、翻页、提示、退出与刷新不改学习存档');
 await open(p);await nav(p,'close').click();await p.locator('[data-caption-page]').fill('今天，我想先等水面静下来。');
 await open(p);await p.locator('#showcase .own-fold summary').click();
 assert.match(await p.locator('#showcase .showcase-own').innerText(),/今天，我想/);
 await nav(p,'close').click();assert.equal(await p.locator('[data-caption-page]').inputValue(),'今天，我想先等水面静下来。');
 await p.evaluate(()=>window.print=()=>{});await p.locator('[data-action=print]').click();
 assert.match(await p.locator('#print-sheet').innerText(),/今天，我想/);assert.equal(await p.locator('#print-sheet [data-showcase-open]').count(),0);
 ok('返回后可继续修改，重新展示读取新图注，原打印路径正常且不打印操作入口');
 const lab=await page(finishedState('lab'));const originalLab=await raw(lab);await open(lab);
 assert.match(await lab.locator('#showcase').innerText(),/位置不会变/);
 await jump(lab,1);assert.equal(await lab.locator('.showcase-sample svg').count(),2);
 assert.match(await lab.locator('.showcase-sample').first().innerText(),/1块木块/);
 assert.match(await lab.locator('.showcase-sample').last().innerText(),/3块木块/);
 assert.match(await lab.locator('#showcase').innerText(),/我要修改原来的猜想/);
 await jump(lab,2);assert.match(await lab.locator('#showcase').innerText(),/第一次的结局/);
 await jump(lab,3);assert.equal(await lab.locator('.object-tool').count(),1);assert.deepEqual(await lab.locator('.showcase-objects h3').allTextContents(),['第一次','第二次']);await lab.locator('[data-page="3"]').hover();await lab.waitForTimeout(230);assert.equal(await lab.locator('[data-page="3"]').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(42, 89, 113)');
 assert.match(await lab.locator('#showcase').innerText(),/300克/);
 await nav(lab,'close').click();assert.equal(await raw(lab),originalLab);
 ok('实验展示依据本人问题、原猜想、A/B快照、首次结局和迁移回答，不使用当前桌面代替记录');
 const partial=finishedState('lab','E3');partial.claimedMass=null;partial.reflections=['','',''];partial.learning.lab.samples.B=null;partial.learning.lab.transferNumber='340';partial.learning.lab.transferReason='add';
 const missing=await page(partial);await open(missing);await jump(missing,1);assert.match(await missing.locator('#showcase').innerText(),/B栏还没有记录/);
 await jump(missing,2);assert.match(await missing.locator('#showcase').innerText(),/暂不确认/);assert.match(await missing.locator('#showcase').innerText(),/还没有填写/);
 await jump(missing,3);assert.match(await missing.locator('#showcase').innerText(),/340克/);assert.match(await missing.locator('#showcase').innerText(),/再加20克/);
 ok('缺失记录、暂缓确认和错误答案如实展示，不改成成功或标准答案');
 const old=finishedState();old.learning.revision=4;delete old.learning.workshop;delete old.learning.bridge;
 const legacy=await page(old);const oldRaw=await raw(legacy);await open(legacy);
 await legacy.locator('.own-fold summary').click();assert.match(await legacy.locator('#showcase').innerText(),/这一页还没写话/);
 await nav(legacy,'close').click();assert.equal(await raw(legacy),oldRaw);
 ok('旧存档能展示空图注，进入展示不改写旧存储');
 const failed=await page(finishedState(),1440,false,async p=>{await p.route('**/media/artwork/**',r=>r.abort());});
 await open(failed);await failed.locator('#showcase .media-fallback').waitFor();await nav(failed,'next').click();assert.match(await failed.locator('.showcase-position').innerText(),/第2页/);
 ok('图片加载失败保留画面描述和翻页入口');
 for(const mode of ['story','lab'])for(const width of [320,390,768,1440]){
  const s=finishedState(mode);s.learning.workshop.captions=Array(4).fill('看着水面，慢慢说。'.repeat(15));s.reflections=Array(3).fill('这是我写下的想法。'.repeat(150));
  const q=await page(s,width,width===390);await open(q);
  for(let n=0;n<4;n++){
   await jump(q,n);for(const d of await q.locator('#showcase details summary').all())await d.click();
   assert.equal(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   assert.equal(await q.locator('.showcase-content').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,mode+' '+width+' '+n);
   for(const r of await q.locator('#showcase button,#showcase summary').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))))assert.ok(r.w>=43&&r.h>=43,JSON.stringify({mode,width,...r}));
   await nav(q,'close').focus();
   for(let i=0;i<8;i++){await q.keyboard.press('Tab');const hit=await q.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!h&&(h===e||e.contains(h));});assert.ok(hit,'hidden focus '+mode+' '+width+' '+n);}
  }
  if(width===390){await nav(q,'close').tap();await q.locator('[data-showcase-open]').tap();await nav(q,'next').tap();assert.match(await q.locator('.showcase-position').innerText(),/第2页/);}
  await q.close();
 }
 ok('两版四页在320/390/768/1440宽度及长文字下无横向溢出，44像素目标、键盘焦点和手机点按可用');
 const quiet=await page(finishedState(),1440,false,async p=>{
  await p.addInitScript(()=>{window.__speech=0;window.__pause=0;speechSynthesis.speak=()=>window.__speech++;speechSynthesis.cancel=()=>window.__pause++;localStorage.setItem('caochong-companion-v1',JSON.stringify({motion:true,voice:true,collapsed:false}));});
 });
 await quiet.evaluate(()=>{const a=document.createElement('audio');a.id='test-audio';a.pause=()=>window.__audioPaused=true;document.body.append(a);});
 await open(quiet);const speech=await quiet.evaluate(()=>window.__speech);
 assert.equal(await quiet.evaluate(()=>window.__audioPaused),true);
 assert.equal(await quiet.locator('.learning-companion').evaluate(e=>getComputedStyle(e).visibility),'hidden');
 await nav(quiet,'next').click();await nav(quiet,'close').click();assert.equal(await quiet.evaluate(()=>window.__speech),speech);
 assert.equal(await quiet.locator('.learning-companion').evaluate(e=>getComputedStyle(e).visibility),'visible');
 assert.equal(await quiet.evaluate(()=>JSON.parse(localStorage.getItem('caochong-companion-v1')).voice),true);
 ok('展示暂停已有媒体与伙伴朗读，伙伴退出后恢复可见但不自动开口，原偏好保留');
 let release;let posted=0;
 const pending=await page(finishedState('lab'),1440,false,async p=>{
  await p.route('**/api/companion/status',r=>r.fulfill({json:{available:true}}));
  await p.route('**/api/companion',async r=>{posted++;await new Promise(resolve=>release=resolve);try{await r.fulfill({json:{reply:'这是一条过期的回答。'}});}catch{}});
 });
 await pending.locator('[data-companion=ask]').click();await pending.locator('#companion-question').fill('我想比较什么？');
 await pending.locator('[data-companion=send]').click();await pending.waitForFunction(()=>document.querySelector('[data-companion=send]').disabled);
 await open(pending);release();await pending.waitForTimeout(150);
 await nav(pending,'next').click();assert.equal(posted,1);
 await nav(pending,'close').click();assert.equal(await pending.locator('.companion-answer').innerText(),'');
 ok('打开展示取消在途模型请求，迟到回答不抢讲述，翻页不发送学生作品');
 assert.deepEqual(errors,[]);ok('新增展示场景无页面脚本异常');
 fs.writeFileSync(dir+'/showcase-browser.json',JSON.stringify({checks,errors},null,2)+'\n');
}finally{await browser.close();}
