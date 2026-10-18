import fs from'node:fs';import{spawnSync}from'node:child_process';
const file='artifacts/acceptance-v17.json',result=JSON.parse(fs.readFileSync(file,'utf8'));
for(const[name,args]of [['unit',['--test',...fs.readdirSync('tests').filter(f=>f.endsWith('.test.mjs')).map(f=>'tests/'+f)]],['showcase-browser.mjs',['tests/showcase-browser.mjs']]]){
 const start=Date.now(),r=spawnSync(process.execPath,args,{encoding:'utf8',timeout:180000}),log=(r.stdout||'')+(r.stderr||'');
 fs.writeFileSync('artifacts/v17-verification/'+name+'.txt',log);
 const entry={name,exitCode:r.status,seconds:Math.round((Date.now()-start)/100)/10,checks:(r.stdout?.match(/^PASS /gm)||[]).length,log:'artifacts/v17-verification/'+name+'.txt'};
 result.runs=result.runs.filter(x=>x.name!==name);result.runs.push(entry);result.allPassed=result.runs.every(x=>x.exitCode===0);fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');
 if(r.status!==0){console.log(log);process.exit(1);}console.log(name+': PASS');
}
result.unitTests=Number(fs.readFileSync('artifacts/v17-verification/unit.txt','utf8').match(/tests (\d+)/)?.[1]);result.browserChecks=result.runs.reduce((n,r)=>n+r.checks,0);result.finalRecheck='最后只补充书箱两次装载标识、图文间距与当前页悬停高亮；重跑全部单元及展示浏览器，其他完整回归结果保留。';fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({allPassed:result.allPassed,unitTests:result.unitTests,browserChecks:result.browserChecks}));
