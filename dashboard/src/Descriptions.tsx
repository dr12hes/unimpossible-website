import {useState} from 'react';
export type DescriptionWork={id:string;state:string;page_id:number;title:string;url:string;before:string|null;description:string;source:string;message?:string;public_verified:boolean};
export async function descriptionAction(body:object){
 const r=await fetch('/api/production-results/descriptions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const value=await r.json();if(!r.ok)throw new Error(value.detail||'Description action failed.');return value;
}
function Draft({work,changed}:{work:DescriptionWork;changed:()=>void}){
 const [text,setText]=useState(work.description);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function act(action:string){setBusy(true);setError('');try{await descriptionAction({action,key:work.id,...(action==='approve'?{description:text}:{})});changed();}catch(e){setError(e instanceof Error?e.message:'Action failed');}finally{setBusy(false);}}
 return <article className="card"><span className="status">{work.state==='ready'?'Awaiting your approval':work.state.replaceAll('_',' ')}</span><h3>{work.title}</h3><p>{work.url}</p><p><strong>Before:</strong> {work.before??'No search description'}</p>
 {work.state==='ready'?<label>Proposed search description<textarea rows={3} maxLength={320} value={text} onChange={e=>setText(e.target.value)} style={{width:'100%',boxSizing:'border-box',minHeight:90,fontFamily:'inherit'}}/><small>{text.length} characters · review for accuracy and clarity</small></label>:<p><strong>Approved description:</strong> {work.description}</p>}
 <details><summary>Source paragraph used for the draft</summary><p>{work.source}</p></details>
 <div className="actions">
 {work.state==='ready'&&<button disabled={busy||!text.trim()} onClick={()=>void act('approve')}>Approve this description</button>}
 {work.state==='approved'&&<button disabled={busy} onClick={()=>void act('publish')}>Publish approved description to staging</button>}
 {['applying','unknown','verifying','verification_pending','undo_pending'].includes(work.state)&&<button disabled={busy} onClick={()=>void act('verify')}>Verify / recover result</button>}
 {work.state==='published'&&<><span>Verified on the rendered staging page</span><button className="secondary" disabled={busy} onClick={()=>void act('undo')}>Undo description</button></>}
 {work.state==='undone'&&<span>Original description restored and verified</span>}
 </div>{work.message&&<p>{work.message}</p>}{error&&<p className="error" role="alert">{error}</p>}{busy&&<p role="status">Checking with Core…</p>}
 </article>;
}
export function Descriptions({items,changed}:{items:DescriptionWork[];changed:()=>void}){
 return <section className="card"><span className="eyebrow">SEARCH DESCRIPTIONS</span><h2>Review, approve and publish</h2><p>Drafts use existing page text. Review and edit them before approval. Approval saves the exact text; publishing is a separate action. Staging stays blocked from search indexing.</p>{items.length?items.map(work=><Draft key={work.id+':'+work.state+':'+work.description} work={work} changed={changed}/>):<p>Choose “Draft description” beside a missing-description finding below.</p>}</section>;
}
