# Canonical WordPress website — 24 October 2026

https://unimpossible.co.uk now serves WordPress from isolated-vm (159.69.106.3).
The existing VPS1 Traefik/nginx entry point (46.4.219.113) terminates public HTTPS;
`deploy/nginx.conf` proxies website requests over verified TLS to the restricted origin.
The origin certificate uses staging.unimpossible.co.uk as its TLS identity. It is
not the public canonical hostname. Keep its certificate renewal and DNS in place.

The existing scanner service and `/api/` router remain on VPS1. Original browser
chat/enquiry integrations still call Core. WordPress PHP retains its outbound
network restrictions; mail and external WordPress HTTP requests remain blocked.
No Core secret is embedded in pages or copied to WordPress.

## Content and indexing

- WordPress pages 4 (home) and 5 (privacy), original live content and HTML design.
- Theme source: `theme/`; active theme: `unimpossible`.
- Original titles, canonical URLs, descriptions, structured data and social tags retained.
- Search descriptions are stored in the existing plugin-owned post metadata.
- Homepage indexable; privacy remains noindex as on the previous live site.
- `/privacy` stays canonical, without a trailing slash. www redirects to apex.
- staging hostname redirects to the canonical site, still behind its source allowlist.
- robots.txt and sitemap.xml retain their existing public content.

The static `site/` directory is the pre-migration source/archive. The old deploy
script is deliberately stopped to prevent it overwriting the WordPress proxy.
Content changes now belong in WordPress; deploy only the specific theme/plugin
files required, after a backup and targeted checks. Do not run old bootstrap or
staging provisioning scripts on the promoted server.

## Core and dashboard

Existing optaro site ID `1b81e91094da2fec6386cae20a4e799d` and owner retained.
Connection URL is now https://unimpossible.co.uk. Historical audits/suggestions
keep their actual staging URLs; do not rewrite history as live measurements.
The exact-site worker allowlist replaced staging with the canonical URL, keeping
Core image sha-f4c2993 and API key scope unchanged. Schedules remain paused.
Publishing approval is still required. Live description publishing remains
blocked by the existing noindex-only backend/plugin rule; dashboard hides those
actions on the promoted site. Qualify live writes separately, with approval,
revision checking, verification and undo intact.

## Recovery and operation

Before-promotion encrypted backup on isolated-vm:
`/var/backups/unimpossible/20261024T141456Z.tar.gz.fernet`.
Immediate public rollback: restore the contents of VPS1
`/home/docker/unimpossible/nginx.conf.before-wordpress` to `nginx.conf`, validate
with `docker exec unimpossible-website nginx -t`, then reload nginx. This serves
the retained static site immediately. Coordinate Core URL/WordPress restoration
separately; don't relabel live metrics as staging.

Credentials retained in Optaro Production under **Unimpossible WordPress — isolated-vm**;
admin URL is https://unimpossible.co.uk/wp-admin/. Origin SSH/HTTPS firewalls unchanged.
Daily encrypted on-server backups remain enabled. Automated off-server backup
is still outstanding; the current backup alone does not cover loss of the VM.

## Focused validation

Original page bodies and metadata compared, redirects/assets/robots/sitemap,
scanner health, anonymous plugin denial, browser chatbot load and dashboard audit.
No test enquiry/email sent. No new framework or broad Core release suite.
The live technical baseline is separate from search/traffic measurement: Google
Search Console and AI referral reporting have not been connected by this migration.
