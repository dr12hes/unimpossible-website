"""Transactional mail through Postmark; an explicit local outbox is available for development."""
from __future__ import annotations

import logging
import secrets
from email.message import EmailMessage
from email.utils import formatdate, make_msgid, parseaddr

import httpx

from .config import Settings

log = logging.getLogger("scanner.mail")


class MailError(Exception):
    """Delivery was not accepted. Never include provider response bodies or credentials."""


class Mailer:
    def __init__(self, settings: Settings):
        self.s = settings
        self.outbox = settings.data_dir / "outbox"

    async def send(self, to: str, subject: str, text: str, html: str | None = None, bcc: str | None = None) -> None:
        copy = bcc if bcc and parseaddr(bcc)[1].lower() != parseaddr(to)[1].lower() else None
        if self.s.mail_outbox:
            msg = EmailMessage()
            msg["From"], msg["To"], msg["Subject"] = self.s.mail_from, to, subject
            if self.s.mail_reply_to:
                msg["Reply-To"] = self.s.mail_reply_to
            msg["Date"], msg["Message-ID"] = formatdate(), make_msgid(domain="unimpossible.co.uk")
            if copy:
                msg["Bcc"] = copy
            msg.set_content(text)
            if html:
                msg.add_alternative(html, subtype="html")
            self.outbox.mkdir(parents=True, exist_ok=True)
            (self.outbox / f"{secrets.token_hex(16)}.eml").write_bytes(bytes(msg))
            return
        if not self.s.postmark_server_token:
            raise MailError("Postmark is not configured")
        payload = {
            "From": self.s.mail_from, "To": to, "Subject": subject, "TextBody": text,
            "MessageStream": self.s.postmark_message_stream, "Tag": "unimpossible-scanner",
            "TrackOpens": False, "TrackLinks": "None",
        }
        if self.s.mail_reply_to:
            payload["ReplyTo"] = self.s.mail_reply_to
        if html:
            payload["HtmlBody"] = html
        if copy:
            payload["Bcc"] = copy
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.postmarkapp.com/email", json=payload,
                    headers={"X-Postmark-Server-Token": self.s.postmark_server_token, "Accept": "application/json"},
                )
            response.raise_for_status()
            result = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise MailError("Postmark could not accept the message") from exc
        if result.get("ErrorCode") != 0 or not result.get("MessageID"):
            raise MailError("Postmark rejected the message")
        log.info("Postmark accepted message %s", result["MessageID"])
