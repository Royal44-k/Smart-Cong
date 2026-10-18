import fs from'node:fs';import{chromium}from'playwright';
const dir='tests/artifacts/v18',browser=await chromium.launch({channel:'msedge',headless:true}),meta=[];
async function pair(name,left,right,width,height,scale=1,labels=['v1.7 修改前','v1.8 本轮实现']){
 const p=await browser.newPage({viewport:{width:width*2,height:height+36},deviceScaleFactor:1});
 await p.setContent('<style>*{box-sizing:border-box}body{margin:0;background:#e5ece8;font:14px Microsoft YaHei}main{display:flex}section{width:'+width+'px}b{display:block;height:36px;padding:7px 12px}div{width:'+width+'px;height:'+height+'px;overflow:hidden}img{display:block;transform:scale('+scale+');transform-origin:top left;max-width:none}</style><main>'+[left,right].map((n,i)=>'<section><b>'+labels[i]+'</b><div><img src="data:image/jpeg;base64,'+fs.readFileSync(dir+'/'+n+'.jpg').toString('base64')+'"></div></section>').join('')+'</main>');
 await p.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
 meta.push({name,left,right,output:[width*2,height+36],density:1,scale,sourcePixels:await p.locator('img').evaluateAll(xs=>xs.map(x=>[x.naturalWidth,x.naturalHeight]))});
 await p.screenshot({path:dir+'/'+name+'.jpg',quality:86});await p.close();
}
try{
 for(const mode of ['story','lab']){
  await pair('compare-'+mode+'-desktop','before-'+mode+'-1440-top','after-'+mode+'-1440-top',720,500,.5);
  await pair('compare-'+mode+'-mobile','before-'+mode+'-390-top','after-'+mode+'-390-top',390,1000);
 }
 await pair('peer-modes-desktop','after-story-1440-solve','after-lab-1440-recheck',590,460,.5,['故事 · 补回故事画面','实验 · 用实际答案试算']);
 await pair('peer-modes-mobile','after-story-390-solve','after-lab-390-recheck',390,1000,1,['故事 · 寻找缺失的一幅','实验 · 比较两次重量']);
 fs.writeFileSync(dir+'/visual-comparison.json',JSON.stringify(meta,null,2)+'\n');console.log(meta);
}finally{await browser.close();}
