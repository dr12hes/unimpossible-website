import type {IncomingMessage,ServerResponse} from 'node:http';
export function productionProxy(config:{key:string;tenant:string;site:string}){
 if(!config.key.startsWith('opt_i_')||!config.tenant||!/^[a-f0-9]{32}$/.test(config.site))throw new Error('Production results require a scoped Core key, tenant and site.');
 return async(req:IncomingMessage,res:ServerResponse)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
  const send=(status:number,detail:string)=>{res.statusCode=status;res.end(JSON.stringify({detail}));};
  const audit=req.url==='/api/production-results/audit';
  const description=req.url==='/api/production-results/descriptions';
  const write=audit||description;
  if(req.url!=='/api/production-results'&&!audit&&!description)return send(404,'Not found');
  if(req.headers.host!=='127.0.0.1:5187'||(req.headers.origin&&req.headers.origin!=='http://127.0.0.1:5187')||req.headers['sec-fetch-site']==='cross-site')return send(403,'Local dashboard only');
  if(req.method!==(write?'POST':'GET'))return send(405,'Method not allowed');
  if(write&&req.headers.origin!=='http://127.0.0.1:5187')return send(403,'Local dashboard only');
  try{
   let body:string|undefined;
   if(description){
    const chunks:Buffer[]=[];let size=0;for await(const chunk of req){const bytes=Buffer.from(chunk);size+=bytes.length;if(size>4096)return send(413,'Request too large');chunks.push(bytes);}const raw=Buffer.concat(chunks).toString('utf8');
    let value;try{value=JSON.parse(raw);}catch{return send(422,'Invalid description request');}
    if(!value||typeof value!=='object'||Array.isArray(value)||!['draft','approve','publish','verify','undo'].includes(value.action)||Object.keys(value).some(k=>!['action','page_id','key','description'].includes(k)))return send(422,'Invalid description request');
    body=JSON.stringify(value);
   }
   const response=await fetch('https://core.optaro.io/api/v1/integration/websites/'+config.site+(audit?'/audits':description?'/descriptions':'/results'),{method:write?'POST':'GET',headers:{'X-API-Key':config.key,'X-Tenant-Id':config.tenant,...(description?{'Content-Type':'application/json'}:{})},body,redirect:'error',signal:AbortSignal.timeout(15000)});
   if(!response.ok&&description){const error=await response.json().catch(()=>({}));return send([401,403,404,409,422].includes(response.status)?response.status:502,typeof error.detail==='string'?error.detail:'Description action failed.');}
   if(!response.ok)return send([401,403,409,429].includes(response.status)?response.status:502,response.status===429?'Please wait one minute between audits.':audit?'Core could not queue the audit.':'Core results unavailable');
   res.statusCode=response.status;
   res.end(JSON.stringify(await response.json()));
  }catch{return send(502,'Core results unavailable');}
 };
}
