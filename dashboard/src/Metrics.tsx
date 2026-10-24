import {useState} from 'react';
type SearchDay={date:string;clicks:number;impressions:number;ctr:number;position:number};
type ReferralDay={date:string;source:string;page:string;requests:number};
type Source={last_success?:string;checked_at?:string;error?:string|null};
export type EnquiryData={days:{date:string;submissions:number}[];started_at:string;checked_at:string;source:string;retention_days:number};
export type MetricsData={enquiries?:EnquiryData|null;google_email:string|null;property:string|null;next_due:string;google:Source&{days?:SearchDay[];from?:string;through?:string};referrals:Source&{days?:ReferralDay[];started_at?:string;updated_at?:string}};
const ai=new Set(['chatgpt','claude','perplexity','copilot','gemini']);
const stamp=(s?:string)=>s?new Date(s).toLocaleString():'Not imported yet';
function Trend({rows,label}:{rows:{date:string;value:number}[];label:string}){
 if(!rows.length)return <p className="metric-empty">No reported data yet.</p>;
 const max=Math.max(1,...rows.map(r=>r.value));
 return <div className="metric-bars" role="img" aria-label={label+' by date. Exact totals are available below.'}>{rows.slice(-28).map(r=><div key={r.date} title={`${r.date}: ${r.value}`}><span style={{height:`${Math.max(2,r.value/max*100)}%`}}/></div>)}</div>;
}
export function Metrics({data,canWrite,changed}:{data?:MetricsData|null;canWrite:boolean;changed:()=>void}){
 const outcome=new URLSearchParams(window.location.search).get('google');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function action(action:string){setBusy(true);setError('');try{const response=await fetch('/api/production-results/metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})});const value=await response.json();if(!response.ok)throw new Error(value.detail||'Connection unavailable.');if(value.url){window.location.assign(value.url);return;}changed();}catch(e){setError(e instanceof Error?e.message:'Connection unavailable.');}finally{setBusy(false);}}
 const search=(data?.google.days||[]).slice(-28);const clicks=search.reduce((n,d)=>n+d.clicks,0);const impressions=search.reduce((n,d)=>n+d.impressions,0);
 const totals=new Map<string,number>();for(const r of data?.referrals.days||[])if(ai.has(r.source))totals.set(r.date,(totals.get(r.date)||0)+r.requests);
 const referrals=[...totals].sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({date,value}));
 return <section className="card"><span className="eyebrow">SEARCH & DISCOVERY</span><h2>Your baseline, day by day</h2><p>Follow search traffic and recognised AI referrals alongside your change history. Movement alone does not prove a change worked.</p>
 {outcome&&<p role="status" className="notice">{outcome==='connected'?'Google is connected. Your first daily import is queued.':outcome==='cancelled'?'Google connection was cancelled. You can connect again when ready.':'Google could not be connected. Choose an account with Search Console access to this website and approve read-only access, then try again.'}</p>}
 {error&&<p className="error" role="alert">{error}</p>}
 <div className="actions">{canWrite&&<><button disabled={busy} onClick={()=>void action('google_start')}>{busy?'Connecting…':data?.google_email?'Reconnect Google':'Connect Google Search Console'}</button>{!data&&<button className="secondary" disabled={busy} onClick={()=>void action('enable')}>Start referral imports</button>}</>}</div>
 <p className="site-note">Read-only Google access. You approve on Google, then return here. No Core sign-in.</p>
 {data?<><p>Daily imports through Core · Next due {stamp(data.next_due)}</p>{Date.parse(data.next_due)<Date.now()-15*60*1000&&<p role="status" className="notice">The next import is overdue. The timestamps below show how current the saved data is.</p>}<div className="metrics-panels">
 <article><h3>Google search</h3><p>{data.google_email?`${data.google_email} · ${data.property}`:'Google is not connected.'}</p>{data.property?.startsWith('sc-domain:')&&<p className="site-note">Domain property: includes all protocols and subdomains reported by Google.</p>}{data.google.error&&<p role="status" className="notice">{data.google.error}</p>}
 <div className="audit-metrics"><div><strong>{search.length?clicks.toLocaleString():'—'}</strong><span>Clicks</span></div><div><strong>{search.length?impressions.toLocaleString():'—'}</strong><span>Impressions</span></div></div>
 <p>Latest {search.length} reported days · Google web search · Pacific dates</p><Trend rows={search.map(d=>({date:d.date,value:d.clicks}))} label="Google clicks"/>
 <p className="site-note">Last imported {stamp(data.google.last_success)}{data.google.through&&` · checked through ${data.google.through}`}. Missing dates mean no row was reported, not a confirmed zero.</p>
 <details><summary>Daily search totals</summary>{search.map(d=><p key={d.date}>{d.date} · {d.clicks} clicks · {d.impressions} impressions · {(d.ctr*100).toFixed(1)}% click rate · position {d.position.toFixed(1)}</p>)}</details></article>
 <article><h3>AI referrals</h3>{data.referrals.error&&<p role="status" className="notice">{data.referrals.error}</p>}<div className="audit-metrics"><div><strong>{data.referrals.last_success?referrals.reduce((n,d)=>n+d.value,0).toLocaleString():'—'}</strong><span>Attributed page requests</span></div></div><p>Since {data.referrals.started_at?new Date(data.referrals.started_at).toLocaleDateString():'tracking began'} · UTC dates</p><Trend rows={referrals} label="AI referrals"/>
 <p className="site-note">Counter updated {stamp(data.referrals.updated_at)} · Last imported {stamp(data.referrals.last_success)}</p><p>ChatGPT, Claude, Perplexity, Copilot and Gemini referrers. Not unique visitors or AI citations. Visits without a referrer cannot be counted; today is incomplete.</p>
 <details><summary>Daily AI referral totals</summary>{(data.referrals.days||[]).filter(r=>ai.has(r.source)).slice(-100).map(r=><p key={r.date+r.source+r.page}>{r.date} · {r.source} · {r.page} · {r.requests}</p>)}</details></article>
 </div></>:<p>Connect Google or start referral imports to establish a baseline. Imports continue when this dashboard is closed.</p>}
 </section>;
}
