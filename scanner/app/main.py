"""HTTP surface: start a hook, poll it, request the full audit, confirm by email link, view a report."""
from __future__ import annotations

import asyncio
import logging
import re
import secrets
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import store as S
from .config import load_settings
from .fetch import FetchError, domain_of, make_client, normalise_url
from .mailer import Mailer
from .pipeline import Pipeline
from .store import Store

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
log = logging.getLogger("scanner")

_EMAIL = re.compile(r"^[^\s@]{1,64}@[^\s@]+\.[a-zA-Z]{2,}$")


class RateLimiter:
    def __init__(self, limit: int, window_s: float):
        self.limit, self.window = limit, window_s
        self.hits: dict[str, deque] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.time()
        q = self.hits[key]
        while q and q[0] < now - self.window:
            q.popleft()
        if len(q) >= self.limit:
            return False
        q.append(now)
        return True


@asynccontextmanager
async def lifespan(app: FastAPI):
    s = load_settings()
    store = Store(s.data_dir / "scanner.sqlite")
    client = make_client(s.user_agent)
    pipeline = Pipeline(s, store, client, Mailer(s))
    hooks: asyncio.Queue[str] = asyncio.Queue()
    reports: asyncio.Queue[str] = asyncio.Queue()

    async def worker(queue: asyncio.Queue, fn):
        while True:
            scan_id = await queue.get()
            try:
                await fn(scan_id)
            except Exception:
                log.exception("job %s failed", scan_id)
            finally:
                queue.task_done()

    tasks = [asyncio.create_task(worker(hooks, pipeline.run_hook)) for _ in range(2)]
    tasks.append(asyncio.create_task(worker(reports, pipeline.run_report)))
    for kind, scan_id in store.jobs_to_resume():
        (hooks if kind == "hook" else reports).put_nowait(scan_id)
    store.cache_prune(30 * 86400)
    app.state.s, app.state.store, app.state.pipeline = s, store, pipeline
    app.state.hooks, app.state.reports = hooks, reports
    app.state.hook_limit = RateLimiter(s.hook_rate_per_ip, 600)
    app.state.report_limit = RateLimiter(s.report_rate_per_ip, 3600)
    log.info("scanner ready; search=%s, postmark=%s, model key=%s", s.search_provider or "none", bool(s.postmark_server_token), bool(s.anthropic_api_key))
    try:
        yield
    finally:
        for t in tasks:
            t.cancel()
        await client.aclose()


app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(CORSMiddleware, allow_origins=["https://unimpossible.co.uk", "https://www.unimpossible.co.uk",
                                                  "http://localhost:8080", "http://127.0.0.1:8080"],
                   allow_methods=["GET", "POST"], allow_headers=["Content-Type"])


def _ip(request: Request) -> str:
    return (request.client.host if request.client else "") or "unknown"


def _public(scan: dict) -> dict:
    status = scan["status"]
    phase = ("reading" if status in (S.HOOK_QUEUED, S.HOOK_RUNNING) else
             "failed" if status == S.HOOK_FAILED else "read")
    out = {"id": scan["id"], "phase": phase, "status": status, "domain": scan["domain"]}
    if status == S.HOOK_FAILED:
        out["error"] = scan.get("error")
    if scan.get("hook_json") and status not in (S.HOOK_QUEUED, S.HOOK_RUNNING, S.HOOK_FAILED):
        import json
        out["hook"] = json.loads(scan["hook_json"])
    out["report"] = ("requested" if status == S.REPORT_REQUESTED else
                     "running" if status in (S.REPORT_QUEUED, S.REPORT_RUNNING) else
                     "done" if status == S.REPORT_DONE else
                     "failed" if status == S.REPORT_FAILED else None)
    return out


class ScanIn(BaseModel):
    url: str = Field(max_length=500)


class ReportIn(BaseModel):
    email: str = Field(max_length=200)
    name: str = Field(default="", max_length=120)
    website: str = Field(default="", max_length=200)  # honeypot; humans never fill it


@app.get("/api/health")
async def health():
    return {"ok": True}


@app.post("/api/scan")
async def start_scan(body: ScanIn, request: Request):
    s, store = app.state.s, app.state.store
    ip = _ip(request)
    try:
        url = normalise_url(body.url)
    except FetchError as e:
        raise HTTPException(400, str(e))
    domain = domain_of(url)
    if domain in ("unimpossible.co.uk",):
        raise HTTPException(400, "We've read our own site. Try yours.")
    if not app.state.hook_limit.allow(ip):
        raise HTTPException(429, "That's a few in quick succession. Give it ten minutes and try again.")
    if store.count_since(time.time() - 3600) >= s.hooks_per_hour:
        raise HTTPException(429, "We're busy reading sites right now. Please try again in a little while.")
    recent = store.recent(domain, S.HOOK_DONE, s.reuse_days * 86400)
    if recent and recent.get("hook_json"):
        scan = store.create_scan(url, domain, ip, S.HOOK_DONE, hook_json=recent["hook_json"],
                                 usage_json='{"reused_from": "%s"}' % recent["id"])
        return _public(scan)
    scan = store.create_scan(url, domain, ip, S.HOOK_QUEUED)
    app.state.hooks.put_nowait(scan["id"])
    return _public(scan)


@app.get("/api/scan/{scan_id}")
async def get_scan(scan_id: str):
    scan = app.state.store.get(scan_id)
    if not scan:
        raise HTTPException(404, "Unknown scan.")
    return _public(scan)


@app.post("/api/scan/{scan_id}/report")
async def request_report(scan_id: str, body: ReportIn, request: Request):
    store = app.state.store
    scan = store.get(scan_id)
    if not scan:
        raise HTTPException(404, "Unknown scan.")
    if body.website.strip():
        return {"ok": True}  # a bot filled the honeypot; say nothing
    email = body.email.strip().lower()
    if not _EMAIL.match(email):
        raise HTTPException(400, "Please enter an email address we can send the audit to.")
    if scan["status"] not in (S.HOOK_DONE, S.REPORT_REQUESTED):
        raise HTTPException(409, "The first read hasn't finished yet." if scan["status"].startswith("hook") else "An audit is already on its way.")
    if not app.state.report_limit.allow(_ip(request)):
        raise HTTPException(429, "That's a few requests in a row. Give it an hour and try again.")
    token = secrets.token_urlsafe(24)
    store.update(scan_id, email=email, name=body.name.strip()[:120], confirm_token=token, status=S.REPORT_REQUESTED)
    scan = store.get(scan_id)
    try:
        await app.state.pipeline.send_confirmation(scan)
    except Exception:
        log.exception("confirmation email failed for %s", scan_id)
        raise HTTPException(502, "We couldn't send the confirmation email just now. Please try again in a minute.")
    return {"ok": True, "report": "requested"}


@app.get("/api/confirm/{token}")
async def confirm(token: str):
    s, store = app.state.s, app.state.store
    scan = store.by_token("confirm_token", token)
    if not scan:
        return RedirectResponse(f"{s.public_origin}/?audit=invalid#report", status_code=303)
    if scan["status"] == S.REPORT_REQUESTED:
        store.update(scan["id"], status=S.REPORT_QUEUED, confirmed_at=time.time())
        app.state.reports.put_nowait(scan["id"])
    return RedirectResponse(f"{s.public_origin}/?audit=confirmed#report", status_code=303)


@app.get("/api/report/{token}", response_class=HTMLResponse)
async def view_report(token: str):
    scan = app.state.store.by_token("report_token", token)
    if not scan or not scan.get("report_html"):
        raise HTTPException(404, "No report at this address.")
    return HTMLResponse(scan["report_html"], headers={"Cache-Control": "private, no-store", "X-Robots-Tag": "noindex"})


def _admin(key: str | None):
    s = app.state.s
    if not s.admin_key or not key or not secrets.compare_digest(key, s.admin_key):
        raise HTTPException(404)


@app.get("/api/admin/scans")
async def admin_list(x_admin_key: str | None = Header(default=None)):
    _admin(x_admin_key)
    return app.state.store.list(200)


@app.get("/api/admin/scans/{scan_id}")
async def admin_get(scan_id: str, x_admin_key: str | None = Header(default=None)):
    _admin(x_admin_key)
    scan = app.state.store.get(scan_id)
    if not scan:
        raise HTTPException(404)
    scan.pop("report_html", None)
    return scan


@app.exception_handler(HTTPException)
async def http_error(request: Request, exc: HTTPException):
    if exc.status_code == 404 and not request.url.path.startswith("/api/"):
        return HTMLResponse("Not found", status_code=404)
    return JSONResponse({"error": exc.detail}, status_code=exc.status_code)


# Local development only: serve site/ from the same origin so the page's fetch('/api/...') calls just work.
_site_dir = load_settings().serve_site
if _site_dir:
    app.mount("/", StaticFiles(directory=_site_dir, html=True), name="site")
