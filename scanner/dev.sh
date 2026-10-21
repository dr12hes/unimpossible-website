#!/usr/bin/env bash
# Serve the API and site together; 1Password resolves secrets directly into the process environment.
set -euo pipefail
cd "$(dirname "$0")/.."
cmd=(env "SCANNER_DATA_DIR=${SCANNER_DATA_DIR:-$PWD/scanner/data}"
  "SCANNER_SERVE_SITE=$PWD/site"
  "SCANNER_PUBLIC_ORIGIN=${SCANNER_PUBLIC_ORIGIN:-http://127.0.0.1:8000}"
  "SCANNER_MAIL_OUTBOX=${SCANNER_MAIL_OUTBOX:-0}"
  scanner/.venv/bin/uvicorn app.main:app --app-dir scanner --host 127.0.0.1 --port 8000)
exec op run --env-file="${SCANNER_ENV_REFS:-deploy/scanner.env.1password}" -- "${cmd[@]}"
