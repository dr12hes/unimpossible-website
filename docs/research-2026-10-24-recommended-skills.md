# Recommended skills and evidence for Unimpossible

Decision research, 24 October 2026. No skills installed or product/site changes made.

## Recommendation

Adopt eight locally adapted skills from Corey Haines's published Marketing Skills library. Use AgriciDaniel's technical/content checklists as supporting review material rather than another overlapping agent system. Load only the skill relevant to the job. These are reusable published workflows, not scientifically validated optimisation products.

We inspected actual skill files, compared competing repositories, checked licences and reviewed eight primary-source case studies. We did not exhaustively inspect thousands of directory entries. Popularity helped discovery; it did not establish effectiveness. No inspected skill provided controlled evidence that running that skill caused better customer outcomes.

## Firm initial selection

| Purpose | Source / inspected version | Use |
|---|---|---|
| Customer and offer context | [product-marketing 2.2.0](https://github.com/coreyhaines31/marketingskills/blob/main/skills/product-marketing/SKILL.md) | Maintain verified audience, offer, differentiators and customer language per site. |
| Search foundations | [seo-audit 2.2.2](https://github.com/coreyhaines31/marketingskills/blob/main/skills/seo-audit/SKILL.md) | Check discovery, indexing, canonicals and page evidence before proposing copy changes. |
| AI-search review | [ai-seo 2.10.1](https://github.com/coreyhaines31/marketingskills/blob/main/skills/ai-seo/SKILL.md) | Review customer questions, factual support, crawler access and observed citations separately by platform. |
| Review existing content | [copy-editing 2.2.0](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copy-editing/SKILL.md) | Preserve voice and offers; justify specific edits and omissions. |
| Draft content and calls to action | [copywriting 2.3.1](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copywriting/SKILL.md) | Match audience, promise and action; reject unsupported claims. |
| Page and lead-form conversion | [cro 2.0.3](https://github.com/coreyhaines31/marketingskills/blob/main/skills/cro/SKILL.md) | Review clarity, proof, competing actions and form friction; include its form reference. |
| Reliable measurement | [analytics 2.2.1](https://github.com/coreyhaines31/marketingskills/blob/main/skills/analytics/SKILL.md) | Define events and qualified enquiries; verify data before interpreting changes. |
| Decide whether a change worked | [ab-testing 2.0.2](https://github.com/coreyhaines31/marketingskills/blob/main/skills/ab-testing/SKILL.md) | Set a hypothesis, primary outcome and potential harms; return insufficient evidence when traffic cannot support a conclusion. |

These are current names: old examples using page-cro, form-cro, analytics-tracking or ab-test-setup should not drive installation. All selected sources are covered by the repository's [MIT licence](https://github.com/coreyhaines31/marketingskills/blob/main/LICENSE); retain notices when adapting substantial material.

For later modules, add customer-research when analysing customer evidence, content-strategy before starting sector articles, and lead-magnets when creating lead offers. See the [marketing source review](research-marketing-skills-2026-10-24.md) for versions and links. Apple design remains a UI discipline and Ponytail an engineering scope discipline; neither establishes marketing effectiveness.

## Supporting sources and rejected alternatives

- Borrow [AgriciDaniel seo-technical](https://github.com/AgriciDaniel/claude-seo/blob/main/skills/seo-technical/SKILL.md) and [seo-content](https://github.com/AgriciDaniel/claude-seo/blob/main/skills/seo-content/SKILL.md) review questions, under its MIT licence. Remove arbitrary word-count/link-density requirements. Do not import its runtime to duplicate Core.
- Profound's improved-copywriting is useful, but current Haines copywriting already credits adapting it. Loading both is unnecessary.
- Do not adopt Trabzada geo-audit unchanged: its composite score and uplift interpretation do not establish measurable AI visibility; its orchestration adds unnecessary work for this pilot.
- Anthropic skill-creator can help package adaptations later. It is not SEO evidence; check individual licences before copying files from that mixed-licence repository.

Detailed comparisons and source licences: [AI-search research](research-ai-search-skills-2026-10-24.md), [marketing research](research-marketing-skills-2026-10-24.md).

## Required corrections before adoption

Remove unsupported numerical uplift promises, universal form-field penalties, fixed optimal paragraph lengths, minimum content lengths and invented AI visibility scores. Keep useful review questions without pretending their thresholds are proven.

Provider documentation overrides a skill's platform claims. Google's current guidance prioritises ordinary SEO and distinctive useful content; it rejects special AI files and prescribed chunking as ranking tactics. It also now references a Generative AI performance report, contradicting the inspected ai-seo statement that no AI-specific Search Console reporting exists. Availability and API support for our account/import still need checking; this research does not claim our dashboard imports that report. [Google guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Search access and model training are different settings. Consult current [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots), [Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) and [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers). Check official bot verification methods; do not weaken site security or allow every claimed user agent. Access establishes eligibility, not guaranteed citations. Do not infer one platform's ranking behaviour from another's documentation.

## Documented outcomes we can borrow from

The [eight-case evidence library](research-documented-cases-2026-10-24.md) records methods, disclosed samples, outcomes, limits and source links. Key decisions:

| Evidence | What it supports borrowing | What it does not prove |
|---|---|---|
| [Vodafone controlled performance test](https://web.dev/case-studies/vodafone): 31% lower Largest Contentful Paint (main-content loading time), 8% more sales | Fix a measured rendering bottleneck while holding content/offer stable; measure business outcomes. | An 8% forecast for our site or AI-search gains. |
| [GEO research](https://arxiv.org/html/2311.09735v3): evidence-rich content improved benchmark visibility, with gains up to 40% | Add relevant verified sources and factual substance; evaluate actual cited URLs. | Public-web discovery or lead growth. Its Perplexity check used uploaded source files, not live-site discovery. |
| [SearchPilot snippet restriction](https://www.searchpilot.com/resources/case-studies/seo-split-test-lessons-forcing-google-respect-meta-descriptions-data-nosnippet): traffic fell 3% | Preserve engine freedom to select useful snippets; investigate real query problems. | Authored descriptions are always better, or always harmful. |
| [SearchPilot description removal](https://www.searchpilot.com/resources/case-studies/seo-split-test-lessons-removing-meta-descriptions): inconclusive at 95% confidence | Accept an inconclusive result and avoid automatic description churn. | Every missing description is a measurable loss. |
| [MECLABS form experiment](https://marketingexperiments.com/conversion-marketing/optimizing-web-forms-2): both redesigned treatments improved leads, including a longer form | Explain fields and improve context; evaluate qualification, not field count alone. | Fewer fields always wins, or more collected information means higher-quality leads. |
| [MECLABS chat experiment](https://marketingexperiments.com/lead-generation/pop-up-chat-test): chat clicks rose while forms and calls fell | Measure total qualified enquiries across channels before judging the future chatbot. | Widget engagement equals extra business. |

These studies vary greatly in strength. The case library labels controlled commercial tests, vendor-reported tests, academic benchmarks and weaker practitioner reports separately. Most commercial articles omit raw data or some protocol details. None establishes a universal winning recipe for our site.

## How we should apply them

Each suggestion should contain observed page evidence, customer purpose, exact proposed change, dated sources, source strength, why the evidence fits this site, possible downside, reviewer conclusion and measurement plan. Separate confidence that a problem exists from confidence that fixing it improves results. A review may conclude “leave unchanged”.

Core should run the relevant adapted workflow; the Unimpossible dashboard should show its rationale and evidence beside the proposed change. Customer approval, publishing verification, dated history and undo remain required. This is a proposed implementation standard, not a claim those evidence fields already exist in the dashboard.

Measure qualified enquiries and downstream outcomes, with search traffic and observed AI referrals as supporting measures. Referrals omit unclicked citations and some unattributed visits. A before/after increase is an observation, not proof that our edit caused it. Keep the current homepage description stable while gathering evidence.

## Lean adoption boundary

Before installation, resolve and pin upstream commit SHAs and file hashes, retain licences, and review referenced files. This report records inspected versions, not a reproducible installation lockfile; exact SHAs remain unresolved. Do not auto-update prompts from main or execute bundled scripts without review.

Then inspect three representative dry runs: a search description, a CTA and a form recommendation. Require accurate sources, preservation of customer offers, an appropriate uncertainty label and no publication without approval. This is output review, not a large new test platform. Low-traffic sites must be allowed to report insufficient evidence rather than run underpowered experiments.

Reuse licensed instructions and defensible methods. Write our own customer-specific copy; published case studies do not automatically license their screenshots, testimonials or proprietary assets. No installation or live edit is authorised by this research document itself.

Case-study synthesis independently reviewed against the evidence library: no material outcome-claim mismatches found. Installation pins and applicability to our site remain unverified until adoption.
