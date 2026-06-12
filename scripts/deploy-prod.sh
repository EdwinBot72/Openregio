#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  OpenRegio — deploy:prod script
#  Gebruik: npm run deploy:prod
#  Of direct: bash scripts/deploy-prod.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[deploy]${NC} $*"; }
success() { echo -e "${GREEN}[deploy] ✓${NC} $*"; }
warn()    { echo -e "${YELLOW}[deploy] ⚠${NC} $*"; }
fail()    { echo -e "${RED}[deploy] ✗${NC} $*"; exit 1; }

# ── 1. Vereiste env-variabelen checken ────────────────────────────────────────
info "Omgevingsvariabelen controleren..."
MISSING=()
for VAR in DATABASE_URL SESSION_SECRET; do
  [ -z "${!VAR:-}" ] && MISSING+=("$VAR")
done
if [ ${#MISSING[@]} -gt 0 ]; then
  fail "Ontbrekende vereiste variabelen: ${MISSING[*]}"
fi
success "Vereiste env-variabelen aanwezig"

for OPT in MOLLIE_API_KEY POSTMARK_API_KEY PUBLIC_BASE_URL OPENAI_API_KEY GEMINI_API_KEY; do
  [ -z "${!OPT:-}" ] && warn "Optionele variabele niet ingesteld: $OPT"
done

# ── 2. TypeScript check ───────────────────────────────────────────────────────
info "TypeScript check draaien (npm run check)..."
npm run check || fail "TypeScript fouten gevonden — deploy gestopt"
success "TypeScript check geslaagd"

# ── 3. Productiebuild ─────────────────────────────────────────────────────────
info "Productiebuild (npm run build)..."
npm run build || fail "Build mislukt — deploy gestopt"
success "Build geslaagd → dist/"

# ── 4. Database migraties ─────────────────────────────────────────────────────
info "Database migraties controleren (db:push)..."
if npm run db:push --if-present 2>/dev/null; then
  success "Database schema up-to-date"
else
  warn "db:push niet beschikbaar of mislukt — handmatig controleren"
fi

# ── 5. Builduitvoer verifiëren ────────────────────────────────────────────────
info "Builduitvoer verifiëren..."
[ -f "dist/index.js" ]        || fail "dist/index.js ontbreekt"
[ -d "dist/public" ]          || fail "dist/public ontbreekt"
[ -f "dist/public/index.html" ] || fail "dist/public/index.html ontbreekt"
success "Builduitvoer compleet"

# ── 6. Samenvatting & instructies ────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  OpenRegio build klaar voor productie-deploy          ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Replit Deploy (aanbevolen):${NC}"
echo "  Klik op 'Deploy' in de Replit-interface."
echo "  Replit beheert TLS, health checks en rolling updates automatisch."
echo "  Startcommando: NODE_ENV=production node dist/index.js"
echo ""
echo -e "${CYAN}VPS / eigen server (PM2):${NC}"
echo "  # Vereisten: Node.js 20+, PM2 (npm install -g pm2)"
echo "  # Kopieer dist/ en package.json naar de server, stel .env in"
echo ""
echo "  pm2 start dist/index.js \\"
echo "    --name openregio \\"
echo "    --interpreter node \\"
echo "    --time \\"
echo "    --env production \\"
echo "    -- NODE_ENV=production"
echo ""
echo "  pm2 save && pm2 startup  # voor herstart na reboot"
echo ""
echo -e "${CYAN}Healthcheck na deploy:${NC}"
echo "  curl https://jouw-domein.nl/api/healthz"
echo "  # Verwacht: { \"ok\": true, \"database\": \"ok\", ... }"
echo ""
echo -e "${CYAN}Nginx reverse-proxy (minimaal):${NC}"
echo "  server {"
echo "    listen 443 ssl;"
echo "    server_name jouw-domein.nl;"
echo "    location / { proxy_pass http://localhost:5000; }"
echo "    location /api/healthz { proxy_pass http://localhost:5000; }"
echo "  }"
echo ""
