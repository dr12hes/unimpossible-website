import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(readFileSync(new URL('../src/recommendation-data.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {safeEvidenceUrl,linkedWork}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('evidence links reject executable, relative and credential-bearing URLs',()=>{
 for(const value of ['javascript:alert(1)','data:text/html,test','/relative','https://user:secret@example.com'])assert.equal(safeEvidenceUrl(value),undefined);
 assert.equal(safeEvidenceUrl('https://example.com/guide'),'https://example.com/guide');
});
test('a review links only to its exact operation and page, never another draft or staging copy',()=>{
 const item={work_id:'published',url:'https://unimpossible.co.uk/'};
 assert.equal(linkedWork(item,[{id:'new-draft',url:item.url}]),undefined);
 assert.equal(linkedWork(item,[{id:'published',url:'https://staging.unimpossible.co.uk/'}]),undefined);
 const work={id:'published',url:item.url};assert.equal(linkedWork(item,[work]),work);
});
