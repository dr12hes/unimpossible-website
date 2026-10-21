import json
from dataclasses import replace
from unittest.mock import AsyncMock

import httpx
import pytest
from app import store as S
from app.config import load_settings
from app.pipeline import Pipeline
from app.store import Store


@pytest.mark.asyncio
async def test_cached_report_gets_private_link_and_compact_email_for_new_recipient(tmp_path):
    settings = replace(load_settings(), public_origin="https://unimpossible.co.uk", mail_bcc="hello@unimpossible.co.uk")
    store = Store(tmp_path / "scanner.sqlite")
    original = store.create_scan("https://example.com/", "example.com", "ip", S.REPORT_DONE,
                                 email="original@example.com", report_token="original-private-token",
                                 report_json=json.dumps({"summary": "Generated text stays in the report"}),
                                 report_html="<html>Full report</html>")
    scan = store.create_scan("https://example.com/", "example.com", "ip", S.REPORT_QUEUED,
                             email="new@example.com", name="New Reader")
    mailer = AsyncMock()

    def unexpected_request(request):
        raise AssertionError("A cached report must not fetch pages or call a model")

    async with httpx.AsyncClient(transport=httpx.MockTransport(unexpected_request)) as client:
        await Pipeline(settings, store, client, mailer).run_report(scan["id"])
    sent = store.get(scan["id"])
    assert sent["status"] == S.REPORT_DONE
    assert sent["report_html"] == original["report_html"]
    assert sent["report_token"] and sent["report_token"] != original["report_token"]
    mailer.send.assert_awaited_once()
    args, kwargs = mailer.send.await_args
    assert args[0] == "new@example.com" and kwargs["bcc"] == "hello@unimpossible.co.uk"
    assert "https://unimpossible.co.uk/api/report/" + sent["report_token"] in args[2]
    assert "original-private-token" not in args[2] and "original@example.com" not in args[2]
    assert "Generated text" not in args[2] and len(args[2]) < 600
