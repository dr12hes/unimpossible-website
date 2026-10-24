# Search and referral baseline

Started 24 October 2026, 14:28 UTC, before SEO improvements.

## Google Search Console

Domain property `sc-domain:unimpossible.co.uk` verified under david@unimpossible.co.uk
with a DNS TXT record. Keep that record. Canonical sitemap
https://unimpossible.co.uk/sitemap.xml processed successfully: one discovered page.
Google performance/indexing reports initially show processing, not zero values.
Older sitemap submissions were retained as history.

Open https://search.google.com/search-console?resource_id=sc-domain%3Aunimpossible.co.uk
for clicks, impressions, CTR and average position. Google's own reporting is now
active; the Unimpossible OAuth connection is live. No new
Google API credential or third-party analytics subscription was created.

## Referral counts

The isolated-vm nginx `referrals.conf` evaluates incoming requests, retaining only
UTC timestamp, public page path, known source category and a synthetic-test flag.
No IP, cookie, full referrer, query string, user agent or visitor ID is stored in
this separate log. Normal security logs retain their existing policy.

Sources: ChatGPT, Claude, Perplexity, Copilot, Gemini, Google (.com/.co.uk), Bing,
DuckDuckGo. Eligible routes currently `/` and `/privacy`, successful GET only.
Known bots are excluded; unknown bots may remain. Sources without a referrer,
other search domains, unique people, sessions, conversions and unclicked AI
citations are not measured. Google-source counts are not a separate measure of
Google AI Overview clicks or organic-only search clicks.

Shortcut: explicit two-page route list; update it when adding public content pages.

Files on isolated-vm:
- `/etc/nginx/conf.d/unimpossible-metrics.conf`
- `/var/log/nginx/unimpossible-referrals.jsonl` (daily rotation, 35 archives)
- `/usr/local/sbin/unimpossible-metrics`
- `/var/lib/unimpossible-metrics/referrals.json` (root-owned, PHP-readable daily totals, 400 days)
- `unimpossible-metrics.timer` (hourly, persistent across downtime)

Read or refresh the operator report with `sudo /usr/local/sbin/unimpossible-metrics`.
The output is JSON; Core imports these counters daily into the Unimpossible dashboard.
Synthetic test rows are always excluded, and rereading logs does not add totals again.

Privacy disclosure was added to the existing WordPress privacy page; original
indexing policy and plugin publishing approval were retained. No SEO improvement
was applied. The Google Console report and referral request counts are different
metrics and must not be combined as if they were the same measurement.

## Focused checks

`python3 aggregate.py --check` covers UTC dates and synthetic exclusion.
Actual nginx checks covered all eight sources, a spoofed hostname, asset request,
known bot and empty real baseline. nginx configuration and logrotate syntax passed.
One real server timer invocation wrote the private report. No load test, new test
framework, tracking script, tracking cookies or analytics service was introduced.

## Dashboard import slice

Plugin 0.4.2 adds a connection-authenticated read endpoint for this aggregate.
The directory/file become root:www-data 0750/0640 so PHP can read, but cannot
write, the totals. Raw logs are not exported. Core's `website_metrics` CPU job
retains Google daily totals and referral history, with per-source errors and
freshness; configuration is restricted to the exact site. Google consent begins
in Unimpossible and returns there, without a Core staff login. The loopback
server keeps the scoped key and browser-binding cookie out of JavaScript.

Implementation checks: dashboard build and six proxy-boundary cases; Core
property/owner/state, stale-worker, independent source failure and data-validation
checks. Production release `sha-f4498a3` passed the normal beta/production gates.

Live referral proof: task 5731243 completed at 2026-10-24 15:27:53 UTC;
next daily import is due 2026-10-25 15:27:53 UTC. The dashboard displays the real
empty baseline (zero attributed requests), source freshness and next due time.
Only the existing exact-site key gained `metrics:write`; its value/expiry and
publication approval remain unchanged. Optaro Production metadata was updated.
Google consent was started from the dashboard as david@unimpossible.co.uk;
user consent succeeded and the first production Google/referral import completed
at 2026-10-24 15:48:38 UTC with no provider errors. Google returned no rows
for 2026-07-24 through 2026-10-21; this is not a confirmed zero-search baseline.
Next metrics import: 2026-10-25 15:48:39 UTC. Dashboard verified both source
import times, exact property, empty baseline and next due time. Google uses the
existing Optaro OAuth app; the user does not sign into Core.
