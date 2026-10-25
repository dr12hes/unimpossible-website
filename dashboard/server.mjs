import {createServer} from 'node:http';
import {createHash,timingSafeEqual,randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {productionProxy} from './proxy.mjs';

// shortcut: one owner login for our pilot; replace with account sessions before customer onboarding.
export async function dashboardServer(config){
 const proxy=productionProxy(config);
 if(!/^[a-f0-9]{64}$/.test(config.authHash||''))throw new Error('Dashboard login is required');
 const expected=Buffer.from(config.authHash,'hex');const root=resolve(config.root);
 const sessions=new Map();let failures=[];
 const cookie='__Host-unimp_session';const ttl=12*60*60*1000;
 const signIn=await readFile(new URL('./sign-in.html',import.meta.url),'utf8');
 return createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  if(req.url==='/healthz'){res.end('ok');return;}
  if(req.headers.host!==new URL(config.origin).host){res.writeHead(403);res.end();return;}
  const redirect=path=>{res.writeHead(303,{Location:path});res.end();};
  const login=(status,message='')=>{res.writeHead(status,{'Content-Type':'text/html; charset=utf-8'});res.end(signIn.replace('{{ERROR}}',message));};
  const now=Date.now();for(const [key,expiry] of sessions)if(expiry<=now)sessions.delete(key);
  const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookie+'='))?.slice(cookie.length+1);
  const tokenHash=createHash('sha256').update(token||'').digest('hex');
  if(req.url==='/login'&&req.method==='POST'){
   if(req.headers.origin!==config.origin){res.writeHead(403);res.end();return;}
   failures=failures.filter(t=>t>now-60000);
   if(failures.length>=10){res.setHeader('Retry-After','60');login(429,'Too many attempts. Please wait a minute and try again.');return;}
   if(!req.headers['content-type']?.startsWith('application/x-www-form-urlencoded')){login(400,'Please use the sign-in form.');return;}
   try{
    let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>4096){login(413,'The sign-in request is too large.');return;}}
    const fields=new URLSearchParams(body);const authorization='Basic '+Buffer.from((fields.get('username')||'')+':'+(fields.get('password')||'')).toString('base64');
    if(!timingSafeEqual(createHash('sha256').update(authorization).digest(),expected)){failures.push(now);login(401,'The username or password is incorrect. Please try again.');return;}
    const session=randomBytes(32).toString('hex');sessions.delete(tokenHash);
    if(sessions.size>=16)sessions.delete(sessions.keys().next().value);
    sessions.set(createHash('sha256').update(session).digest('hex'),now+ttl);
    res.setHeader('Set-Cookie',cookie+'='+session+'; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age='+ttl/1000);redirect('/');return;
   }catch{if(!res.writableEnded){res.writeHead(400);res.end('Sign-in could not finish. Please try again.');}return;}
  }
  if(req.url==='/logout'&&req.method==='POST'){
   if(req.headers.origin!==config.origin){res.writeHead(403);res.end();return;}
   sessions.delete(tokenHash);res.setHeader('Set-Cookie',cookie+'=; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');redirect('/login');return;
  }
  if(!sessions.has(tokenHash)){
   if(req.url?.startsWith('/api/')){res.writeHead(401,{'Content-Type':'application/json'});res.end(JSON.stringify({detail:'Your session has ended. Reload the page to sign in.'}));return;}
   if(['GET','HEAD'].includes(req.method)){login(200);return;}
   res.writeHead(405);res.end();return;
  }
  if(req.url==='/login'){redirect('/');return;}
  if(req.url?.startsWith('/api/')){await proxy(req,res);return;}
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
 (await dashboardServer({...config,root:fileURLToPath(new URL('./dist',import.meta.url))})).listen(8080,'0.0.0.0');
}
