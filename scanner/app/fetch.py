"""Outbound fetching with SSRF checks, and HTML to structured page data."""
from __future__ import annotations

import asyncio
import ipaddress
import json
import re
import socket
import time
from dataclasses import dataclass, field
from urllib.parse import urljoin, urlsplit, urlunsplit

import httpx
from pydantic import BaseModel, Field
from selectolax.lexbor import LexborHTMLParser as HTMLParser


class FetchError(Exception):
    """A reason the visitor can read."""


_PRIVATE = [ipaddress.ip_network(n) for n in (
    "0.0.0.0/8", "10.0.0.0/8", "100.64.0.0/10", "127.0.0.0/8", "169.254.0.0/16", "172.16.0.0/12",
    "192.0.0.0/24", "192.168.0.0/16", "198.18.0.0/15", "224.0.0.0/4", "240.0.0.0/4",
    "::1/128", "fc00::/7", "fe80::/10", "::ffff:0:0/96")]


def normalise_url(raw: str) -> str:
    s = (raw or "").strip()
    if not s:
        raise FetchError("Please enter your website address.")
    if len(s) > 500:
        raise FetchError("That address is too long.")
    if "://" not in s:
        s = "https://" + s
    parts = urlsplit(s)
    if parts.scheme not in ("http", "https"):
        raise FetchError("Only web addresses (http or https) can be read.")
    host = (parts.hostname or "").lower().rstrip(".")
    if not host or "." not in host or " " in host:
        raise FetchError("That doesn't look like a website address.")
    try:
        host.encode("idna")
    except UnicodeError as e:
        raise FetchError("That doesn't look like a website address.") from e
    try:
        port = parts.port
    except ValueError as e:
        raise FetchError("That doesn't look like a website address.") from e
    if port not in (None, 80, 443):
        raise FetchError("Only standard web ports are supported.")
    try:
        literal = ipaddress.ip_address(host.strip("[]"))
    except ValueError:
        literal = None
    if literal is not None and _is_private(str(literal)):
        raise FetchError("That address points at a private network, which we don't read.")
    return urlunsplit((parts.scheme, host, parts.path or "/", parts.query, ""))


def domain_of(url: str) -> str:
    host = (urlsplit(url).hostname or "").lower()
    return host[4:] if host.startswith("www.") else host


def same_site(a: str, b: str) -> bool:
    return domain_of(a) == domain_of(b)


def _is_private(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip.split("%")[0])
    except ValueError:
        return True
    return (addr.is_private or addr.is_loopback or addr.is_link_local or addr.is_multicast or addr.is_reserved
            or addr.is_unspecified or any(addr in n for n in _PRIVATE))


async def resolve_public(host: str) -> list[str]:
    """Resolve and refuse anything that lands on a private network."""
    try:
        infos = await asyncio.get_running_loop().getaddrinfo(host, None, type=socket.SOCK_STREAM)
    except socket.gaierror as e:
        raise FetchError(f"We couldn't find a website at {host}.") from e
    ips = sorted({i[4][0] for i in infos})
    if not ips:
        raise FetchError(f"We couldn't find a website at {host}.")
    if any(_is_private(ip) for ip in ips):
        raise FetchError("That address points at a private network, which we don't read.")
    return ips


@dataclass
class Fetched:
    url: str
    final_url: str
    status: int
    headers: dict[str, str]
    body: bytes
    elapsed_ms: int
    redirects: list[tuple[str, int]] = field(default_factory=list)

    @property
    def text(self) -> str:
        ct = self.headers.get("content-type", "")
        m = re.search(r"charset=([\w-]+)", ct)
        for enc in ([m.group(1)] if m else []) + ["utf-8", "cp1252", "latin-1"]:
            try:
                return self.body.decode(enc)
            except (UnicodeDecodeError, LookupError):
                continue
        return self.body.decode("utf-8", "replace")


def make_client(user_agent: str) -> httpx.AsyncClient:
    return httpx.AsyncClient(
        follow_redirects=False,
        timeout=httpx.Timeout(20.0, connect=10.0),
        headers={"User-Agent": user_agent, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
                 "Accept-Language": "en-GB,en;q=0.8"},
        limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
    )


async def fetch(client: httpx.AsyncClient, url: str, *, method: str = "GET", max_bytes: int = 2_000_000,
                max_redirects: int = 5, check: bool = True) -> Fetched:
    """Fetch with every hop resolved and checked. Redirects are followed by hand so each target is checked too."""
    cur = url
    redirects: list[tuple[str, int]] = []
    t0 = time.monotonic()
    for _ in range(max_redirects + 1):
        parts = urlsplit(cur)
        host = parts.hostname or ""
        if parts.scheme not in ("http", "https") or not host:
            raise FetchError("That page redirected somewhere we can't follow.")
        # Pin the connection to a checked address. A second DNS lookup at connect time could rebind to an internal host.
        cur = normalise_url(cur)
        target = httpx.URL(cur)
        headers = {}
        extensions = {}
        if check:
            ips = await resolve_public(host)
            ip = sorted(ips, key=lambda value: ":" in value)[0]
            target = target.copy_with(host=ip)
            # Do not reuse an IP-keyed TLS connection for a different hostname sharing that address.
            headers = {"Host": httpx.URL(cur).netloc.decode("ascii"), "Connection": "close"}
            extensions = {"sni_hostname": host.encode("idna").decode("ascii")}
        try:
            async with client.stream(method, target, headers=headers, extensions=extensions) as r:
                loc = r.headers.get("location")
                if r.status_code in (301, 302, 303, 307, 308) and loc:
                    redirects.append((cur, r.status_code))
                    cur = urljoin(cur, loc)
                    continue
                buf = bytearray()
                async for chunk in r.aiter_bytes():
                    buf += chunk
                    if len(buf) >= max_bytes:
                        break
                return Fetched(url, cur, r.status_code, {k.lower(): v for k, v in r.headers.items()},
                               bytes(buf[:max_bytes]), int((time.monotonic() - t0) * 1000), redirects)
        except httpx.TimeoutException as e:
            raise FetchError(f"{host} took too long to respond.") from e
        except httpx.HTTPError as e:
            raise FetchError(f"We couldn't connect to {host}.") from e
    raise FetchError("That address redirects too many times.")


# ---------------------------------------------------------------- HTML -> structured page

class Link(BaseModel):
    text: str
    href: str


class Form(BaseModel):
    action: str = ""
    fields: list[str] = Field(default_factory=list)


class Page(BaseModel):
    url: str
    final_url: str
    status: int
    title: str = ""
    description: str = ""
    canonical: str = ""
    lang: str = ""
    viewport: str = ""
    robots_meta: str = ""
    h1: list[str] = Field(default_factory=list)
    h2: list[str] = Field(default_factory=list)
    above_fold: str = ""
    text: str = ""
    word_count: int = 0
    nav_links: list[Link] = Field(default_factory=list)
    internal_links: list[Link] = Field(default_factory=list)
    external_link_count: int = 0
    tel: list[str] = Field(default_factory=list)
    mailto: list[str] = Field(default_factory=list)
    forms: list[Form] = Field(default_factory=list)
    buttons: list[str] = Field(default_factory=list)
    image_count: int = 0
    images_missing_alt: int = 0
    image_srcs: list[str] = Field(default_factory=list)
    jsonld_types: list[str] = Field(default_factory=list)
    jsonld: list[dict] = Field(default_factory=list)
    script_count: int = 0
    headers: dict[str, str] = Field(default_factory=dict)
    elapsed_ms: int = 0
    bytes: int = 0
    redirects: list[str] = Field(default_factory=list)

    def excerpt(self, chars: int) -> str:
        return self.text[:chars]


_KEEP_HEADERS = ("content-type", "server", "strict-transport-security", "content-security-policy",
                 "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy",
                 "cache-control", "content-encoding", "last-modified", "x-powered-by")


def _clean(s: str | None) -> str:
    return re.sub(r"\s+", " ", s or "").strip()


def _jsonld_types(obj, out: list[str]) -> None:
    if isinstance(obj, dict):
        t = obj.get("@type")
        if isinstance(t, str):
            out.append(t)
        elif isinstance(t, list):
            out.extend(str(x) for x in t)
        for v in obj.values():
            _jsonld_types(v, out)
    elif isinstance(obj, list):
        for v in obj:
            _jsonld_types(v, out)


def extract_page(f: Fetched, *, text_cap: int = 15000) -> Page:
    page = Page(url=f.url, final_url=f.final_url, status=f.status, elapsed_ms=f.elapsed_ms, bytes=len(f.body),
                headers={k: v[:300] for k, v in f.headers.items() if k in _KEEP_HEADERS},
                redirects=[u for u, _ in f.redirects])
    if "html" not in f.headers.get("content-type", "") and not f.body.lstrip()[:200].lower().startswith((b"<!doctype", b"<html")):
        return page
    tree = HTMLParser(f.text)
    base = f.final_url

    def meta(name: str, attr: str = "name") -> str:
        n = tree.css_first(f'meta[{attr}="{name}" i]')
        return _clean(n.attributes.get("content")) if n else ""

    t = tree.css_first("title")
    page.title = _clean(t.text()) if t else ""
    page.description = meta("description") or meta("og:description", "property")
    c = tree.css_first('link[rel="canonical"]')
    page.canonical = _clean(c.attributes.get("href")) if c else ""
    html = tree.css_first("html")
    page.lang = _clean(html.attributes.get("lang")) if html else ""
    page.viewport = meta("viewport")
    page.robots_meta = meta("robots")
    page.h1 = [_clean(n.text()) for n in tree.css("h1")][:5]
    page.h2 = [_clean(n.text()) for n in tree.css("h2")][:15]

    for s in tree.css('script[type="application/ld+json"]'):
        try:
            data = json.loads(s.text() or "")
        except (ValueError, TypeError):
            continue
        types: list[str] = []
        _jsonld_types(data, types)
        page.jsonld_types.extend(types)
        if len(page.jsonld) < 5:
            page.jsonld.append(data if isinstance(data, dict) else {"items": data})
    page.jsonld_types = sorted(set(page.jsonld_types))[:20]

    page.script_count = len(tree.css("script"))
    imgs = tree.css("img")
    page.image_count = len(imgs)
    page.images_missing_alt = sum(1 for i in imgs if not _clean(i.attributes.get("alt")))
    page.image_srcs = [urljoin(base, i.attributes.get("src") or i.attributes.get("data-src") or "")
                       for i in imgs if (i.attributes.get("src") or i.attributes.get("data-src"))][:12]

    for form in tree.css("form"):
        fields = []
        for inp in form.css("input, textarea, select"):
            typ = (inp.attributes.get("type") or inp.tag).lower()
            if typ in ("hidden", "submit", "button"):
                continue
            fields.append(_clean(inp.attributes.get("name") or inp.attributes.get("placeholder") or typ)[:40])
        page.forms.append(Form(action=_clean(form.attributes.get("action"))[:200], fields=fields[:12]))
    page.forms = page.forms[:8]

    buttons = [_clean(b.text()) for b in tree.css("button")] + \
              [_clean(i.attributes.get("value")) for i in tree.css('input[type="submit"]')] + \
              [_clean(a.text()) for a in tree.css("a") if re.search(r"btn|button|cta", a.attributes.get("class") or "", re.I)]
    page.buttons = [b for b in dict.fromkeys(buttons) if b][:20]

    nav_nodes = tree.css("nav a[href], header a[href]")
    page.nav_links = [Link(text=_clean(a.text())[:60], href=urljoin(base, a.attributes.get("href", "")))
                      for a in nav_nodes if _clean(a.text())][:40]
    seen: set[str] = set()
    for a in tree.css("a[href]"):
        href = (a.attributes.get("href") or "").strip()
        if not href or href.startswith(("#", "javascript:")):
            continue
        if href.lower().startswith("tel:"):
            v = _clean(href[4:])
            if v and v not in page.tel:
                page.tel.append(v)
            continue
        if href.lower().startswith("mailto:"):
            v = _clean(href[7:].split("?")[0])
            if v and v not in page.mailto:
                page.mailto.append(v)
            continue
        abs_url = urljoin(base, href)
        if not abs_url.startswith(("http://", "https://")):
            continue
        if same_site(abs_url, base):
            key = abs_url.split("#")[0]
            if key not in seen:
                seen.add(key)
                page.internal_links.append(Link(text=_clean(a.text())[:60], href=key))
        else:
            page.external_link_count += 1
    page.internal_links = page.internal_links[:150]

    for n in tree.css("script, style, noscript, template, svg, iframe"):
        n.decompose()
    body = tree.body if tree.body is not None else tree.root
    raw = body.text(separator="\n", strip=True) if body is not None else ""
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in raw.split("\n")]
    text = "\n".join(ln for ln in lines if ln)
    page.word_count = len(text.split())
    page.above_fold = text[:1200]
    page.text = text[:text_cap]
    return page


# ---------------------------------------------------------------- choosing which pages to read

_SCORE = [
    (r"about|who-we-are|our-story|team|meet", 3), (r"service|what-we-do|solutions|treatments|menu|products?|shop|range", 3),
    (r"contact|get-in-touch|enquir|book|quote|appointment", 3), (r"pric|cost|fees|rates|packages?|plans?", 3),
    (r"review|testimonial|feedback", 2), (r"case-stud|projects?|portfolio|our-work|gallery|results", 2),
    (r"faq|questions", 1), (r"areas?|locations?|where", 1), (r"why-us|why-choose|guarantee|accredit", 1),
]
_SKIP = re.compile(r"login|sign-?in|account|cart|basket|checkout|privacy|terms|cookie|sitemap|wp-|feed|/tag/|/category/"
                   r"|/author/|\.(pdf|jpe?g|png|gif|svg|zip|docx?|xlsx?)(\?|$)", re.I)


def choose_pages(home: Page, limit: int) -> list[str]:
    """Pick the internal pages most likely to say what the business does and how to buy."""
    scored: list[tuple[int, str]] = []
    home_key = home.final_url.split("#")[0].rstrip("/")
    for link in home.internal_links:
        href = link.href.split("#")[0]
        if href.rstrip("/") == home_key or _SKIP.search(href):
            continue
        path = urlsplit(href).path.lower()
        hay = f"{path} {link.text.lower()}"
        score = sum(w for pat, w in _SCORE if re.search(pat, hay))
        depth = path.count("/")
        if score:
            scored.append((score * 10 - depth, href))
    scored.sort(reverse=True)
    out: list[str] = []
    for _, href in scored:
        if href not in out:
            out.append(href)
        if len(out) >= limit:
            break
    return out
