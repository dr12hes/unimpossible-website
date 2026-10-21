"""End-to-end over HTTP with no model key: the hook is queued, runs, and fails gracefully; validation and limits hold."""
import asyncio

import pytest
from app.main import app
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_validation_and_hook_lifecycle(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "")
    monkeypatch.setenv("SCANNER_HOOK_RATE_PER_IP", "3")
    async with app.router.lifespan_context(app), AsyncClient(transport=ASGITransport(app=app), base_url="http://t") as c:
        r = await c.get("/api/health")
        assert r.json() == {"ok": True}
        r = await c.post("/api/scan", json={"url": "not a url"})
        assert r.status_code == 400 and "website address" in r.json()["error"]
        r = await c.post("/api/scan", json={"url": "127.0.0.1"})
        assert r.status_code == 400  # no dot-less host; the private check runs at fetch time
        r = await c.post("/api/scan", json={"url": "unimpossible.co.uk"})
        assert r.status_code == 400
        r = await c.post("/api/scan", json={"url": "example.com"})
        assert r.status_code == 200
        scan = r.json()
        assert scan["phase"] == "reading"
        for _ in range(100):
            await asyncio.sleep(0.1)
            scan = (await c.get(f"/api/scan/{scan['id']}")).json()
            if scan["phase"] != "reading":
                break
        assert scan["phase"] == "failed" and "try again" in scan["error"]
        r = await c.post(f"/api/scan/{scan['id']}/report", json={"email": "nope"})
        assert r.status_code == 400
        r = await c.post(f"/api/scan/{scan['id']}/report", json={"email": "a@b.co"})
        assert r.status_code == 409
        r = await c.post("/api/scan", json={"url": "example.org"})
        r = await c.post("/api/scan", json={"url": "example.net"})
        r = await c.post("/api/scan", json={"url": "example.edu"})
        assert r.status_code == 429
        r = await c.get("/api/admin/scans")
        assert r.status_code == 404
        r = await c.get("/api/report/nothing")
        assert r.status_code == 404
