import type {DescriptionWork} from './Descriptions';
import type {MetricsData} from './Metrics';
export const aiSources=new Set(['chatgpt','claude','perplexity','copilot','gemini']);
export const labels:Record<string,string>={suggested:'Suggested',revised:'Revised',approved:'Approved',published:'Published',verified:'Verified',undo_requested:'Undo requested',undo_applied:'Undo applied',undone:'Undo verified'};
export const day=(at:string,zone='UTC')=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
export const offset=(date:string,n:number)=>new Date(Date.parse(date+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
export function siteEvents(items:DescriptionWork[],url:string){
 return items.filter(item=>{try{return new URL(item.url).origin===new URL(url).origin;}catch{return false;}}).flatMap(item=>(item.timeline||[]).filter(e=>e.at&&Number.isFinite(Date.parse(e.at))&&labels[e.kind]).map((e,i)=>({id:item.id+':'+i,at:e.at!,kind:e.kind,title:item.title,url:item.url,description:e.description}))).sort((a,b)=>b.at.localeCompare(a.at));
}
export function daily(data:MetricsData,date:string){
 const google=(data.google.days||[]).find(d=>d.date===date);
 // Only complete UTC days covered by the counter may be interpreted as zero.
 const covered=!!(data.referrals.last_success&&data.referrals.started_at&&data.referrals.updated_at&&date>day(data.referrals.started_at)&&date<day(data.referrals.updated_at)&&date>=offset(day(data.referrals.updated_at),-400));
 return {clicks:google?.clicks??null,impressions:google?.impressions??null,ai:covered?(data.referrals.days||[]).filter(d=>d.date===date&&aiSources.has(d.source)).reduce((n,d)=>n+d.requests,0):null};
}
export function comparison(data:MetricsData,at:string,metric:'clicks'|'impressions'|'ai'){
 const anchor=day(at,metric==='ai'?'UTC':'America/Los_Angeles');
 const period=(start:number)=>Array.from({length:7},(_,i)=>daily(data,offset(anchor,start+i))[metric]);
 const before=period(-7),after=period(1);
 const sum=(rows:(number|null)[])=>rows.every(v=>v!==null)?rows.reduce<number>((n,v)=>n+v!,0):null;
 return {before:sum(before),after:sum(after),beforeDays:before.filter(v=>v!==null).length,afterDays:after.filter(v=>v!==null).length,from:offset(anchor,-7),through:offset(anchor,7),anchor};
}
