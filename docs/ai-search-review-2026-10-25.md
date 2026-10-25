# AI-search review — 25 October 2026

Scope: review unimpossible.co.uk and store advisory recommendations in the existing dashboard. No website publication, access change, new tracking, subscription or feature removal. Publishing approval stays required.

## Decision

Prioritise one verifiable project example, confirm genuine AI-crawler delivery, then establish a small repeatable answer sample. Do not churn the homepage description or pursue the previously identified Chambers/form conversion issue in this slice.

## Site evidence

| Check | Observation | Interpretation |
|---|---|---|
| Latest scheduled audit | 25 October, two pages, no failures | Small site inventory; audit does not cover all AI eligibility checks |
| Homepage HTTP/HTML | 200, readable server HTML, useful headings | No rendering barrier observed |
| Robots | `User-agent: *`, `Allow: /` | Search crawlers permitted by robots; training crawlers also permitted under existing policy |
| Snippet/index directives | No noindex/nosnippet in homepage HTML or response headers | No explicit snippet restriction found |
| Canonical | https://unimpossible.co.uk/ | Matches Google's selected canonical |
| Sitemap | One URL: homepage | Privacy deliberately omitted; not a missing commercial page defect |
| Google URL Inspection | Submitted and indexed; successful crawl 24 October 15:30 UTC | Actual indexing confirmed through existing read-only Core connector |
| Google AI inclusion | Include/default selected in Search Console; Save disabled | Eligible control already enabled; no change made |
| Structured data | ProfessionalService with company, location, contact and service topics | Present; no invented need for special AI schema. No rich-result validation performed |
| Expertise evidence | Four broad platform categories; no linked case example or attributed engineer | Concrete first-hand proof is the strongest content opportunity |
| Genuine AI requests | Not verified against origin/CDN logs | Unknown, not blocked; ordinary fetch/user-agent spoofing cannot prove it |
| Search/referral baseline | Empty imported rows through 22 October | Missing coverage, not evidence of zero traffic or zero citations |
| Privacy | Intentional noindex | Retain; do not apply generic audit “fix” |

## Documented requirements versus experiments

Google requires indexed, snippet-eligible pages and AI inclusion enabled. It recommends useful original experience and does not require special AI files. Both eligibility checks pass here. Source: [Google guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) and [AI inclusion control](https://support.google.com/webmasters/answer/16908024), checked 25 October.

OpenAI distinguishes OAI-SearchBot from GPTBot; Anthropic distinguishes Claude-SearchBot, Claude-User and ClaudeBot. PerplexityBot serves search discovery. Robots permission and network delivery need separate checks; use provider identity guidance before any narrowly scoped access proposal. Sources: [OpenAI](https://developers.openai.com/api/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers).

Original project evidence is supported practice, not an eligibility requirement or a promised ranking boost. Three fixed buyer questions are our lean measurement experiment, not a representative visibility index. Citation, recommendation, search impression, referral request and enquiry remain separate measures.

## Existing SaaS services

Provider descriptions were checked on 25 October; capability claims are not independent proof of effectiveness.

| Service | What it offers | Useful pattern for Unimpossible |
|---|---|---|
| [Peec AI](https://peec.ai/) | AI visibility, position, sentiment and competitor analytics; [Starter](https://peec.ai/pricing) lists 50 prompts, three models and daily tracking | Fixed question portfolio and source comparisons; price not exposed in retrieved page, so not quoted |
| [Otterly](https://otterly.ai/pricing) | Prompt, brand and citation monitoring plus GEO audits; monthly Lite shown as $29 for 15 prompts, extra engines sold separately | Small transparent starting sample; annual equivalent and marketplace plans differ |
| [Scrunch](https://scrunch.com/) | Monitoring, crawler/error insights and AXP agent-facing delivery | Diagnose real access failures. Do not copy a parallel AI-only site architecture without need |
| [Profound](https://www.tryprofound.com/) | Answer Engine Insights, Agent Analytics, prompt data and agents/content workflows | Combine observations with reviewed actions. No unverified price quoted |

Our useful distinction is the approval → WordPress change → verify → undo → dated measurement loop already built. Monitoring competitors confirm the category exists, not that every proposed tactic works. No account created or service purchased.

## GitHub and skills

- [Skills directory](https://skills.sh/) and [Corey Haines Marketing Skills](https://github.com/coreyhaines31/marketingskills): useful discovery and workflow sources. Read the actual [AI-SEO skill](https://github.com/coreyhaines31/marketingskills/blob/main/skills/ai-seo/SKILL.md), rather than using popularity as quality evidence. Reuse our pinned, adapted ai-seo/seo-audit skills; do not update automatically.
- Concrete upstream problem found: its statement that Google has no AI-specific Search Console reporting conflicts with current official guidance. Broad non-Google llms.txt benefits and fixed answer lengths also lack sufficient primary support for this site's recommendations. Our adaptation already rejects those assumptions.
- [GEO research repository](https://github.com/GEO-optim/GEO) and [paper](https://arxiv.org/abs/2311.09735): useful benchmark and evaluation ideas, not a production WordPress plugin or guaranteed public-web uplift. Do not convert its reported experiment gains into a client forecast. Read repository README; no code executed or installed.

## Recommendation records and review

The three dated cards contain observed evidence, proposed task briefs, sources, tradeoffs, confidence and measurement. They are not final website wording. A separate Core reviewer assesses the candidates using the existing version-2 `website_recommendations_review_v1` prompt; accepted review is never publishing approval.

Files alongside this note preserve candidates, independent conclusions and import proof. Reuse the existing recommendation projection and dashboard cards; no product code or new dependencies required. Future automatic review is still the existing homepage-description pilot, not a claimed full automatic AI audit.

Limits: real crawler logs, Bing indexing, external business profiles, rich-result validation and repeatable answers across AI engines remain unverified. This review does not claim every AI visibility factor is already covered or prove traffic uplift.

Verification completed: all three records returned through the existing restricted dashboard results API and rendered in the hosted dashboard. Five prior recommendations remain; publishing approval is still true. Core recorded three recommendation review events. No website writes. Evidence screenshot: `ai-search-dashboard-2026-10-25.png`. Cards retain the existing date/history order; their titles explicitly identify priority.
