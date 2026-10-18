import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
const base='http://127.0.0.1:4184', checks=[],errors=[];
await mkdir('artifacts',{recursive:true});
async function fresh(mode='lab',options={}){const context=await browser.newContext({viewport:{width:1440,height:960},...options});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.locator('[data-mode="'+mode+'"]').click();await p.locator('[data-journey=core]').click();await p.locator('[data-action=start]').click();return p;}
const a=async(p,x)=>{if(x==='confirm'&&await p.locator('[data-inquiry=reason][data-value=total]').count())await p.locator('[data-inquiry=reason][data-value=total]').click();return p.locator('[data-action="'+x+'"]').first().click();};
const phase=async(p,x)=>p.locator('main[data-phase="'+x+'"]').waitFor();
async function load(p){await phase(p,'idea');await p.locator('[data-route=split]').click();await a(p,'next');await phase(p,'mark');await p.locator('[data-inquiry=condition][data-value=wait]').click();await a(p,'capture');await phase(p,'load');for(let i=0;i<4;i++)await p.locator('[data-cargo="'+i+'"]').click();}
async function ledger(p,{crew=true,extra=false}={}){if(crew){await p.locator('[data-inquiry=config-find][data-value=crew]').click();await a(p,'crew');}if(extra)await p.locator('[data-cargo="4"]').click();await a(p,'to-ledger');await phase(p,'ledger');for(let i=0;i<(extra?5:4);i++){await p.locator('[data-inquiry=weigh-batch][data-value="'+i+'"]').click();await p.locator('[data-record="'+i+'"]').click();}await a(p,'to-report');await phase(p,'report');}
const ok=t=>{checks.push(t);console.log('PASS '+t);};
try{
 const p=await fresh();await load(p);await ledger(p);await p.getByLabel('我认为大象的质量（kg）').fill('2700');await a(p,'confirm');await phase(p,'ending');assert.equal(await p.locator('main').getAttribute('data-ending'),'E1');ok('真实操作通过E1');
 await p.screenshot({path:'artifacts/ending-desktop.png',fullPage:true,animations:'disabled'});
 const q=await fresh();await load(q);await ledger(q,{crew:false,extra:true});await q.getByLabel('我认为大象的质量（kg）').fill('2760');await a(q,'draft');await a(q,'confirm');assert.equal(await q.locator('main').getAttribute('data-ending'),'E4');await a(q,'repair');await phase(q,'report');await q.getByLabel('把前后人员差额计入比较').check();await q.getByLabel('我认为大象的质量（kg）').fill('2700');await a(q,'confirm');assert.equal(await q.locator('main').getAttribute('data-ending'),'E2');assert.match(await q.locator('main').innerText(),/首次.*证据未齐/);ok('E4修正为E2，首次结局和草稿保留');
 await a(q,'reflect');await q.locator('[data-reflect="0"]').fill('同样的船，还要核对人和器具。');await q.reload();assert.equal(await q.locator('[data-reflect="0"]').inputValue(),'同样的船，还要核对人和器具。');const down=q.waitForEvent('download');await a(q,'export');const download=await down;await download.saveAs('artifacts/learning-record.json');ok('反思刷新恢复并可导出');
 const r=await fresh('story');await load(r);await ledger(r);await a(r,'defer');assert.equal(await r.locator('main').getAttribute('data-ending'),'E3');ok('低年级模式可暂缓结论，得到E3');
 const mobile=await fresh('story',{viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});await load(mobile);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mobile.screenshot({path:'artifacts/experiment-mobile.png',fullPage:true,animations:'disabled'});await mobile.reload();await phase(mobile,'load');assert.equal(await mobile.locator('[data-cargo][aria-pressed=true]').count(),4);ok('小屏无溢出，装载状态刷新保留');
 await ledger(mobile);await mobile.locator('[data-answer=direct]').click();await a(mobile,'confirm');assert.equal(await mobile.locator('main').getAttribute('data-ending'),'E1');ok('低年级图像路径无需大数输入即可完成');
 const desk=await browser.newPage({viewport:{width:1440,height:960}});await desk.goto(base);await desk.screenshot({path:'artifacts/home-desktop.png',fullPage:true,animations:'disabled'});await a(desk,'teacher');assert.match(await desk.locator('#dialog').innerText(),/备课阅读/);await desk.keyboard.press('Escape');assert.equal(await desk.locator('#dialog').evaluate(x=>x.open),false);await desk.keyboard.press('Tab');assert.notEqual(await desk.evaluate(()=>document.activeElement.tagName),'BODY');ok('教师说明、Escape与键盘焦点正常');
 const broken=await browser.newPage();await broken.goto(base);await broken.evaluate(()=>localStorage.setItem('caochong-waterline-v1','{broken'));await broken.reload();assert.match(await broken.locator('#status').innerText(),/存档/);await broken.locator('[data-action=start]').waitFor();ok('损坏存档不白屏并有说明');
 assert.deepEqual(errors,[]);ok('浏览器无运行异常');
 await writeFile('artifacts/browser-checks.json',JSON.stringify({checks,errors},null,2));
}finally{await browser.close();}

