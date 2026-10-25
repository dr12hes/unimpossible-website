import {useState} from 'react';
import type {Result} from './ProductionResults';
import {daily,day,offset,siteEvents,labels} from './impact-data';
import {summariseTrend} from './progress-data';

type Metric='clicks'|'impressions'|'ai'|'enquiries';
const metricNames:Record<Metric,string>={clicks:'Search clicks',impressions:'Search impressions',ai:'AI referrals',enquiries:'Enquiries'};
const shortDate=(s:string)=>new Date(s+'T12:00:00Z').toLocaleDateString(undefined,{day:'numeric',month:'short'});
const stamp=(s:string)=>new Date(s).toLocaleString(undefined,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});

export function ProgressOverview({data}:{data:Result}){
 const [metric,setMetric]=useState<Metric>('clicks');
 const [range,setRange]=useState(28);
 const metrics=data.metrics?{...data.metrics,enquiries:data.enquiries}:null;
 const today=day(new Date().toISOString());
 const rows=Array.from({length:range},(_,i)=>{const date=offset(today,i-range);return {date,values:metrics?daily(metrics,date):null};});
 const series=rows.map(r=>r.values?.[metric]??null);
 const stats=summariseTrend(series);
 const events=siteEvents([...(data.descriptions||[]),...(data.changes||[])],data.site.url);
 const publications=events.filter(e=>e.kind==='published');
 const inRange=publications.filter(e=>day(e.at)>=rows[0].date&&day(e.at)<today);
 const meaningful=events.filter(e=>['published','verified','undone'].includes(e.kind));
 const suggestions=(data.recommendations||[]).filter(r=>r.decision==='change'&&r.review.outcome==='accepted'&&!r.work_id);
 const latestAI=data.ai_monitor?.[0];
 const audit=data.audit?.payload;
 const max=Math.max(2,...series.filter((v):v is number=>v!==null));
 const x=(i:number)=>36+i/(range-1)*708;
 const y=(v:number)=>204-v/max*156;
 let connected=false;
 const path=series.map((v,i)=>{if(v===null){connected=false;return '';}const command=connected?'L':'M';connected=true;return `${command}${x(i)},${y(v)}`;}).join(' ');
 return <div className="progress-overview">
 <div className="outcome-metrics">{(Object.keys(metricNames) as Metric[]).map(m=>{const s=summariseTrend(rows.map(r=>r.values?.[m]??null));return <button className={`outcome-metric ${metric===m?'selected':''}`} aria-pressed={metric===m} key={m} onClick={()=>setMetric(m)}><span className="metric-caption">{metricNames[m]}<span aria-hidden="true">{m==='ai'?'✧':m==='enquiries'?'↗':'↗'}</span></span><strong>{s.total===null?'—':s.total.toLocaleString()}</strong><span className={`metric-comparison ${s.delta!==null&&s.delta>0?'positive':''}`}>{s.delta===null?(s.days?`${s.days} reported days`:'Building your baseline'):`${s.delta>0?'+':''}${s.delta.toLocaleString()} vs previous 7 days`}</span></button>;})}</div>
 <div className="progress-main-grid"><section className="performance-panel"><div className="performance-title"><div><span className="eyebrow">PERFORMANCE OVER TIME</span><h2>Small changes. A clearer picture.</h2></div><label className="period-picker"><span className="sr-only">Chart date range</span><select value={range} onChange={e=>setRange(Number(e.target.value))}><option value={28}>Last 28 days</option><option value={90}>Last 90 days</option></select></label></div>
 <div className="chart-summary"><span className="chart-dot"/><strong>{metricNames[metric]}</strong><span>{stats.days} / {range} days reported</span></div>
 <div className="performance-chart"><svg viewBox="0 0 780 246" role="img" aria-label={`${metricNames[metric]} across ${range} completed days. ${stats.days} days reported. Exact daily values below.`}>
 {[0,.5,1].map(n=><g key={n}><line x1="36" x2="744" y1={y(n*max)} y2={y(n*max)} stroke="currentColor" opacity=".12"/><text x="12" y={y(n*max)+4} fill="currentColor" fontSize="11">{stats.days?Math.round(n*max):'—'}</text></g>)}
 {inRange.map(e=>{const index=rows.findIndex(r=>r.date===day(e.at,metric==='clicks'||metric==='impressions'?'America/Los_Angeles':'UTC'));return index<0?null:<g key={e.id}><title>{stamp(e.at)} · {e.title} published</title><line x1={x(index)} x2={x(index)} y1="35" y2="214" stroke="#b29cf5" strokeDasharray="4 5"/><circle cx={x(index)} cy="35" r="5" fill="#b29cf5"/></g>;})}
 <path d={path} fill="none" stroke="#83ebc7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{series.map((v,i)=>v===null?null:<circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#83ebc7"><title>{rows[i].date}: {v}</title></circle>)}
 {[0,Math.floor((range-1)/2),range-1].map(i=><text key={i} x={x(i)} y="238" textAnchor={i===0?'start':i===range-1?'end':'middle'} fill="currentColor" fontSize="11">{shortDate(rows[i].date)}</text>)}
 </svg>{!stats.days&&<div className="chart-empty"><span className="empty-orbit" aria-hidden="true">↗</span><strong>Your baseline starts here.</strong><p>{metric==='clicks'||metric==='impressions'?'Google hasn’t returned daily search data yet.': 'Completed-day data will appear after the next import.'}</p><a href="#settings">View data connection →</a></div>}</div>
 <div className="chart-legend"><span><i/> Published change</span><span>{metric==='ai'?'Attributed page requests · UTC':metric==='enquiries'?'Accepted submissions, excluding tests · UTC':'Google web search · Pacific dates'}</span></div>
 <details className="chart-values"><summary>Daily values & measurement notes</summary><p>Gaps are unreported days. Changes and traffic are shown together to help investigation; movement alone does not establish cause. AI referrals count attributed requests, not unique people or AI recommendations.</p><div className="chart-table"><table><thead><tr><th>Date</th><th>{metricNames[metric]}</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.date}><td>{r.date}</td><td>{series[i]??'Unreported'}</td></tr>)}</tbody></table></div></details>
 </section>
 <section className="next-panel"><span className="eyebrow">UP NEXT</span><div className="next-icon" aria-hidden="true">✧</div><h2>{latestAI?.result?.review.outcome==='needs_revision'?'Strengthening the next recommendation.':suggestions.length?`${suggestions.length} reviewed ideas to explore.`:'Watching for your next opportunity.'}</h2><p>{latestAI?.result?.review.outcome==='needs_revision'?'The latest AI advice needs clearer supporting evidence before it can become a change.':suggestions.length?suggestions[0].title:'Page checks and search evidence feed the next round of useful changes.'}</p><a className="progress-link" href={latestAI?.result?.review.outcome==='needs_revision'?'#checks':'#improvements'}>{latestAI?.result?.review.outcome==='needs_revision'?'View latest review':'Review improvements'} <span aria-hidden="true">→</span></a><div className="next-check"><span>Next website check</span><strong>{data.schedule.frequency==='off'?'Paused':data.schedule.next_due?stamp(data.schedule.next_due):'Awaiting schedule'}</strong><span>{data.schedule.frequency==='off'?'Schedule is paused':'Runs automatically through Core'}</span></div></section></div>
 <div className="progress-bottom-grid"><section className="card recent-progress"><div className="section-heading"><div><span className="eyebrow">THE WORK BEHIND THE RESULTS</span><h2>Recent changes</h2></div><a href="#changes">View history →</a></div>{meaningful.length?<ol>{meaningful.slice(0,4).map(e=><li key={e.id}><span className={`event-icon ${e.kind}`} aria-hidden="true">{e.kind==='undone'?'↶':e.kind==='verified'?'✓':'↗'}</span><div><strong>{e.title}</strong><span>{labels[e.kind]} · {stamp(e.at)}</span></div><a href="#changes" aria-label={`View change history for ${e.title}`}>↗</a></li>)}</ol>:<p>Your first published improvement will appear here with its verification and date.</p>}</section>
 <section className="card coverage-panel"><span className="eyebrow">ALWAYS IN VIEW</span><h2>Your website, covered.</h2><div className="coverage-number"><strong>{audit?.audited??'—'}</strong><span>pages checked<br/>{data.audit?stamp(data.audit.updated_at):'First check pending'}</span></div><div className="coverage-track" aria-hidden="true"><span style={{width:`${audit?.selected?Math.min(100,audit.audited/audit.selected*100):0}%`}}/></div><p>{audit?`${audit.audited} of ${audit.total??audit.selected} inventoried pages audited`:'Waiting for the first audit'}{audit?.failed?` · ${audit.failed} need a retry`:''}</p><a href="#checks">Explore page checks →</a></section></div>
 </div>;
}
