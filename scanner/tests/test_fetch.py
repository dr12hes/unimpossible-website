import pytest
from app.fetch import (
    Fetched,
    FetchError,
    Page,
    _is_private,
    choose_pages,
    domain_of,
    extract_page,
    normalise_url,
)


def test_normalise_adds_scheme_and_keeps_path():
    assert normalise_url("Example.co.uk/about?x=1#frag") == "https://example.co.uk/about?x=1"
    assert normalise_url("http://www.example.com") == "http://www.example.com/"


@pytest.mark.parametrize("bad", ["", "not a url", "ftp://example.com", "localhost", "example.com:8080", "javascript:alert(1)"])
def test_normalise_rejects(bad):
    with pytest.raises(FetchError):
        normalise_url(bad)


@pytest.mark.parametrize("ip", ["127.0.0.1", "10.1.2.3", "192.168.0.5", "172.16.9.9", "169.254.169.254", "::1", "fd00::1",
                                "0.0.0.0", "100.64.0.1", "::ffff:127.0.0.1", "224.0.0.1"])
def test_private_addresses_are_private(ip):
    assert _is_private(ip)


@pytest.mark.parametrize("ip", ["8.8.8.8", "46.4.219.113", "2606:4700::1111"])
def test_public_addresses_are_public(ip):
    assert not _is_private(ip)


def test_domain_of_strips_www():
    assert domain_of("https://www.Example.co.uk/x") == "example.co.uk"


HTML = b"""<!doctype html><html lang="en-GB"><head><title>Acme Electrical | Norwich electricians</title>
<meta name="description" content="NICEIC electricians in Norwich"><meta name="viewport" content="width=device-width">
<link rel="canonical" href="https://acme.example/">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Acme Electrical","telephone":"01603 123456"}</script>
</head><body><header><nav><a href="/about">About us</a><a href="/services/rewires">Rewires</a><a href="/contact">Contact</a></nav></header>
<h1>Electricians in Norwich</h1><p>Call <a href="tel:01603123456">01603 123456</a> or <a href="mailto:hi@acme.example">email us</a>.</p>
<h2>What we do</h2><p>Rewires, EICRs, consumer units.</p><img src="/a.jpg"><img src="/b.jpg" alt="van">
<form action="/enquire"><input name="name"><input type="email" name="email"><input type="hidden" name="t"><button>Get a quote</button></form>
<a class="btn" href="/quote">Request a quote</a><a href="https://facebook.com/acme">Facebook</a><a href="/privacy">Privacy</a>
<script>var x=1;</script><style>p{}</style></body></html>"""


def _page() -> Page:
    f = Fetched("https://acme.example", "https://acme.example/", 200, {"content-type": "text/html; charset=utf-8",
                "strict-transport-security": "max-age=1"}, HTML, 120)
    return extract_page(f)


def test_extract_page_fields():
    p = _page()
    assert p.title == "Acme Electrical | Norwich electricians"
    assert p.description.startswith("NICEIC")
    assert p.lang == "en-GB" and p.viewport
    assert p.h1 == ["Electricians in Norwich"] and p.h2 == ["What we do"]
    assert p.tel == ["01603123456"] and p.mailto == ["hi@acme.example"]
    assert p.jsonld_types == ["LocalBusiness"]
    assert p.forms[0].fields == ["name", "email"]
    assert "Get a quote" in p.buttons and "Request a quote" in p.buttons
    assert p.image_count == 2 and p.images_missing_alt == 1
    assert p.external_link_count == 1
    assert "var x=1" not in p.text and "Rewires, EICRs" in p.text
    assert {link.href for link in p.internal_links} >= {"https://acme.example/about", "https://acme.example/contact"}
    assert p.headers.get("strict-transport-security")


def test_choose_pages_prefers_informative_and_skips_privacy():
    chosen = choose_pages(_page(), 3)
    assert "https://acme.example/privacy" not in chosen
    assert set(chosen) <= {"https://acme.example/about", "https://acme.example/services/rewires", "https://acme.example/contact", "https://acme.example/quote"}
    assert len(chosen) == 3


@pytest.mark.parametrize("bad", ["https://example.com:bad", "https://example.com:99999"])
def test_malformed_ports_are_validation_errors(bad):
    with pytest.raises(FetchError):
        normalise_url(bad)


@pytest.mark.asyncio
async def test_fetch_pins_checked_ip_and_preserves_hostname(monkeypatch):
    import httpx
    from app.fetch import fetch

    async def resolve(host):
        assert host == "public.example"
        return ["8.8.8.8"]

    def respond(request):
        assert request.url.host == "8.8.8.8"
        assert request.headers["Host"] == "public.example"
        assert request.headers["Connection"] == "close"
        assert request.extensions["sni_hostname"] == "public.example"
        return httpx.Response(200, text="public page")

    monkeypatch.setattr("app.fetch.resolve_public", resolve)
    async with httpx.AsyncClient(transport=httpx.MockTransport(respond)) as client:
        result = await fetch(client, "https://public.example/about")
    assert result.final_url == "https://public.example/about"


@pytest.mark.asyncio
@pytest.mark.parametrize("location", ["http://127.0.0.1/", "https://public.example:8000/"])
async def test_redirect_cannot_reach_private_address_or_non_web_port(monkeypatch, location):
    import httpx
    from app.fetch import fetch

    async def resolve(host):
        return ["8.8.8.8"]

    seen = []

    def respond(request):
        seen.append(request)
        return httpx.Response(302, headers={"Location": location})

    monkeypatch.setattr("app.fetch.resolve_public", resolve)
    async with httpx.AsyncClient(transport=httpx.MockTransport(respond)) as client:
        with pytest.raises(FetchError):
            await fetch(client, "https://public.example/")
    assert len(seen) == 1
