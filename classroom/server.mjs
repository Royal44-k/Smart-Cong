import{createCompanionAPI}from'./server/companion-api.mjs';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const port=Number(process.env.CAOCHONG_PORT||4184);
const types={'.wav':'audio/wav','.csv':'text/csv; charset=utf-8','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8'};
const companionAPI=createCompanionAPI();
createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-cache');res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
 if(await companionAPI(req,res))return;
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{
  const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(p.includes('\\')||p.includes('\0')||p.split('/').some(x=>x.startsWith('.')))throw Error();
  const rel=p==='/'?'index.html':p.slice(1);
  if(!['index.html','app.css','src','media','docs'].includes(rel.split('/')[0]))throw Error();
  const file=path.resolve(root,rel);if(!file.startsWith(root))throw Error();
  const meta=await stat(file);if(!meta.isFile())throw Error();
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':meta.size});
  res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('曹冲称象：http://127.0.0.1:'+port)).on('error',e=>{console.error(e.message);process.exitCode=1;});

