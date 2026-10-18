import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true}),checks=[],failures=[];
async function setup(block=false){
 const ctx=await browser.newContext({viewport:{width:1200,height:900},reducedMotion:'reduce'});
 if(block)await ctx.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('disabled')}}));
 const p=await ctx.newPage();await p.goto('http://127.0.0.1:4184');await p.locator('[data-journey=core]').click();return p;
}
async function mark(p){await p.locator('[data-action=start]').click();await p.locator('[data-route=split]').click();await p.locator('[data-action=next]').click();}
async function check(name,fn){try{await fn();checks.push(name);console.log('PASS '+name);}catch(e){failures.push({name,error:e.message});console.log('FAIL '+name+': '+e.message);}}
try{
 await check('Space操作后留在原条件，不丢失键盘焦点',async()=>{const p=await setup();await mark(p);const input=p.locator('[data-inquiry=condition][data-value=wait]');await input.focus();await p.keyboard.press('Space');assert.equal(await p.evaluate(()=>document.activeElement.dataset.value),'wait');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.dataset.value),'balance');});
 await check('换载条件检查展开状态与焦点在更新后保留',async()=>{const p=await setup();await mark(p);await p.locator('[data-inquiry=condition][data-value=wait]').click();await p.locator('[data-action=capture]').click();await p.locator('.conditions summary').click();await p.locator('[data-inquiry=condition][data-value=balance]').focus();await p.keyboard.press('Space');assert.equal(await p.locator('.conditions').evaluate(x=>x.open),true);assert.equal(await p.evaluate(()=>document.activeElement.dataset.value),'balance');});
 await check('快速重复点击不能跳过留线或重复呈报',async()=>{const p=await setup();await p.locator('[data-action=start]').dblclick();await p.locator('[data-route=split]').click();await p.locator('[data-action=next]').dblclick();assert.equal(await p.locator('main').getAttribute('data-phase'),'mark');assert.equal(await p.locator('[data-action=capture]').isDisabled(),true);});
 await check('禁用localStorage仍可完整体验并下载',async()=>{const p=await setup(true);assert.match(await p.locator('#status').innerText(),/存储不可用/);await mark(p);await p.locator('[data-inquiry=condition][data-value=wait]').click();await p.locator('[data-action=capture]').click();for(let i=0;i<4;i++)await p.locator('[data-cargo="'+i+'"]').click();await p.locator('[data-inquiry=config-find][data-value=crew]').click();await p.locator('[data-action=crew]').click();await p.locator('[data-action=to-ledger]').click();await p.locator('[data-action=to-report]').click();await p.locator('[data-action=defer]').click();await p.locator('[data-action=reflect]').click();const wait=p.waitForEvent('download');await p.locator('[data-action=export]').click();assert.ok((await wait).suggestedFilename().endsWith('.json'));});
 await check('两张图片实际加载，减少动态关闭过渡',async()=>{const p=await setup();await p.locator('.cover-image').evaluate(i=>i.decode());assert.equal(await p.locator('.cover-image').evaluate(i=>i.complete&&i.naturalWidth>0),true);await mark(p);await p.locator('.scene-image').evaluate(i=>i.decode());assert.equal(await p.locator('.scene-image').evaluate(i=>i.complete&&i.naturalWidth>0),true);assert.equal(await p.locator('.hull').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');});
 await writeFile('artifacts/edge-checks.json',JSON.stringify({checks,failures},null,2));
 assert.deepEqual(failures,[]);
}finally{await browser.close();}


