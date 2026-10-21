"""Web search through a provider API (Brave, Serper or Tavily). Results are cached for a week."""
from __future__ import annotations

import httpx

from .config import Settings
from .store import Store


async def web_search(client: httpx.AsyncClient, settings: Settings, store: Store, query: str, *, count: int = 10) -> list[dict]:
    """[{position, title, url, snippet}], or [] when no provider is configured or the call fails."""
    provider = settings.search_provider
    if provider not in ("brave", "serper", "tavily"):
        return []
    key = f"search:{provider}:{query.lower()}"
    cached = store.cache_get(key, 7 * 86400)
    if cached is not None:
        return cached
    results: list[dict] = []
    try:
        if provider == "brave":
            r = await client.get("https://api.search.brave.com/res/v1/web/search",
                                 params={"q": query, "count": count, "country": "GB", "search_lang": "en"},
                                 headers={"Accept": "application/json", "X-Subscription-Token": settings.brave_api_key},
                                 timeout=20.0)
            r.raise_for_status()
            for i, it in enumerate((r.json().get("web") or {}).get("results") or [], 1):
                results.append({"position": i, "title": it.get("title", ""), "url": it.get("url", ""),
                                "snippet": it.get("description", "")})
        elif provider == "serper":
            r = await client.post("https://google.serper.dev/search",
                                  json={"q": query, "gl": "gb", "hl": "en", "num": count},
                                  headers={"X-API-KEY": settings.serper_api_key, "Content-Type": "application/json"},
                                  timeout=20.0)
            r.raise_for_status()
            for i, it in enumerate(r.json().get("organic") or [], 1):
                results.append({"position": i, "title": it.get("title", ""), "url": it.get("link", ""),
                                "snippet": it.get("snippet", "")})
        else:
            r = await client.post("https://api.tavily.com/search",
                                  json={"query": query, "search_depth": "basic", "max_results": min(count, 20),
                                        "include_answer": False, "include_raw_content": False, "country": "united kingdom"},
                                  headers={"Authorization": "Bearer " + settings.tavily_api_key}, timeout=20.0)
            r.raise_for_status()
            for i, it in enumerate(r.json().get("results") or [], 1):
                results.append({"position": i, "title": it.get("title", ""), "url": it.get("url", ""),
                                "snippet": it.get("content", "")})
    except (httpx.HTTPError, ValueError):
        return []
    store.cache_put(key, results)
    return results
