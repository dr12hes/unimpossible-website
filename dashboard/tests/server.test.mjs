import {request} from 'node:http';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {dashboardServer} from '../server.mjs';
test('form login, session expiry/logout and hosted boundaries',async()=>{
 const authorization='Basic '+Buffer.from('owner:test-only').toString('base64');
 const server=await dashboardServer({key:'opt_i_test',tenant:'pilot',site:'a'.repeat(32),origin:'https://dashboard.unimpossible.co.uk',authHash:createHash('sha256').update(authorization).digest('hex'),root:new URL('../dist',import.meta.url).pathname});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const fetch=(url,options={})=>new Promise((resolve,reject)=>{const req=request(url,options,res=>{let body='';res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});req.on('error',reject);req.end(options.body);});
 const url='http://127.0.0.1:'+server.address().port;const headers={host:'dashboard.unimpossible.co.uk'};
 const login=(body,origin='https://dashboard.unimpossible.co.uk')=>fetch(url+'/login',{method:'POST',headers:{...headers,origin,'content-type':'application/x-www-form-urlencoded'},body});
 try{
  const signIn=await fetch(url+'/',{headers});assert.equal(signIn.status,200);assert.match(signIn.body,/Welcome back/);assert.equal(signIn.headers['referrer-policy'],'same-origin');assert.equal(signIn.headers['www-authenticate'],undefined);
  assert.equal((await fetch(url+'/api/production-results',{headers})).status,401);
  assert.equal((await login('username=owner&password=test-only','https://evil.test')).status,403);
  assert.equal((await login('username=owner&password=wrong')).status,401);
  const signed=await login('username=owner&password=test-only');assert.equal(signed.status,303);
  const cookie=signed.headers['set-cookie'][0];assert.match(cookie,/Secure; HttpOnly; SameSite=Lax; Path=\//);headers.cookie=cookie.split(';')[0];
  const good=await fetch(url+'/',{headers});assert.equal(good.status,200);assert.equal(good.headers['x-robots-tag'],'noindex, nofollow');assert.match(good.body,/<html/);
  for(const path of ['/.env','/%2e%2e%2fserver.mjs','/server.mjs'])assert.equal((await fetch(url+path,{headers})).status,404);
  assert.equal((await fetch(url+'/',{headers:{...headers,host:'evil.test'}})).status,403);
  assert.equal((await fetch(url+'/api/production-results/audit',{method:'POST',headers:{...headers,origin:'https://evil.test'}})).status,403);
  assert.equal((await fetch(url+'/api/production-results',{headers:{...headers,cookie:headers.cookie+'tampered'}})).status,401);
  const originalNow=Date.now;try{Date.now=()=>originalNow()+13*60*60*1000;assert.equal((await fetch(url+'/api/production-results',{headers})).status,401);}finally{Date.now=originalNow;}
  const again=await login('username=owner&password=test-only');headers.cookie=again.headers['set-cookie'][0].split(';')[0];
  assert.equal((await fetch(url+'/logout',{method:'POST',headers:{...headers,origin:'https://dashboard.unimpossible.co.uk'}})).status,303);
  assert.equal((await fetch(url+'/api/production-results',{headers})).status,401);
  for(let i=0;i<9;i++)assert.equal((await login('username=owner&password=wrong')).status,401);
  assert.equal((await login('username=owner&password=wrong')).status,429);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
