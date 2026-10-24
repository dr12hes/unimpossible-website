"""One idempotent import of an already-approved, verified operator publication."""
import json
from sqlalchemy import text
from app import database
site='1b81e91094da2fec6386cae20a4e799d'
key='4bc8ba7c-40f8-4f4b-9f25-029ebec42d80'
payload={
 'kind':'external_change','site_id':site,'title':'Homepage CTA and form labels',
 'url':'https://unimpossible.co.uk/','approval_required':True,
 'approval':{'quote':'Ok continue - dont bother with staging','at':None,'note':'Exact approval time was not captured; publication date is verified.'},
 'evidence':'docs/live-cta-form-2026-10-24.md',
 'timeline':[
 {'kind':'published','at':'2026-10-24T19:27:06+00:00','description':'Approved operator edit. Hero: “Book a free 30-minute conversation” → “Request a free 30-minute conversation”. Submit: “Book a conversation” → “Request a conversation”. Contact labels: “Name” → “Name (required)”; “Email” → “Email (required)”; “Company” → “Company (optional)”; “What takes up too much of your team’s time?” → “What takes up too much of your team’s time? (optional)”. Description and validation unchanged. Approval was given in chat; its exact time was not recorded.'},
 {'kind':'verified','at':'2026-10-24T19:27:30.054064+00:00','description':'Fresh public HTML and browser check confirmed the six edits, CTA destination, unchanged search metadata and Chambers offer. No form submission test. Guarded operator undo is available; no undo was performed. Both edits shipped together, so their separate effects cannot be isolated.'}]
}
database.configure_platform_database()
with database.tenant_session_scope('optaro') as db:
 row=db.execute(text('SELECT user_id,url,state,approval_required FROM website_connections WHERE id=:site FOR UPDATE'),{'site':site}).mappings().one()
 assert row['user_id']==2 and row['url']=='https://unimpossible.co.uk' and row['state']=='connected' and row['approval_required']
 existing=db.execute(text('SELECT payload FROM website_proof_operations WHERE id=:id'),{'id':key}).scalar()
 if existing is not None:
  assert existing==payload, 'Existing record differs; do not overwrite history'
 else:
  db.execute(text("INSERT INTO website_proof_operations(id,state,payload) VALUES (:id,'verified',CAST(:payload AS jsonb))"),{'id':key,'payload':json.dumps(payload)})
 print(json.dumps({'id':key,'imported':existing is None,'approval_required':True,'events':2}))
