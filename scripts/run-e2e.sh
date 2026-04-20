#!/usr/bin/env bash
# Run the OpenRegio Playwright e2e suite against a running dev/preview server.
#
# Usage:
#   scripts/run-e2e.sh                # runs against http://localhost:5000
#   E2E_BASE_URL=https://staging ./scripts/run-e2e.sh
#
# In CI, set E2E_BASE_URL to the deployment under test, or start `npm run dev`
# in the background before invoking this script.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found — install Node.js first" >&2
  exit 1
fi

# Ensure browsers are present (idempotent, fast when already installed)
npx --yes playwright install chromium >/dev/null

exec npx --yes playwright test "$@"
