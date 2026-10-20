# unimpossible.co.uk

The UNimpossible website: one static page, no build step, no framework.

```
site/        the web root — index.html, privacy.html, site.css, site.js, favicons, og.png, robots, sitemap
deploy/      nginx.conf + docker-compose.yml (nginx:alpine behind Traefik, same pattern as floorfllr/candengo) and deploy.sh
```

## Editing

Open `site/index.html`. Copy is in the HTML, styles in `site/site.css`, the two bits of behaviour (the website-check demo
and the enquiry form) in `site/site.js`. Preview locally with any static server, e.g. `python3 -m http.server -d site 8080`.

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

It refuses to ship uncommitted changes, tars `site/`, copies it to `/home/docker/unimpossible/live` on the server (previous
release kept in `live-previous`), retires any other container routing the domain, (re)creates the `unimpossible-website` nginx
container from `deploy/docker-compose.yml`, then checks every route and the page title against the server's own IP and exits
non-zero if anything is off. It signs in with `~/.ssh/hetzner_dedicated` when present (`UNIMP_SSH_KEY` to change). A second
server can be added with `UNIMP_VPS2=root@host` (reached through the first as a jump host) once DNS actually points at it.

Rollback: `ssh -i ~/.ssh/hetzner_dedicated root@46.4.219.113 'cd /home/docker/unimpossible && rm -rf live && mv live-previous live && docker compose up -d --force-recreate'`.

## Enquiries

By default the form opens the visitor's email app addressed to hello@unimpossible.co.uk with the message filled in.
To post enquiries into Optaro Core instead, create the page once with `deploy/provision_core_page.py` (instructions in the file),
paste the token into `window.UNIMPOSSIBLE.pageToken` at the foot of `site/index.html`, commit and deploy.

## History

The previous Next.js redesign (never deployed) is on the `skunkworks/d7b2e3ad` branch.
