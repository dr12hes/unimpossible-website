# Operator publication history and enquiry observations

Scope: show the approved homepage CTA/form edit beside search traffic, AI referrals and retained enquiry counts. No live website edits, new tracker, customer form binding or publishing capability.

Acceptance:
- Actual publication 2026-10-24T19:27:06Z and public verification 19:27:30Z, exact six copy changes, marked operator-recorded. No invented suggestion/approval timestamps.
- Import once with stable ID 4bc8ba7c-40f8-4f4b-9f25-029ebec42d80 into Core's existing site-bound history. Replay refuses differing payloads. Approval must remain on.
- Core returns only own-site form aggregate dates/counts under the existing results scope and active owner authorization; no enquiry content or contact details.
- Existing daily view and before/after comparisons include enquiries, with unknown/partial days distinct from zero and no causal claims.
- History stays read-only; existing description approval/publish/undo unchanged. Operator undo remains the documented guarded command.

Checks: three focused Core tests, aggregate PostgreSQL read, four dashboard impact tests, TypeScript/production-results build, then production response and browser evidence. Core's existing release gates apply; no new test framework.

## Delivered — 24 October 2026

Core PRs #2308 and #2309 merged through required validation. Normal release completed with `RELEASE PASS sha-7623f8f`: beta and production compose/swarm API and workers verified.

The local dashboard at http://127.0.0.1:5187/ reads production results. Live response assertions confirmed the operator record's original publication/verification dates, public field allowlist, date/count-only enquiry data and `approval_required=true`. Browser verification confirmed the CTA/form entry, read-only source label, all four comparison cards and complete-day handling: 22/23 October zero enquiries; partial dates unreported. Search data remains insufficient for an impact comparison.

Evidence: workspace `outputs/timeline-production-results.json` and `outputs/timeline-enquiries-live.png`. No website content or indexing settings changed in this slice. No form submissions were created. Enquiry counts can include tests, spam or repeats; this is not qualified-lead attribution.
