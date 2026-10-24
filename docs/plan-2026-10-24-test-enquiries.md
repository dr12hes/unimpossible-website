# Confirmed test enquiries

Keep the baseline limited to accepted homepage enquiries excluding explicitly confirmed tests. No visitor/email heuristics, deletions, tracking vendor or publishing changes.

Core keeps append-only classification receipts in its existing operation store, with actual date, actor, reason, submission IDs and private content hashes. Latest decision wins; corrections use a fresh receipt. The pilot operator script checks exact site/form ownership and approval before recording. Existing enquiry content is unchanged. The dashboard shows excluded counts separately and a read-only classification audit, with incomplete days still unknown.

Reviewed IDs 41–45 are explicitly labelled internal tests. Four were counted as homepage submissions; one lacks source_page and remains outside that population. Receipt 86918cb5-6d07-48dc-9c02-68efc792b8db recorded 24 October 2026. SQL verification: all eight form submissions retained, zero non-test tagged homepage submissions, four excluded homepage tests. Other non-homepage submissions are not claimed to be leads.

Validation: four focused Core tests, five impact tests and production-results TypeScript/Vite build. No new test framework. Deployment and browser proof to be recorded after release.
