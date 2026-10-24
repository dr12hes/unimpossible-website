# Unimpossible dashboard

The original controlled WordPress proof uses `npm run dev` and the isolated proof API. Production results use a separate read-only mode:

1. Install dependencies with `npm ci`.
2. Create `.env.production-results.local` (permissions 0600), containing `CORE_RESULTS_KEY`, `CORE_RESULTS_TENANT`, and `CORE_RESULTS_SITE`. Use a Core integration key with only the exact website's `results:read` grant. Never use a staff, Connect or administrator API key.
3. Run `npm run dev -- --mode production-results` and open `http://127.0.0.1:5187`.

The loopback server requests the fixed Core HTTPS endpoint. Credentials are server-only; browser headers and cookies are never forwarded. The UI reads current production data every 30 seconds and removes displayed data on a failed refresh. It shows audit coverage, priorities, change history and the scheduled due time. It cannot publish, start audits or change schedules. The existing approval policy stays on.

Focused verification: `npm run build -- --mode production-results` and `node --test tests/production-proxy.test.mjs`, followed by the live Core read and browser check. The build output alone is not a hosted service: the protected proxy must exist. Public hosting, customer authentication and secure product sessions remain a later slice. Do not expose this development server on a network interface.

Backend contract/spec: Core `docs/build-plan/unimpossible-production-results.md`. The API uses Core's existing key expiry/revocation and active membership checks, plus current website ownership. Changing site ownership, disconnecting, revoking the key or disabling its owner stops access. No site credentials are returned.

Private staging extension: an operator may issue the same exact-site key with the additional `audits:run` scope. The results response advertises that permission and the dashboard offers **Run audit**. Its same-origin POST queues Core's existing background worker; it does not publish or change schedules. Read-only keys remain read-only. See Core `docs/build-plan/unimpossible-staging-audit.md`.

Description slice: the exact-site `descriptions:write` grant adds editable missing-description drafts and separate approve/publish actions, with public verification and undo. Drafts quote an existing paragraph and need human review. Only approved saved text can publish; the browser cannot submit replacement text at publication. The fixed `/api/production-results/descriptions` proxy accepts bounded action JSON and requires the same Origin. Page bodies, schedules and indexing controls are unavailable. Core and WordPress require noindex for this staging pilot. See Core `docs/build-plan/unimpossible-search-descriptions.md`. Existing results/audit-only keys gain no write access.

Search-description cards include an expandable suggestion timeline from Core results. It displays suggestion/approval wording and publication, verification and undo evidence with local dates. Earlier pilot dates that were never recorded are explicitly labelled missing; the timeline does not imply search-performance impact. This display is read-only and does not publish or alter indexing.
