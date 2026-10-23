import {defineConfig,loadEnv} from 'vite';
import {productionProxy} from './production-proxy';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');const production=mode==='production-results';
 return {define:{__PRODUCTION_RESULTS__:JSON.stringify(production)},plugins:production?[{name:'core-production-results',configureServer(server){const handler=productionProxy({key:env.CORE_RESULTS_KEY||'',tenant:env.CORE_RESULTS_TENANT||'',site:env.CORE_RESULTS_SITE||''});server.middlewares.use('/api/production-results',(req,res)=>{req.url='/api/production-results'+(req.url==='/'?'':req.url);void handler(req,res);});}}]:[],server:{host:'127.0.0.1',port:5187,strictPort:true,headers:{'Referrer-Policy':'no-referrer'},...(production?{}:{proxy:{'/api/proof':{target:'http://127.0.0.1:8187'}}})}};
});
