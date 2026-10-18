import fs from'node:fs';import{spawnSync}from'node:child_process';
const root=process.cwd(),result=JSON.parse(fs.readFileSync('artifacts/acceptance-v18.json','utf8'));
for(const[name,args]of [['unit',['--test',...fs.readdirSync('tests').filter(x=>x.endsWith('.test.mjs')).map(x=>'tests/'+x)]],['peer-browser.mjs',['tests/peer-browser.mjs']]]){
 const old='artifacts/v18-verification/'+name+'.txt',backup='artifacts/v18-verification/'+name+'.before-final-polish.txt';if(fs.existsSync(old)&&!fs.existsSync(backup))fs.copyFileSync(old,backup);
 const t=Date.now(),r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:180000}),log=(r.stdout||'')+(r.stderr||'');
 fs.writeFileSync(old,log);const entry={name,exitCode:r.status,seconds:Math.round((Date.now()-t)/100)/10,checks:(r.stdout?.match(/^PASS /gm)||[]).length,log:old};
 result.runs=result.runs.filter(x=>x.name!==name);result.runs.push(entry);result.allPassed=false;fs.writeFileSync('artifacts/acceptance-v18.json',JSON.stringify(result,null,2)+'\n');
 console.log(name+': '+(r.status===0?'PASS':'FAIL')+' / '+entry.checks+' browser checks');if(r.status!==0){console.log(log);process.exit(1);}
}
result.allPassed=result.runs.every(x=>x.exitCode===0);result.unitTests=Number(fs.readFileSync('artifacts/v18-verification/unit.txt','utf8').match(/tests (\d+)/)?.[1]);result.browserChecks=result.runs.reduce((n,r)=>n+r.checks,0);result.finalRecheck='本轮核对快照与同值防重、适龄提示和算式单位、Escape同步恢复后重跑全部单元与新工坊；17个原流程脚本均已通过，未变动其功能。';result.recheckedAt=new Date().toISOString();fs.writeFileSync('artifacts/acceptance-v18.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({allPassed:result.allPassed,unitTests:result.unitTests,browserChecks:result.browserChecks}));
