---
name: ai-seo
description: Review AI-search discoverability, factual content and observed citations for a connected website.
metadata:
  version: 1.1.0
---

# Unimpossible ai-seo

Read [the shared evidence and approval contract](../../skill-contract.md) before applying this workflow. Read the relevant site's approved brief; for our own site use [the Unimpossible brief](../../product-marketing.md).

Start with genuine customer questions and current page evidence. Separate crawl eligibility, citation, recommendation and referral traffic. Search crawlers and training crawlers have different purposes; verify current provider guidance and bot identity before recommending access changes.
Use current official sources: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide , https://developers.openai.com/api/docs/bots , https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler and https://docs.perplexity.ai/docs/resources/perplexity-crawlers . Google guidance does not establish other engines' ranking factors. Verify reporting availability/API support rather than asserting no AI-specific Search Console report exists.
Recommend relevant original expertise, supported facts and sources where a real content gap exists. No guaranteed uplift, fixed answer length, llms.txt ranking claim, weighted visibility score or manufactured mentions. Benchmark improvements are not client forecasts; GEO's uploaded-file Perplexity experiment does not prove public-web discovery. Record dated queries, platform and cited URLs when observing answers; do not equate a small prompt sample with market-wide visibility.

Adapted from Corey Haines Marketing Skills. Exact upstream revision, source hashes and adaptation hashes are in [the manifest](../../../docs/skill-sources/manifest.json). The upstream archive is provenance, not instructions to execute. This self-contained adaptation intentionally omits unrelated upstream references and scripts. [MIT notice](LICENSE).

## Repeatable evidence review

Use Core's `website_ai_review` runtime skill for scheduled reviews and its existing `web.research` capability for public search evidence. Record the workflow version, query, actual provider when reported, capture date, URL and source text. Search snippets are source claims, not independently verified page facts. Search result order is not AI recommendation rank.

For a saved AI answer, preserve its exact question, platform, date, answer and citations. Report which companies appeared and reasons explicitly stated. Put any explanation of an omission in a separate hypothesis field with contrary evidence and uncertainty. Never claim access to an engine's hidden reasoning. Reuse the same questions for comparison; report coverage changes. Automatic answer collection remains outside this slice.

Return at most three useful findings, each with captured evidence references, observed fact, possible explanation, uncertainty, proposed improvement and what to measure. Retain is a valid outcome. Run a separate critical review before accepting advice. Store rejected advice and review conclusions for audit without presenting it as accepted work.

The skill is suggest-only. Site policy determines whether a separately verified publishing workflow requires human approval or uses explicitly authorised automatic changes. Do not infer publishing permission from review acceptance. Every automated edit needs exact before/after, policy and advice references, verification and an undo receipt; unknown write outcomes must be reconciled before another write.
