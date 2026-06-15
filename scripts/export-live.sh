#!/usr/bin/env bash
# export-live.sh — code-review zip (geschikt voor ChatGPT)
# Gebruik: bash scripts/export-live.sh
# Output: openregio-live.zip (in projectroot)
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
node "$DIR/export-live.mjs"
