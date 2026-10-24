# Evidence-backed recommendations — first dashboard slice

Show Core-stored recommendation evidence beside the existing approval and change history. Import the three already reviewed own-site decisions: retain the description, clarify the CTA, and label optional form fields. These are dated historical reviews, not newly generated suggestions or evidence of uplift.

Contract: title, page, observation date/evidence, exact before/after or retain, audience, rationale, primary guidance with review date and strength, applicability, downside, separate rationale/outcome confidence, baseline gaps, measurement plan, review conclusion/provenance and optional linked operation. Publish/verify/undo dates come only from the linked site-bound operation, never inferred from review acceptance. Review does not approve publication. An unrelated draft does not inherit a review.

Reuse the existing site operation store and authenticated results API; explicit public projection, site-scoped read, no credentials, no new permissions or WordPress writes. An idempotent own-site importer records reviewed material with original review dates and current import date. Three initial records; not a new CMS or model orchestration framework.

UI: concise decision first; details reveal exact wording, evidence, sources, risks and measurement. Link the existing description/history without duplicate publication controls. No claim of freshness or causal impact. Sources open only safe HTTP(S) URLs. Existing excerpt drafting, approval, publish and undo remain unchanged; automated evidence generation and enforcement belong to the next slice.

Focused checks: site isolation/public field projection, safe links, linked-record matching; existing dashboard build and a live browser proof after normal Core release gates. No broad new test suite. Use existing Apple design styling and Ponytail scope.
