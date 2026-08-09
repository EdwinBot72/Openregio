#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# OpenRegio — AI-sleutels invullen voor de TEST-straat.
# Vraagt om je sleutel(s) en schrijft ze naar env/test.env.
# Leeg laten (Enter) = huidige waarde behouden. De sleutel wordt
# NIET op het scherm getoond en NIET gedeeld.
# Draai vanuit /opt/openregio:  ./scripts/set-test-keys.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

ENV_FILE="env/test.env"
[ -f "$ENV_FILE" ] || { echo "Niet gevonden: $ENV_FILE (draai vanuit /opt/openregio)"; exit 1; }

set_key() {
  local key="$1" val="$2" tmp
  tmp="$(mktemp)"
  grep -v "^${key}=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$key" "$val" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
}

ask_secret() {
  local key="$1" label="$2" cur input
  cur="$(grep "^${key}=" "$ENV_FILE" | cut -d= -f2- || true)"
  local status="leeg"; [ -n "$cur" ] && status="al ingevuld"
  printf '\n%s\n  (%s) — plak de sleutel (wordt niet getoond) of Enter om over te slaan:\n> ' "$label" "$status"
  read -rs input; echo
  if [ -n "$input" ]; then set_key "$key" "$input"; echo "  ✓ opgeslagen"; else echo "  – overgeslagen"; fi
}

echo "═══════════════════════════════════════════════"
echo " OpenRegio — AI-sleutels invullen (TEST)"
echo "═══════════════════════════════════════════════"

ask_secret OPENAI_API_KEY                "OpenAI key (RegioBot + brieven-motor) — begint met sk-"
ask_secret AI_INTEGRATIONS_GEMINI_API_KEY "Gemini key (Brief Analyse) — optioneel"

echo
echo "Test-straat herstarten zodat de sleutels actief worden..."
ENV_FILE="$ENV_FILE" docker compose -p openregio-test --env-file "$ENV_FILE" \
  -f docker-compose.yml -f docker-compose.test.yml up -d --force-recreate >/dev/null
echo "✓ Klaar — test draait met de nieuwe sleutel(s)."
echo "  Test nu RegioBot op https://test.openregio.nl/regiobot"
