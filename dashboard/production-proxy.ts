import type {IncomingMessage,ServerResponse} from 'node:http';
export function productionProxy(config:{key:string;tenant:string;site:string}){
 if(!config.key.startsWith('opt_i_')||!config.tenant||!/^[a-f0-9]{32}$/.test(config.site))throw new Error('Production results require a scoped Core key, tenant and site.');
 return async(req:IncomingMessage,res:ServerResponse)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
  const send=(status:number,detail:string)=>{res.statusCode=status;res.end(JSON.stringify({detail}));};
  const audit=req.url==='/api/production-results/audit';
  if(req.url!=='/api/production-results'&&!audit)return send(404,'Not found');
  if(req.headers.host!=='127.0.0.1:5187'||(req.headers.origin&&req.headers.origin!=='http://127.0.0.1:5187')||req.headers['sec-fetch-site']==='cross-site')return send(403,'Local dashboard only');
  if(req.method!==(audit?'POST':'GET'))return send(405,'Method not allowed');
  if(audit&&req.headers.origin!=='http://127.0.0.1:5187')return send(403,'Local dashboard only');
  try{
   const response=await fetch('https://core.optaro.io/api/v1/integration/websites/'+config.site+(audit?'/audits':'/results'),{method:audit?'POST':'GET',headers:{'X-API-Key':config.key,'X-Tenant-Id':config.tenant},redirect:'error',signal:AbortSignal.timeout(15000)});
   if(!response.ok)return send([401,403,409,429].includes(response.status)?response.status:502,response.status===429?'Please wait one minute between audits.':audit?'Core could not queue the audit.':'Core results unavailable');
   res.statusCode=response.status;
   res.end(JSON.stringify(await response.json()));
  }catch{return send(502,'Core results unavailable');}
 };
}
