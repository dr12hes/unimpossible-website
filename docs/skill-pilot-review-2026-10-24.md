# Three recommendation dry runs — Unimpossible

24 October 2026. Draft recommendations only: no live edits, submissions, tracking changes or approval actions. Used the eight locally adapted skills via the shared contract and site brief. Source revision: e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b; local version 1.0.0. Source provenance is in skill-sources/manifest.json.

## Evidence inspected

Fresh GET of https://unimpossible.co.uk/ and https://unimpossible.co.uk/site.js?v=20261021-leads on 24 October. HTML confirms the current description, CTA destinations and form labels/required attributes. Public script validates name/email only, posts an enquiry and shows a reply-within-one-working-day message; it does not reserve an appointment. No enquiry was submitted, server delivery was not tested, and visual/mobile usability was not assessed. The earlier description evidence note and change history were consulted; no fresh private Search Console or lead data was fetched. Baseline, current volumes, qualified-lead rate and attribution remain unestablished here, not assumed zero.

Audience: businesses considering practical AI/software assistance. Free general conversation is 30 minutes; Norfolk Chambers members have a separate one-hour offer. Published business statements are not independently verified customer evidence.

## 1. Description — retain

**Current and recommended:** “Norfolk-based engineers helping businesses explore AI and build practical software. Book a free 30-minute conversation with UNimpossible.”

**Finding:** The text accurately summarises the page and its general offer. No evidenced defect requires another rewrite. It omits the Chambers benefit compared with the older description; that offer remains prominent on the page. “Book” reflects the existing site wording but the journey is a request, so a future coordinated CTA review may justify “Request”; do not quietly roll that into this experiment.

**Basis:** Google's [snippet guidance](https://developers.google.com/search/docs/appearance/snippet), reviewed 24 October, supports descriptive page-specific summaries, sets no fixed character limit and permits query-dependent snippets. Our case library includes negative and inconclusive description tests. This is a supported editorial decision, not proof the current description outperforms the old one or earns AI citations.

**Tradeoff/confidence:** High confidence in factual fit to published content; low confidence in any search uplift. Keeping it stable preserves interpretability; the Chambers detail remains absent from the meta description. No new approval or publish needed because recommendation is no change.

**Measurement:** Monitor homepage/query clicks, impressions and CTR with position/query mix and migration/recrawl context when available; separately observe AI referrals and relevant enquiries. No causal claim from a seven-day comparison or missing baseline. Status: retained, impact unproven.

## 2. CTA — clarify that this requests a conversation

**Observed:** Hero button says “Book a free 30-minute conversation” and links to #talk. Form button says “Book a conversation”. Public form code submits an enquiry and promises a reply; it shows no time selection or appointment confirmation.

**Proposed exact change, not applied:** Hero: “Request a free 30-minute conversation”. Form submit: “Request a conversation”. Leave the existing one-working-day reply sentence and separate Chambers offer intact. The shorter form label also works for visitors requesting the Chambers hour. If implemented later, review the navigation's “Book a conversation” label for consistency; no automated sitewide replacement.

**Why:** Match the action promise to the observed next step. This is a clarity hypothesis based on direct journey evidence and the adapted copywriting/cro workflow; it is not a proven conversion gain. The [Unbounce CTA case](https://unbounce.com/conversion-rate-optimization/design-call-to-action-buttons/) in our evidence library supports measuring wording experiments, not this particular wording or a projected uplift. Source reviewed 24 October.

**Tradeoff/confidence:** High confidence that the current client journey requests contact; moderate confidence the new wording clarifies expectations, low confidence it improves enquiries. “Request” may feel less immediate and reduce clicks; users may already understand the current wording. No user interviews or abandonment data establish actual confusion. Review status: candidate for customer approval, not approved to publish.

**Measurement:** Primary desired outcome is qualified enquiries from relevant businesses; qualification criteria and measurement must be agreed rather than assumed implemented. Supporting outcomes: server-accepted enquiries relative to relevant page visitors and subsequent scheduled conversations. CTA clicks alone cannot establish success. Keep the free offer, mobile layout, contact channels and Chambers path as guardrails. Use observational reporting until volume justifies a controlled test. On future approval, verify exact labels and anchor destination, preserve previous wording for undo.

## 3. Form — show which fields are optional

**Observed:** HTML and public client validation require Name and Email. Company and the message are optional, but their labels do not say so. There are four visible customer fields; the anti-spam and interest fields are not customer questions. Existing labels, autocomplete, privacy link, status region and anti-spam handling should be preserved.

**Proposed exact labels, not applied:**
- “Name” → “Name (required)”
- “Email” → “Email (required)”
- “Company” → “Company (optional)”
- “What takes up too much of your team's time?” → “What takes up too much of your team's time? (optional)”

**Why:** State the existing rules where visitors need them, without removing useful qualification context or changing validation. W3C's [form instructions guidance](https://www.w3.org/WAI/tutorials/forms/instructions/), reviewed 24 October, recommends indicating required/optional inputs in accessible instructions/labels. This is supported usability practice, not evidence of a particular completion uplift. The MECLABS form case in our evidence library also cautions against treating field count as the only cause of completion changes.

**Tradeoff/confidence:** High confidence in the observed HTML/client mismatch between implicit rules and visible labels; server-side optionality not exercised. High confidence the proposal makes those client rules explicit; low confidence in conversion benefit. More visible label text may wrap on mobile. Optional labels may reduce volunteered company/problem details, so monitor useful enquiry context and follow-up effort. Do not add data collection or enrichment to compensate automatically. Review status: candidate for customer approval, not approved to publish.

**Measurement:** Accepted enquiries, validation difficulties if already measurable, useful company/problem context and subsequent qualification. No existing abandonment instrumentation was verified. Before a future publish, check labels on mobile and with accessible names; use a controlled staging check for required/optional behaviour rather than sending test leads into production. Keep original labels for undo.

## Lean evaluation result

The outputs include a justified no-change decision, exact candidate wording, current page evidence, source links, downside and separate rationale/impact confidence. They preserve the 30-minute general offer, Chambers eligibility, privacy and existing validation. None fabricates a numerical uplift or claims to have measured an outcome. Independent content review is recorded below before delivery. This validates these examples, not every future output or production integration.

## Reproducibility and focused checks

Fresh public response fingerprints (SHA-256; raw downloads kept in the temporary review workspace, not committed with public embed/config identifiers):
- homepage.html: `782de63a15de921ad112f68feb9d8031de2106632f1eda9c92137ccf05224338`
- site.js: `3301ef473e49af35696a95e9a327a529088cf027ddf400af6fea64d46698775d`

Checked all ten archived source hashes, all eight adaptation hashes and required frontmatter, local links and MIT notices. The bundled skill validator could not start because its Python environment lacks PyYAML; a focused standard-library check covered these structural checks instead, without adding a dependency. No application test suite was run because application code was unchanged.

## Independent review

Separate reviewer `skill_pilot_review` checked the adapted skills, contract, recommendations and raw public HTML/script on 24 October 2026. No material factual, offer-preservation or unsupported-outcome issues found. Review accepted the description retain decision and the CTA/form proposals as drafts, not publication approval. Confirm server-side optionality on staging before a future form publish; navigation wording remains a separate consistency decision. No live actions were performed by the reviewer.
