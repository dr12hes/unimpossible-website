import json
from dataclasses import replace

import httpx
import pytest

from app.config import load_settings
from app.search import web_search
from app.store import Store


@pytest.mark.asyncio
async def test_tavily_results_are_normalised_and_cached(tmp_path):
    settings = replace(load_settings(), search_provider="tavily", tavily_api_key="test-key")
    store = Store(tmp_path / "scanner.sqlite")
    seen = []

    def provider(request):
        seen.append(request)
        assert request.headers["Authorization"] == "Bearer test-key"
        body = json.loads(request.content)
        assert body["search_depth"] == "basic" and body["include_answer"] is False
        return httpx.Response(200, json={"results": [{"title": "Acme", "url": "https://acme.example", "content": "Local business"}]})

    async with httpx.AsyncClient(transport=httpx.MockTransport(provider)) as client:
        results = await web_search(client, settings, store, "Norfolk consultants")
        assert results == [{"position": 1, "title": "Acme", "url": "https://acme.example", "snippet": "Local business"}]
        assert await web_search(client, settings, store, "Norfolk consultants") == results
    assert len(seen) == 1


@pytest.mark.asyncio
async def test_failed_search_is_not_cached(tmp_path):
    settings = replace(load_settings(), search_provider="tavily", tavily_api_key="test-key")
    store = Store(tmp_path / "scanner.sqlite")
    async with httpx.AsyncClient(transport=httpx.MockTransport(lambda r: httpx.Response(432))) as client:
        assert await web_search(client, settings, store, "test") == []
    assert store.cache_get("search:tavily:test", 60) is None
