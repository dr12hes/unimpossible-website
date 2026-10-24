# Approved live CTA and form labels

Published 24 October 2026 at 19:27:06 UTC, homepage WordPress page 4, https://unimpossible.co.uk/.
Approval: user's “Ok continue - dont bother with staging”, following the exact proposals in skill-pilot-review-2026-10-24.md. Direct live update; no staging work.

Changes: hero “Request a free 30-minute conversation”; form button “Request a conversation”; Name/Email marked required and Company/Message marked optional. Navigation wording remains unchanged as scoped. Description, existing post metadata, indexing, validation, submissions, privacy and Chambers offer were preserved. No Core/plugin approval setting was modified.

Initial exact-match preflight stopped safely before writing because other forms also contain Name/Email labels. Update was narrowed to the contact form. PHP syntax and exact before/after body checks passed. Fresh public HTML confirms six changes, unchanged description/robots/canonical and Chambers offer. Browser confirms accessible labels, CTA anchor destination and unclipped desktop form. No form was submitted or email sent. Mobile layout and server submission were not retested; validation code did not change. No conversion uplift is claimed.

Full encrypted pre-change backup: `/var/backups/unimpossible/20261024T192705Z.tar.gz.fernet` on isolated-vm.
Exact before/after body and approval record: `/root/unimp-cta-form-20261024T192706Z.json` (root-only).
Before SHA-256: `3a204d2442c3f8e59eb10af772bf7acd12e4e380edd1c7ac4ff5604394a3acd0`.
After SHA-256: `7700c4a280fcd9d0bfa46108272a41e946eb9ad413df8f61691fe54c5e0b41af`.
WordPress revisions and `_unimp_approved_copy_event` metadata retain publication and verification records. This operational content change is not a Core suggestion record and is not displayed in the dashboard suggestion timeline. Do not claim it is automatically included in impact charts.

Undo, only when authorised: on isolated-vm run `wp --allow-root --path=/var/www/unimpossible eval-file /root/unimp-undo-cta-form.php`. The script refuses if the body changed since this publication, checks backup integrity, restores only the body and records undo. Syntax checked; not executed against live content. Source in wordpress/operations/undo-cta-form.php. Do not rerun the publication script: its preflight deliberately rejects already-applied edits.

Task outputs: live-cta-form-published.json and live-cta-form.png. These contain public verification evidence; credentials remain in 1Password.

## Timeline follow-up

The operator publication and public verification are now included in the dashboard impact timeline via Core release sha-7623f8f (PRs #2308/#2309). This supersedes the earlier note that the edit was absent from the dashboard. It is a read-only operator record, compared alongside search, AI referrals and retained homepage enquiry counts. See `plan-2026-10-24-operator-change-impact.md`.
