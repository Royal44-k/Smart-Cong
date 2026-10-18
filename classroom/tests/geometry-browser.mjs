import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'msedge',headless:true});
try{
 const p=await b.newPage({reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4184');
 const bad=await p.evaluate(async()=>{
  const {createState}=await import('/src/engine.mjs');const {boatDiagram}=await import('/src/diagram.mjs');
  const host=document.createElement('div');host.style.width='800px';document.body.append(host);const bad=[];
  for(let mask=0;mask<32;mask++)for(const crew of [false,true]){
   const s=createState('lab');s.phase='load';s.crewPresent=crew;s.cargo=s.cargo.map((_,i)=>!!(mask&(1<<i)));
   host.innerHTML=boatDiagram(s);const svg=host.querySelector('svg'),body=host.querySelector('.hull > path');
   const box=body.getBBox(),bottom=svg.createSVGPoint();bottom.y=box.y+box.height;
   const worldBottom=bottom.matrixTransform(body.getScreenCTM()).y;const water=svg.createSVGPoint();water.y=238;const worldWater=water.matrixTransform(svg.getScreenCTM()).y;
   if(worldBottom<=worldWater)bad.push({mask,crew,bottom:worldBottom,water:worldWater});
  }host.remove();return bad;
 });
 assert.deepEqual(bad,[],'Loaded or empty boat must remain in the water');
 console.log('PASS all 64 cargo/crew combinations remain in the water');
}finally{await b.close();}

