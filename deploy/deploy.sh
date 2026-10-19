#!/usr/bin/env bash
# Deploy site/ to VPS1 and VPS2 (Cloudflare load-balances between them, so both must match).
#
#   ./deploy/deploy.sh            # both servers
#   ./deploy/deploy.sh vps1       # one server
#
# What it does on each server, in /home/docker/unimpossible:
#   1. retires any other container currently routing unimpossible.co.uk (the old single-page site)
#   2. unpacks the new site into live/ (previous release kept in live-previous/)
#   3. (re)creates the nginx:alpine container from deploy/docker-compose.yml; Traefik routes it from its labels
#   4. checks the page from inside the container and then from the public internet, per server
#
# Rollback:  ssh <server> 'cd /home/docker/unimpossible && rm -rf live && mv live-previous live && docker compose up -d --force-recreate'
#
# Override hosts with UNIMP_VPS1 / UNIMP_VPS2 (ssh targets or ~/.ssh/config aliases). VPS2 is reached through VPS1 unless UNIMP_VPS2_DIRECT=1.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_DIR="${UNIMP_REMOTE_DIR:-/home/docker/unimpossible}"
VPS1="${UNIMP_VPS1:-root@144.126.238.139}"
VPS2="${UNIMP_VPS2:-root@68.183.43.115}"
VPS1_IP="${UNIMP_VPS1_IP:-144.126.238.139}"
VPS2_IP="${UNIMP_VPS2_IP:-68.183.43.115}"
TARGETS=("$@"); [ ${#TARGETS[@]} -eq 0 ] && TARGETS=(vps1 vps2)
for t in "${TARGETS[@]}"; do case "$t" in vps1|vps2) ;; *) echo "unknown target '$t' (use vps1, vps2)" >&2; exit 1;; esac; done

cd "$HERE"
if [ -n "$(git status --porcelain -- site deploy 2>/dev/null)" ]; then
  echo "Refusing to deploy uncommitted changes in site/ or deploy/. Commit first." >&2; exit 1
fi
REV="$(git rev-parse --short=7 HEAD 2>/dev/null || date +%Y%m%d%H%M)"
STAMP="$(date +%Y%m%d%H%M)"

TGZ="${TMPDIR:-/tmp}/unimpossible-site-$STAMP.tgz"
trap 'rm -f "$TGZ"' EXIT
COPYFILE_DISABLE=1 tar czf "$TGZ" --exclude="._*" --exclude=".DS_Store" -C "$HERE/site" .
echo "release $REV ($(du -h "$TGZ" | cut -f1)) built from site/"

host_for() { case "$1" in vps1) echo "$VPS1";; vps2) echo "$VPS2";; esac; }
ip_for()   { case "$1" in vps1) echo "$VPS1_IP";; vps2) echo "$VPS2_IP";; esac; }
jump_for() { if [ "$1" = vps2 ] && [ "${UNIMP_VPS2_DIRECT:-0}" != 1 ]; then echo "-J"; echo "$VPS1"; fi; }
# macOS ships bash 3.2, so no mapfile/associative arrays here.
run_ssh() { local t="$1"; shift; ssh -o BatchMode=yes -o ConnectTimeout=10 $(jump_for "$t") "$(host_for "$t")" "$@"; }
run_scp() { local t="$1"; shift; scp -q -o BatchMode=yes -o ConnectTimeout=10 $(jump_for "$t") "$@" "$(host_for "$t"):/tmp/"; }

deploy_to() {
  local t="$1"
  echo; echo "== $t ($(host_for "$t"))"
  run_scp "$t" "$TGZ" "$HERE/deploy/nginx.conf" "$HERE/deploy/docker-compose.yml"
  local tgz_name; tgz_name="$(basename "$TGZ")"
  run_ssh "$t" "REMOTE_DIR='$REMOTE_DIR' TGZ='/tmp/$tgz_name' REV='$REV' STAMP='$STAMP' bash -s" <<'REMOTE'
set -euo pipefail
mkdir -p "$REMOTE_DIR"; cd "$REMOTE_DIR"

# 1. Retire whatever else is routing the domain (the old static site), so Traefik has one target.
for c in $(docker ps -q); do
  name="$(docker inspect -f '{{.Name}}' "$c" | sed 's#^/##')"
  [ "$name" = unimpossible-website ] && continue
  if docker inspect -f '{{json .Config.Labels}}' "$c" | grep -q 'unimpossible\.co\.uk'; then
    wd="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' "$c")"
    echo "retiring $name (compose dir: ${wd:-none})"
    if [ -n "$wd" ] && [ -f "$wd/docker-compose.yml" ] && [ "$wd" != "$REMOTE_DIR" ]; then
      (cd "$wd" && docker compose down) || docker rm -f "$c"
      tar czf "$REMOTE_DIR/retired-$name-$STAMP.tgz" -C "$wd" . 2>/dev/null || true
    else
      docker rm -f "$c"
    fi
  fi
done

# 2. Stage the release, keep the previous one.
rm -rf live-next && mkdir live-next && tar xzf "$TGZ" -C live-next && rm -f "$TGZ"
echo "$REV $STAMP" > live-next/.release
if [ -d live ]; then rm -rf live-previous && mv live live-previous; fi
mv live-next live
cp /tmp/nginx.conf nginx.conf && cp /tmp/docker-compose.yml docker-compose.yml

# 3. Start or recreate the container (the html mount is a directory we just swapped, so recreate rather than reload).
docker compose up -d --force-recreate --remove-orphans
sleep 2
docker exec unimpossible-website nginx -t
code="$(docker exec unimpossible-website wget -q -O /dev/null -S --header='Host: unimpossible.co.uk' http://127.0.0.1/ 2>&1 | awk '/HTTP\//{print $2}' | tail -1)"
title="$(docker exec unimpossible-website wget -q -O - --header='Host: unimpossible.co.uk' http://127.0.0.1/ | grep -o '<title>[^<]*' | head -1)"
echo "container: HTTP $code  $title"
[ "$code" = 200 ] || { echo "container not serving 200; rolled nothing back, inspect $REMOTE_DIR" >&2; exit 1; }
echo "$(hostname): release $REV live in $REMOTE_DIR/live"
REMOTE
}

for t in "${TARGETS[@]}"; do deploy_to "$t"; done

echo; echo "== public checks (per server, bypassing Cloudflare's choice)"
for t in "${TARGETS[@]}"; do
  ip="$(ip_for "$t")"
  for path in / /privacy /site.css /og.png /favicon.svg /robots.txt /sitemap.xml; do
    code="$(curl -sk -o /dev/null -w '%{http_code}' --resolve "unimpossible.co.uk:443:$ip" "https://unimpossible.co.uk$path" || echo ERR)"
    printf '%-5s %-14s %s\n' "$t" "$path" "$code"
  done
done
echo; printf 'public  /  '; curl -s -o /dev/null -w '%{http_code}\n' https://unimpossible.co.uk/
curl -s https://unimpossible.co.uk/ | grep -o '<title>[^<]*' | head -1
