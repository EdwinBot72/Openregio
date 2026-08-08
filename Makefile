# ─────────────────────────────────────────────────────────────
# OpenRegio — OTAP-bediening
# Ontwikkel = lokaal (npm run dev). Test/Acceptatie/Productie = Docker.
# ─────────────────────────────────────────────────────────────

COMPOSE := docker compose
BASE    := -f docker-compose.yml

# Per-straat variabelen: projectnaam, env-file, override-file
TEST_ENV := env/test.env
ACC_ENV  := env/acceptatie.env
PROD_ENV := env/productie.env

test_cmd = ENV_FILE=$(TEST_ENV) $(COMPOSE) -p openregio-test --env-file $(TEST_ENV) $(BASE) -f docker-compose.test.yml
acc_cmd  = ENV_FILE=$(ACC_ENV)  $(COMPOSE) -p openregio-acc  --env-file $(ACC_ENV)  $(BASE) -f docker-compose.acceptatie.yml
prod_cmd = ENV_FILE=$(PROD_ENV) $(COMPOSE) -p openregio-prod --env-file $(PROD_ENV) $(BASE) -f docker-compose.productie.yml

.PHONY: help
help:
	@echo "OpenRegio OTAP-commando's:"
	@echo "  make dev            - lokale ontwikkelserver (npm run dev, poort 5000)"
	@echo "  make test-up        - Test-straat starten/bouwen (app :5001, db :5433)"
	@echo "  make test-down      - Test-straat stoppen"
	@echo "  make test-logs      - Test-logs volgen"
	@echo "  make db-push-test   - Databaseschema pushen naar Test"
	@echo "  make acc-up         - Acceptatie starten (app :5002, db :5434)"
	@echo "  make acc-down       - Acceptatie stoppen"
	@echo "  make db-push-acc    - Databaseschema pushen naar Acceptatie"
	@echo "  make prod-up        - Productie starten (app :5000)"
	@echo "  make prod-down      - Productie stoppen"
	@echo "  make db-push-prod   - Databaseschema pushen naar Productie"

# ── Ontwikkel (lokaal, geen Docker) ─────────────────────────────
.PHONY: dev
dev:
	npm run dev

# ── Test ────────────────────────────────────────────────────────
.PHONY: test-up test-down test-logs db-push-test
test-up:      ; $(test_cmd) up -d --build
test-down:    ; $(test_cmd) down
test-logs:    ; $(test_cmd) logs -f app
db-push-test: ; $(test_cmd) --profile tools run --rm migrate

# ── Acceptatie ──────────────────────────────────────────────────
.PHONY: acc-up acc-down acc-logs db-push-acc
acc-up:       ; $(acc_cmd) up -d --build
acc-down:     ; $(acc_cmd) down
acc-logs:     ; $(acc_cmd) logs -f app
db-push-acc:  ; $(acc_cmd) --profile tools run --rm migrate

# ── Productie ───────────────────────────────────────────────────
.PHONY: prod-up prod-down prod-logs db-push-prod
prod-up:      ; $(prod_cmd) up -d --build
prod-down:    ; $(prod_cmd) down
prod-logs:    ; $(prod_cmd) logs -f app
db-push-prod: ; $(prod_cmd) --profile tools run --rm migrate
