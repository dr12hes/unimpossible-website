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
