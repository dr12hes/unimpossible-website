import {useState} from 'react';
import type {DescriptionWork} from './Descriptions';
import type {MetricsData} from './Metrics';
import {siteEvents,labels,day,offset,daily,comparison} from './impact-data';
const number=(n:number|null)=>n===null?'—':n.toLocaleString();
export function Impact({data,items,url}:{data?:MetricsData|null;items:DescriptionWork[];url:string}){
 const [range,setRange]=useState(28);const [chosen,setChosen]=useState('');
 const events=siteEvents(items,url);const publications=events.filter(e=>e.kind==='published');
 const selected=publications.find(e=>e.id===chosen)||publications[0];
 const today=day(new Date().toISOString());
 const dates=Array.from({length:range},(_,i)=>offset(today,-i));
 return <section className="card"><span className="eyebrow">CHANGES & TRAFFIC</span><h2>What changed. What followed.</h2><p>Review recorded actions alongside daily traffic for this website. These are site-wide observations, not proof that an individual change caused a result.</p>
 {!events.length&&<p className="notice">No recorded live changes yet. Earlier staging work is excluded; edits made outside this tool are not tracked.</p>}
 {publications.length>0?<><label className="impact-label">Compare a publication<select value={selected.id} onChange={e=>setChosen(e.target.value)}>{publications.map(e=><option key={e.id} value={e.id}>{new Date(e.at).toLocaleString()} · {e.title}</option>)}</select></label><p>Seven full days before and seven after publication; the publication day is excluded. Google uses Pacific dates; referrals use UTC. Other changes and undo actions may overlap these periods.</p>
 {data&&<div className="impact-comparisons">{(['clicks','impressions','ai'] as const).map(metric=>{const c=comparison(data,selected.at,metric);return <article key={metric}><h3>{metric==='ai'?'AI referral requests':`Google ${metric}`}</h3><strong>{number(c.before)} → {number(c.after)}</strong><p>{c.beforeDays}/7 days before · {c.afterDays}/7 days after</p><small>{c.from} to {c.through}; excluding {c.anchor}</small><p>{c.before===null||c.after===null?'Not enough complete reported data to compare.':`Observed difference: ${c.after-c.before>0?'+':''}${(c.after-c.before).toLocaleString()}. Not an attributed impact.`}</p></article>;})}</div>}
 <details><summary>Actions around this publication</summary><ol className="timeline">{events.filter(e=>Math.abs(Date.parse(e.at)-Date.parse(selected.at))<=8*86400000).map(e=><li key={e.id}><strong>{labels[e.kind]} · {e.title}</strong><time dateTime={e.at}>{new Date(e.at).toLocaleString()}</time>{e.description&&<p>{e.description}</p>}</li>)}</ol></details></>:<p>Before-and-after comparisons appear after your first live publication.</p>}
 <label className="impact-label">Daily view<select value={range} onChange={e=>setRange(Number(e.target.value))}><option value={28}>Last 28 calendar days</option><option value={90}>Last 90 calendar days</option></select></label>
 <p className="site-note">— means unreported or incomplete. Google uses Pacific dates; AI and actions use UTC. Late-night actions may fall on a different Google date. Import status is shown above.</p>
 <div className="impact-scroll" role="region" aria-label="Traffic and recorded actions by date" tabIndex={0}><table className="impact-table"><caption>Daily traffic and recorded actions · newest first</caption><thead><tr><th scope="col">Date</th><th scope="col">Google clicks</th><th scope="col">Impressions</th><th scope="col">AI requests</th><th scope="col">Recorded actions (UTC)</th></tr></thead><tbody>{dates.map(date=>{const totals=data?daily(data,date):null;return <tr key={date}><th scope="row">{date}</th><td>{number(totals?.clicks??null)}</td><td>{number(totals?.impressions??null)}</td><td>{number(totals?.ai??null)}</td><td>{events.filter(e=>day(e.at)===date).map(e=><div key={e.id}><strong>{labels[e.kind]}</strong> · {e.title}<br/><small>{new Date(e.at).toISOString().slice(11,19)} UTC</small></div>)}</td></tr>;})}</tbody></table></div>
 </section>;
}
