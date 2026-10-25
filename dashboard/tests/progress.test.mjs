import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(readFileSync(new URL('../src/progress-data.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {summariseTrend}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('progress separates missing data from zero and compares only complete weeks',()=>{
 assert.deepEqual(summariseTrend(Array(28).fill(null)),{total:null,days:0,delta:null});
 assert.deepEqual(summariseTrend([...Array(7).fill(0),...Array(7).fill(2)]),{total:14,days:14,delta:14});
 assert.equal(summariseTrend([...Array(7).fill(0),null,...Array(6).fill(2)]).delta,null);
 assert.deepEqual(summariseTrend([0,0]),{total:0,days:2,delta:null});
});
