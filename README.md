# unimpossible.co.uk

The UNimpossible website: one static page, no build step, no framework.

```
site/        the web root — index.html, privacy.html, site.css, site.js, favicons, og.png, robots, sitemap
deploy/      nginx.conf + docker-compose.yml (nginx:alpine behind Traefik, same pattern as floorfllr/candengo) and deploy.sh
```

## Editing

Open `site/index.html`. Copy is in the HTML, styles in `site/site.css`, the website scanner
and the enquiry form in `site/site.js`. Preview the working scanner and site together with `./scanner/dev.sh` (requires the scanner virtualenv and unlocked 1Password). A plain static server previews the layout but cannot run scans.

Design tokens: paper `#FFFFFF`, chalk `#EEF4F1`, teal ink `#0F3D33`, mint `#8FD9C4` (tints `#C9F2E6`, `#E3F6EF`, mid `#2E8B73`),
amber `#D98E04` for report scores only. Type: Bricolage Grotesque (Google Fonts). The impossible triangle is inline SVG
(`viewBox="3 6.6 64 56"`); the logo pack lives in `site/logo/`.

## Deploying

The site is served from one server: the Hetzner box `v1` at 46.4.219.113 (`vps1` / `hetzner-pub` in `~/.ssh/config`; it also
serves floorfllr.com and candengo.com). Cloudflare holds the DNS only (proxy off, a single A record for the apex and www), so
nothing load-balances it. The 144.126.238.139 / 68.183.43.115 DigitalOcean addresses in older notes are gone.

```bash
./deploy/deploy.sh
```

It first resolves `deploy/scanner.env.1password` locally using the 1Password CLI and streams the environment over SSH into a mode-0600 file. No plaintext credentials are stored in this repository. It refuses to ship uncommitted changes, tars `site/`, copies it to `/home/docker/unimpossible/live` on the server (previous
release kept in `live-previous`), retires any other container routing the domain, (re)creates the `unimpossible-website` nginx
container and the scanner service from `deploy/docker-compose.yml`, then checks every route and the page title against the server's own IP and exits
non-zero if anything is off. It signs in with `~/.ssh/hetzner_dedicated` when present (`UNIMP_SSH_KEY` to change). A second
server can be added with `UNIMP_VPS2=root@host` (reached through the first as a jump host) once DNS actually points at it.

Rollback: `ssh -i ~/.ssh/hetzner_dedicated root@46.4.219.113 'cd /home/docker/unimpossible && rm -rf live && mv live-previous live && docker compose up -d --force-recreate'`.

## Enquiries

The enquiry form posts to the published `unimpossible-website-enquiry` page in the **optaro** Core tenant.
Core saves the submission, captures a Sales lead and sends a staff notification to **hello@unimpossible.co.uk**.
The public page token in `site/index.html` is an identifier, not a credential. Without JavaScript the form
uses Core's normal HTML submission endpoint. Failed JavaScript submissions retain the visitor's input.

`deploy/provision_core_page.py` creates the page if absent. It preserves existing page configuration.
Notification routing is `settings.after_submit.notify_email` in Core; no marketing sequence is enrolled.
**Receiving verified 21 October 2026:** Fastmail alias `hello@unimpossible.co.uk` delivers to
`david@unimpossible.co.uk`. Resolved earlier hard-bounce suppressions were cleared in Postmark.
The complete live website → Core submission → Sales lead → hello notification journey was verified.

The branded **UNimpossible website assistant** is bot ID 3 in the optaro tenant. It uses only its own
knowledge base and is restricted to the apex and www website origins. The embed token is public.
Approved FAQs live in `docs/chatbot-knowledge.md`. To refresh them, copy that document into the Core API
container as `/tmp/unimpossible-chatbot-knowledge.md` and run `deploy/provision_core_chatbot.py` inside it.
The script reconciles this bot's approved persona, greeting and per-bot enquiry delivery policy, preserves its identity/theme, and refreshes page knowledge through Core's
canonical knowledge service. Do not refresh the bot from the website URL: that replaces the curated FAQs.

Chat helps visitors and shows an enquiry review card. The visitor presses **Send enquiry** before the canonical
`chat_lead_capture` path saves a Sales lead. The bot's policy queues branded staff notification to
hello@unimpossible.co.uk and a transactional acknowledgement to the visitor, using stable queue keys
to avoid duplicate mail on retry. Other bots retain their existing sales-trigger behaviour.
The form remains a fallback. No marketing outreach, autonomous quotations or calendar booking is configured.
Deploy the supporting Core chat-capture release before running this provisioning script.

## History

The previous Next.js redesign (never deployed) is on the `skunkworks/d7b2e3ad` branch.

## Website read and emailed audit

The home-page read fetches real public pages and returns a Claude analysis with three evidence-backed observations.
The full audit starts only after the visitor confirms their email, researches competitors, generates a private HTML
report and emails its link. The report copy goes to hello@unimpossible.co.uk.

Secrets live in **1Password → Optaro Production**. The Anthropic key remains in **UNimpossible Anthropic API key**;
search, Postmark, the scanner admin key and signing secret live in **UNimpossible scanner — shared Core provider credentials**.
`deploy/scanner.env.1password` contains references only. `scanner/dev.sh` uses `op run`; deployment resolves the same
references in memory and installs `/home/docker/unimpossible/.env` over SSH. The server needs no 1Password login.
Never include `.env*`, `data/` or `.venv/` in the scanner archive.

As verified on 21 October 2026, Tavily is the working search provider. The shared Brave and Serper accounts have no
provider credit; do not select them until funded. Tavily result order is not represented as measured Google rankings.
Companies House, Google Places and Open PageRank are optional and currently unconfigured.

Email uses Postmark's transactional API and the stored message stream. The `unimpossible.co.uk` domain has verified
DKIM and a verified custom Return-Path (`pm-bounces.unimpossible.co.uk`), checked on 21 October 2026.
All scanner mail sends as **UNimpossible <hello@unimpossible.co.uk>**, with the same address as Reply-To.
Cloudflare holds the Postmark DKIM TXT and unproxied Return-Path CNAME; existing Fastmail records are preserved.
Missing/rejected Postmark delivery fails visibly; development can explicitly set `SCANNER_MAIL_OUTBOX=1`
to write `.eml` files instead.

Focused validation:

```bash
scanner/.venv/bin/python -m pytest scanner/tests -q
ruff check scanner deploy/sync-secrets.py
bash -n deploy/deploy.sh scanner/dev.sh
```

The API health gate requires JSON `{"ok": true}`; an nginx homepage with status 200 is not healthy scanner evidence.
The advertised AI readiness questionnaire and admin cost calculator are outside this release.
