"""SQLite persistence: scans (one per visitor request) and a small fetch/search cache."""
from __future__ import annotations

import json
import sqlite3
import threading
import time
import uuid
from pathlib import Path
from typing import Any

HOOK_QUEUED, HOOK_RUNNING, HOOK_DONE, HOOK_FAILED = "hook_queued", "hook_running", "hook_done", "hook_failed"
REPORT_REQUESTED, REPORT_QUEUED, REPORT_RUNNING, REPORT_DONE, REPORT_FAILED = (
    "report_requested", "report_queued", "report_running", "report_done", "report_failed")

SCHEMA = """
CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  created_at REAL NOT NULL,
  updated_at REAL NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  ip TEXT,
  status TEXT NOT NULL,
  hook_json TEXT,
  email TEXT,
  name TEXT,
  confirm_token TEXT,
  confirmed_at REAL,
  report_token TEXT,
  report_json TEXT,
  report_html TEXT,
  error TEXT,
  usage_json TEXT,
  log TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS scans_domain ON scans(domain, created_at);
CREATE INDEX IF NOT EXISTS scans_confirm ON scans(confirm_token);
CREATE INDEX IF NOT EXISTS scans_report ON scans(report_token);
CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, created_at REAL NOT NULL, value TEXT NOT NULL);
"""


class Store:
    def __init__(self, path: Path):
        self.lock = threading.RLock()
        self.conn = sqlite3.connect(str(path), check_same_thread=False, isolation_level=None)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.execute("PRAGMA busy_timeout=5000")
        self.conn.executescript(SCHEMA)

    # ---- scans
    def create_scan(self, url: str, domain: str, ip: str | None, status: str, **fields: Any) -> dict:
        now = time.time()
        row = {"id": uuid.uuid4().hex[:16], "created_at": now, "updated_at": now, "url": url, "domain": domain,
               "ip": ip, "status": status, **fields}
        cols = ", ".join(row)
        with self.lock:
            self.conn.execute(f"INSERT INTO scans ({cols}) VALUES ({', '.join(':' + c for c in row)})", row)
        return self.get(row["id"])

    def get(self, scan_id: str) -> dict | None:
        with self.lock:
            r = self.conn.execute("SELECT * FROM scans WHERE id = ?", (scan_id,)).fetchone()
        return dict(r) if r else None

    def by_token(self, column: str, token: str) -> dict | None:
        assert column in ("confirm_token", "report_token")
        with self.lock:
            r = self.conn.execute(f"SELECT * FROM scans WHERE {column} = ?", (token,)).fetchone()
        return dict(r) if r else None

    def update(self, scan_id: str, **fields: Any) -> None:
        fields["updated_at"] = time.time()
        sets = ", ".join(f"{k} = :{k}" for k in fields)
        with self.lock:
            self.conn.execute(f"UPDATE scans SET {sets} WHERE id = :id", {**fields, "id": scan_id})

    def log(self, scan_id: str, line: str) -> None:
        stamp = time.strftime("%H:%M:%S")
        with self.lock:
            self.conn.execute("UPDATE scans SET log = log || ? WHERE id = ?", (f"{stamp} {line}\n", scan_id))

    def recent(self, domain: str, status: str, max_age_s: float) -> dict | None:
        with self.lock:
            r = self.conn.execute(
                "SELECT * FROM scans WHERE domain = ? AND status = ? AND created_at > ? ORDER BY created_at DESC LIMIT 1",
                (domain, status, time.time() - max_age_s)).fetchone()
        return dict(r) if r else None

    def recent_report(self, domain: str, max_age_s: float) -> dict | None:
        with self.lock:
            r = self.conn.execute(
                "SELECT * FROM scans WHERE domain = ? AND report_json IS NOT NULL AND updated_at > ? "
                "ORDER BY updated_at DESC LIMIT 1", (domain, time.time() - max_age_s)).fetchone()
        return dict(r) if r else None

    def jobs_to_resume(self) -> list[tuple[str, str]]:
        with self.lock:
            rows = self.conn.execute("SELECT id, status FROM scans WHERE status IN (?,?,?,?) ORDER BY created_at",
                                     (HOOK_QUEUED, HOOK_RUNNING, REPORT_QUEUED, REPORT_RUNNING)).fetchall()
        return [("hook" if r["status"].startswith("hook") else "report", r["id"]) for r in rows]

    def list(self, limit: int = 100) -> list[dict]:
        with self.lock:
            rows = self.conn.execute(
                "SELECT id, created_at, updated_at, url, domain, ip, status, email, name, confirmed_at, error, usage_json "
                "FROM scans ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
        return [dict(r) for r in rows]

    def count_since(self, since: float) -> int:
        with self.lock:
            return self.conn.execute("SELECT COUNT(*) FROM scans WHERE created_at > ?", (since,)).fetchone()[0]

    # ---- cache
    def cache_get(self, key: str, max_age_s: float) -> Any | None:
        with self.lock:
            r = self.conn.execute("SELECT value FROM cache WHERE key = ? AND created_at > ?",
                                  (key, time.time() - max_age_s)).fetchone()
        return json.loads(r["value"]) if r else None

    def cache_put(self, key: str, value: Any) -> None:
        with self.lock:
            self.conn.execute("INSERT OR REPLACE INTO cache (key, created_at, value) VALUES (?, ?, ?)",
                              (key, time.time(), json.dumps(value)))

    def cache_prune(self, max_age_s: float) -> None:
        with self.lock:
            self.conn.execute("DELETE FROM cache WHERE created_at < ?", (time.time() - max_age_s,))
