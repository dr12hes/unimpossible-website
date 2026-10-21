"""The two jobs: the hook (one read of a few pages) and the full audit (site, research, competitors, report)."""
from __future__ import annotations

import asyncio
import json
import logging
import re
import secrets
import traceback
from urllib.parse import urlsplit

import httpx

from . import store as S
from .config import Settings
from .fetch import FetchError, Page, choose_pages, domain_of, extract_page, fetch
from .llm import LLM, LLMError
from .mailer import Mailer
from .report import render_report
from .search import web_search
from .sources import companies_house, page_rank, places_search
from .store import Store
from .tech import summarise_tech, technical_checks

log = logging.getLogger("scanner.pipeline")

# Sites that show up in search results but are never the competitor: directories, platforms, media, government.
NOT_COMPETITORS = {
    "yell.com", "checkatrade.com", "trustatrader.com", "ratedpeople.com", "mybuilder.com", "bark.com", "trustpilot.com",
    "facebook.com", "instagram.com", "linkedin.com", "twitter.com", "x.com", "youtube.com", "tiktok.com", "pinterest.co.uk",
    "yelp.com", "yelp.co.uk", "thomsonlocal.com", "scoot.co.uk", "cylex-uk.co.uk", "hotfrog.co.uk", "192.com",
    "freeindex.co.uk", "threebestrated.co.uk", "nextdoor.co.uk", "bing.com", "google.com", "google.co.uk", "wikipedia.org",
    "companieshouse.gov.uk", "find-and-update.company-information.service.gov.uk", "gov.uk", "indeed.com", "indeed.co.uk",
    "reed.co.uk", "glassdoor.co.uk", "totaljobs.com", "tripadvisor.co.uk", "tripadvisor.com", "amazon.co.uk", "ebay.co.uk",
    "etsy.com", "fsb.org.uk", "bbc.co.uk", "theguardian.com", "edp24.co.uk", "lynnnews.co.uk", "eveningnews24.co.uk",
    "reddit.com", "quora.com", "mumsnet.com", "which.co.uk", "citizensadvice.org.uk", "nhs.uk", "gumtree.com",
    "houzz.co.uk", "booking.com", "airbnb.co.uk", "opentable.co.uk", "justeat.co.uk", "deliveroo.co.uk", "ubereats.com",
    "rightmove.co.uk", "zoopla.co.uk", "onthemarket.com", "autotrader.co.uk", "motors.co.uk", "dnb.com", "endole.co.uk",
    "companycheck.co.uk", "bizstats.co.uk", "ukbusinessdirectory.org.uk", "localsearch.co.uk", "approvedbusiness.co.uk",
}
_NOT_COMPETITOR_RE = re.compile(r"(directory|directories|\.gov\.|\.ac\.uk|\.nhs\.|news|jobs?|wiki)", re.I)


def _page_for_llm(p: Page, chars: int) -> dict:
    return {
        "url": p.final_url, "title": p.title, "description": p.description, "h1": p.h1, "h2": p.h2[:8],
        "first_screen_text": p.above_fold, "text_excerpt": p.excerpt(chars), "word_count": p.word_count,
        "phone_links": p.tel, "email_links": p.mailto, "forms": [f.fields for f in p.forms], "buttons": p.buttons[:12],
        "navigation": [link.text for link in p.nav_links][:20], "structured_data_types": p.jsonld_types,
    }


def _compact_tech(t: dict) -> dict:
    keep = ("https", "http_to_https", "certificate_days_left", "security_headers", "viewport_meta", "robots_txt", "ai_bots",
            "sitemap_xml", "llms_txt", "jsonld_types", "ttfb_and_download_ms", "html_bytes", "image_bytes_sampled", "images",
            "compression", "server")
    return {k: t[k] for k in keep if k in t}


class Pipeline:
    def __init__(self, settings: Settings, store: Store, client: httpx.AsyncClient, mailer: Mailer):
        self.s, self.store, self.client, self.mailer = settings, store, client, mailer

    # ------------------------------------------------------------ fetching

    async def get_page(self, url: str) -> Page:
        key = f"page:{url}"
        cached = self.store.cache_get(key, self.s.reuse_days * 86400)
        if cached is not None:
            return Page.model_validate(cached)
        page = extract_page(await fetch(self.client, url))
        self.store.cache_put(key, page.model_dump())
        return page

    async def _safe_page(self, url: str) -> Page | None:
        try:
            p = await self.get_page(url)
            return p if p.status < 400 and p.text else None
        except (FetchError, Exception) as e:  # one bad inner page never sinks the job
            log.info("skip %s: %s", url, e)
            return None

    async def crawl(self, url: str, max_pages: int, *, light: bool = False) -> dict:
        """Home page, the most informative internal pages, and the measured technical facts."""
        home = await self.get_page(url)
        if home.status in (401, 403):
            raise FetchError("That site refused our request (it may block automated readers).")
        if home.status >= 400:
            raise FetchError(f"That address returned an error (HTTP {home.status}).")
        if not home.text:
            raise FetchError("That address didn't return a readable web page.")
        extra = choose_pages(home, max(0, max_pages - 1))
        others = await asyncio.gather(*(self._safe_page(u) for u in extra))
        pages = [home] + [p for p in others if p]
        tech = await technical_checks(self.client, home, light=light)
        return {"url": home.final_url, "domain": domain_of(home.final_url), "pages": pages, "tech": tech}

    async def crawl_with_fallback(self, url: str, max_pages: int, *, light: bool = False) -> dict:
        """https first; if the host does not answer on https and the visitor typed no scheme, try http."""
        try:
            return await self.crawl(url, max_pages, light=light)
        except FetchError as e:
            parts = urlsplit(url)
            if parts.scheme == "https" and ("couldn't connect" in str(e) or "took too long" in str(e)):
                return await self.crawl(url.replace("https://", "http://", 1), max_pages, light=light)
            raise

    # ------------------------------------------------------------ the hook

    async def run_hook(self, scan_id: str) -> None:
        scan = self.store.get(scan_id)
        if not scan:
            return
        self.store.update(scan_id, status=S.HOOK_RUNNING)
        llm = None
        try:
            llm = LLM(self.s)
            site = await self.crawl_with_fallback(scan["url"], 4, light=True)
            self.store.log(scan_id, f"read {len(site['pages'])} pages from {site['domain']}")
            pages = [_page_for_llm(p, 6000 if i == 0 else 3000) for i, p in enumerate(site["pages"])]
            facts = summarise_tech(site["tech"])
            read = await llm.hook(pages, facts)
            hook = read.model_dump()
            hook["pages_read"] = [p.final_url for p in site["pages"]]
            hook["measured_facts"] = facts
            hook["domain"] = site["domain"]
            self.store.update(scan_id, status=S.HOOK_DONE, hook_json=json.dumps(hook), error=None,
                              usage_json=json.dumps({"usage": llm.usage, "cost_usd": llm.cost_usd()}))
            self.store.log(scan_id, f"hook done, ${llm.cost_usd()}")
        except FetchError as e:
            self.store.update(scan_id, status=S.HOOK_FAILED, error=str(e))
            self.store.log(scan_id, f"fetch failed: {e}")
        except LLMError as e:
            self.store.update(scan_id, status=S.HOOK_FAILED, error="We couldn't finish reading the site just now. Please try again in a minute.")
            self.store.log(scan_id, f"model failed: {e}")
        except Exception:
            self.store.update(scan_id, status=S.HOOK_FAILED, error="Something went wrong on our side. Please try again in a minute.")
            self.store.log(scan_id, "crashed: " + traceback.format_exc()[-1500:])
            log.exception("hook %s crashed", scan_id)

    # ------------------------------------------------------------ the full audit

    async def _notes(self, llm: LLM, pages: list[Page], chars: int) -> list[dict]:
        sem = asyncio.Semaphore(4)

        async def one(p: Page) -> dict | None:
            async with sem:
                try:
                    n = await llm.notes(_page_for_llm(p, chars))
                    return {"url": p.final_url, "title": p.title, **n.model_dump()}
                except LLMError as e:
                    log.info("notes failed for %s: %s", p.final_url, e)
                    return None
        out = await asyncio.gather(*(one(p) for p in pages))
        return [n for n in out if n]

    def _candidates(self, target: str, results: dict[str, list[dict]], places: list[dict]) -> list[dict]:
        cands: dict[str, dict] = {}

        def consider(domain: str, name: str, snippet: str, query: str | None, position: int | None, extra: dict | None = None):
            if not domain or domain == target or domain.endswith("." + target) or target.endswith("." + domain):
                return
            if domain in NOT_COMPETITORS or any(domain.endswith("." + d) for d in NOT_COMPETITORS) or _NOT_COMPETITOR_RE.search(domain):
                return
            c = cands.setdefault(domain, {"domain": domain, "name": name[:80], "snippet": snippet[:200], "queries_hit": [],
                                          "best_position": None, "sources": []})
            if query and query not in c["queries_hit"]:
                c["queries_hit"].append(query)
            if position is not None and (c["best_position"] is None or position < c["best_position"]):
                c["best_position"] = position
            if extra:
                c.update(extra)
                c["sources"].append("places")
            elif "search" not in c["sources"]:
                c["sources"].append("search")

        for q, rs in results.items():
            for r in rs:
                consider(domain_of(r["url"]), r["title"], r["snippet"], q, r["position"])
        for p in places:
            if p.get("website"):
                consider(domain_of(p["website"]), p["name"], p.get("address", ""), None, None,
                         {"rating": p.get("rating"), "reviews": p.get("reviews"), "address": p.get("address", "")})
        ranked = sorted(cands.values(), key=lambda c: (-len(c["queries_hit"]), c["best_position"] or 99, c["domain"]))
        return ranked[:40]

    @staticmethod
    def _visibility(results: dict[str, list[dict]], domains: list[str]) -> dict:
        out = {}
        for q, rs in results.items():
            pos = {d: next((r["position"] for r in rs if domain_of(r["url"]) == d), None) for d in domains}
            out[q] = {"positions": pos, "top_three": [domain_of(r["url"]) for r in rs[:3]]}
        return out

    async def run_report(self, scan_id: str) -> None:
        scan = self.store.get(scan_id)
        if not scan or not scan.get("email"):
            return
        self.store.update(scan_id, status=S.REPORT_RUNNING)
        try:
            recent = self.store.recent_report(scan["domain"], self.s.reuse_days * 86400)
            if recent and recent["id"] != scan_id and recent.get("report_html"):
                token = secrets.token_urlsafe(24)
                self.store.update(scan_id, status=S.REPORT_DONE, report_json=recent["report_json"], report_html=recent["report_html"],
                                  report_token=token, usage_json=json.dumps({"reused_from": recent["id"]}))
                self.store.log(scan_id, f"reused report from {recent['id']}")
                await self._send_report(scan, token, json.loads(recent["report_json"]))
                return

            llm = LLM(self.s)
            site = await self.crawl_with_fallback(scan["url"], self.s.max_site_pages)
            domain = site["domain"]
            self.store.log(scan_id, f"site: {len(site['pages'])} pages")
            notes = await self._notes(llm, site["pages"], 9000)
            if not notes:
                raise LLMError("no page notes")
            home: Page = site["pages"][0]
            names = [home.title.split("|")[0].split("-")[0].strip()]
            for ld in home.jsonld:
                if isinstance(ld, dict) and isinstance(ld.get("name"), str):
                    names.append(ld["name"])
            postcode = next((m.group(0) for m in re.finditer(r"\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b", home.text)), "")
            ch = await companies_house(self.client, self.s, self.store, names, postcode)
            facts = summarise_tech(site["tech"])
            model = await llm.business_model({"site": domain, "pages": notes, "measured_facts": facts,
                                              "technical": _compact_tech(site["tech"]), "companies_house": ch})
            self.store.log(scan_id, f"model: {model.category} / {model.service_area_type} / {model.confidence}")

            queries = (model.local_queries[:6] + model.national_queries[:4])[:self.s.max_queries]
            found = await asyncio.gather(*(web_search(self.client, self.s, self.store, q) for q in queries))
            results = {q: r for q, r in zip(queries, found)}
            place_q = f"{model.category} in {model.places[0]}" if model.places else ""
            places = await places_search(self.client, self.s, self.store, place_q) if place_q else []
            candidates = self._candidates(domain, results, places)
            searched = any(results.values())
            self.store.log(scan_id, f"{len(queries)} queries, {sum(len(r) for r in results.values())} results, {len(places)} places, {len(candidates)} candidates")

            picks = []
            if candidates:
                chosen = await llm.pick({"business": {"name": model.name, "category": model.category, "description": model.description,
                                                      "customer_type": model.customer_type, "service_area": model.service_area_type,
                                                      "places": model.places, "offerings": model.offerings},
                                         "candidates": candidates})
                picks = [p for p in chosen.picks if p.fit >= 5 and p.domain and p.domain != domain][: self.s.max_competitors]

            comps: list[dict] = []
            for p in picks:
                try:
                    c = await self.crawl("https://" + p.domain.strip("/"), self.s.max_competitor_pages, light=True)
                except FetchError as e:
                    self.store.log(scan_id, f"competitor {p.domain} skipped: {e}")
                    continue
                c_notes = await self._notes(llm, c["pages"], 6000)
                if c_notes:
                    comps.append({"pick": p.model_dump(), "crawl": c, "notes": c_notes})
            self.store.log(scan_id, f"{len(comps)} competitors read")

            all_domains = [domain] + [c["crawl"]["domain"] for c in comps]
            ranks = await page_rank(self.client, self.s, self.store, all_domains)
            visibility = self._visibility(results, all_domains)
            criteria = [c.model_dump() for c in model.criteria]
            place_facts = {domain_of(p["website"]): {"rating": p.get("rating"), "reviews": p.get("reviews")} for p in places if p.get("website")}

            async def assess(label: str, c_notes: list[dict], tech: dict, d: str):
                return await llm.assess({"site": label, "criteria": criteria, "pages": c_notes, "measured_facts": summarise_tech(tech),
                                         "google_reviews": place_facts.get(d), "authority_rank_0_to_10": ranks.get(d)})

            assessments = await asyncio.gather(
                assess(domain, notes, site["tech"], domain),
                *(assess(c["crawl"]["domain"], c["notes"], c["crawl"]["tech"], c["crawl"]["domain"]) for c in comps))
            yours, theirs = assessments[0], assessments[1:]

            report = await llm.report({
                "business": model.model_dump(), "companies_house": ch,
                "your_site": {"domain": domain, "assessment": yours.model_dump(), "measured_facts": facts, "technical": _compact_tech(site["tech"]),
                              "google_reviews": place_facts.get(domain), "authority_rank_0_to_10": ranks.get(domain)},
                "competitors": [{"domain": c["crawl"]["domain"], "why_chosen": c["pick"], "assessment": a.model_dump(),
                                 "measured_facts": summarise_tech(c["crawl"]["tech"]), "google_reviews": place_facts.get(c["crawl"]["domain"]),
                                 "authority_rank_0_to_10": ranks.get(c["crawl"]["domain"])} for c, a in zip(comps, theirs)],
                "search": {"queries_run": queries, "provider_configured": searched, "provider": self.s.search_provider, "visibility": visibility},
                "notes_for_writer": ("Search positions are the provider's result order, not measured Google rankings. "
                                     if self.s.search_provider == "tavily" else "") + ("No search provider was available, so competitors could not be researched; say so plainly and judge the site alone."
                                     if not searched else "") + ("" if comps else " No competitor site could be read."),
            })
            html = render_report(report, {"domain": domain, "business_name": model.name, "pages_read": [p.final_url for p in site["pages"]],
                                          "competitors": [c["crawl"]["domain"] for c in comps], "queries": queries,
                                          "public_origin": self.s.public_origin})
            token = secrets.token_urlsafe(24)
            self.store.update(scan_id, status=S.REPORT_DONE, report_json=report.model_dump_json(), report_html=html, report_token=token,
                              error=None, usage_json=json.dumps({"usage": llm.usage, "cost_usd": llm.cost_usd()}))
            self.store.log(scan_id, f"report done, ${llm.cost_usd()}")
            await self._send_report(scan, token, report.model_dump())
        except (FetchError, LLMError) as e:
            self.store.update(scan_id, status=S.REPORT_FAILED, error=str(e))
            self.store.log(scan_id, f"report failed: {e}")
            await self._notify_failure(scan, str(e))
        except Exception:
            self.store.update(scan_id, status=S.REPORT_FAILED, error="internal error")
            self.store.log(scan_id, "crashed: " + traceback.format_exc()[-2000:])
            log.exception("report %s crashed", scan_id)
            await self._notify_failure(scan, "internal error")

    # ------------------------------------------------------------ mail

    async def send_confirmation(self, scan: dict) -> None:
        link = f"{self.s.public_origin}/api/confirm/{scan['confirm_token']}"
        first = (scan.get("name") or "").split(" ")[0]
        text = (f"{'Hello ' + first if first else 'Hello'},\n\n"
                f"Click to confirm and we'll start the full audit of {scan['domain']}, including who you're up against:\n\n{link}\n\n"
                "It takes a few minutes. The report arrives by email as a link.\n\n"
                "If you didn't ask for this, ignore it and nothing happens.\n\nUNimpossible\nhello@unimpossible.co.uk\n")
        await self.mailer.send(scan["email"], f"Confirm your website audit for {scan['domain']}", text)

    async def _send_report(self, scan: dict, token: str, report: dict) -> None:
        link = f"{self.s.public_origin}/api/report/{token}"
        first = (scan.get("name") or "").split(" ")[0]
        moves = "\n".join(f"  {i}. {m['title']}" for i, m in enumerate(report.get("three_moves", []), 1))
        text = (f"{'Hello ' + first if first else 'Hello'},\n\nYour audit of {scan['domain']} is ready:\n\n{link}\n\n"
                f"{report.get('summary', '')}\n\nThree moves worth making first:\n{moves}\n\n"
                "Every finding in the report points at the page it came from. If something is wrong, reply and tell us; "
                "the first thing we get right is what your business actually does.\n\n"
                "If you'd like to talk any of it through: reply to this email, or book a free 30-minute conversation at "
                f"{self.s.public_origin}/#talk.\n\nUNimpossible\nhello@unimpossible.co.uk\n")
        await self.mailer.send(scan["email"], f"Your website audit: {scan['domain']}", text, bcc=self.s.mail_bcc or None)

    async def _notify_failure(self, scan: dict, reason: str) -> None:
        if not self.s.mail_bcc:
            return
        await self.mailer.send(self.s.mail_bcc, f"Audit failed: {scan['domain']}",
                               f"Scan {scan['id']} for {scan['url']} requested by {scan.get('email')} failed: {reason}\n"
                               f"Log: {self.s.public_origin}/api/admin/scans/{scan['id']}\n")
