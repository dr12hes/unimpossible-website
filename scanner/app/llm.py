"""Every model call in one place: schemas, prompts, and a parse wrapper that tracks usage."""
from __future__ import annotations

import json
from collections import defaultdict
from typing import Literal

import anthropic
from pydantic import BaseModel, Field

from .config import Settings


class LLMError(Exception):
    pass


# ---------------------------------------------------------------- schemas (what the models must return)

class Observation(BaseModel):
    point: str = Field(description="One specific sentence about this site, as a plain-speaking expert would put it")
    evidence: str = Field(description="What on the site shows it: a short quote or the page it was seen on")
    why_it_matters: str = Field(description="Why a customer of this kind of business would care, one sentence")


class HookRead(BaseModel):
    readable: bool = Field(description="False when the pages do not say enough to tell what the business does")
    business_name: str
    one_line: str = Field(description="What this business does, for whom, and where, in one plain sentence a customer would use")
    what_they_do: str = Field(description="Two or three sentences on the offering, in their customers' words, not marketing words")
    who_for: str = Field(description="Who buys: consumers, businesses, which kinds, and the situation they are in")
    where: str = Field(description="Service area as the site states or implies it, or 'not stated'")
    confidence: Literal["high", "medium", "low"]
    unknowns: list[str] = Field(description="Things a customer would want to know that the pages do not say")
    yardstick: list[str] = Field(description="Three to five things a customer of this kind of business needs to see in the first minute, specific to this business type and how its customers buy")
    observations: list[Observation] = Field(description="Exactly three, most consequential first, each grounded in what was read")


class PageNotes(BaseModel):
    summary: str = Field(description="What this page is for and says, two sentences")
    offers: list[str] = Field(description="Products, services or packages named on the page")
    ctas: list[str] = Field(description="Calls to action as written, with where on the page they sit: e.g. 'Call 01953 ... (top)', 'Get a quote form (bottom)'")
    proof: list[str] = Field(description="Reviews, ratings, accreditations, years trading, case studies, client names, guarantees")
    prices: list[str] = Field(description="Any prices, price ranges or 'from' figures")
    contact: list[str] = Field(description="Phone numbers, emails, addresses, opening hours found")
    audience: list[str] = Field(description="Who the page addresses and the situations it names")
    places: list[str] = Field(description="Towns, counties or areas named")
    gaps: list[str] = Field(description="Things a customer would expect here that are missing")


class Criterion(BaseModel):
    criterion: str = Field(description="Short name, e.g. 'Phone number visible before scrolling'")
    why: str = Field(description="Why this matters for this business's customers, one sentence")
    weight: Literal["high", "medium", "low"]


class BusinessModel(BaseModel):
    name: str
    description: str = Field(description="What the business does, in plain words, three sentences")
    category: str = Field(description="The category a customer or directory would file it under, e.g. 'commercial electrical contractor'")
    offerings: list[str]
    customer_type: Literal["consumers", "businesses", "both"]
    sectors: list[str] = Field(description="Customer sectors or segments served")
    service_area_type: Literal["local", "regional", "national", "international", "unknown"]
    places: list[str] = Field(description="Towns, counties, regions served; the first is the home base")
    buying_trigger: str = Field(description="What makes a customer start looking")
    urgency: Literal["emergency", "soon", "planned", "considered"]
    research_depth: Literal["minimal", "compares a few", "researches thoroughly"]
    decision_criteria: list[str] = Field(description="What customers compare on, most important first")
    typical_value: str = Field(description="Rough value of a typical sale or job, with the basis for the guess")
    decision_maker: str
    positioning: str = Field(description="Premium or budget, specialist or generalist, and the evidence")
    proof_found: list[str]
    criteria: list[Criterion] = Field(description="Six to nine things the website must do for this business's customers, derived from the buying journey. These are the yardstick every site, including competitors', is judged by")
    local_queries: list[str] = Field(description="Four to six searches a customer in their area would type, service plus place")
    national_queries: list[str] = Field(description="Two to four searches without a place, for the category nationally")
    confidence: Literal["high", "medium", "low"]
    unknowns: list[str]


class Pick(BaseModel):
    domain: str
    name: str
    tier: Literal["regional", "national", "search"] = Field(description="regional: same area, same customers. national: a national player or the default alternative. search: holds the top results for the customer's searches")
    reason: str = Field(description="Why this is a real competitor for this business's customers, one sentence")
    fit: int = Field(description="0 to 10, how directly it competes for the same customers")


class CompetitorPick(BaseModel):
    picks: list[Pick] = Field(description="Up to five, best fit first, at least one regional and one national when the candidates allow")
    not_competitors: list[str] = Field(description="Domains from the candidates that are directories, suppliers, news or otherwise not rivals")


class Score(BaseModel):
    criterion: str
    score: int = Field(description="0 to 10: how well the site does this job for the customer")
    evidence: str = Field(description="What on the site shows it, quoted or referenced")
    gap: str = Field(description="What is missing or weak, or 'none'")


class Assessment(BaseModel):
    site: str
    scores: list[Score] = Field(description="One per criterion, in the given order")
    first_impression: str = Field(description="What a customer sees in the first screen, two sentences")
    enquiry_path: str = Field(description="How a customer gets in touch and how many steps it takes")
    proof: str = Field(description="What evidence of competence and trust the site offers")
    ai_answerable: list[str] = Field(description="Of: what they do, where, how to contact, prices, opening hours, who it is for; which an AI assistant could answer from these pages")
    ai_unanswerable: list[str]
    strengths: list[str]
    weaknesses: list[str]


class TableCell(BaseModel):
    site: str
    score: int
    note: str = Field(description="Five to ten words")


class TableRow(BaseModel):
    criterion: str
    cells: list[TableCell]


class CompetitorSection(BaseModel):
    name: str
    domain: str
    tier: str
    who_they_are: str = Field(description="Two sentences: what they do and how they position themselves")
    where_they_beat_you: list[str]
    where_you_beat_them: list[str]


class Move(BaseModel):
    title: str
    what_to_do: str = Field(description="Concrete, two or three sentences")
    why: str = Field(description="Which gap it closes and what it is worth, tied to the evidence")
    evidence: str
    effort: Literal["days", "weeks", "months"]


class Report(BaseModel):
    title: str
    summary: str = Field(description="Four sentences for the top of the report: what the business is, the single biggest gap, who is beating them, what to do first")
    what_we_think_you_do: str
    how_customers_buy: str
    yardstick_intro: str = Field(description="One paragraph introducing why these criteria and not generic ones")
    comparison: list[TableRow] = Field(description="One row per criterion; cells for the business first, then each competitor")
    conversion: str = Field(description="Does the site turn visitors into enquiries, with evidence. Paragraphs separated by blank lines")
    content_and_authority: str
    competitors: list[CompetitorSection]
    search_visibility: str = Field(description="Who shows up for the customer's searches, from the visibility data")
    ai_readiness: str = Field(description="What an AI assistant could and could not say about them, and the robots.txt and structured-data facts")
    technical_footnote: str = Field(description="Speed, mobile, security in a short paragraph, only what matters")
    three_moves: list[Move]
    caveats: list[str] = Field(description="What we could not check or were unsure about")
    how_we_did_this: str = Field(description="How we read the business, which searches we ran, why these competitors")


# ---------------------------------------------------------------- prompts

VOICE = ("You write in plain British English for a business owner, not a marketer. Short sentences. Specific over general. "
         "No hype, no jargon, no flattery. Every claim about a website must come from the pages supplied; if the pages do "
         "not say, say so. Never invent prices, reviews, awards or facts. Scores mean how well the site does the job this "
         "kind of customer needs, nothing more.")

HOOK_SYSTEM = VOICE + """

You are an experienced consultant reading a business's website for the first time, the way a prospective customer and
an AI assistant would. You are given the text of a few pages plus some measured facts. Work out what the business is,
who it sells to, where, and how those customers buy. From that, state the yardstick: the few things a site for this
kind of business must do in the first minute (an emergency plumber's site has one job; a wedding photographer's has
another; a precision engineering firm's another). Then give exactly three observations against that yardstick, most
consequential first, each with the evidence from the pages. If the pages do not say enough to tell what the business
does, set readable to false and say what is missing; that is a complete and honest answer."""

NOTES_SYSTEM = VOICE + """

Reduce one web page to structured notes. Record only what is on the page. Keep calls to action and contact details
verbatim. Note where on the page a call to action sits (top, middle, bottom) from its position in the text."""

MODEL_SYSTEM = VOICE + """

You are building a model of a business from notes on its web pages, measured facts, and (when present) its Companies
House record. Decide what it sells, to whom, where, and how its customers buy: what triggers a purchase, how urgent
it is, how much they research, what they compare on, roughly what a sale is worth, and who decides. Then derive the
criteria: six to nine things the website must do for these particular customers, weighted. These criteria are the
yardstick the site and its competitors will be judged by, so make them specific to this buying journey, not a generic
checklist. Finally write the searches a customer would type: local ones with a place, national ones without.
Be explicit about confidence and unknowns."""

PICK_SYSTEM = VOICE + """

You are choosing a business's real competitors from search and directory results. You know the business model. Keep
only sites that compete for the same customers: same kind of work, same customer type, and for regional picks the
same area. Reject directories, aggregators, marketplaces, review sites, news, suppliers, trade bodies, job boards and
social networks. Prefer a mix: regional rivals, the national or default alternative a customer might choose instead,
and whoever holds the top search results. Give a one-sentence reason each."""

ASSESS_SYSTEM = VOICE + """

Judge one website against the supplied criteria, using only the page notes and measured facts given. Score each
criterion 0 to 10 for how well the site does that job for this kind of customer, and quote the evidence. Say what an
AI assistant could and could not answer about the business from these pages."""

REPORT_SYSTEM = VOICE + """

Write the audit report for the business owner. You have the business model, the criteria, an assessment of their
site and of each competitor against the same criteria, search visibility data, and technical facts. Open with what
you think they do and how their customers buy, so they can see you understood the business before you judge the
website. Then the comparison, the sections, and three moves that would win them more business, ordered by value,
each tied to evidence. Technical matters are a footnote unless they are the biggest problem. Be candid about caveats
and show your working in 'how we did this'. Paragraph breaks are blank lines."""

PRICES_USD_PER_MTOK = {  # input, output, cache read
    "claude-haiku-5-5": (0.10, 0.50, 0.01),
    "claude-sonnet-5-5": (2.00, 10.00, 0.20),
    "claude-opus-5-5": (4.00, 20.00, 0.20),
}


class LLM:
    def __init__(self, settings: Settings):
        if not settings.anthropic_api_key:
            raise LLMError("ANTHROPIC_API_KEY is not set")
        self.s = settings
        self.client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key, max_retries=3)
        self.usage: dict[str, dict[str, int]] = defaultdict(lambda: {"calls": 0, "input": 0, "output": 0, "cache_read": 0, "cache_write": 0})

    def cost_usd(self) -> float:
        total = 0.0
        for model, u in self.usage.items():
            p = next((v for k, v in PRICES_USD_PER_MTOK.items() if model.startswith(k)), (4.0, 20.0, 0.4))
            total += (u["input"] * p[0] + u["output"] * p[1] + u["cache_read"] * p[2] + u["cache_write"] * p[0] * 1.25) / 1e6
        return round(total, 4)

    async def parse(self, *, model: str, system: str, user: str, schema: type[BaseModel], effort: str,
                    max_tokens: int, cache_system: bool = False) -> BaseModel:
        sys_block: dict = {"type": "text", "text": system}
        if cache_system:
            sys_block["cache_control"] = {"type": "ephemeral"}
        kwargs = dict(model=model, max_tokens=max_tokens, system=[sys_block],
                      messages=[{"role": "user", "content": user}], output_format=schema,
                      output_config={"effort": effort})
        # Server-side fallback on a safety decline (Sonnet/Opus 5.x, Claude API only). Dropped if the API rejects it.
        extra = {}
        if model.startswith(("claude-sonnet-5-5", "claude-opus-5")):
            extra = dict(extra_headers={"anthropic-beta": "server-side-fallback-2026-07-01"},
                         extra_body={"fallbacks": "default"})
        try:
            resp = await self.client.messages.parse(**kwargs, **extra)
        except anthropic.BadRequestError as e:
            if extra and "fallback" in str(e).lower():
                resp = await self.client.messages.parse(**kwargs)
            else:
                raise LLMError(f"bad request to {model}: {e.message}") from e
        except anthropic.APIStatusError as e:
            raise LLMError(f"{model} returned {e.status_code}") from e
        except anthropic.APIConnectionError as e:
            raise LLMError("could not reach the model API") from e
        u = self.usage[resp.model]
        u["calls"] += 1
        u["input"] += resp.usage.input_tokens or 0
        u["output"] += resp.usage.output_tokens or 0
        u["cache_read"] += getattr(resp.usage, "cache_read_input_tokens", 0) or 0
        u["cache_write"] += getattr(resp.usage, "cache_creation_input_tokens", 0) or 0
        if resp.stop_reason == "refusal":
            raise LLMError("the model declined this request")
        if resp.stop_reason == "max_tokens":
            raise LLMError("the model's answer was cut short")
        if resp.parsed_output is None:
            raise LLMError("the model returned nothing usable")
        return resp.parsed_output

    # ---- the calls

    async def hook(self, pages: list[dict], facts: list[str]) -> HookRead:
        user = json.dumps({"pages": pages, "measured_facts": facts}, ensure_ascii=False)
        return await self.parse(model=self.s.hook_model, system=HOOK_SYSTEM, user=user, schema=HookRead,
                                effort="medium", max_tokens=6000)

    async def notes(self, page: dict) -> PageNotes:
        return await self.parse(model=self.s.notes_model, system=NOTES_SYSTEM, user=json.dumps(page, ensure_ascii=False),
                                schema=PageNotes, effort="low", max_tokens=3000, cache_system=True)

    async def business_model(self, payload: dict) -> BusinessModel:
        return await self.parse(model=self.s.judge_model, system=MODEL_SYSTEM, user=json.dumps(payload, ensure_ascii=False),
                                schema=BusinessModel, effort="high", max_tokens=10000)

    async def pick(self, payload: dict) -> CompetitorPick:
        return await self.parse(model=self.s.judge_model, system=PICK_SYSTEM, user=json.dumps(payload, ensure_ascii=False),
                                schema=CompetitorPick, effort="medium", max_tokens=6000)

    async def assess(self, payload: dict) -> Assessment:
        return await self.parse(model=self.s.judge_model, system=ASSESS_SYSTEM, user=json.dumps(payload, ensure_ascii=False),
                                schema=Assessment, effort="medium", max_tokens=8000, cache_system=True)

    async def report(self, payload: dict) -> Report:
        return await self.parse(model=self.s.writer_model, system=REPORT_SYSTEM, user=json.dumps(payload, ensure_ascii=False),
                                schema=Report, effort="high", max_tokens=20000)
