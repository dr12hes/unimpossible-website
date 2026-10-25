// Missing reports stay missing; only complete weeks support a comparison.
export function summariseTrend(values:(number|null)[]){
 const reported=values.filter((v):v is number=>v!==null);
 const recent=values.slice(-7),previous=values.slice(-14,-7);
 const complete=(rows:(number|null)[])=>rows.length===7&&rows.every(v=>v!==null);
 const sum=(rows:(number|null)[])=>rows.reduce<number>((total,v)=>total+(v??0),0);
 return {total:reported.length?sum(reported):null,days:reported.length,delta:complete(recent)&&complete(previous)?sum(recent)-sum(previous):null};
}
