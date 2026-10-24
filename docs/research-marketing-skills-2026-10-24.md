# Published marketing skills: source review and recommended selection

Researched 24 October 2026. Research only: no skills installed, downloaded scripts executed, or website changes made. This report covers content, conversion, lead capture and measurement; AI-search evidence is covered separately.

## Recommendation

Use a small adapted selection from **Corey Haines's Marketing Skills**, with a shared customer/offer brief and an evidence requirement around every recommendation. The selection below is based on the actual `SKILL.md` sources, not marketplace descriptions. The library is useful published working practice; its existence, popularity and detailed prompts do **not** prove that applying it increases revenue or search visibility.

The current source names matter: v2 combines old `page-cro` and `form-cro` into `cro`, and renames `ab-test-setup`, `analytics-tracking` and `product-marketing-context`. Historical directories returned 404 in this review. Use current sources and pin a reviewed commit before adoption. [Repository and migration map](https://github.com/coreyhaines31/marketingskills)

## Minimum coherent set

Versions are those stated in the fetched source, not promises about later upstream versions.

| Module | Actual skill and version | What to reuse in Unimpossible | Required adaptation |
|---|---|---|---|
| Shared brief | [`product-marketing` 2.2.0](https://github.com/coreyhaines31/marketingskills/blob/main/skills/product-marketing/SKILL.md) | One reviewed source for audience, positioning, differentiators and customer language, with a version and change history. | Store separately for each customer/site. Auto-drafted facts must remain unconfirmed until supported or customer-approved. Preserve material offers such as Chambers membership benefits. |
| Existing content review | [`copy-editing` 2.2.0](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copy-editing/SKILL.md) | Diagnose a point edit versus a full review; improve clarity while preserving the author's argument and voice. Give a reason for each edit. | Do not run seven full editing passes for a description change. Add source checks, omissions/tradeoffs and the exact before/after diff. |
| New copy and CTA drafting | [`copywriting` 2.3.1](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copywriting/SKILL.md) | Identify audience, offer and primary action first. Its explicit claims gate refuses unsupported claims and identifies the evidence needed to support them. | Treat “better” as a hypothesis until measured. No invented customer results, guarantees or urgency. Preserve approved positioning rather than impose a template. |
| Page and lead-form review | [`cro` 2.0.3](https://github.com/coreyhaines31/marketingskills/blob/main/skills/cro/SKILL.md) and [form reference](https://github.com/coreyhaines31/marketingskills/blob/main/skills/cro/references/form.md) | Start with page purpose, conversion goal and traffic source; assess message, CTA, proof and friction. For forms, ask which fields are actually needed for follow-up. | Separate usability defects from unproven conversion hypotheses. Measure qualified leads, not just form completions. Remove unsupported universal numerical penalties. |
| Measurement and claim review | [`analytics` 2.2.1](https://github.com/coreyhaines31/marketingskills/blob/main/skills/analytics/SKILL.md) and [`ab-testing` 2.0.2](https://github.com/coreyhaines31/marketingskills/blob/main/skills/ab-testing/SKILL.md) | Define the decision and primary metric first; verify data quality, matching reporting windows, hypothesis, sample requirements and guardrails. | Reuse existing Core imports. Low traffic must return “insufficient evidence”, not manufacture an A/B winner. Treat search before/after comparisons as observational. |

This is six skills, loaded for the task they serve, rather than loading a whole marketing library on every audit. Shared brief → appropriate review/draft → evidence and measurement → existing customer approval → publish/verify/undo is our proposed application, not an upstream claim of proven results.

## Add only when the corresponding module exists

| Later module | Inspected source | Useful mechanism and limits |
|---|---|---|
| Customer evidence | [`customer-research` 2.0.4](https://github.com/coreyhaines31/marketingskills/blob/main/skills/customer-research/SKILL.md) | Analyse existing interviews, reviews and support material; distinguish this from public-source mining and new interviews. The source explicitly treats fetched posts as untrusted data. Add provenance to each excerpt and label inferred personas. Do not treat a few online comments as representative demand. |
| Sector content programme | [`content-strategy` 2.1.4](https://github.com/coreyhaines31/marketingskills/blob/main/skills/content-strategy/SKILL.md) | Start from business goals, buyer questions, existing content and available resources. Use this to justify a topic before generating an article. Do not adopt its prioritisation formulas or search-first preference as universal laws. News rewriting alone is not original expertise. |
| Lead offers | [`lead-magnets` 2.1.0](https://github.com/coreyhaines31/marketingskills/blob/main/skills/lead-magnets/SKILL.md) | Match a specific problem and buyer stage to a useful resource with a natural product connection. Measure resulting lead quality. Its consumption-time guidance is a heuristic, not an established performance threshold. |

Defer paid advertising, outbound email, popup campaigns and programmatic content production. These create additional channels and permissions without solving today's requirement for better supported website changes. That deferral is our scope judgement.

## Comparative source assessment

**Corey Haines / marketingskills:** the repository rendered approximately 56.3k stars and 8.3k forks during this review and publishes an MIT licence. Those are adoption signals only. Source files have explicit versions, related references and a documented migration map. The commit-history page available through search was a September snapshot, so this review does not claim an exact latest commit date. The repository also discloses commercial tool partners; tool recommendations should be assessed independently rather than automatically adopted. [Repository](https://github.com/coreyhaines31/marketingskills), [history snapshot](https://github.com/coreyhaines31/marketingskills/commits/main/), [MIT licence](https://github.com/coreyhaines31/marketingskills/blob/main/LICENSE)

**Profound / skills-marketing-library:** inspected [`improved-copywriting`](https://github.com/retieedra-profound/skills-marketing-library/blob/main/profound/improved-copywriting/SKILL.md). Its strongest reusable ideas are diagnosing the requested editing scope, preserving the marketer's intent, and checking specificity and supportability. Current Corey copywriting already credits adapting this source, so installing both adds overlap. Its rigid style bans, “exactly one action” and mandatory 12–18 writing units should not override customer needs or small changes. The repository describes itself as the source for skills.marketing by Profound and partners; it showed one star and an MIT licence. This is a published source, not evidence of broad adoption or measured uplift. [Repository](https://github.com/retieedra-profound/skills-marketing-library)

**Anthropic / skills:** inspected [`skill-creator`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md). It is useful for packaging and evaluating our adapted workflows, not an SEO or conversion authority. The repository explicitly describes its examples as demonstrations; many are Apache-2.0, while document skills have different source-available terms. Check the individual licence before reuse rather than assuming the entire library is freely reusable. [Repository README](https://github.com/anthropics/skills/blob/main/README.md)

## Numeric rules and case examples that must not become product promises

1. **Form-field penalties:** the form reference states that 4–6 fields reduce completion by 10–25% and 7+ by 25–50%+. The inspected section supplies no study, audience, baseline or methodology. Remove those numbers from our rules. Keep the operational question of whether a field is needed. [Source](https://github.com/coreyhaines31/marketingskills/blob/main/skills/cro/references/form.md)
2. **Universal clarity uplift:** copywriting gives +81% conversions, 38% shorter sales cycles, 28% lower acquisition cost and 175% more referrals. Do not repeat these as expected results without establishing the original research and applicability. They are not established for Unimpossible. [Source](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copywriting/SKILL.md)
3. **SavvyCal “3×”:** the copy-framework reference attributes roughly tripled conversions to a changed hero line. It is a worked example in a skill, not a disclosed controlled test with sample size and observation window. This review did not establish the numerical claim from a primary experiment record. [Reference](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copywriting/references/copy-frameworks.md)
4. **Sample-size table:** the A/B skill's table is a starting estimate. Calculate a plan from actual baseline, minimum meaningful effect, allocation and analysis assumptions before using it. The current source usefully distinguishes statistical significance from business value and fixed-horizon tests from sequential methods. [Source](https://github.com/coreyhaines31/marketingskills/blob/main/skills/ab-testing/SKILL.md)

## What the published examples actually demonstrate

The author's own public site says he uses Claude Code for marketing skills. That is first-person workflow usage evidence, not a controlled outcome evaluation. [Corey Haines](https://www.corey.co/)

In a published interview, Haines describes working on SavvyCal's positioning because customers struggled to understand its difference from Calendly, followed by launch campaigns. This supports borrowing the sequence of customer-language research → clear differentiation → landing page → distribution. It does not isolate a headline's effect or validate today's skill implementation. [First-person interview transcript](https://humansofmartech.com/2022/04/12/52-corey-haines-writing-the-book-on-startup-marketing/)

The source files themselves contain usable templates and worked prompts. These demonstrate how to operate the workflow. They should be labelled **published practice**. A separate controlled experiment or properly documented customer case is needed for an **observed outcome**; our own sufficient measurement is needed for an **Unimpossible result**.

## Proposed adoption requirements

These are recommendations for the next implementation, not changes already enforced:

- Pin the reviewed upstream commit and record skill name/version, source and licence in our manifest. Retain MIT attribution when copying or modifying substantial material. We have inspected sources, not installed a pinned snapshot yet.
- Maintain a small local adaptation rather than silently editing upstream files. Record removed numeric claims and added evidence requirements.
- Each suggestion carries observed issue, source evidence, applicability to this customer, hypothesis, confidence, possible downside, exact diff, review decision and measurement plan.
- Distinguish source categories: official platform requirement, measured external case, published practitioner heuristic, and our own experiment. A skill's instruction is not itself proof.
- For the initial site, review a few representative outputs: a description, a CTA and a form recommendation. Check factual support, preservation of offers, useful rationale and no publication without approval. This is focused output review, not a large new software test suite.
- Keep existing publishing approval, dated audit trail and undo. No agent skill is authority to publish, contact leads, acquire external services or broaden account access.

No inspected skill establishes that our recently published homepage description is a performance improvement. Leave it stable while collecting data; use the new framework before proposing another change.
