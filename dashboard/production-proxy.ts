import type {IncomingMessage,ServerResponse} from 'node:http';
export function productionProxy(config:{key:string;tenant:string;site:string}){
 if(!config.key.startsWith('opt_i_')||!config.tenant||!/^[a-f0-9]{32}$/.test(config.site))throw new Error('Production results require a scoped Core key, tenant and site.');
 return async(req:IncomingMessage,res:ServerResponse)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
  const send=(status:number,detail:string)=>{res.statusCode=status;res.end(JSON.stringify({detail}));};
  if(req.url!=='/api/production-results')return send(404,'Not found');
  if(req.headers.host!=='127.0.0.1:5187'||(req.headers.origin&&req.headers.origin!=='http://127.0.0.1:5187')||req.headers['sec-fetch-site']==='cross-site')return send(403,'Local dashboard only');
  if(req.method!=='GET')return send(405,'Read-only results');
  try{
   const response=await fetch('https://core.optaro.io/api/v1/integration/websites/'+config.site+'/results',{headers:{'X-API-Key':config.key,'X-Tenant-Id':config.tenant},redirect:'error',signal:AbortSignal.timeout(15000)});
   if(!response.ok)return send(response.status===401||response.status===403?response.status:502,'Core results unavailable');
   res.end(JSON.stringify(await response.json()));
  }catch{return send(502,'Core results unavailable');}
 };
}
