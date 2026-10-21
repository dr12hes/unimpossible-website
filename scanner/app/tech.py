"""Technical basics measured directly: transport security, robots and AI-bot rules, discoverability files, weight."""
from __future__ import annotations

import asyncio
import socket
import ssl
from datetime import datetime, timezone
from urllib.parse import urlsplit, urlunsplit

import httpx

from .fetch import resolve_public, Fetched, FetchError, Page, fetch

AI_BOTS = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-SearchBot", "anthropic-ai", "Google-Extended",
           "PerplexityBot", "CCBot", "Applebot-Extended", "Bytespider", "meta-externalagent"]


def parse_robots(text: str) -> dict:
    """Group rules by user-agent. Returns {agent_lower: {"disallow": [...], "allow": [...]}} plus sitemaps."""
    groups: dict[str, dict[str, list[str]]] = {}
    sitemaps: list[str] = []
    current: list[str] = []
    last_was_agent = False
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key, value = key.strip().lower(), value.strip()
        if key == "user-agent":
            if not last_was_agent:
                current = []
            current.append(value.lower())
            groups.setdefault(value.lower(), {"disallow": [], "allow": []})
            last_was_agent = True
            continue
        last_was_agent = False
        if key == "sitemap":
            sitemaps.append(value)
        elif key in ("disallow", "allow") and current:
            for agent in current:
                groups[agent][key].append(value)
    return {"groups": groups, "sitemaps": sitemaps}


def ai_bot_access(robots: dict | None) -> dict[str, str]:
    """'blocked' when the bot (or the wildcard that applies to it) is disallowed from /, else 'allowed'."""
    out: dict[str, str] = {}
    groups = (robots or {}).get("groups", {})
    for bot in AI_BOTS:
        g = groups.get(bot.lower()) or groups.get("*")
        if g is None:
            out[bot] = "allowed (no robots.txt rules)"
            continue
        blocked = any(d.strip() == "/" for d in g["disallow"]) and not any(a.strip() == "/" for a in g["allow"])
        specific = bot.lower() in groups
        out[bot] = ("blocked" if blocked else "allowed") + ("" if specific else " (wildcard rule)")
    return out


def _cert_days_left(host: str, ip: str) -> int | None:
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((ip, 443), timeout=8) as sock, ctx.wrap_socket(sock, server_hostname=host) as s:
            cert = s.getpeercert()
        exp = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        return (exp - datetime.now(timezone.utc)).days
    except Exception:
        return None


async def _get(client: httpx.AsyncClient, url: str, max_bytes: int = 200_000) -> Fetched | None:
    try:
        return await fetch(client, url, max_bytes=max_bytes)
    except FetchError:
        return None


async def technical_checks(client: httpx.AsyncClient, home: Page, *, light: bool = False) -> dict:
    """What can be measured without judgment. `light` skips the slower probes (used for competitors)."""
    final = home.final_url
    parts = urlsplit(final)
    host = parts.hostname or ""
    origin = f"{parts.scheme}://{parts.netloc}"
    h = home.headers
    out: dict = {
        "final_url": final,
        "https": parts.scheme == "https",
        "status": home.status,
        "ttfb_and_download_ms": home.elapsed_ms,
        "html_bytes": home.bytes,
        "viewport_meta": bool(home.viewport),
        "lang_attr": home.lang,
        "security_headers": {
            "strict-transport-security": "strict-transport-security" in h,
            "content-security-policy": "content-security-policy" in h,
            "x-frame-options": "x-frame-options" in h,
            "x-content-type-options": "x-content-type-options" in h,
            "referrer-policy": "referrer-policy" in h,
        },
        "server": h.get("server", ""),
        "compression": h.get("content-encoding", "none"),
        "jsonld_types": home.jsonld_types,
        "images": {"count": home.image_count, "missing_alt": home.images_missing_alt},
        "scripts": home.script_count,
    }

    robots_f = await _get(client, f"{origin}/robots.txt")
    robots = parse_robots(robots_f.text) if robots_f and robots_f.status == 200 else None
    out["robots_txt"] = "present" if robots else ("missing" if robots_f is None or robots_f.status == 404 else f"HTTP {robots_f.status}")
    out["ai_bots"] = ai_bot_access(robots)
    out["robots_sitemaps"] = (robots or {}).get("sitemaps", [])

    if light:
        return out

    async def probe(path: str) -> str:
        f = await _get(client, f"{origin}{path}", max_bytes=50_000)
        if f is None:
            return "unreachable"
        if f.status != 200:
            return f"HTTP {f.status}"
        return "present" if path != "/sitemap.xml" or b"<urlset" in f.body or b"<sitemapindex" in f.body else "present but not a sitemap"

    http_redirect = "n/a"
    if parts.scheme == "https":
        try:
            f = await fetch(client, urlunsplit(("http", parts.netloc, "/", "", "")), max_redirects=0, max_bytes=1000)
            http_redirect = f"no redirect (HTTP {f.status})"
        except FetchError as e:
            http_redirect = "redirects to https" if "redirects too many" in str(e) else str(e)
        except Exception:
            http_redirect = "unknown"

    async def certificate_days():
        try:
            ips = await resolve_public(host)
            ip = sorted(ips, key=lambda value: ":" in value)[0]
            return await asyncio.to_thread(_cert_days_left, host, ip)
        except FetchError:
            return None

    sitemap, llms, cert_days = await asyncio.gather(
        probe("/sitemap.xml"), probe("/llms.txt"), certificate_days())
    out.update({"sitemap_xml": sitemap, "llms_txt": llms, "http_to_https": http_redirect,
                "certificate_days_left": cert_days})

    # Weight of the images the home page references (up to eight HEAD requests).
    sizes: list[int] = []

    async def head(url: str) -> None:
        try:
            f = await fetch(client, url, method="HEAD", max_bytes=1, max_redirects=2)
            cl = f.headers.get("content-length")
            if cl and cl.isdigit():
                sizes.append(int(cl))
        except (FetchError, Exception):
            pass

    await asyncio.gather(*(head(u) for u in home.image_srcs[:8] if u.startswith("http")))
    out["image_bytes_sampled"] = {"images": len(sizes), "total_kb": sum(sizes) // 1024, "largest_kb": (max(sizes) // 1024) if sizes else 0}
    return out


def summarise_tech(t: dict) -> list[str]:
    """One-line facts for the models and the report, worded so they can be quoted as evidence."""
    lines = []
    if not t.get("https"):
        lines.append("The site is not served over HTTPS.")
    if t.get("http_to_https", "").startswith("no redirect"):
        lines.append("http:// does not redirect to https://.")
    cd = t.get("certificate_days_left")
    if isinstance(cd, int) and cd < 21:
        lines.append(f"The TLS certificate expires in {cd} days.")
    sh = t.get("security_headers", {})
    missing = [k for k, v in sh.items() if not v]
    if missing:
        lines.append("Missing security headers: " + ", ".join(missing) + ".")
    if not t.get("viewport_meta"):
        lines.append("No viewport meta tag, so the page is not laid out for phones.")
    if t.get("robots_txt") != "present":
        lines.append(f"robots.txt is {t.get('robots_txt')}.")
    blocked = [b for b, s in t.get("ai_bots", {}).items() if s.startswith("blocked")]
    if blocked:
        lines.append("robots.txt blocks AI crawlers: " + ", ".join(blocked) + ".")
    if t.get("sitemap_xml") and t["sitemap_xml"] != "present":
        lines.append(f"sitemap.xml: {t['sitemap_xml']}.")
    if t.get("llms_txt") == "present":
        lines.append("Has an llms.txt file.")
    if not t.get("jsonld_types"):
        lines.append("No structured data (JSON-LD) on the home page.")
    else:
        lines.append("Structured data types on the home page: " + ", ".join(t["jsonld_types"][:6]) + ".")
    ib = t.get("image_bytes_sampled") or {}
    if ib.get("largest_kb", 0) > 400:
        lines.append(f"Largest sampled home-page image is {ib['largest_kb']} KB.")
    if t.get("images", {}).get("missing_alt", 0) > 3:
        lines.append(f"{t['images']['missing_alt']} of {t['images']['count']} home-page images have no alt text.")
    if t.get("ttfb_and_download_ms", 0) > 2500:
        lines.append(f"The home page took {t['ttfb_and_download_ms']} ms to download.")
    return lines
