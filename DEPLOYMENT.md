# OpenRegio Deployment Guide

## Database Setup voor Deployment

### Probleem
Bij deployment moet de production database gesynchroniseerd worden met het schema. Dit gebeurt niet automatisch.

### Oplossing

**Optie 1: Automatische Database Sync (Aanbevolen)**

1. Ga naar de **Deployments** tab in Replit
2. Open de **Console** voor je deployment
3. Voer uit: `npx drizzle-kit push --force`
4. Dit synchroniseert de production database met je schema

**Optie 2: Handmatige .replit configuratie**

Update `.replit` deployment configuratie om automatisch migrations te runnen:

```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["sh", "scripts/deploy.sh"]
```

Het deploy script (`scripts/deploy.sh`) is al aangemaakt en voert automatisch database migrations uit voor deployment.

### Vereiste Environment Variables voor Deployment

Zorg ervoor dat de volgende secrets zijn ingesteld in de **Deployments** tab:

**Verplicht:**
- `DATABASE_URL` - Automatisch ingesteld door Replit
- `SESSION_SECRET` - Voor sessie encryptie
- `MOLLIE_API_KEY` - Voor betalingen (gebruik test key voor testing, live key voor productie)

**Optioneel:**
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Voor RegioBot (automatisch ingesteld)
- `MOLLIE_PROFILE_ID` - Mollie profiel ID

### Database Schema Status

✅ **Development Database**: Volledig gesynchroniseerd
- Alle tabellen aangemaakt inclusief `onboarding_tokens`
- Master account `edwin@stroombox.nl` bestaat
- Constraints en indexen zijn correct

✅ **Schema Definities**: Alle tabellen gedefinieerd in `shared/schema.ts`
- users (met onboarding_token kolom)
- onboarding_tokens (aparte tabel voor tokens)
- bedrijfsprofielen
- subscriptions
- documents
- proposals, votes
- En meer...

### Deployment Checklist

- [x] Database provisioned
- [x] Schema gedefinieerd in `shared/schema.ts`
- [x] Development database gesynchroniseerd
- [x] Deploy script aangemaakt (`scripts/deploy.sh`)
- [ ] Production database synchroniseren (via deployment console)
- [ ] Environment variables instellen in Deployments tab
- [ ] .replit configuratie updaten (optioneel, handmatig)

### Veelvoorkomende Problemen

**Error: "onboarding_tokens table does not exist"**
- Oplossing: Run `npx drizzle-kit push --force` in deployment console

**Error: "users_email_unique constraint already exists"**
- Dit is normaal, de constraint bestaat al
- De database is al gesynchroniseerd

**Error: "DATABASE_URL not set"**
- Oplossing: Replit stelt dit automatisch in bij deployment
- Check dat PostgreSQL module is toegevoegd in .replit

### Database Management Scripts

```bash
# Sync schema to database (development)
npm run db:push

# Force sync (skip confirmations)
npm run db:push -- --force

# Check TypeScript types
npm run check
```

## Deployment Proces

1. **Build**: `npm run build` - Compileert frontend en backend
2. **Migrations**: `scripts/deploy.sh` - Synchroniseert database schema
3. **Start**: `npm run start` - Start productie server op poort 5000

## Contact

Voor vragen over deployment: info@openregio.nl
