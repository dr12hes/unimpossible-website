"""Settings from the environment. Everything optional degrades gracefully; only the Anthropic key is required."""
from __future__ import annotations

import os
import secrets
from dataclasses import dataclass
from pathlib import Path


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _int(name: str, default: int) -> int:
    try:
        return int(_env(name, str(default)))
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    data_dir: Path
    public_origin: str
    secret: str
    anthropic_api_key: str
    hook_model: str
    notes_model: str
    judge_model: str
    writer_model: str
    search_provider: str
    brave_api_key: str
    serper_api_key: str
    companies_house_api_key: str
    google_places_api_key: str
    openpagerank_api_key: str
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_pass: str
    mail_from: str
    mail_bcc: str
    admin_key: str
    user_agent: str
    max_site_pages: int
    max_competitor_pages: int
    max_competitors: int
    max_queries: int
    reuse_days: int
    hook_rate_per_ip: int       # per 10 minutes
    report_rate_per_ip: int     # per hour
    hooks_per_hour: int         # across everyone
    serve_site: str             # local dev only: a directory of static files to serve at /


def load_settings() -> Settings:
    data_dir = Path(_env("SCANNER_DATA_DIR", "/data"))
    data_dir.mkdir(parents=True, exist_ok=True)
    secret = _env("SCANNER_SECRET")
    if not secret:
        f = data_dir / "secret"
        if f.exists():
            secret = f.read_text().strip()
        else:
            secret = secrets.token_urlsafe(32)
            f.write_text(secret)
            f.chmod(0o600)
    return Settings(
        data_dir=data_dir,
        public_origin=_env("SCANNER_PUBLIC_ORIGIN", "https://unimpossible.co.uk").rstrip("/"),
        secret=secret,
        anthropic_api_key=_env("ANTHROPIC_API_KEY"),
        hook_model=_env("SCANNER_HOOK_MODEL", "claude-sonnet-5-5"),
        notes_model=_env("SCANNER_NOTES_MODEL", "claude-haiku-5-5"),
        judge_model=_env("SCANNER_JUDGE_MODEL", "claude-sonnet-5-5"),
        writer_model=_env("SCANNER_WRITER_MODEL", "claude-sonnet-5-5"),
        search_provider=_env("SEARCH_PROVIDER").lower(),
        brave_api_key=_env("BRAVE_API_KEY"),
        serper_api_key=_env("SERPER_API_KEY"),
        companies_house_api_key=_env("COMPANIES_HOUSE_API_KEY"),
        google_places_api_key=_env("GOOGLE_PLACES_API_KEY"),
        openpagerank_api_key=_env("OPENPAGERANK_API_KEY"),
        smtp_host=_env("SMTP_HOST"),
        smtp_port=_int("SMTP_PORT", 465),
        smtp_user=_env("SMTP_USER"),
        smtp_pass=_env("SMTP_PASS"),
        mail_from=_env("MAIL_FROM", "UNimpossible <hello@unimpossible.co.uk>"),
        mail_bcc=_env("MAIL_BCC", "hello@unimpossible.co.uk"),
        admin_key=_env("SCANNER_ADMIN_KEY"),
        user_agent=_env("SCANNER_USER_AGENT", "Mozilla/5.0 (compatible; UNimpossibleAudit/1.0; +https://unimpossible.co.uk/)"),
        max_site_pages=_int("SCANNER_MAX_SITE_PAGES", 8),
        max_competitor_pages=_int("SCANNER_MAX_COMPETITOR_PAGES", 4),
        max_competitors=_int("SCANNER_MAX_COMPETITORS", 5),
        max_queries=_int("SCANNER_MAX_QUERIES", 10),
        reuse_days=_int("SCANNER_REUSE_DAYS", 7),
        hook_rate_per_ip=_int("SCANNER_HOOK_RATE_PER_IP", 6),
        report_rate_per_ip=_int("SCANNER_REPORT_RATE_PER_IP", 3),
        hooks_per_hour=_int("SCANNER_HOOKS_PER_HOUR", 60),
        serve_site=_env("SCANNER_SERVE_SITE"),
    )
