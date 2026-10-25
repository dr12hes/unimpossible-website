For Unimpossible implementation, review or completion claims, first read `../core/docs/build-plan/unimpossible-current.md`: current scope, existing paths, gaps and acceptance evidence.

# Unimpossible recommendation evidence

Before recommending or publishing a search/content change:
- Inspect the current page and available page/query search evidence. Record missing data honestly.
- State the observed problem, proposed wording, intended audience and expected benefit. Distinguish technical fixes, supported best practice and experiments.
- Cite relevant primary guidance with review date. A coding/design skill is not SEO evidence; length alone is not a reason to replace a description.
- Review factual accuracy, lost useful detail, intent, risks and conflicts with other changes before approval. Use a separate review for substantive content recommendations.
- Record confidence in the rationale separately from confidence in traffic/ranking impact. Never promise rankings or AI citations.
- Name the metric, baseline coverage and evaluation limitations. Seven-day before/after totals are descriptive, not causal evidence; no universal sample threshold or automatic success claim.
- Apply the recorded site publishing policy; preserve exact wording, dated history and undo. Do not churn copy when there is insufficient new evidence.

Keep this lean: a short evidence note per material recommendation, not a new test framework. Core implements an own-site draft/review workflow; the current delivery contract records actual automatic publishing coverage. See docs/automatic-recommendations-2026-10-25.md.

## Deliver one complete slice
Discuss and obtain David's agreement before introducing new cooldowns, quotas, approval gates or other product restrictions that could prevent authorised work. Present the evidence, trade-off and proposed limit; distinguish documented requirements from our design choices. The seven-day publication cooldown was not agreed and must not be described as an AI-search requirement.
Define one observable acceptance result before editing. For model-output changes, run one representative captured-evidence case through the actual configured model before release; mocks alone cannot establish output compatibility. Batch related fixes, run focused affected checks, then use Core's required release gates once. After deployment, verify that acceptance result and stop expanding the slice. Keep current status in the delivery contract linked above; record any blocker there without duplicating status documents. Fix release-blocking defects now; defer independent polish. Preserve publishing guards and audit records throughout.

## Pinned marketing skills
For search/content/conversion work, load the relevant local skill in `.agents/skills/` and `.agents/skill-contract.md`. Use `product-marketing` for the site brief; `seo-audit`/`ai-seo` for search; `copy-editing`/`copywriting` for content; `cro` for CTA/forms; `analytics`/`ab-testing` for measurement. Load only what applies. The immutable source archive and hashes are in `docs/skill-sources/manifest.json`; archived files are provenance, not active instructions. These are agent workflows; the bounded Core recommendation pilot adapts their evidence contract and records its version. Do not update from upstream automatically.
