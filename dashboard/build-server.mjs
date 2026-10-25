import ts from 'typescript';
import {readFileSync,writeFileSync} from 'node:fs';
writeFileSync('proxy.mjs',ts.transpileModule(readFileSync('production-proxy.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
