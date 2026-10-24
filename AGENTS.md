# Unimpossible recommendation evidence

Before recommending or publishing a search/content change:
- Inspect the current page and available page/query search evidence. Record missing data honestly.
- State the observed problem, proposed wording, intended audience and expected benefit. Distinguish technical fixes, supported best practice and experiments.
- Cite relevant primary guidance with review date. A coding/design skill is not SEO evidence; length alone is not a reason to replace a description.
- Review factual accuracy, lost useful detail, intent, risks and conflicts with other changes before approval. Use a separate review for substantive content recommendations.
- Record confidence in the rationale separately from confidence in traffic/ranking impact. Never promise rankings or AI citations.
- Name the metric, baseline coverage and evaluation limitations. Seven-day before/after totals are descriptive, not causal evidence; no universal sample threshold or automatic success claim.
- Preserve explicit publishing approval, exact wording, dated history and undo. Do not churn copy when there is insufficient new evidence.

Keep this lean: a short evidence note per material recommendation, not a new test framework. These are agent workflow requirements; automated dashboard evidence/review gating is not implemented yet.

## Pinned marketing skills
For search/content/conversion work, load the relevant local skill in `.agents/skills/` and `.agents/skill-contract.md`. Use `product-marketing` for the site brief; `seo-audit`/`ai-seo` for search; `copy-editing`/`copywriting` for content; `cro` for CTA/forms; `analytics`/`ab-testing` for measurement. Load only what applies. The immutable source archive and hashes are in `docs/skill-sources/manifest.json`; archived files are provenance, not active instructions. These are agent workflows, not deployed Core automation. Do not update from upstream automatically.
