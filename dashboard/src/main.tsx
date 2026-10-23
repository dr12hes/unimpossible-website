import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import {ProductionResults} from './ProductionResults';
declare const __PRODUCTION_RESULTS__: boolean;
import {AuditPanel} from './AuditPanel';
import {RecheckPanel} from './RecheckPanel';
import {SiteAuditPanel} from './SiteAuditPanel';
type Page = {id:number;title:string;content:string;revision:string;url:string;editable?:boolean};
type Work = {id:string;state:string;created_at:string;payload:{before:Page;content:string;direction:string;message?:string;public_verified?:boolean;undo_id?:string}};
async function api<T>(path:string, body?:unknown):Promise<T> {
  const r = await fetch('/api/proof'+path, {method:body === undefined?'GET':'POST', headers:{'Content-Type':'application/json'}, ...(body===undefined?{}:{body:JSON.stringify(body)})});
  const result = await r.json(); if(!r.ok) throw new Error(result.detail || 'The request could not be completed.'); return result;
}
function WebsiteWork({site,onAuditState}:{site:Site;onAuditState:(state:string)=>void}){
  const siteApi = <T,>(path:string,body?:unknown) => api<T>('/sites/'+site.id+path,body);
  const [pageId,setPageId]=useState<number>();const [inventory,setInventory]=useState<{id:number;title:string;editable:boolean}[]>([]);const [auditRefresh,setAuditRefresh]=useState(0);
  const [page,setPage]=useState<Page>(); const [content,setContent]=useState(''); const [work,setWork]=useState<Work[]>([]);
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [selected,setSelected]=useState<string>();
  const loadGeneration=useRef(0); const activePage=useRef(pageId); activePage.current=pageId;
  async function load(id=pageId){const generation=++loadGeneration.current;const listing=await siteApi<{items:{id:number;title:string;editable:boolean}[]}>('/inventory');if(generation!==loadGeneration.current)return;setInventory(listing.items);const target=id??listing.items[0]?.id;setPageId(target);setPage(undefined);if(target===undefined){const rows=await siteApi<Work[]>('/work');if(generation===loadGeneration.current)setWork(rows);return;}const [p,w]=await Promise.all([siteApi<Page>('/page?page_id='+target),siteApi<Work[]>('/work')]);if(generation!==loadGeneration.current)return;setPage(p);setContent(p.content);setWork(w);}
  async function openPage(id:number,workId?:string){setBusy(true);setError('');setSelected(workId);try{await load(id);document.getElementById('page-review')?.scrollIntoView({behavior:'smooth'});}catch(e){setError(e instanceof Error?e.message:'Page unavailable');}finally{setBusy(false);}}
  useEffect(()=>{load().catch(e=>setError(e.message));},[]);
  async function act(fn:()=>Promise<unknown>){setBusy(true);setError('');try{await fn();await load();}catch(e){setError(e instanceof Error?e.message:'Request failed');}finally{setBusy(false);}}
  const current=work.find(w=>w.id===selected&&w.payload.before.id===pageId) || work.find(w=>w.payload.before.id===pageId);
  return <div className="shell"><aside><a className="brand" href="/">△ UNimpossible<span>YOUR WEBSITE, WORKING HARDER</span></a><nav><span className="active">Website work</span><span className="muted">Visibility · coming later</span></nav><div className="aside-foot">A clearer website.<br/>One useful change at a time.</div></aside><main>
    <header><div><div className="eyebrow">WORDPRESS / CONTROLLED PROOF</div><h1>Website work</h1><p>Make a change. Check it is live. Keep a way back.</p></div><span className="pill">Approval required</span></header>
    <div className="notice">Connected to {site.name}. Every publication needs your approval. Posts and unsupported formats remain audit-only.</div>
    {error&&<div role="alert" className="error">{error}</div>}
    <SiteAuditPanel navigationDisabled={busy} siteId={site.id} refreshKey={auditRefresh+work.length} onStatus={onAuditState} onPage={id=>{void openPage(id);}}/>
    <RecheckPanel siteId={site.id}/>
    <section id="page-review"><label htmlFor="selected-page">Page to review</label><select id="selected-page" value={pageId??''} disabled={busy} onChange={e=>{void openPage(Number(e.target.value));}}>{inventory.map(p=><option value={p.id} key={p.id}>{p.title||'Untitled content'}{p.editable?'':' (audit only)'}</option>)}</select></section>
    {pageId!==undefined&&<AuditPanel key={pageId} pageId={pageId} revision={page?.revision} onStatus={()=>setAuditRefresh(n=>n+1)} siteId={site.id} onDraft={async id=>{if(activePage.current!==pageId)return;await load();if(activePage.current!==pageId)return;setSelected(id);document.getElementById('publication-review')?.scrollIntoView({behavior:'smooth'});}}/>}
    {!page?<div><p role="status">{error?'Page editor unavailable. Check the connection, then reload.':'Loading the page editor…'}</p><button className="secondary" disabled={busy} onClick={()=>act(load)}>Reload page editor</button></div>:<>
    <section className="page-heading"><div><span className="eyebrow">CONNECTED PAGE</span><h2>{page.title}</h2></div><a target="_blank" rel="noreferrer" href={page.url}>Open public page ↗</a></section>
    <div className="columns" id="publication-review"><section className="card"><div className="step">01 / PREPARE</div><h2>Propose an improvement</h2><p>Change the page body below. We’ll save the original before publishing.</p><label htmlFor="body">Proposed page HTML</label><textarea id="body" value={content} onChange={e=>setContent(e.target.value)} disabled={busy||page.editable===false}/><div className="actions"><button disabled={busy||page.editable===false||content===page.content||!content.trim()} onClick={()=>act(async()=>{const w=await siteApi<Work>('/work?page_id='+page.id,{content,expected_revision:page.revision});setSelected(w.id);})}>Save proposal</button><button className="secondary" disabled={busy} onClick={()=>act(load)}>Reload page</button></div></section>
    <section className="card"><div className="step">02 / REVIEW & PUBLISH</div><h2>{current?'Review this change':'Your next change appears here'}</h2>{current&&<p>Change to: <strong>{current.payload.before.title}</strong></p>}{current?<><span className={'status '+current.state}>{current.state.replaceAll('_',' ')}</span><p>{current.payload.public_verified?'The public page was verified for this operation.':'Publication is not yet verified.'}</p><details open><summary>Before</summary><pre>{current.payload.before.content}</pre></details><details open><summary>Proposed</summary><pre>{current.payload.content}</pre></details>{current.payload.message&&<p>{current.payload.message}</p>}<div className="actions">
      {current.state==='ready'&&<button disabled={busy} onClick={()=>act(()=>siteApi('/work/'+current.id+'/publish',{}))}>Publish change</button>}
      {['verifying','verification_pending','unknown','applying'].includes(current.state)&&<button disabled={busy} onClick={()=>act(()=>siteApi('/work/'+current.id+'/verify',{}))}>Reconcile & verify</button>}
      {['published','undo_pending'].includes(current.state)&&current.payload.direction==='publish'&&<button className="secondary" disabled={busy} onClick={()=>act(()=>siteApi('/work/'+current.id+'/undo',{}))}>{current.state==='undo_pending'?'Resume undo':'Undo change'}</button>}
      </div></>:<p>Save a proposal to compare it with the current page.</p>}</section></div>
    <section className="history"><div className="step">03 / EVIDENCE</div><h2>Work history</h2>{!work.length?<p>No changes yet. Start with a small, factual improvement.</p>:work.map(w=><button className="history-row" disabled={busy} key={w.id} onClick={()=>{void openPage(w.payload.before.id,w.id);}}><span>{w.payload.direction==='undo'?'Restore previous content':'Page improvement'}<small>{new Date(w.created_at).toLocaleString()}</small></span><span className="status">{w.state.replaceAll('_',' ')}</span></button>)}</section>
    </>}{busy&&<div className="working" role="status">Working on the test site…</div>}
    </main></div>;
}

type Site={id:string;name:string;url:string;state:string;approval_required:boolean;audit_state?:string};
type Account={email:string;user_id:number};
const query = new URLSearchParams(window.location.search);
const pairing = query.has('ticket') ? {url:query.get('site')||'',ticket:query.get('ticket')||'',instance:query.get('instance')||''} : null;
// Remove the short-lived ticket from browser history immediately; keep it in memory only.
if(pairing) window.history.replaceState({},'',window.location.pathname);
function App(){
 const [user,setUser]=useState<Account>(); const [sites,setSites]=useState<Site[]>([]);
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [signup,setSignup]=useState(false);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [loading,setLoading]=useState(true);
 const [pending,setPending]=useState(pairing); const [selected,setSelected]=useState<string>();
 async function refresh(){ const u=await api<Account>('/me');setUser(u);setSites(await api<Site[]>('/sites')); }
 useEffect(()=>{refresh().catch(()=>setUser(undefined)).finally(()=>setLoading(false));},[]);
 async function action(fn:()=>Promise<void>){setBusy(true);setError('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'Request failed');}finally{setBusy(false);}}
 const site=sites.find(s=>s.id===selected&&s.state==='connected');
 return <><div className="account-bar"><a className="account-brand" href="/">△ UNimpossible</a>{user&&<><span>{user.email}</span><button className="secondary" disabled={busy} onClick={()=>action(async()=>{await api('/logout',{});setUser(undefined);setSites([]);setSelected(undefined);})}>Sign out</button></>}</div>
 <div className="account-content">{error&&<p role="alert" className="error">{error}</p>}{loading?<p>Loading your account…</p>:!user?<section className="card login"><h1>{signup?'Create your account':'Sign in to UNimpossible'}</h1><p>Connect your WordPress website. You stay in control of every publication.</p>{pending&&<p>Connecting: {pending.url}</p>}<form onSubmit={e=>{e.preventDefault();action(async()=>{await api('/login',{email,password,signup});setPassword('');await refresh();});}}><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/><label htmlFor="password">Password (at least 12 characters)</label><input id="password" type="password" autoComplete={signup?'new-password':'current-password'} minLength={12} maxLength={256} required value={password} onChange={e=>setPassword(e.target.value)}/><div className="actions"><button disabled={busy}>{signup?'Create account':'Sign in'}</button><button type="button" className="secondary" onClick={()=>setSignup(!signup)}>{signup?'Already have an account?':'Create an account'}</button></div></form><p>Controlled preview · use a test account. No payments or automatic publishing.</p></section>:<>
 {pending&&<section className="card consent"><div className="eyebrow">CONNECT WORDPRESS</div><h2>Connect this website?</h2><p><strong>{pending.url}</strong></p><p>Link to {user.email}. UNimpossible can read published pages and apply changes you approve, including undo. Automatic publishing stays off.</p><div className="actions"><button disabled={busy} onClick={()=>action(async()=>{const result=await api<Site>('/sites',pending);setPending(null);setSelected(result.id);await refresh();setSites(rows=>rows.map(s=>s.id===result.id?result:s));})}>Approve connection</button><button className="secondary" disabled={busy} onClick={()=>setPending(null)}>Cancel</button></div><p>Requests expire after five minutes. If expired, start again in WordPress → Settings → UNimpossible.</p></section>}
 <header><div><div className="eyebrow">YOUR WEBSITES</div><h1>Connected websites</h1></div><button className="secondary" disabled={busy} onClick={()=>action(refresh)}>Refresh sites</button></header>
 {!sites.length?<section className="card"><h2>Connect your first website</h2><p>Install and activate the UNimpossible plugin in WordPress, then open Settings → UNimpossible and click Connect.</p></section>:sites.map(s=><section className="card site-card" key={s.id}><div><h2>{s.name}</h2><a href={s.url} target="_blank" rel="noreferrer">{s.url}</a><p><span className="status">{s.state}</span> · Publishing approval required</p><p>Website audit: {(s.audit_state||'not_started').replaceAll('_',' ')}</p></div><div className="actions">{s.state==='connected'&&<button onClick={()=>setSelected(s.id)}>View audit & improvements</button>}{s.state!=='disconnected'&&<button className="secondary" disabled={busy} onClick={()=>action(async()=>{const result=await api<{remote_revoked:boolean}>('/sites/'+s.id+'/disconnect',{});setSelected(undefined);await refresh();if(!result.remote_revoked)setError('Disconnected here. WordPress could not be reached; use its plugin Disconnect button to remove the remote credential.');})}>Disconnect</button>}</div></section>)}
 </>}</div>{site&&<WebsiteWork key={site.id} site={site} onAuditState={state=>setSites(rows=>rows.map(s=>s.id===site.id?{...s,audit_state:state}:s))}/>}</>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode>{__PRODUCTION_RESULTS__?<ProductionResults/>:<App/>}</React.StrictMode>);
