import fs from'node:fs';import path from'node:path';import crypto from'node:crypto';import{fileURLToPath}from'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),read=p=>fs.readFileSync(path.join(root,p)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const assets=JSON.parse(read('catalog/asset-manifest.json')),bad=[];let bytes=0;
for(const a of assets.files){try{const b=read(a.path);bytes+=b.length;if(b.length!==a.bytes||hash(b)!==a.sha256)bad.push({file:a.path,error:'size/hash mismatch'});}catch{bad.push({file:a.path,error:'missing'});}}
const delivery=JSON.parse(read('classroom/DELIVERY-MANIFEST.json'));for(const a of delivery.files){try{const b=read('classroom/'+a.path);if(b.length!==a.bytes||hash(b)!==a.sha256)bad.push({file:a.path,error:'original classroom manifest mismatch'});}catch{bad.push({file:a.path,error:'classroom delivery missing'});}}
const docs=['README.md','VERIFYING.md','releases/README.md',...fs.readdirSync(path.join(root,'docs')).filter(n=>n.endsWith('.md')).map(n=>'docs/'+n),'docs/superpowers/plans/2026-10-17-project-archive.md'];let links=0;
for(const f of docs){for(const m of read(f).toString('utf8').matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)){const u=m[1];if(/^(https?:|#|mailto:)/.test(u))continue;links++;const target=path.resolve(root,path.dirname(f),decodeURIComponent(u.split('#')[0]));if(!fs.existsSync(target))bad.push({file:f,error:'broken link',target:u});}}
const releases=JSON.parse(read('catalog/release-manifest.json'));if(releases.releases.length!==1||releases.releases[0].tag!=='v1.8')bad.push({error:'release scope must be latest v1.8 only'});
if(assets.files.length!==683||assets.currentClassroomVersion!==delivery.version)bad.push({error:'latest asset scope differs'});
if(bad.length){console.error(JSON.stringify(bad,null,2));process.exit(1);}
console.log(JSON.stringify({pass:true,sourceFiles:assets.files.length,sourceBytes:bytes,originalClassroomDeliveryFiles:delivery.files.length,releases:1,navigationDocuments:docs.length,localNavigationLinks:links},null,2));
