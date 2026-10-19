"""Create the UNimpossible enquiry page in Optaro Core, so the website form posts enquiries to Core
instead of opening the visitor's email app. Run INSIDE the Core API container:

    ssh hetzner 'docker exec -i optaro-core-api python -' < deploy/provision_core_page.py

Idempotent: creates the page if missing, never overwrites one. Prints the share token; paste it into
`window.UNIMPOSSIBLE.pageToken` at the bottom of site/index.html and redeploy. The token is a public
identifier, not a credential. Mirrors cloudwlc-website/deploy/provision_core_pages.py.

Change TENANT if UNimpossible gets its own Core tenant; keep it in step with `tenant` in index.html.
"""
import json

from app.database import configure_platform_database, tenant_session_scope
from app.services.pages_store import get_page_by_slug, set_page_status, upsert_page

TENANT = "optaro"
SITE = "https://unimpossible.co.uk"
SLUG = "unimpossible-website-enquiry"

fields = [
    {"name": "name", "type": "text", "label": "Name", "required": True},
    {"name": "email", "type": "email", "label": "Email", "required": True},
    {"name": "company", "type": "text", "label": "Company", "required": False},
    {"name": "message", "type": "textarea", "label": "What takes up too much of your team's time?", "required": False},
    {"name": "interest", "type": "text", "label": "Interest (website report / Chamber session)", "required": False},
]

configure_platform_database()
with tenant_session_scope(TENANT) as db:
    page = get_page_by_slug(db, SLUG)
    if not page:
        page = upsert_page(
            db,
            slug=SLUG,
            title="UNimpossible website enquiries",
            blocks=[{"id": SLUG, "type": "form", "fields": fields, "submit_label": "Book a conversation"}],
            settings={
                "verify_email": False,
                "external_site": {"url": SITE + "/#talk", "analytics_only": False},
                "form_list_snapshot": {"fields": fields},
            },
        )
        page = set_page_status(db, page["id"], "published")
    if page["status"] != "published":
        raise RuntimeError(f"{SLUG} exists but is not published")
    print(json.dumps({"pageToken": page["share_token"], "tenant": TENANT}, indent=2))
