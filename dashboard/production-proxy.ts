import {createHash} from 'node:crypto';
import type {IncomingMessage,ServerResponse} from 'node:http';
export function productionProxy(config:{key:string;tenant:string;site:string}){
 if(!config.key.startsWith('opt_i_')||!config.tenant||!/^[a-f0-9]{32}$/.test(config.site))throw new Error('Production results require a scoped Core key, tenant and site.');
 return async(req:IncomingMessage,res:ServerResponse)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
  const send=(status:number,detail:string)=>{res.statusCode=status;res.end(JSON.stringify({detail}));};
  const incoming=new URL(req.url||'/', 'http://127.0.0.1:5187');
  const googleReturn=incoming.pathname==='/api/production-results/google-return';
  const metrics=req.url==='/api/production-results/metrics';
  const audit=req.url==='/api/production-results/audit';
  const description=req.url==='/api/production-results/descriptions';
  const write=audit||description||metrics;
  if(req.url!=='/api/production-results'&&!audit&&!description&&!metrics&&!googleReturn)return send(404,'Not found');
  if(req.headers.host!=='127.0.0.1:5187'||(req.headers.origin&&req.headers.origin!=='http://127.0.0.1:5187')||(!googleReturn&&req.headers['sec-fetch-site']==='cross-site'))return send(403,'Local dashboard only');
  if(req.method!==(write?'POST':'GET'))return send(405,'Method not allowed');
  if(write&&req.headers.origin!=='http://127.0.0.1:5187')return send(403,'Local dashboard only');
  try{
   let body:string|undefined;
   if(description||metrics){
    const chunks:Buffer[]=[];let size=0;for await(const chunk of req){const bytes=Buffer.from(chunk);size+=bytes.length;if(size>4096)return send(413,'Request too large');chunks.push(bytes);}const raw=Buffer.concat(chunks).toString('utf8');
    let value;try{value=JSON.parse(raw);}catch{return send(422,'Invalid description request');}
    if(metrics){if(!value||typeof value!=='object'||!['enable','google_start'].includes(value.action)||Object.keys(value).some(k=>k!=='action'))return send(422,'Invalid metrics request');}
    else if(!value||typeof value!=='object'||Array.isArray(value)||!['draft','approve','publish','verify','undo'].includes(value.action)||Object.keys(value).some(k=>!['action','page_id','key','description'].includes(k)))return send(422,'Invalid description request');
    body=JSON.stringify(value);
   }
   if(googleReturn){
    const state=incoming.searchParams.get('state')||'';
    const cookie=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('unimp_google='))?.slice(13);
    if(!cookie||cookie!==createHash('sha256').update(state).digest('hex'))return send(403,'Connection browser did not match. Start again from the dashboard.');
    res.setHeader('Set-Cookie','unimp_google=; HttpOnly; SameSite=Lax; Path=/api/production-results; Max-Age=0');
    if(incoming.searchParams.get('error')){res.statusCode=303;res.setHeader('Location','/?google=cancelled');res.end();return;}
    body=JSON.stringify({action:'google_finish',state,code:incoming.searchParams.get('code')||''});
   }
   const response=await fetch('https://core.optaro.io/api/v1/integration/websites/'+config.site+(audit?'/audits':description?'/descriptions':metrics||googleReturn?'/metrics':'/results'),{method:write||googleReturn?'POST':'GET',headers:{'X-API-Key':config.key,'X-Tenant-Id':config.tenant,...(description||metrics||googleReturn?{'Content-Type':'application/json'}:{})},body,redirect:'error',signal:AbortSignal.timeout(metrics||googleReturn?60000:15000)});
   if(!response.ok&&googleReturn){res.statusCode=303;res.setHeader('Location','/?google=failed');res.end();return;}
   if(!response.ok&&(description||metrics)){const error=await response.json().catch(()=>({}));return send([401,403,404,409,422].includes(response.status)?response.status:502,typeof error.detail==='string'?error.detail:metrics?'Google connection failed.':'Description action failed.');}
   if(!response.ok)return send([401,403,409,429].includes(response.status)?response.status:502,response.status===429?'Please wait one minute between audits.':audit?'Core could not queue the audit.':'Core results unavailable');
   const result=await response.json();
   if(googleReturn){res.statusCode=303;res.setHeader('Location','/?google=connected');res.end();return;}
   if(metrics&&result.state){
    res.setHeader('Set-Cookie','unimp_google='+createHash('sha256').update(result.state).digest('hex')+'; HttpOnly; SameSite=Lax; Path=/api/production-results; Max-Age=600');
    delete result.state;
   }
   res.statusCode=response.status;
   res.end(JSON.stringify(result));
  }catch{return send(502,'Core results unavailable');}
 };
}
