import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await chromium.launch({channel:'msedge',headless:true});const checks=[];
try{
 const p=await b.newPage({viewport:{width:1200,height:900},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4184');
 async function tabTo(selector){for(let i=0;i<90;i++){if(await p.evaluate(sel=>document.activeElement?.matches(sel),selector))return;await p.keyboard.press('Tab');}throw Error('Keyboard cannot reach '+selector);}
 async function press(selector,key='Enter'){await tabTo(selector);await p.keyboard.press(key);}
 await press('[data-journey=core]');await press('[data-action=start]');await press('[data-route=split]');await press('[data-action=next]');
 await press('[data-inquiry=condition][data-value=wait]','Space');await press('[data-action=capture]');
 for(let i=0;i<4;i++)await press('[data-cargo="'+i+'"]');
 await press('[data-inquiry=config-find][data-value=crew]');await press('[data-action=crew]');await press('[data-action=to-ledger]');
 for(let i=0;i<4;i++){await press('[data-inquiry=weigh-batch][data-value="'+i+'"]');await press('[data-record="'+i+'"]');}
 await press('[data-action=to-report]');await press('[data-answer=direct]');await press('[data-inquiry=reason][data-value=total]');await press('[data-action=confirm]');
 assert.equal(await p.locator('main').getAttribute('data-ending'),'E1');checks.push('仅Tab/Enter/Space完成称象练习E1');
 await press('[data-action=reflect]');await tabTo('[data-reflect="0"]');await p.keyboard.type('先留参照，再比较条件。');
 await p.evaluate(()=>window.print=()=>{window.__printed=true;});await press('[data-action=print]');
 assert.equal(await p.evaluate(()=>window.__printed),true);assert.match(await p.locator('#print-sheet').textContent(),/先留参照/);
 await p.emulateMedia({media:'print'});assert.equal(await p.locator('#app').evaluate(x=>getComputedStyle(x).display),'none');assert.equal(await p.locator('#print-sheet').evaluate(x=>getComputedStyle(x).display),'block');
 await p.screenshot({path:'artifacts/print-preview.png',fullPage:true,animations:'disabled'});checks.push('打印版包含真实反思且隐藏游戏界面');
 await writeFile('artifacts/keyboard-checks.json',JSON.stringify({checks},null,2));checks.forEach(x=>console.log('PASS '+x));
}finally{await b.close();}

