# Smallest hosted own-site release

Scope: resume daily read-only website audits, host the existing dashboard permanently at https://dashboard.unimpossible.co.uk, and check the existing monitoring/recommendation/publication controls. No new marketing modules or customer onboarding.

The dashboard runs as a separate unprivileged, read-only Node container on VPS1 behind existing Traefik HTTPS. WordPress stays on isolated-vm. It serves a production build and reuses the fixed-site Core proxy. The Core key is mounted server-side, never included in the JavaScript bundle. One strong owner login is stored in Optaro Production; the server stores only its authorization digest. All pages and API paths require login. The health endpoint contains no site data. Same-origin checks guard mutations; no arbitrary Core target is accepted. Dashboard responses are no-store/noindex with frame and content-type protections.

Google's Core callback returns to this fixed HTTPS dashboard; signed state and the initiating browser cookie remain required. Existing daily imports are preserved. The local preview remains useful for development but Google reconnect now belongs on the hosted dashboard.

Deploy from dashboard/Dockerfile and deploy/dashboard-compose.yml in /home/docker/unimpossible-dashboard on VPS1. Mount dashboard.json with origin, key, tenant, site and authHash; protect it as root:1000 mode 0640. No public container port. To roll back the hosted surface, restore the prior dashboard image/config and recreate only this compose project. Never run the retired static website deploy script.

Acceptance checks: authentication and cross-site denial; hosted results/metrics/history; a scheduler-created completed audit and next due; a hosted recommendation run; existing publication verification with approval retained. Do not churn live copy solely for a hosting test. Previous live publish/undo proof remains part of the release evidence.

Known limits: single owner pilot login, existing scoped key expiry, manual transfer of accepted advice into the existing draft flow, and insufficient search traffic for causal claims. Password/account management and customer onboarding are deferred.

## Background monitoring proof

Daily audits resumed using the existing schedule with an integration audit entry. Core picked up run `28bd8fdc-88e2-470d-9548-8b17fca8bd1c` at 10:10 UTC on 25 October 2026 and completed both pages with zero failures. Next scheduled audit: 26 October at 10:10 UTC. A fresh existing-account Google/referral import completed at 10:12 UTC with no reported errors; next due 26 October at 10:12 UTC. Approval remains required. See hosted-monitoring-proof.json. Missing Google rows remain missing data, not confirmed zero traffic.

The existing scoped dashboard key expires on 22 January 2027 at 12:24 UTC; renew it before then. Hosting DNS/login/configuration awaits the explicit access-scope approval requested after automatic approval review blocked provisioning. No hosting credential has yet been created.
