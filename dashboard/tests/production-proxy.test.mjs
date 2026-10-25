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

test('description actions keep the fixed site and reject caller target fields',async()=>{
 const original=globalThis.fetch;let sent;
 globalThis.fetch=async(url,options)=>{sent={url,options};return {ok:true,status:200,json:async()=>({state:'ready'})};};
 const req=value=>({url:'/api/production-results/descriptions',method:'POST',headers:{host:'127.0.0.1:5187',origin:'http://127.0.0.1:5187'},async *[Symbol.asyncIterator](){yield JSON.stringify(value);}});
 try{
  const denied=response();await handler(req({action:'draft',page_id:4,url:'https://evil.test'}),denied);assert.equal(denied.statusCode,422);assert.equal(sent,undefined);
  const res=response();await handler(req({action:'approve',key:'a'.repeat(36),description:'Reviewed text'}),res);
  assert.equal(sent.url,'https://core.optaro.io/api/v1/integration/websites/'+'a'.repeat(32)+'/descriptions');
  assert.deepEqual(JSON.parse(sent.options.body),{action:'approve',key:'a'.repeat(36),description:'Reviewed text'});
 }finally{globalThis.fetch=original;}
});

test('Google return requires initiating browser cookie and exchanges code server-side',async()=>{
 const {createHash}=await import('node:crypto');const original=globalThis.fetch;let sent;
 globalThis.fetch=async(url,options)=>{sent={url,options};return {ok:true,status:200,json:async()=>({connected:true})};};
 const state='website-metrics.signed';const request={url:'/api/production-results/google-return?state='+state+'&code=private',method:'GET',headers:{host:'127.0.0.1:5187','sec-fetch-site':'cross-site'}};
 try{
  const denied=response();await handler(request,denied);assert.equal(denied.statusCode,403);assert.equal(sent,undefined);
  const res=response();await handler({...request,headers:{...request.headers,cookie:'unimp_google='+createHash('sha256').update(state).digest('hex')}},res);
  assert.equal(res.statusCode,303);assert.equal(res.headers.Location,'/?google=connected');
  assert.equal(JSON.parse(sent.options.body).action,'google_finish');assert.equal(sent.options.method,'POST');assert.ok(sent.url.endsWith('/metrics'));
 }finally{globalThis.fetch=original;}
});

test('Google start sets a short-lived HttpOnly browser-binding cookie',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>({ok:true,status:200,json:async()=>({state:'signed',url:'https://accounts.google.com/test'})});
 try{const res=response();await handler({url:'/api/production-results/metrics',method:'POST',headers:{host:'127.0.0.1:5187',origin:'http://127.0.0.1:5187'},async *[Symbol.asyncIterator](){yield JSON.stringify({action:'google_start'});}},res);
 assert.equal(JSON.parse(res.body).state,undefined);assert.match(res.headers['Set-Cookie'],/HttpOnly; SameSite=Lax/);
 }finally{globalThis.fetch=original;}
});
test('test email settings are same-origin, fixed-site and reject manual review payloads',async()=>{
 const original=globalThis.fetch;let sent;globalThis.fetch=async(url,options)=>{sent={url,options};return {ok:true,status:200,json:async()=>({emails:[]})};};
 const req=(value,origin='http://127.0.0.1:5187')=>({url:'/api/production-results/test-emails',method:'POST',headers:{host:'127.0.0.1:5187',origin},async *[Symbol.asyncIterator](){yield JSON.stringify(value);}});
 try{
  const bad=response();await handler(req({emails:[],submission_id:41}),bad);assert.equal(bad.statusCode,422);assert.equal(sent,undefined);
  const foreign=response();await handler(req({emails:[]},'https://evil.test'),foreign);assert.equal(foreign.statusCode,403);
  const good=response();await handler(req({emails:['test@example.com'],expected:null,request_id:'id'}),good);assert.equal(good.statusCode,200);assert.ok(sent.url.endsWith('/'+'a'.repeat(32)+'/test-emails'));
  const removed=response();await handler({...req({}),url:'/api/production-results/enquiries'},removed);assert.equal(removed.statusCode,404);
 }finally{globalThis.fetch=original;}
});
test('recommendation generation requires same origin and uses only the fixed Core site',async()=>{
 const original=globalThis.fetch;let sent;
 globalThis.fetch=async(url,options)=>{sent={url,options};return {ok:true,status:202,json:async()=>({state:'queued'})};};
 try{
  for(const origin of [undefined,'https://evil.test']){const res=response();await handler({url:'/api/production-results/recommendations',method:'POST',headers:{host:'127.0.0.1:5187',origin}},res);assert.equal(res.statusCode,403);assert.equal(sent,undefined);}
  const res=response();await handler({url:'/api/production-results/recommendations',method:'POST',headers:{host:'127.0.0.1:5187',origin:'http://127.0.0.1:5187'}},res);
  assert.equal(res.statusCode,202);assert.equal(sent.url,'https://core.optaro.io/api/v1/integration/websites/'+'a'.repeat(32)+'/recommendations');assert.equal(sent.options.body,undefined);
 }finally{globalThis.fetch=original;}
});
test('hosted origin requires exact origin and sets Secure Google cookie',async()=>{
 const hosted=productionProxy({key:'opt_i_private',tenant:'pilot',site:'a'.repeat(32),origin:'https://dashboard.unimpossible.co.uk'});
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return {ok:true,status:200,json:async()=>({state:'signed',url:'https://accounts.google.com/test'})};};
 const request=origin=>({url:'/api/production-results/metrics',method:'POST',headers:{host:'dashboard.unimpossible.co.uk',origin},async *[Symbol.asyncIterator](){yield JSON.stringify({action:'google_start'});}});
 try{
  const bad=response();await hosted(request('http://127.0.0.1:5187'),bad);assert.equal(bad.statusCode,403);assert.equal(calls,0);
  const good=response();await hosted(request('https://dashboard.unimpossible.co.uk'),good);assert.equal(good.statusCode,200);assert.match(good.headers['Set-Cookie'],/; Secure/);
 }finally{globalThis.fetch=original;}
});
