# OpenRegio — OTAP deploy-handleiding

Deze repo heeft een ontwikkelstraat met vier omgevingen:

| Omgeving   | Waar            | Branch       | App-poort | DB-poort | Keys        |
|------------|-----------------|--------------|-----------|----------|-------------|
| Ontwikkel  | lokaal (laptop) | `feature/*`  | 5000      | lokaal   | test        |
| Test       | Docker          | `develop`    | 5001      | 5433     | test        |
| Acceptatie | Docker          | `acceptatie` | 5002      | 5434     | test/prod-like |
| Productie  | Docker          | `main`       | 5000      | intern   | live        |

Promotie loopt één kant op: **Ontwikkel → Test → Acceptatie → Productie**.

---

## 1. Vereisten op een server

- Docker Engine + Docker Compose v2
- Git
- De repo uitgecheckt in `/opt/openregio` (of pas `REMOTE_DIR` aan)

Installeer Docker (Debian/Ubuntu):

```bash
curl -fsSL https://get.docker.com | sh
```

## 2. Omgeving klaarzetten

Per omgeving één keer het env-bestand aanmaken uit het voorbeeld:

```bash
cp env/test.env.example env/test.env
# vul minimaal DATABASE_URL (staat al goed) + SESSION_SECRET in:
openssl rand -hex 32
```

`env/*.env` staat in `.gitignore` en wordt nooit gecommit.

## 3. Een straat starten

Via de Makefile (aanbevolen):

```bash
make test-up        # bouwt image + start app (:5001) + db (:5433)
make db-push-test   # databaseschema synchroniseren (drizzle-kit push)
make test-logs      # logs volgen
make test-down      # stoppen
```

Zelfde patroon voor Acceptatie (`acc-up`, `db-push-acc`) en Productie
(`prod-up`, `db-push-prod`).

Handmatig equivalent (Test):

```bash
ENV_FILE=env/test.env docker compose -p openregio-test \
  --env-file env/test.env -f docker-compose.yml -f docker-compose.test.yml \
  up -d --build
```

## 4. Database & migraties

- **Bij elke start** draait `runMigrations()` in de app automatisch een reeks
  idempotente `ALTER TABLE ... IF NOT EXISTS`-migraties (`server/db-migrate.ts`).
- **Volledige schema-sync** doe je expliciet met `make db-push-<stage>`
  (`drizzle-kit push`). Draai dit na schemawijzigingen in `shared/schema.ts`.
- De database draait als aparte container met `pgvector/pgvector:pg16`
  (pgvector is nodig voor RegioBot/RAG). Data staat in een Docker-volume per
  project (`openregio-test_db-data`, enz.).

## 5. CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` doet bij een push:

1. `npm ci` + `npm run check` (typecheck)
2. Docker-image bouwen en pushen naar GHCR
3. Deploy-job voor de bijbehorende omgeving

Branch → omgeving: `develop`→Test, `acceptatie`→Acceptatie, `main`→Productie.

### Approval-gates instellen

Maak in GitHub (Settings → Environments) drie environments aan: `test`,
`acceptatie`, `productie`. Zet bij `acceptatie` en `productie` **Required
reviewers**, zodat productie-deploys eerst goedgekeurd worden.

### Deploy-secrets (per environment)

| Secret            | Betekenis                       |
|-------------------|---------------------------------|
| `*_DEPLOY_HOST`   | server-hostnaam of IP           |
| `*_DEPLOY_USER`   | SSH-gebruiker                   |
| `*_DEPLOY_SSH_KEY`| private SSH-sleutel (deploy key) |

Zolang deze ontbreken stopt `scripts/deploy.sh` bewust met een duidelijke
melding — de build/publish-stap blijft wel gewoon werken.

## 6. Reverse proxy / TLS (productie)

De app luistert op poort 5000. Zet er in productie een reverse proxy voor
(Caddy of Nginx) die TLS termineert en `www.openregio.nl` doorstuurt naar
`127.0.0.1:5000`. De DB-poort wordt in productie niet naar buiten geëxposeerd.

## 7. Losmaken van Replit (aandachtspunten)

- **Object storage**: nu Replit/GCS. Voor eigen hosting koppelen aan een
  S3-compatibele bucket of lokale opslag.
- **Secrets**: van Replit Secrets naar env-bestanden / secret-manager.
- **Replit vite-plugins**: worden in productie automatisch overgeslagen
  (`REPL_ID` niet gezet), dus de Docker-build is schoon.

## 8. Snelle rooktest na deploy

```bash
curl -I http://localhost:5001/         # Test → HTTP 200
docker compose -p openregio-test logs app | tail -30
```
