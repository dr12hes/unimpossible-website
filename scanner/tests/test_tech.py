from app.tech import ai_bot_access, parse_robots, summarise_tech


ROBOTS = """
User-agent: *
Disallow: /admin
Sitemap: https://x.example/sitemap.xml

User-agent: GPTBot
User-agent: ClaudeBot
Disallow: /

User-agent: PerplexityBot
Disallow:
"""


def test_parse_robots_groups_and_sitemaps():
    r = parse_robots(ROBOTS)
    assert r["sitemaps"] == ["https://x.example/sitemap.xml"]
    assert r["groups"]["gptbot"]["disallow"] == ["/"]
    assert r["groups"]["claudebot"]["disallow"] == ["/"]
    assert r["groups"]["*"]["disallow"] == ["/admin"]


def test_ai_bot_access():
    a = ai_bot_access(parse_robots(ROBOTS))
    assert a["GPTBot"] == "blocked" and a["ClaudeBot"] == "blocked"
    assert a["PerplexityBot"] == "allowed"
    assert a["Google-Extended"] == "allowed (wildcard rule)"
    assert ai_bot_access(None)["GPTBot"].startswith("allowed")


def test_summarise_tech_mentions_the_gaps():
    lines = summarise_tech({"https": False, "security_headers": {"content-security-policy": False}, "viewport_meta": False,
                            "robots_txt": "missing", "ai_bots": {"GPTBot": "blocked"}, "jsonld_types": [], "images": {"missing_alt": 0}})
    text = " ".join(lines)
    assert "not served over HTTPS" in text and "viewport" in text and "blocks AI crawlers: GPTBot" in text and "No structured data" in text
