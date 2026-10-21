"""Third-party facts: Companies House, Google Places, Open PageRank. All optional; any failure returns None."""
from __future__ import annotations

import re

import httpx

from .config import Settings
from .store import Store

_SUFFIX = re.compile(r"\b(ltd|limited|llp|plc|cic|t/a|trading as)\b\.?", re.IGNORECASE)


def clean_company_name(name: str) -> str:
    name = re.sub(r"\s*[|\-–—:]\s*.*$", "", name or "")  # drop taglines after a separator
    return _SUFFIX.sub("", name).strip(" .,")


async def companies_house(client: httpx.AsyncClient, settings: Settings, store: Store, names: list[str],
                          postcode_hint: str = "") -> dict | None:
    """Best match for the business among candidate names. Returns the profile with a note on how it was matched."""
    if not settings.companies_house_api_key:
        return None
    auth = (settings.companies_house_api_key, "")
    base = "https://api.company-information.service.gov.uk"
    for name in [n for n in names if n][:3]:
        q = clean_company_name(name)
        if len(q) < 3:
            continue
        key = f"ch:{q.lower()}"
        cached = store.cache_get(key, 30 * 86400)
        if cached is not None:
            return cached or None
        try:
            r = await client.get(f"{base}/search/companies", params={"q": q, "items_per_page": 5}, auth=auth, timeout=15.0)
            r.raise_for_status()
            items = r.json().get("items") or []
        except (httpx.HTTPError, ValueError):
            continue
        chosen = None
        for it in items:
            title = clean_company_name(it.get("title", "")).lower()
            if title == q.lower() or (postcode_hint and postcode_hint.lower()[:4] in (it.get("address_snippet") or "").lower()):
                chosen = it
                break
        if chosen is None and items and clean_company_name(items[0].get("title", "")).lower().startswith(q.lower()[:12]):
            chosen = items[0]
        if not chosen:
            store.cache_put(key, {})
            continue
        try:
            p = await client.get(f"{base}/company/{chosen['company_number']}", auth=auth, timeout=15.0)
            p.raise_for_status()
            c = p.json()
        except (httpx.HTTPError, ValueError, KeyError):
            continue
        out = {
            "matched_on": q, "company_name": c.get("company_name"), "company_number": c.get("company_number"),
            "status": c.get("company_status"), "incorporated": c.get("date_of_creation"), "type": c.get("type"),
            "sic_codes": c.get("sic_codes") or [], "registered_office": c.get("registered_office_address") or {},
            "last_accounts_to": ((c.get("accounts") or {}).get("last_accounts") or {}).get("made_up_to"),
            "accounts_type": ((c.get("accounts") or {}).get("last_accounts") or {}).get("type"),
        }
        store.cache_put(key, out)
        return out
    return None


async def places_search(client: httpx.AsyncClient, settings: Settings, store: Store, text_query: str) -> list[dict]:
    """Google Places (New) text search: name, website, rating, review count, address."""
    if not settings.google_places_api_key:
        return []
    key = f"places:{text_query.lower()}"
    cached = store.cache_get(key, 7 * 86400)
    if cached is not None:
        return cached
    try:
        r = await client.post("https://places.googleapis.com/v1/places:searchText",
                              json={"textQuery": text_query, "maxResultCount": 10, "regionCode": "GB", "languageCode": "en"},
                              headers={"X-Goog-Api-Key": settings.google_places_api_key, "Content-Type": "application/json",
                                       "X-Goog-FieldMask": "places.displayName,places.websiteUri,places.rating,places.userRatingCount,places.formattedAddress"},
                              timeout=20.0)
        r.raise_for_status()
        out = [{"name": (p.get("displayName") or {}).get("text", ""), "website": p.get("websiteUri", ""),
                "rating": p.get("rating"), "reviews": p.get("userRatingCount"), "address": p.get("formattedAddress", "")}
               for p in r.json().get("places") or []]
    except (httpx.HTTPError, ValueError):
        return []
    store.cache_put(key, out)
    return out


async def page_rank(client: httpx.AsyncClient, settings: Settings, store: Store, domains: list[str]) -> dict[str, float | None]:
    """Open PageRank score 0-10 per domain (a free authority proxy)."""
    if not settings.openpagerank_api_key or not domains:
        return {}
    out: dict[str, float | None] = {}
    todo = []
    for d in domains:
        c = store.cache_get(f"opr:{d}", 30 * 86400)
        if c is not None:
            out[d] = c.get("rank")
        else:
            todo.append(d)
    if todo:
        try:
            r = await client.get("https://openpagerank.com/api/v1.0/getPageRank",
                                 params=[("domains[]", d) for d in todo[:100]],
                                 headers={"API-OPR": settings.openpagerank_api_key}, timeout=20.0)
            r.raise_for_status()
            for item in r.json().get("response") or []:
                d = item.get("domain")
                rank = item.get("page_rank_decimal")
                if d:
                    out[d] = rank
                    store.cache_put(f"opr:{d}", {"rank": rank})
        except (httpx.HTTPError, ValueError):
            pass
    return out
