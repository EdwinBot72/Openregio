#!/usr/bin/env bash
# export-clean.sh — schone Replit-upload zip (alleen broncode)
# Gebruik: bash scripts/export-clean.sh
# Output: openregio-clean.zip (in projectroot)
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
node "$DIR/export-clean.mjs"
