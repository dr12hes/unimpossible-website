import {createServer} from 'node:http';
import {createHash,timingSafeEqual} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {productionProxy} from './proxy.mjs';

// shortcut: one owner login for our pilot; replace with account sessions before customer onboarding.
export function dashboardServer(config){
 const proxy=productionProxy(config);
 if(!/^[a-f0-9]{64}$/.test(config.authHash||''))throw new Error('Dashboard login is required');
 const expected=Buffer.from(config.authHash,'hex');const root=resolve(config.root);
 return createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  if(req.url==='/healthz'){res.end('ok');return;}
  const authorization=req.headers.authorization||'';
  const actual=createHash('sha256').update(authorization).digest();
  if(!timingSafeEqual(actual,expected)){res.writeHead(401,{'WWW-Authenticate':'Basic realm="Unimpossible dashboard", charset="UTF-8"'});res.end('Sign in to Unimpossible');return;}
  if(req.url?.startsWith('/api/')){await proxy(req,res);return;}
  if(req.headers.host!==new URL(config.origin).host){res.writeHead(403);res.end();return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  try{
   const pathname=decodeURIComponent(new URL(req.url,'https://dashboard.unimpossible.co.uk').pathname);
   const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
   if(!path.startsWith(root+sep)||pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(404);res.end();return;}
   const body=await readFile(path);
   res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'})[extname(path)]||'application/octet-stream');
   res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404);res.end('Not found');}
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const config=JSON.parse(await readFile(process.env.DASHBOARD_CONFIG||'/run/secrets/dashboard.json','utf8'));
 dashboardServer({...config,root:fileURLToPath(new URL('./dist',import.meta.url))}).listen(8080,'0.0.0.0');
}
