# Changes and traffic — own-site dashboard slice

Use existing Core metrics and suggestion timelines. No API, worker, credentials,
publishing controls or website changes. Current site: https://unimpossible.co.uk.

Acceptance:
- Daily table for 28 or 90 calendar days: Google clicks/impressions, AI referral
  requests, and dated suggestion/approval/publication/verification/undo events.
- Exact-origin filter excludes earlier staging work from live-site comparisons.
- Select a publication and compare seven full days before and after, excluding
  publication day in each source's timezone. All seven days must be available
  before displaying a total or difference. Google missing rows remain unknown.
- AI zeros only for complete counter-covered UTC days within retention. Today,
  tracking's first partial day and unimported days remain unknown.
- Label site-wide measurements, source date conventions and overlapping actions;
  do not attribute movement to a change or show an invented impact percentage.
- No live publication yet is an honest empty state. External edits and migration
  are not invented as tool-recorded changes. Existing suggestion history remains.

Validation: three focused calculation/boundary checks and production-results
build. Browser checks against the real own-site baseline; no synthetic traffic
or publication written to production. No new chart library or test framework.
