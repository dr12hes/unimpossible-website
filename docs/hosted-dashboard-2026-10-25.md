# Smallest hosted own-site release

Scope: resume daily read-only website audits, host the existing dashboard permanently at https://dashboard.unimpossible.co.uk, and check the existing monitoring/recommendation/publication controls. No new marketing modules or customer onboarding.

The dashboard runs as a separate unprivileged, read-only Node container on VPS1 behind existing Traefik HTTPS. WordPress stays on isolated-vm. It serves a production build and reuses the fixed-site Core proxy. The Core key is mounted server-side, never included in the JavaScript bundle. One strong owner login is stored in Optaro Production; the server stores only its authorization digest. All pages and API paths require login. The health endpoint contains no site data. Same-origin checks guard mutations; no arbitrary Core target is accepted. Dashboard responses are no-store/noindex with frame and content-type protections.

Google's Core callback returns to this fixed HTTPS dashboard; signed state and the initiating browser cookie remain required. Existing daily imports are preserved. The local preview remains useful for development but Google reconnect now belongs on the hosted dashboard.

Deploy from dashboard/Dockerfile and deploy/dashboard-compose.yml in /home/docker/unimpossible-dashboard on VPS1. Mount dashboard.json with origin, key, tenant, site and authHash; protect it as root:1000 mode 0640. No public container port. To roll back the hosted surface, restore the prior dashboard image/config and recreate only this compose project. Never run the retired static website deploy script.

Acceptance checks: authentication and cross-site denial; hosted results/metrics/history; a scheduler-created completed audit and next due; a hosted recommendation run; existing publication verification with approval retained. Do not churn live copy solely for a hosting test. Previous live publish/undo proof remains part of the release evidence.

Known limits: single owner pilot login, existing scoped key expiry, manual transfer of accepted advice into the existing draft flow, and insufficient search traffic for causal claims. Password/account management and customer onboarding are deferred.

## Background monitoring proof

Daily audits resumed using the existing schedule with an integration audit entry. Core picked up run `28bd8fdc-88e2-470d-9548-8b17fca8bd1c` at 10:10 UTC on 25 October 2026 and completed both pages with zero failures. Next scheduled audit: 26 October at 10:10 UTC. A fresh existing-account Google/referral import completed at 10:12 UTC with no reported errors; next due 26 October at 10:12 UTC. Approval remains required. See hosted-monitoring-proof.json. Missing Google rows remain missing data, not confirmed zero traffic.

The existing scoped dashboard key expires on 22 January 2027 at 12:24 UTC; renew it before then. The user approved the exact hosting/access scope. DNS, server-only scoped key and owner login are now provisioned. The login is saved as “Unimpossible dashboard — owner login” in Optaro Production.

## Hosted acceptance — 25 October 2026

The production build is serving over valid HTTPS from the separate dashboard container. Anonymous page/API requests return 401; authenticated assets/results work; cross-site mutations are rejected. Core key material is absent from the browser assets. Existing daily audits and Google/referral imports appear through the hosted proxy.

Hosted recommendation run `de3d6574-59b5-4325-ac07-6814c6244f96` completed with one independently reviewed retain decision. The description operations/history and public homepage description remain unchanged. Publishing approval is required and the homepage remains indexable. Google start sets a Secure/HttpOnly browser cookie; a real signed cancellation round trip through Core returns to the hosted dashboard without changing the connected Google account. See hosted-dashboard-proof.json.

The in-app/automated Chrome browser could not handle the native HTTP authentication prompt, and native screen capture was unavailable. Therefore hosted visual rendering and interactive sign-in were not browser-verified in this pass; authenticated HTTPS and assets/API checks passed. Open in a normal browser with the saved owner login. No new publish/undo cycle or test enquiry was performed: the prior live proof and current unchanged history are retained.

Validation stayed focused: ten hosting/proxy checks plus the production build; existing nine website-metrics checks for Core's callback. Normal Core PR/merge/release gates apply to PR #2320. Vite was patched to 7.3.7 after its build-time audit flagged vulnerabilities; npm audit then reported zero. The hosted runtime does not include Vite or node_modules.

Final Core release verification passed: beta and production API/worker containers all run `sha-e6512cb` (`e6512cb04cbe1c1521c50f61045069103c141c2e`). Dashboard container is healthy, runs as `node`, has a read-only filesystem and no published host ports. Temporary local plaintext credential files were removed after verification; the vault login and restricted server configuration remain.

## Sign-in correction

The browser-native Basic authentication prompt proved incompatible with the in-app browser. Replaced it with a branded HTML sign-in form, reusing the same vault credentials and server-side credential digest. No new access scope or credential is introduced. Successful login issues a random opaque Secure/HttpOnly/SameSite=Lax cookie; only its hash is stored in memory, with a 12-hour absolute expiry. Sign-out invalidates it. Container restart requires sign-in again. The single-owner pilot caps active sessions at 16 and failed sign-ins at 10 per minute, in addition to the existing edge rate limit. Login and logout require the exact hosted Origin; Core mutations retain their existing checks. Anonymous API requests return JSON 401 without a native authentication challenge. Publishing approval and indexing controls are unchanged.
