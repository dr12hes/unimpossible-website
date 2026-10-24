# Published AI-search and technical SEO skills: source review

Reviewed 24 October 2026. Research only: nothing installed, no downloaded code executed, no website changed. Recommendation: adopt a small, pinned, locally adapted selection; do not treat any library as proven to increase revenue or AI visibility.

## Recommended sources and exact skills

| Source | Decision | What to borrow | Required changes before use |
|---|---|---|---|
| [Corey Haines: seo-audit](https://github.com/coreyhaines31/marketingskills/blob/main/skills/seo-audit/SKILL.md), version 2.2.2 | Adapt as main audit workflow | Business context, crawl/index checks before copy edits, evidence-led prioritisation, explicit treatment of fetched pages as untrusted | Replace blanket schema-detection claims with “inspect raw HTML and rendered DOM as appropriate”; do not enforce three-click depth or positions 8–20 as universal rules |
| [Corey Haines: ai-seo](https://github.com/coreyhaines31/marketingskills/blob/main/skills/ai-seo/SKILL.md), version 2.10.1 in current version registry | Adapt, with evidence filter | Defined customer questions, separate platform monitoring, search/training crawler distinction, sourced factual content | Remove guaranteed percentage uplifts, fixed “optimal” answer lengths, universal freshness rules and unsupported platform adoption of llms.txt. Treat these as hypotheses, not automatic edits |
| [AgriciDaniel: seo-technical](https://github.com/AgriciDaniel/claude-seo/blob/main/skills/seo-technical/SKILL.md), version 2.5.0 | Borrow technical reviewer checklist | Intentional versus accidental noindex, crawler purpose distinctions, canonical and rendering checks | Use existing Core tools; importing its complete plugin adds scripts/runtime dependencies we do not need. Recheck vendor-specific facts against current official docs |
| [AgriciDaniel: seo-content](https://github.com/AgriciDaniel/claude-seo/blob/main/skills/seo-content/SKILL.md), version 2.5.0 | Borrow content reviewer questions | Who created this, how was it produced, why is it useful; original experience and sourcing | Remove page-type minimum word counts and mechanical links-per-word recommendations. Its own text warns that word count is not a ranking factor |
| [AgriciDaniel: seo-geo](https://github.com/AgriciDaniel/claude-seo/blob/main/skills/seo-geo/SKILL.md), version 2.5.0 | Reference only | Explicit priority for Google's primary guidance over community advice; warnings about unverified statistics | Do not show its weighted citability score as measured AI visibility. Correlations between mentions and citations are not evidence that buying or generating mentions causes uplift |
| [Zubair Trabzada: geo-audit](https://github.com/zubair-trabzada/geo-seo-claude/blob/main/skills/geo-audit/SKILL.md) | Reject unchanged; optional crawl checklist reference | Bounded discovery (50 pages), business-type recognition, page evidence inventory | Five-agent orchestration is unnecessary for our small pilot. Composite GEO score is a heuristic. Its statement tying high scores to 30–115% visibility misrepresents benchmark results as a validated site scoring model |

The current raw Haines skill fixes an important older error: training crawlers and discovery crawlers are separate. Search-indexed GitHub previews still show older text claiming that blocking GPTBot prevents citations. This is why we must pin reviewed source rather than trust marketplace summaries. [Current raw skill](https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/skills/ai-seo/SKILL.md), [older indexed preview](https://github.com/coreyhaines31/marketingskills/blob/main/skills/ai-seo/SKILL.md).

## Popularity, maintenance and reuse

[Skills.sh](https://skills.sh/coreyhaines31/marketingskills/ai-seo) displayed **149.8K installs** and **56.2K repository stars** for Haines ai-seo when checked. Those are directory-reported popularity, not successful customers, independent validation or effect size. Its security pass labels concern security checks, not SEO effectiveness. Other two skills.sh detail pages were inaccessible; their install counts are **unverified**, not zero. AgriciDaniel's [source repository](https://github.com/AgriciDaniel/claude-seo) displayed 19.9K stars. Do not use third-party directory “91/100” badges as quality evidence.

Haines maintains a [per-skill version registry](https://github.com/coreyhaines31/marketingskills/blob/main/VERSIONS.md): ai-seo 2.10.1 updated 19 October; seo-audit 2.2.2 updated 15 October. AgriciDaniel's inspected files identify 2.5.0. Exact upstream commit SHAs could not be verified through the available GitHub API requests. These are **selection candidates, not an installation lockfile**: before vendoring, resolve the SHA, store source path + SHA + file hash + reviewed date, preserve references and licence notices, then review future diffs rather than auto-update.

All three inspected licence files are MIT: commercial modification/distribution permitted subject to retaining copyright and permission notices in copies/substantial portions. This does not license the external papers, proprietary tools, customer examples, trademarks or third-party screenshots they reference. [Haines licence](https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/LICENSE), [AgriciDaniel licence](https://raw.githubusercontent.com/AgriciDaniel/claude-seo/main/LICENSE), [Trabzada licence](https://raw.githubusercontent.com/zubair-trabzada/geo-seo-claude/main/LICENSE).

## What is actually evidenced

**Provider-supported technical requirements:** Google's AI Overviews/AI Mode use ordinary SEO requirements; pages need indexing and snippet eligibility. No special AI schema or file is required. Therefore prioritize discoverability, useful visible content, correct canonical/indexing rules and genuine source material. [Google primary guidance](https://developers.google.com/search/docs/appearance/ai-features).

**Crawler configuration:** OpenAI explicitly separates OAI-SearchBot (search), GPTBot (potential training), and ChatGPT-User (user-triggered visits). Allowing search does not require allowing training, and crawler access is eligibility—not a promise of citations. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots).

**Empirical research, with limits:** Aggarwal et al.'s KDD 2024 GEO paper evaluates content interventions against generative-engine visibility measures, including a deployed Perplexity experiment. Its Perplexity check uploaded source files and restricted answers to those files; it did not test public-web discovery. It reports gains up to 40%, varying by domain. This is evidence for testing accurate citations/statistics and clearer content, not proof of a 40% traffic or revenue gain, not validation of an arbitrary 0–100 GEO score, and not a current production guarantee across all engines. It does not validate these skill libraries. [Versioned paper and methodology](https://arxiv.org/html/2311.09735v3).

**Skill-specific outcome evidence:** None of the inspected SKILL.md files establishes a controlled client outcome attributable to running that skill. The repositories document workflows and demonstrations; that is useful implementation material, but it does not meet the user's requested “proven outcomes” standard. Separate named case-study evidence is still needed per proposed intervention.

## Proposed Unimpossible adaptation contract

Every recommendation must attach: observed page evidence; customer/search intent; exact source and date; evidence class (provider requirement, controlled study, observational case, hypothesis); proposed diff; tradeoff; confidence; reviewer conclusion; measurement and undo plan. A reviewer must be allowed to say “leave unchanged.” No arbitrary target score should trigger publication.

For our small site, start with one technical audit and one content review using the selected excerpts. Keep approved publishing and dated verification/undo history. Measure organic clicks, impressions, qualified leads and separately observed AI referrals/citations. Do not imply referrals capture all AI exposure, or that a before/after movement proves causation. No new install, dependency or testing framework is needed to agree this standard.

## Current provider correction

The inspected ai-seo text says there is no AI-specific Search Console reporting. Current [Google guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) references a Generative AI performance report. Correct that statement before adoption; availability and API support for our own import are not established by this research.
