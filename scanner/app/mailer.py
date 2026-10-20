"""Outbound email over SMTP. Without SMTP settings, messages are written to data/outbox as .eml files."""
from __future__ import annotations

import asyncio
import logging
import smtplib
import time
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

from .config import Settings

log = logging.getLogger("scanner.mail")


class Mailer:
    def __init__(self, settings: Settings):
        self.s = settings
        self.outbox = settings.data_dir / "outbox"

    async def send(self, to: str, subject: str, text: str, html: str | None = None, bcc: str | None = None) -> None:
        await asyncio.to_thread(self._send, to, subject, text, html, bcc)

    def _send(self, to: str, subject: str, text: str, html: str | None, bcc: str | None) -> None:
        msg = EmailMessage()
        msg["From"] = self.s.mail_from
        msg["To"] = to
        msg["Subject"] = subject
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="unimpossible.co.uk")
        msg.set_content(text)
        if html:
            msg.add_alternative(html, subtype="html")
        recipients = [to] + ([bcc] if bcc and bcc != to else [])
        if not self.s.smtp_host:
            self.outbox.mkdir(parents=True, exist_ok=True)
            path = self.outbox / f"{int(time.time())}-{to.replace('@', '_at_')}.eml"
            path.write_bytes(bytes(msg))
            log.warning("SMTP not configured; wrote %s", path)
            return
        try:
            if self.s.smtp_port == 465:
                server = smtplib.SMTP_SSL(self.s.smtp_host, self.s.smtp_port, timeout=30)
            else:
                server = smtplib.SMTP(self.s.smtp_host, self.s.smtp_port, timeout=30)
                server.starttls()
            with server:
                if self.s.smtp_user:
                    server.login(self.s.smtp_user, self.s.smtp_pass)
                server.send_message(msg, to_addrs=recipients)
            log.info("sent '%s' to %s", subject, to)
        except (smtplib.SMTPException, OSError) as e:
            log.error("mail to %s failed: %s", to, e)
            raise
