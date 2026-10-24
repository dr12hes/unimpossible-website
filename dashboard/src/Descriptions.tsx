import {useState} from 'react';
type TimelineEvent={kind:string;at:string|null;description?:string|null;note?:string;legacy?:boolean};
const eventLabels:Record<string,string>={suggested:'Suggested',revised:'Draft revised',approved:'Approved',published:'Published — WordPress confirmed',verified:'Verified on the public page',undo_requested:'Undo requested',undo_applied:'Undo applied — WordPress confirmed',undone:'Undone and verified',conflict:'Stopped: page changed',rejected:'Write rejected',unknown:'Write outcome unknown',verification_pending:'Verification pending'};
function SuggestionTimeline({events}:{events:TimelineEvent[]}){
 if(!events.length)return <p><small>Timeline not available from Core yet.</small></p>;
 return <details className="suggestion-history"><summary>Suggestion timeline · {events.length} events</summary><p><small>Dates show when Core recorded each action, in your local time. Earlier pilot records may have missing dates.</small></p><ol className="timeline">{events.map((event,i)=><li key={i}><strong>{eventLabels[event.kind]??event.kind}</strong>{event.at?<time dateTime={event.at}>{new Date(event.at).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'long'})}</time>:<span>Date not recorded — earlier pilot</span>}{Object.hasOwn(event,'description')&&<p style={{margin:'4px 0'}}>{event.description??'No search description'}</p>}{event.note&&<p style={{margin:'4px 0'}}><small>{event.note}</small></p>}</li>)}</ol></details>;
}
export type DescriptionWork={id:string;state:string;page_id:number;title:string;url:string;before:string|null;description:string;source:string;message?:string;public_verified:boolean;timeline?:TimelineEvent[]};
export async function descriptionAction(body:object){
 const r=await fetch('/api/production-results/descriptions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const value=await r.json();if(!r.ok)throw new Error(value.detail||'Description action failed.');return value;
}
function Draft({work,changed,canWrite}:{work:DescriptionWork;changed:()=>void;canWrite:boolean}){
 const [text,setText]=useState(work.description);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function act(action:string){setBusy(true);setError('');try{await descriptionAction({action,key:work.id,...(action==='approve'?{description:text}:{})});changed();}catch(e){setError(e instanceof Error?e.message:'Action failed');}finally{setBusy(false);}}
 return <article className="card description-card"><span className={`status ${work.state}`}>{work.state==='ready'?'Awaiting your approval':work.state.replaceAll('_',' ')}</span><h3>{work.title}</h3><p className="page-url">{work.url}</p><p className="before-copy"><strong>Before:</strong> {work.before??'No search description'}</p>
 {work.state==='ready'&&canWrite?<label>Proposed search description<textarea rows={3} maxLength={320} value={text} onChange={e=>setText(e.target.value)} style={{width:'100%',boxSizing:'border-box',minHeight:90,fontFamily:'inherit'}}/><small>{text.length} characters · review for accuracy and clarity</small></label>:<p className="approved-copy"><strong>{work.state==='ready'?'Proposed description:':'Approved description:'}</strong> {work.description}</p>}
 <details><summary>Source paragraph used for the draft</summary><p>{work.source}</p></details>
 <SuggestionTimeline events={work.timeline??[]}/>
 <div className="actions">
 {canWrite&&work.state==='ready'&&<button disabled={busy||!text.trim()} onClick={()=>void act('approve')}>Approve this description</button>}
 {canWrite&&work.state==='approved'&&<button disabled={busy} onClick={()=>void act('publish')}>Publish approved description</button>}
 {canWrite&&['applying','unknown','verifying','verification_pending','undo_pending'].includes(work.state)&&<button disabled={busy} onClick={()=>void act('verify')}>Verify / recover result</button>}
 {work.state==='published'&&<><span>Verified on the rendered public page</span>{canWrite&&<button className="secondary" disabled={busy} onClick={()=>void act('undo')}>Undo description</button>}</>}
 {work.state==='undone'&&<span>Original description restored and verified</span>}
 </div>{work.message&&<p>{work.message}</p>}{error&&<p className="error" role="alert">{error}</p>}{busy&&<p role="status">Checking with Core…</p>}
 </article>;
}
export function Descriptions({items,changed,canWrite,siteUrl}:{items:DescriptionWork[];changed:()=>void;canWrite:boolean;siteUrl?:string}){
 return <section className="card suggestions-section"><span className="eyebrow">SEARCH DESCRIPTIONS</span><h2>Suggestions and change history</h2><p>Clear descriptions help explain each page. Review the wording, approve it, then publish when you are ready.</p>{items.length?items.map(work=><Draft key={work.id+':'+work.state+':'+work.description} work={work} changed={changed} canWrite={canWrite&&(!siteUrl||new URL(work.url).origin===new URL(siteUrl).origin)}/>):<p>{canWrite?'Choose “Draft description” beside a missing-description finding below.':'No suggestions have been drafted yet.'}</p>}</section>;
}
