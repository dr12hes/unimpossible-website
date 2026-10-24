#!/usr/bin/env bash
# Deploy site/ to the server that unimpossible.co.uk points at.
#
#   ./deploy/deploy.sh            # vps1 (plus vps2 when UNIMP_VPS2 is set)
#   ./deploy/deploy.sh vps1       # one explicit target
#
# Where the site lives (checked 2026-10-20): Cloudflare holds the DNS with the proxy OFF and a single A record for
# the apex and www -> 46.4.219.113, the Hetzner dedicated box (hostname v1; `vps1` / `hetzner` / `hetzner-pub` in
# ~/.ssh/config; it also serves floorfllr.com, candengo.com and the optaro sites). Nothing load-balances it. The
# DigitalOcean addresses an earlier version of this script shipped to (144.126.238.139, 68.183.43.115) are not ours
# any more (host key changed / unreachable) and never routed the domain.
#
# What it does on each server, in /home/docker/unimpossible:
#   1. unpacks the new site into live/ (previous release kept in live-previous/; on the first run after the Feb-2026
#      single-page site, that site's web root ./website becomes live-previous so the rollback below still works)
#   2. retires any other container routing unimpossible.co.uk (the Feb-2026 site ran from this same directory as
#      compose service "website"), so Traefik has exactly one target
#   3. ships scanner/ (the website read and audit service), builds its image, and (re)creates both containers from
#      deploy/docker-compose.yml; Traefik routes them from their labels. Secrets live in <remote>/.env (never in git):
#      deploy/scanner.env.example is copied there on first run and must be filled in.
#   4. checks the page from inside the container, waits for Traefik to pick the container up, then checks every
#      route and the title from the public internet against each server's own IP; exits non-zero if anything is off
#
# Rollback:  ssh -i ~/.ssh/hetzner_dedicated root@46.4.219.113 'cd /home/docker/unimpossible && rm -rf live && mv live-previous live && docker compose up -d --force-recreate'
#
# Overrides: UNIMP_VPS1 (ssh target or ~/.ssh/config alias), UNIMP_VPS1_IP (for the public checks), UNIMP_SSH_KEY
# (default ~/.ssh/hetzner_dedicated when it exists), UNIMP_VPS2 / UNIMP_VPS2_IP (a second server, only used when set;
# reached through VPS1 as a jump host unless UNIMP_VPS2_DIRECT=1), UNIMP_REMOTE_DIR.
set -euo pipefail
echo "Static deployment retired: the canonical website now runs on isolated-vm WordPress. See wordpress/README.md." >&2
exit 1
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_DIR="${UNIMP_REMOTE_DIR:-/home/docker/unimpossible}"
VPS1="${UNIMP_VPS1:-root@46.4.219.113}"
VPS1_IP="${UNIMP_VPS1_IP:-46.4.219.113}"
VPS2="${UNIMP_VPS2:-}"
VPS2_IP="${UNIMP_VPS2_IP:-${VPS2##*@}}"
SSH_KEY="${UNIMP_SSH_KEY:-$HOME/.ssh/hetzner_dedicated}"
SSH_OPTS="-o BatchMode=yes -o ConnectTimeout=10"
[ -f "$SSH_KEY" ] && SSH_OPTS="$SSH_OPTS -o IdentitiesOnly=yes -i $SSH_KEY"   # no spaces in the key path, please
EXPECT_TITLE='UNimpossible — understand what AI can do for your business'

TARGETS=("$@")
if [ ${#TARGETS[@]} -eq 0 ]; then TARGETS=(vps1); [ -n "$VPS2" ] && TARGETS=(vps1 vps2); fi
for t in "${TARGETS[@]}"; do
  case "$t" in
    vps1) ;;
    vps2) [ -n "$VPS2" ] || { echo "vps2 requested but UNIMP_VPS2 is not set: unimpossible.co.uk has one A record (46.4.219.113), there is no second server." >&2; exit 1; } ;;
    *) echo "unknown target '$t' (use vps1, vps2)" >&2; exit 1 ;;
  esac
done

cd "$HERE"
if [ -n "$(git status --porcelain -- site deploy scanner 2>/dev/null)" ]; then
  echo "Refusing to deploy uncommitted changes in site/, deploy/ or scanner/. Commit first." >&2; exit 1
fi
REV="$(git rev-parse --short=7 HEAD 2>/dev/null || date +%Y%m%d%H%M)"
STAMP="$(date +%Y%m%d%H%M)"

TGZ="${TMPDIR:-/tmp}/unimpossible-site-$STAMP.tgz"
trap 'rm -f "$TGZ"' EXIT
COPYFILE_DISABLE=1 tar czf "$TGZ" --exclude="._*" --exclude=".DS_Store" -C "$HERE/site" .
SCANNER_TGZ="${TMPDIR:-/tmp}/unimpossible-scanner-$STAMP.tgz"
trap 'rm -f "$TGZ" "$SCANNER_TGZ"' EXIT
COPYFILE_DISABLE=1 tar czf "$SCANNER_TGZ" --exclude="._*" --exclude=".DS_Store" --exclude=".venv" --exclude="__pycache__" \
  --exclude=".pytest_cache" --exclude=".env*" --exclude="data" -C "$HERE/scanner" .
echo "release $REV ($(du -h "$TGZ" | cut -f1) site, $(du -h "$SCANNER_TGZ" | cut -f1) scanner) built from site/ and scanner/"

host_for() { case "$1" in vps1) echo "$VPS1";; vps2) echo "$VPS2";; esac; }
ip_for()   { case "$1" in vps1) echo "$VPS1_IP";; vps2) echo "$VPS2_IP";; esac; }
via_jump() { [ "$1" = vps2 ] && [ "${UNIMP_VPS2_DIRECT:-0}" != 1 ]; }
# macOS ships bash 3.2 (no mapfile/associative arrays). vps2 goes through vps1 with ProxyCommand rather than -J, so the
# jump hop gets the same key and BatchMode options (command-line options do not apply to -J hops).
run_ssh() {
  local t="$1"; shift
  if via_jump "$t"; then ssh $SSH_OPTS -o "ProxyCommand=ssh $SSH_OPTS -W %h:%p $VPS1" "$VPS2" "$@"
  else ssh $SSH_OPTS "$(host_for "$t")" "$@"; fi
}
run_scp() {   # files... -> /tmp/ on the target
  local t="$1"; shift
  if via_jump "$t"; then scp -q $SSH_OPTS -o "ProxyCommand=ssh $SSH_OPTS -W %h:%p $VPS1" "$@" "$VPS2:/tmp/"
  else scp -q $SSH_OPTS "$@" "$(host_for "$t"):/tmp/"; fi
}

deploy_to() {
  local t="$1"
  echo; echo "== $t ($(host_for "$t"))"
  run_scp "$t" "$TGZ" "$SCANNER_TGZ" "$HERE/deploy/nginx.conf" "$HERE/deploy/docker-compose.yml" "$HERE/deploy/scanner.env.example"
  local tgz_name; tgz_name="$(basename "$TGZ")"
  local scanner_tgz_name; scanner_tgz_name="$(basename "$SCANNER_TGZ")"
  run_ssh "$t" "REMOTE_DIR='$REMOTE_DIR' TGZ='/tmp/$tgz_name' SCANNER_TGZ='/tmp/$scanner_tgz_name' REV='$REV' STAMP='$STAMP' bash -s" <<'REMOTE'
set -euo pipefail
mkdir -p "$REMOTE_DIR"; cd "$REMOTE_DIR"

# 1. Stage the release, keep the previous one. First run after the Feb-2026 site: its web root becomes live-previous.
rm -rf live-next && mkdir live-next && tar xzf "$TGZ" -C live-next && rm -f "$TGZ"
echo "$REV $STAMP" > live-next/.release
if [ -d live ]; then rm -rf live-previous && mv live live-previous
elif [ -d website ] && [ ! -d live-previous ]; then echo "keeping the old ./website root as live-previous"; mv website live-previous; fi
mv live-next live
cp /tmp/nginx.conf nginx.conf && cp /tmp/docker-compose.yml docker-compose.yml && rm -f /tmp/nginx.conf /tmp/docker-compose.yml

# 1b. The scanner's source (built into an image below), its data dir, and its env file.
rm -rf scanner-next && mkdir scanner-next && tar xzf "$SCANNER_TGZ" -C scanner-next && rm -f "$SCANNER_TGZ"
rm -rf scanner && mv scanner-next scanner
mkdir -p data && chown 10001 data
if [ ! -f .env ]; then
  cp /tmp/scanner.env.example .env && chmod 600 .env
  echo "WARNING: created $REMOTE_DIR/.env from the example; the read will fail until ANTHROPIC_API_KEY is set in it" >&2
fi
rm -f /tmp/scanner.env.example

# 2. Retire whatever else carries the hostname, so Traefik has exactly one target. Ours is the container created from
#    this directory (web, scanner); compose --remove-orphans retires old services from this directory itself, and the
#    Feb-2026 site had no compose labels at all.
for c in $(docker ps -aq); do
  docker inspect -f '{{json .Config.Labels}}' "$c" | grep -q 'unimpossible\.co\.uk' || continue
  name="$(docker inspect -f '{{.Name}}' "$c" | sed 's#^/##')"
  wd="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' "$c")"
  svc="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.service"}}' "$c")"
  [ "$wd" = "$REMOTE_DIR" ] && continue
  echo "retiring $name (compose dir: ${wd:-none}, service: ${svc:-none})"
  if [ -n "$wd" ] && [ "$wd" != "$REMOTE_DIR" ] && [ -f "$wd/docker-compose.yml" ]; then
    tar czf "$REMOTE_DIR/retired-$name-$STAMP.tgz" -C "$wd" . 2>/dev/null || true
    (cd "$wd" && docker compose down) || docker rm -f "$c"
  else
    docker rm -f "$c"
  fi
done

# 3. Build the scanner image first (so the site is only down for the recreate), then recreate both containers.
docker compose build --quiet scanner
docker compose up -d --force-recreate --remove-orphans
for i in 1 2 3 4 5; do docker exec unimpossible-website nginx -t >/dev/null 2>&1 && break; sleep 1; done
docker exec unimpossible-website nginx -t
code="$(docker exec unimpossible-website wget -q -O /dev/null -S --header='Host: unimpossible.co.uk' http://127.0.0.1/ 2>&1 | awk '/HTTP\//{print $2}' | tail -1)"
title="$(docker exec unimpossible-website wget -q -O - --header='Host: unimpossible.co.uk' http://127.0.0.1/ | grep -o '<title>[^<]*' | head -1)"
echo "container: HTTP $code  $title"
[ "$code" = 200 ] || { echo "container not serving 200; rolled nothing back, inspect $REMOTE_DIR" >&2; exit 1; }
for i in $(seq 1 20); do
  docker exec unimpossible-scanner python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=3)" >/dev/null 2>&1 && break
  sleep 1
done
docker exec unimpossible-scanner python -c "import urllib.request; print('scanner:', urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=3).read().decode())" \
  || { echo "scanner container is not answering; docker logs unimpossible-scanner" >&2; docker logs --tail 30 unimpossible-scanner >&2; exit 1; }
grep -q '^ANTHROPIC_API_KEY=.\+' .env || echo "WARNING: ANTHROPIC_API_KEY is empty in $REMOTE_DIR/.env; the read will fail until it is set" >&2
echo "$(hostname): release $REV live in $REMOTE_DIR/live"
REMOTE
}

# Resolve credentials on the operator's machine; the server never needs a vault session.
for t in "${TARGETS[@]}"; do
  if via_jump "$t"; then echo "Secret sync for jump hosts is not configured." >&2; exit 1; fi
  python3 "$HERE/deploy/sync-secrets.py" --host "$(host_for "$t")" --key "$SSH_KEY" --remote-dir "$REMOTE_DIR"
  deploy_to "$t"
done

# Traefik learns about the recreated container from Docker events a few seconds after it starts; checking sooner sees
# its 404 for the hostname, not ours. Wait for scanner JSON too: the website catch-all also returns 200.
wait_for_router() {
  local ip="$1" i
  for i in $(seq 1 30); do
    curl -fsk -m 10 --resolve "unimpossible.co.uk:443:$ip" https://unimpossible.co.uk/api/health | \
      python3 -c 'import json,sys; assert json.load(sys.stdin) == {"ok": True}' >/dev/null 2>&1 && return 0
    sleep 1
  done
  return 1
}
for t in "${TARGETS[@]}"; do wait_for_router "$(ip_for "$t")" || echo "$t: Traefik is still not routing unimpossible.co.uk to the container after 30s" >&2; done

echo; echo "== public checks (per server, against its own IP)"
fail=0
for t in "${TARGETS[@]}"; do
  ip="$(ip_for "$t")"
  for path in / /privacy /site.css /site.js /og.png /favicon.svg /robots.txt /sitemap.xml /api/health; do
    code="$(curl -sk -m 15 -o /dev/null -w '%{http_code}' --resolve "unimpossible.co.uk:443:$ip" "https://unimpossible.co.uk$path" || echo ERR)"
    [ "$code" = 200 ] || fail=1
    printf '%-5s %-14s %s\n' "$t" "$path" "$code"
  done
  health="$(curl -fsS -m 15 --resolve "unimpossible.co.uk:443:$ip" https://unimpossible.co.uk/api/health)" || fail=1
  printf '%s' "$health" | python3 -c 'import json,sys; assert json.load(sys.stdin) == {"ok": True}' || fail=1
  for h in unimpossible.co.uk www.unimpossible.co.uk; do
    title="$(curl -sk -m 15 --resolve "$h:443:$ip" "https://$h/" | grep -o '<title>[^<]*' | head -1 | sed 's/^<title>//')"
    [ "$title" = "$EXPECT_TITLE" ] || fail=1
    printf '%-5s %-26s %s\n' "$t" "$h" "${title:-NO TITLE}"
  done
done
echo; echo "== public URL (whatever DNS resolves to)"
for h in unimpossible.co.uk www.unimpossible.co.uk; do
  printf '%-26s HTTP %s  %s\n' "$h" "$(curl -s -m 15 -o /dev/null -w '%{http_code}' "https://$h/")" "$(curl -s -m 15 "https://$h/" | grep -o '<title>[^<]*' | head -1 | sed 's/^<title>//')"
done
[ "$fail" = 0 ] || { echo; echo "DEPLOY INCOMPLETE: a route or title above is not what site/ contains." >&2; exit 1; }
echo; echo "all routes 200 and the title matches on every target."
