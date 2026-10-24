# Live description proof

Own-site pilot only: the dashboard follows Core's `permissions.publish` for live
publishing. Only homepage page 4 is offered for revision. Staging records from the
previous origin stay read-only. Core additionally checks the tenant, exact site,
configured-site allowlist, current owner, description scope and approval policy.
WordPress separately opts in only this canonical homepage; live body writes stay
blocked. Do not change robots, canonical, title or content.

Acceptance: draft, edit and approve exact text; publish and verify one public
meta-description plus revision marker; undo and verify original text. Keep dated
history for all steps. Finish restored. No search ranking improvement is claimed.

Focused checks: 18 Core workflow tests, dashboard build; actual live proof after
normal release gates. Public customer publishing and editor/cache qualification
remain deferred (Phase A). No new dependencies or background jobs.

## Live proof completed
Core release sha-5213f16 passed beta/production, compose and swarm. Plugin 0.4.3
installed after gates; backup 20261024T183438Z.tar.gz.fernet. Homepage opt-in true,
privacy false, blog_public remains 1. Work f511feb9-72b3-45f0-8230-4f73db1789fb
published at 18:35:22 UTC and undone at 18:35:39 UTC on 24 October 2026.
Independent canonical-URL fetches verified exact published and restored text,
single meta-description, unchanged title/canonical/robots. Core confirms the undo
receipt equals the original page revision. All seven dated events are retained;
approval_required remains true. The homepage ends restored, not left changed.

## Retained publication — 24 October 2026
At the user's request, fresh work 4493697d-967c-47c9-850b-8bdd9bb0a8e1 was
approved and published at 18:50:53 UTC, verified at 18:50:54 UTC, and LEFT LIVE.
The four dated lifecycle events retain the new approval and exact wording.
Independent public verification confirms the single approved description and
unchanged robots, canonical and title. Approval remains required. The earlier
undo proof is retained separately. Next metrics import: 25 October 15:48:39 UTC.
No ranking or traffic improvement is yet established.
