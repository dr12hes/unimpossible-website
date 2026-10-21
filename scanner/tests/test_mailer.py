import json
from dataclasses import replace
from email import policy
from email.parser import BytesParser

import httpx
import pytest

from app.config import load_settings
from app.mailer import MailError, Mailer


@pytest.mark.asyncio
async def test_postmark_sends_transactional_message_with_copy(monkeypatch):
    settings = replace(load_settings(), postmark_server_token="test-token", postmark_message_stream="audits", mail_outbox=False)
    requests = []

    async def send(request):
        requests.append(request)
        return httpx.Response(200, json={"ErrorCode": 0, "MessageID": "accepted-123"})

    client = httpx.AsyncClient
    monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: client(transport=httpx.MockTransport(send), **kwargs))
    await Mailer(settings).send("reader@example.com", "Your audit", "Plain report", "<p>Report</p>", "hello@unimpossible.co.uk")
    request = requests[0]
    assert str(request.url) == "https://api.postmarkapp.com/email"
    assert request.headers["X-Postmark-Server-Token"] == "test-token"
    payload = json.loads(request.content)
    assert payload["ReplyTo"] == "hello@unimpossible.co.uk"
    assert payload["To"] == "reader@example.com"
    assert payload["Bcc"] == "hello@unimpossible.co.uk"
    assert payload["MessageStream"] == "audits"
    assert payload["TextBody"] == "Plain report" and payload["HtmlBody"] == "<p>Report</p>"
    assert payload["TrackLinks"] == "None" and payload["TrackOpens"] is False


@pytest.mark.asyncio
@pytest.mark.parametrize("status,body", [(422, {"ErrorCode": 400}), (200, {"ErrorCode": 300}), (200, {"ErrorCode": 0})])
async def test_rejected_mail_never_reports_success(monkeypatch, status, body):
    settings = replace(load_settings(), postmark_server_token="test-token", mail_outbox=False)
    client = httpx.AsyncClient
    monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: client(transport=httpx.MockTransport(lambda r: httpx.Response(status, json=body)), **kwargs))
    with pytest.raises(MailError):
        await Mailer(settings).send("reader@example.com", "Audit", "Report")


@pytest.mark.asyncio
async def test_missing_credentials_fail_without_creating_outbox(tmp_path):
    settings = replace(load_settings(), data_dir=tmp_path, postmark_server_token="", mail_outbox=False)
    with pytest.raises(MailError, match="not configured"):
        await Mailer(settings).send("reader@example.com", "Audit", "Report")
    assert not (tmp_path / "outbox").exists()


@pytest.mark.asyncio
async def test_explicit_dev_outbox_preserves_message_and_avoids_duplicate_copy(tmp_path):
    settings = replace(load_settings(), data_dir=tmp_path, mail_outbox=True)
    await Mailer(settings).send("hello@unimpossible.co.uk", "Audit", "Report", bcc="Hello <HELLO@unimpossible.co.uk>")
    messages = list((tmp_path / "outbox").glob("*.eml"))
    assert len(messages) == 1
    mail = BytesParser(policy=policy.default).parsebytes(messages[0].read_bytes())
    assert mail["Subject"] == "Audit" and mail.get("Bcc") is None
    assert mail.get_content().strip() == "Report"
