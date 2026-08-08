#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# OpenRegio — live API-keys invullen voor productie.
# Vraagt om elke key en schrijft ze naar env/productie.env.
# Laat je een key leeg (Enter), dan blijft de huidige waarde staan.
# Draai vanuit /opt/openregio:  ./scripts/set-prod-keys.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

ENV_FILE="env/productie.env"
[ -f "$ENV_FILE" ] || { echo "Niet gevonden: $ENV_FILE (draai vanuit /opt/openregio)"; exit 1; }

# Zet/vervang een KEY=waarde regel in het env-bestand.
set_key() {
  local key="$1" val="$2"
  local tmp; tmp="$(mktemp)"
  grep -v "^${key}=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$key" "$val" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
}

# Vraag een waarde; toon of er al iets ingevuld is. Leeg = overslaan.
ask() {
  local key="$1" label="$2" cur
  cur="$(grep "^${key}=" "$ENV_FILE" | cut -d= -f2- || true)"
  local status="leeg"; [ -n "$cur" ] && status="al ingevuld"
  printf '\n%s\n  (%s) — plak de waarde of Enter om over te slaan:\n> ' "$label" "$status"
  local input; read -r input
  if [ -n "$input" ]; then set_key "$key" "$input"; echo "  ✓ opgeslagen"; else echo "  – overgeslagen"; fi
}

echo "═══════════════════════════════════════════════"
echo " OpenRegio — live keys invullen (productie)"
echo " Laat leeg wat je (nog) niet hebt."
echo "═══════════════════════════════════════════════"

ask MOLLIE_API_KEY               "Mollie LIVE key (betalingen) — begint met live_"
ask POSTMARK_API_KEY             "Postmark API-key (e-mail) — of gebruik SMTP hieronder"
ask SMTP_HOST                    "SMTP host (bv. mail.mijndomein.nl)"
ask SMTP_USER                    "SMTP gebruikersnaam (bv. info@openregio.nl)"
ask SMTP_PASS                    "SMTP wachtwoord"
ask OPENAI_API_KEY               "OpenAI key (RegioBot, Brief Analyse) — begint met sk-"
ask AI_INTEGRATIONS_GEMINI_API_KEY "Gemini key (Kansen-radar)"
ask GOOGLE_PLACES_API_KEY        "Google Places key (locatie-autocomplete)"

echo
echo "Herstarten van productie zodat de keys actief worden..."
ENV_FILE="$ENV_FILE" docker compose -p openregio-prod --env-file "$ENV_FILE" \
  -f docker-compose.yml -f docker-compose.productie.yml up -d --force-recreate >/dev/null
echo "✓ Klaar — productie draait met de nieuwe keys."
