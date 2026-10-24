# Test email list

Replace the unfinished per-enquiry review panel with one list: load, edit one address per line, save, undo last change, and view dated additions/removals. Seed david@unimpossible.co.uk because all five confirmed internal tests used it. Exact case-insensitive addresses only; original submissions are retained.

List changes recalculate retained historical homepage counts and automatically apply to future submissions. Once configured, the list supersedes old per-ID decisions while preserving their audit. Removing an address or undoing a change updates counts again. Counts still exclude missing homepage-source tags and are not qualified-lead or spam-free metrics.

Core adds only a site-specific list-management scope and reuses the operation store. The localhost proxy keeps the scoped key server-side and checks Origin/Host. No enquiry messages/emails are fetched from the browser for manual classification. UI uses existing components, with no animation/design dependency. No form submission or website copy changes required.

Focused checks: eight backend tests, twelve proxy/impact tests, TypeScript/Vite build, read-only PostgreSQL case/spacing/exact-match and list removal proof. Required Core gates passed; release `sha-5c41b09` verified across beta and production. Live browser add/remove/undo proved 0 counted/4 excluded → 4/0 → 0/4; final list contains david@unimpossible.co.uk. Three dated list receipts and all eight original submissions retained. Publishing approval stays on. See status-2026-10-24.md for remaining product work.
