# Results-first dashboard — 25 October 2026

The hosted dashboard now opens on performance: search clicks, impressions, AI referral requests and enquiries; a selectable 28/90-day chart with publication markers; recent publication/verification/undo events; the next review and audit coverage. Apple design and HIG guidance informed the hierarchy, system typography, restrained colour, disclosure and responsive layout. No charting dependency was added.

Existing evidence, retained decisions, approval/publishing controls, undo, audit history, Google connection and test-email settings remain accessible through separate navigation. Automatic publishing policy is unchanged. No website copy or Core behaviour changed.

Charts reuse the existing daily coverage rules: missing and partial days stay unknown. Changes are compared only when both seven-day periods are complete. Daily values and measurement notes accompany the visual. The current site has no reported Google days; no improvement is invented.

Validation: production TypeScript/Vite build passed; six focused trend/impact tests passed. Browser checks covered metric switching, improvements navigation, hosted sign-in, desktop and compact layout. Container healthy. Image `unimpossible-dashboard:progress-20261025`, deployed digest `sha256:bee5d051e05403b90859f223379c407446e60363bc39dc261bfd83310073d9b4`. Rollback image `unimpossible-dashboard:before-progress-20261025`.

Visual proof: `dashboard-progress-desktop-2026-10-25.png`, `dashboard-progress-chart-2026-10-25.png`, `dashboard-progress-mobile-2026-10-25.png`.

No publish/undo cycle or new data imports were triggered for this visual change. Physical-device and screen-reader testing remain outside this pass.
