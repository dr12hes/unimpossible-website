import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(readFileSync(new URL('../production-proxy.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {productionProxy}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const handler=productionProxy({key:'opt_i_private',tenant:'pilot',site:'a'.repeat(32)});
const response=()=>({statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=body;}});
test('rejects cross-site, foreign hosts, non-GET and arbitrary paths before contacting Core',async()=>{
 const original=globalThis.fetch;globalThis.fetch=()=>assert.fail('Must not reach Core');
 try{for(const patch of [{method:'POST'},{url:'/api/production-results/other'},{headers:{host:'evil.test'}},{headers:{host:'127.0.0.1:5187',origin:'https://evil.test'}},{headers:{host:'127.0.0.1:5187','sec-fetch-site':'cross-site'}}]){const res=response();await handler({url:'/api/production-results',method:'GET',headers:{host:'127.0.0.1:5187'},...patch},res);assert.ok([403,404,405].includes(res.statusCode));}}finally{globalThis.fetch=original;}
});
test('calls only the fixed Core resource and never forwards browser credentials',async()=>{
 const original=globalThis.fetch;let sent;
 globalThis.fetch=async(url,options)=>{sent={url,options};return {ok:true,json:async()=>({source:'core'})};};
 try{const res=response();await handler({url:'/api/production-results',method:'GET',headers:{host:'127.0.0.1:5187',cookie:'staff',authorization:'browser','x-tenant-id':'other'}},res);assert.equal(sent.url,'https://core.optaro.io/api/v1/integration/websites/'+'a'.repeat(32)+'/results');assert.deepEqual(sent.options.headers,{'X-API-Key':'opt_i_private','X-Tenant-Id':'pilot'});assert.equal(res.body,'{"source":"core"}');assert.equal(res.headers['Cache-Control'],'no-store');}finally{globalThis.fetch=original;}
});

test('audit requests require same origin and use only the fixed audit endpoint',async()=>{
 const original=globalThis.fetch;let sent;
 globalThis.fetch=async(url,options)=>{sent={url,options};return {ok:true,status:202,json:async()=>({queued:true})};};
 try{
  for(const origin of [undefined,'https://evil.test']){const res=response();await handler({url:'/api/production-results/audit',method:'POST',headers:{host:'127.0.0.1:5187',origin}},res);assert.equal(res.statusCode,403);assert.equal(sent,undefined);}
  const res=response();await handler({url:'/api/production-results/audit',method:'POST',headers:{host:'127.0.0.1:5187',origin:'http://127.0.0.1:5187'}},res);
  assert.equal(res.statusCode,202);assert.equal(sent.url,'https://core.optaro.io/api/v1/integration/websites/'+'a'.repeat(32)+'/audits');assert.equal(sent.options.method,'POST');assert.equal(sent.options.body,undefined);
 }finally{globalThis.fetch=original;}
});
