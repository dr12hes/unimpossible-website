import {request} from 'node:http';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {dashboardServer} from '../server.mjs';
test('hosted dashboard protects data and files; no traversal or foreign host',async()=>{
 const authorization='Basic '+Buffer.from('owner:test-only').toString('base64');
 const server=dashboardServer({key:'opt_i_test',tenant:'pilot',site:'a'.repeat(32),origin:'https://dashboard.unimpossible.co.uk',authHash:createHash('sha256').update(authorization).digest('hex'),root:new URL('../dist',import.meta.url).pathname});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const fetch=(url,options={})=>new Promise((resolve,reject)=>{const req=request(url,options,res=>{let body='';res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,headers:{get:key=>res.headers[key]},text:async()=>body}));});req.on('error',reject);req.end();});
 const url='http://127.0.0.1:'+server.address().port;const headers={host:'dashboard.unimpossible.co.uk',authorization};
 try{
  for(const path of ['/','/api/production-results'])assert.equal((await fetch(url+path)).status,401);
  const good=await fetch(url+'/',{headers});assert.equal(good.status,200);assert.equal(good.headers.get('x-robots-tag'),'noindex, nofollow');assert.match(await good.text(),/<html/);
  for(const path of ['/.env','/%2e%2e%2fserver.mjs','/server.mjs'])assert.equal((await fetch(url+path,{headers})).status,404);
  assert.equal((await fetch(url+'/',{headers:{...headers,host:'evil.test'}})).status,403);
  assert.equal((await fetch(url+'/api/production-results/audit',{method:'POST',headers:{...headers,origin:'https://evil.test'}})).status,403);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
