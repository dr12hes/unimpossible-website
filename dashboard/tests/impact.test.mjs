import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(readFileSync(new URL('../src/impact-data.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {siteEvents,daily,comparison,offset}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const data={google:{days:Array.from({length:20},(_,i)=>({date:offset('2026-10-01',i),clicks:2,impressions:10}))},referrals:{last_success:'2026-10-21T12:00:00Z',started_at:'2026-10-01T12:00:00Z',updated_at:'2026-10-21T12:00:00Z',days:[{date:'2026-10-10',source:'chatgpt',requests:3},{date:'2026-10-10',source:'google',requests:100}]}};
test('only dated events from the current origin belong to live comparisons',()=>{
 const item={id:'1',url:'https://unimpossible.co.uk/',timeline:[{kind:'published',at:'2026-10-10T00:00:00Z'},{kind:'approved',at:null}]};
 assert.equal(siteEvents([item,{...item,url:'https://staging.unimpossible.co.uk/'}],item.url).length,1);
});
test('missing Google data stays unknown; partial referral days stay unknown; covered zeros and AI sources are counted',()=>{
 assert.equal(daily(data,'2026-10-01').ai,null);assert.equal(daily(data,'2026-10-21').ai,null);
 assert.equal(daily(data,'2026-10-02').ai,0);assert.equal(daily(data,'2026-10-10').ai,3);
 assert.equal(daily(data,'2026-09-30').clicks,null);
 assert.equal(daily({...data,referrals:{...data.referrals,started_at:'2020-01-01T00:00:00Z'}},'2024-01-01').ai,null);
});
test('seven-day comparison excludes change day, respects source timezone and rejects incomplete periods',()=>{
 const c=comparison(data,'2026-10-10T01:00:00Z','clicks');assert.equal(c.anchor,'2026-10-09');assert.equal(c.before,14);assert.equal(c.after,14);
 const a=comparison(data,'2026-10-10T01:00:00Z','ai');assert.equal(a.anchor,'2026-10-10');assert.equal(a.after,0);
 assert.equal(comparison(data,'2026-10-19T12:00:00Z','clicks').after,null);
});

test('operator changes keep their publication date and exclude other sites; enquiry gaps are not zero',()=>{
 const items=[{id:'operator',title:'CTA and form labels',url:'https://unimpossible.co.uk/',source:'operator_record',timeline:[{kind:'published',at:'2026-10-24T19:27:06Z',description:'Approved wording'}]}];
 assert.equal(siteEvents(items,'https://unimpossible.co.uk')[0].source,'operator_record');
 assert.equal(siteEvents(items,'https://another.test').length,0);
 assert.equal(daily(data,'2026-10-10').enquiries,null);
 const measured={...data,enquiries:{started_at:'2026-10-01T12:00:00Z',checked_at:'2026-10-21T12:00:00Z',retention_days:90,days:[{date:'2026-10-10',submissions:2}]}};
 assert.equal(daily(measured,'2026-10-01').enquiries,null);
 assert.equal(daily(measured,'2026-10-10').enquiries,2);
 assert.equal(daily(measured,'2026-10-11').enquiries,0);
 assert.equal(daily(measured,'2026-10-21').enquiries,null);
 assert.equal(comparison(measured,'2026-10-10T01:00:00Z','enquiries').anchor,'2026-10-10');
});

test('excluded tests stay separate from comparisons and incomplete dates stay unknown',()=>{
 const measured={...data,enquiries:{started_at:'2026-10-01T12:00:00Z',checked_at:'2026-10-21T12:00:00Z',retention_days:90,classification_history:[],days:[{date:'2026-10-10',submissions:2,excluded_tests:4}]}};
 assert.equal(daily(measured,'2026-10-10').enquiries,2);
 assert.equal(daily(measured,'2026-10-10').excludedTests,4);
 assert.equal(daily(measured,'2026-10-21').excludedTests,null);
 assert.equal(comparison(measured,'2026-10-09T12:00:00Z','enquiries').after,2);
});
