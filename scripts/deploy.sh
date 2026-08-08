#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# OpenRegio — deploy naar een OTAP-omgeving via SSH.
# Gebruik:  scripts/deploy.sh <test|acceptatie|productie> <image-tag>
#
# SJABLOON: vul de host-gegevens in als GitHub Environment-secrets
# (DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY). Zolang die ontbreken
# stopt het script bewust met een duidelijke melding.
#
# Aanname: op de doelserver staat deze repo met docker-compose.*.yml
# en env/<stage>.env klaar in /opt/openregio.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

STAGE="${1:?stage ontbreekt (test|acceptatie|productie)}"
IMAGE_TAG="${2:?image-tag ontbreekt}"
REMOTE_DIR="${REMOTE_DIR:-/opt/openregio}"

case "$STAGE" in
  test)       COMPOSE_OVERRIDE="docker-compose.test.yml";       PROJECT="openregio-test" ;;
  acceptatie) COMPOSE_OVERRIDE="docker-compose.acceptatie.yml"; PROJECT="openregio-acc"  ;;
  productie)  COMPOSE_OVERRIDE="docker-compose.productie.yml";  PROJECT="openregio-prod" ;;
  *) echo "Onbekende stage: $STAGE" >&2; exit 2 ;;
esac

if [[ -z "${DEPLOY_HOST:-}" || -z "${DEPLOY_USER:-}" || -z "${DEPLOY_SSH_KEY:-}" ]]; then
  echo "─────────────────────────────────────────────────────────" >&2
  echo "Deploy-secrets ontbreken voor stage '$STAGE'." >&2
  echo "Vul DEPLOY_HOST / DEPLOY_USER / DEPLOY_SSH_KEY in als" >&2
  echo "GitHub Environment-secrets. Zie DEPLOY.md, sectie CI/CD." >&2
  echo "─────────────────────────────────────────────────────────" >&2
  exit 1
fi

echo "[deploy] Stage=$STAGE  Tag=$IMAGE_TAG  Host=$DEPLOY_HOST"

KEYFILE="$(mktemp)"
trap 'rm -f "$KEYFILE"' EXIT
printf '%s' "$DEPLOY_SSH_KEY" > "$KEYFILE"
chmod 600 "$KEYFILE"

ssh -i "$KEYFILE" -o StrictHostKeyChecking=accept-new \
  "${DEPLOY_USER}@${DEPLOY_HOST}" bash -s -- \
  "$REMOTE_DIR" "$PROJECT" "$COMPOSE_OVERRIDE" "$STAGE" "$IMAGE_TAG" <<'REMOTE'
set -euo pipefail
REMOTE_DIR="$1"; PROJECT="$2"; OVERRIDE="$3"; STAGE="$4"; TAG="$5"
cd "$REMOTE_DIR"
git pull --ff-only
export ENV_FILE="env/${STAGE}.env"
docker compose -p "$PROJECT" --env-file "env/${STAGE}.env" \
  -f docker-compose.yml -f "$OVERRIDE" pull || true
docker compose -p "$PROJECT" --env-file "env/${STAGE}.env" \
  -f docker-compose.yml -f "$OVERRIDE" up -d --build
docker image prune -f
echo "[deploy] Klaar op $(hostname) voor stage ${STAGE} (tag ${TAG})."
REMOTE
