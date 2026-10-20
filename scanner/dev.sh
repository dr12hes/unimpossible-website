#!/usr/bin/env bash
# Local development: the API and the static site together on http://127.0.0.1:8000.
# Secrets come from 1Password via `op run` when scanner/.env.dev exists (op:// references, never values).
set -euo pipefail
cd "$(dirname "$0")/.."
export SCANNER_DATA_DIR="${SCANNER_DATA_DIR:-$PWD/scanner/data}"
export SCANNER_SERVE_SITE="$PWD/site"
export SCANNER_PUBLIC_ORIGIN="${SCANNER_PUBLIC_ORIGIN:-http://127.0.0.1:8000}"
export SCANNER_ADMIN_KEY="${SCANNER_ADMIN_KEY:-dev}"
mkdir -p "$SCANNER_DATA_DIR"
cmd=(scanner/.venv/bin/uvicorn app.main:app --app-dir scanner --host 127.0.0.1 --port 8000)
if [ -f scanner/.env.dev ] && command -v op >/dev/null; then
  exec op run --env-file=scanner/.env.dev -- "${cmd[@]}"
fi
exec "${cmd[@]}"
