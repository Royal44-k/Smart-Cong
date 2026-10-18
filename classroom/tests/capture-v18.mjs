import{chromium}from'playwright';import fs from'node:fs';import{finishedState}from'./showcase-fixtures.mjs';
const prefix=process.argv[2]||'before',dir='tests/artifacts/v18';fs.mkdirSync(dir,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const mode of ['story','lab'])for(const width of [1440,390]){
 const p=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce',deviceScaleFactor:1});
 await p.addInitScript(s=>localStorage.setItem('caochong-waterline-v1',JSON.stringify(s)),finishedState(mode));
 await p.goto('http://127.0.0.1:4184/');await p.locator('main h1').waitFor();
 const shot=async name=>p.locator('#peer-workshop').screenshot({path:dir+'/'+prefix+'-'+mode+'-'+width+'-'+name+'.jpg',quality:87});
 await p.screenshot({path:dir+'/'+prefix+'-'+mode+'-'+width+'.jpg',fullPage:true,quality:77});await p.screenshot({path:dir+'/'+prefix+'-'+mode+'-'+width+'-top.jpg',quality:85});
 if(prefix!=='before'){
  await p.locator('[data-peer-open]').click();
  if(mode==='lab')await p.locator('[data-peer=position][data-value=second]').click();
  await p.locator('.peer-content').evaluate(e=>e.scrollTop=0);await shot('make');await p.locator('[data-peer=prepare]').click();await shot('pass');await p.locator('[data-peer=solve]').click();await shot('solve');
  if(mode==='story'){await p.locator('[data-peer=guess][data-value="1"]').click();await p.locator('[data-peer=check]').click();await shot('explain');await p.locator('[data-peer=reason][data-value=purpose]').click();await p.locator('[data-peer=check]').click();}
  else{await p.locator('[data-peer=relation][data-value=more]').click();await p.locator('[data-peer-number]').fill('300');await p.locator('[data-peer=check]').click();await p.locator('.peer-proof').scrollIntoViewIfNeeded();await shot('recheck');await p.locator('[data-peer-number]').fill('340');await p.locator('[data-peer=check]').click();}
  await shot('done');
 }await p.close();
}}finally{await browser.close();}
