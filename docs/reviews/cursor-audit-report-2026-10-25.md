Reading the audit brief and gathering the scope it defines.


Searching the codebase for limits, evidence checks, and delivery-process artifacts.


## Executive verdict

**What works (observed):** On the live own-site inventory (two WordPress pages), the chain **audit → per-page description/text review → durable records → optional auto-publish policy → description publish/undo with verification** is implemented and partially proven. Multi-page behaviour is real in code (queue, exclusions, privacy noindex preserved). Connector and Core agree on **320-char descriptions** and **one exact plain-text block edit** per recommendation.

**What blocks the requested outcome:** (1) **Only two eligible pages** exist; repeated runs mostly **retain** the homepage description, so the dashboard shows activity without a visible “improvement.” (2) **First live exact-text publish/undo is still unproven**; a **7-day per-page observation window** after a verified description publish can block further auto-writes on that page until **31 Oct 2026 ~18:50 UTC** (recorded in `reviewed-text-proof-2026-10-25.json`). (3) **AI readiness quality controls are weak for narrative summaries**: review `917b2307…` completed **accepted** with **`findings: []`** and a long factual summary citing evidence IDs in prose only (`/tmp/unimpossible-reviewed-live.json`) — prompts ask for summary checks, but **code does not validate the summary**.

**Were claims justified?** **Partially.** Whole-site *machinery* and two-page coverage are fair. Claims of a **complete customer outcome**, **beneficial automatic text loop**, and **traffic/AI impact** are **not** supported by recorded evidence. Stale docs (e.g. `docs/automatic-recommendations-2026-10-25.md` still describe homepage-only, no auto-publish) **lag** the delivery contract in `core/docs/build-plan/unimpossible-current.md`. Deployed Core **4f405d2** (#2341) is consistent with `/tmp/unimp-evidence-repair-release.log`; dashboard **90392cc** is in git; I did not re-hit production.

---

## Findings (severity order)

### 1 — Critical: Summary bypasses evidence binding (product correctness / trust)

**Observed:** `validate_assessment` only validates **findings** and observation refs, not `summary` (`website_ai_evidence.py` ~43–61). The review step is `Review.model_validate` only — no cross-check against evidence (`website_ai_monitor.py` ~245–246, `website_ai_review.py` ~122–123).

**Evidence:** Live capture shows `assessment.findings: []` with a multi-sentence summary attributing brand recognition, competitor absence, and robots policy, and `review.outcome: "accepted"` (`/tmp/unimpossible-reviewed-live.json` ~79–86). Prompt text *asks* to check summaries (`prompt_seeds/website_ai_review.py` ~25) but that is **not enforced**.

**Customer impact:** Dashboard “AI readiness” can read authoritative while **no finding passed structural citation rules**; saved-answer summaries are **observer paraphrases**, not verbatim quotes.

**Smallest remedy:** **Discuss then change:** require either (a) every factual sentence in `summary` to be backed by validated findings, or (b) `accepted` only when `findings` is non-empty for factual assessments; extend `validate_assessment` or post-validate summary tokens against evidence IDs. Re-run one captured case (917b2307 payload) through the real skill before release.

---

### 2 — High: Seven-day per-page publication window is active product policy without David’s agreement

**Observed:** `website_auto_publish.py` skips enqueue and blocks publish when a description/text op for the same page is pending or **published within 7 days** (~67–75, ~192–201). Documented as “observation window” in `core/docs/guides/website-ai-monitoring.md` ~11 and `unimpossible-current.md` ~26–27 (marked **not endorsed**).

**Effect on own site:** Prior **description publish/undo** exercises trigger the window; **blocks another auto write** on homepage until the window ends (limitations in `reviewed-text-proof-2026-10-25.json` ~279–282). This directly conflicts with David’s instruction to **agree before cooldowns** (audit brief ~9).

**Smallest remedy:** **Discuss:** remove, shorten, or scope to “same recommendation id” only; update guide + contract in one slice. Do not bypass in tests to “manufacture proof” (`deferred/unimpossible-website-proof-customer-rollout.md` ~39–40 agrees).

---

### 3 — High: “Smallest complete product” vs demonstrated outcome

**Observed:** Code supports **up to 50 pages**, per-page reviews, text category (`website_recommendation_worker.py` ~86–107, `website_site_audit.py` `LIMIT = 50`). Live site has **2 pages**; privacy **excluded** correctly (`page_review_exclusion` ~79–82). Recorded proof is largely **homepage retain** (many duplicate recommendation IDs in `reviewed-text-proof-2026-10-25.json`).

**Challenge to retro:** Incomplete scope is **partly inventory-limited** (David declined inventing a page — brief ~7, contract ~21), not only engineering. But **delivery emphasis stayed on description retain** rather than proving **text publish/undo** or **change** recommendations.

**Customer impact:** Buyers see **coverage counts** and **retained decisions**, not a worked example of **applied improvement**.

**Smallest remedy:** When the next real service page exists, one acceptance path: **accepted change → auto or manual publish → verify → undo** for **text**, without new modules.

---

### 4 — Medium: Layered time/scope gates (mix of resource bounds and product policy)

| Control | Location | Class | Effect (own site / scale) |
|--------|----------|--------|---------------------------|
| **7-day** published-page block | `website_auto_publish.py` | **Product policy** (disputed) | Blocks repeat publish on homepage |
| **1-day** recommendation age for auto enqueue | `website_auto_publish.py` ~56 | **Product policy** | Older accepted changes never auto-queue |
| **7-day** accepted AI review for page drafts | `website_recommendation_worker.py` ~313 | **Product policy** | Stale AI context dropped; retain-only still works |
| **2-day** audit freshness | `website_recommendation_worker.py` ~137, `website_ai_monitor.py` ~23 | **Resource / freshness** | Must re-audit frequently |
| **50 URL** audit cap | `website_site_audit.py` ~18, slices in workers | **Resource bound** | Irrelevant at 2 pages; matters for customers |
| **40** `text_blocks`, **24k** text, per-page split in AI monitor | `website_recommendation_evidence.py` ~69–71, `website_ai_monitor.py` ~162–180 | **Compatibility / LLM bound** | Truncation flags exist; model may miss body detail |
| **320** description, **1600** text | `website_proof.py` ~335–337, connector PHP | **Compatibility** | Matches WP/meta practical limits |
| **2 categories × 1 change** | `website_recommendation_evidence.py` ~93–105 | **Product scope** | No multi-edit pages |
| **WP `type==page` only** | `page_review_exclusion` ~77–78 | **Compatibility** | Posts/CPT read-only |
| **2 Google source IDs** | `website_recommendation_evidence.py` ~95 | **Product / evidence policy** | No arbitrary citation URLs |
| **60s** between manual recommendation runs | `website_recommendation_worker.py` ~132–133 | **Resource / abuse** | Minor friction |
| **configured_sites** allowlist | `request()` ~117–119 | **Product policy** | Pilot fence; authorised for own site |
| **`approval_required` must stay true** | `connection_valid` ~217 | **Product policy** | Auto-publish uses policy record, not “open” connection |

**Classification note:** Several gates were implemented as **safety/observation** but function as **throughput limits**; only the **50 URL / truncation / plain-text** limits have clear technical justification at scale.

---

### 5 — Medium: Failed or weak AI evidence does not block publishing (by design) — but weak accepted AI can still enrich drafts

**Observed:** Page recommendations **do not require** AI review success (`worker` ~309–338 optional). Failed run `98067fb0…` in `reviewed-text-proof-2026-10-25.json` ~77–84 while page reviews **complete**. Accepted weak AI **917b2307…** can attach to later drafts if version/outcome/hash match (~324–338).

**Impact:** Publishing stays safe (needs **accepted change** + policy). **Risk is advisory quality**, not accidental publish.

**Smallest remedy:** Fix finding #1; optionally **do not attach** AI blocks unless `findings` non-empty or summary validated.

---

### 6 — Medium: Tests mix high-value regression with schema mirroring

**Useful (keep):** Grounding, invented sources, observation quote/query binding (`test_website_recommendation_generation.py`, `test_website_ai_evidence.py`), connection fence, auto-publish reconciliation (`test_website_auto_publish.py`), multi-page queue exclusions.

**Mirrors implementation:** Strict JSON schema min/max items (e.g. two-call recommendation test ~232–237) — fine as **contract tests**, not user requirements.

**Gap:** **No test** that `findings: []` + factual summary **fails** acceptance — the 917b2307 case would still pass today.

**Lean release recommendation:** Before Core ship touching model prompts/schemas: **one** fixture replay of 917b2307 evidence through `website_ai_review` (real model once). Keep existing `ship.sh` / CI gates as **repo policy**; add **targeted** test only for summary rule once David agrees the rule.

---

### 7 — Low: Process / navigation noise

**Observed:** Overlapping status (`ai-loop-release-2026-10-25.md` vs `unimpossible-current.md` vs many `docs/ai-*-2026-10-25.json`), duplicate retain recommendations in dashboard data, **460-line** `core/AGENTS.md` vs **21-line** `unimpossible/AGENTS.md`. Ponytail did not prevent over-documentation.

**Smallest remedy:** Single **delivery contract** (`unimpossible-current.md`) + one **evidence JSON** per release; dashboard already separates **improvements vs retains** (`ProductionResults.tsx` ~37–38) but **ProgressOverview** still soft-pedals when only retains exist.

---

### 8 — Low: Prompt-only evidence repair validation failed (unchanged per brief)

**Observed:** Branch `codex/website-evidence-repair` at `4a52442d6` duplicates merged `4f405d2` fix for **finding** reference repair (`test_website_ai_review` repair path). Brief states a **prompt-only** correction failed with **`unknown_skill`** — **not fixed** in tree; **seven-day limit still in code**.

---

## Controls: keep / remove / change / discuss

| Control | Action |
|--------|--------|
| Hash match before publish, receipt/undo, plain-text validation | **Keep** |
| Page-type / noindex exclusions | **Keep** |
| 50 URL / text truncation / LLM bounds | **Keep** (document as incomplete coverage) |
| 7-day publication observation window | **Discuss → change/remove** |
| 1-day auto-enqueue window | **Discuss** |
| 7-day AI evidence attachment | **Discuss** (decouple from publish cooldown) |
| 2-day audit requirement | **Keep** or loosen to 7d if audit cost hurts |
| Two categories × one edit | **Keep** for Phase B; **discuss** expansion later |
| configured_sites allowlist | **Keep** until customer rollout authorised |
| Summary without findings | **Change** (validate or reject) |

---

## Minimal completion plan (ordered)

1. **David:** Decide fate of **7-day (and 1-day) windows** vs authorised auto-publish on own site.  
2. **Engineering:** Implement agreed evidence rule for **AI summary**; replay **917b2307** payload with real model; ship Core if behaviour changes.  
3. **Prove one text slice:** accepted **text** change → publish → public verify → undo (fixture already in `test_website_auto_publish.py`; live when window/policy allow).  
4. **On next real service page:** run full page-id-bound review without new proof pages.  
5. **Docs:** Archive or banner stale `automatic-recommendations-2026-10-25.md`; point to `unimpossible-current.md` only.  
6. **Dashboard (small):** Surface “**blocked by observation window until …**” when auto-publish skips (read from work items), not only silent retain.

---

## Decisions requiring David

- Remove/shorten **7-day per-page publication window**?  
- Should **AI readiness accepted** require **non-empty findings** for factual summaries?  
- Is **1-day** limit on which recommendations auto-queue still wanted?  
- Prioritise **live text proof** vs waiting for **service page** content?

---

## Explicit unknowns

- Whether production API is **uniformly** on `4f405d2` or still mixed (log showed prod compose on **10a1153** during beta deploy of **4f405d2**).  
- Whether any **accepted text change** recommendation exists in production DB (snapshots show **retain** only).  
- Causal **search/AI referral** impact (Search Console **zero days** in release notes).  
- Whether proposed prompt-only fix is still blocked by **`unknown_skill`** in your validation environment (not re-run here).

---

**Skipped:** Full CI run, production HTTP checks, recursive read of all `docs/ai-*` artifacts, deep WordPress `unimp_text_edit` parser review. **Risk:** Accepting empty-findings AI reviews can mislead operators until code or policy changes; **7-day window** can stall authorised auto-publish without surfacing clearly in the UI.