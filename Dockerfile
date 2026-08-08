# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
# OpenRegio — multi-stage build
#   builder : installeert ALLE deps (incl. dev) + bouwt client & server.
#             Bevat drizzle-kit → wordt door de migrate-service gebruikt.
#   runtime : productie-image; hergebruikt node_modules + dist uit "builder",
#             dus GEEN tweede npm-install (scheelt geheugen en tijd).
# Let op: de server-bundle laadt vite.config.ts eager in, die dev-plugins
# (@vitejs/plugin-react e.d.) importeert. Daarom NIET prunen — de volledige
# node_modules blijven nodig om te booten. Slankere image kan later door de
# vite-import in server/vite.ts lazy te maken.
# Gebruikt door de OTAP-straat (Test / Acceptatie / Productie).
# ─────────────────────────────────────────────────────────────

# ---- Builder ----------------------------------------------------
FROM node:22-slim AS builder
WORKDIR /app
ENV NODE_ENV=development

# Dependencies eerst (betere layer-caching)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Broncode + build (vite build -> dist/public, esbuild -> dist/index.js)
COPY . .
RUN npm run build

# ---- Runtime ----------------------------------------------------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# tini voor correcte signal-handling (SIGTERM -> nette shutdown)
RUN apt-get update \
 && apt-get install -y --no-install-recommends tini \
 && rm -rf /var/lib/apt/lists/*

# Hergebruik de reeds gebouwde artefacten (geen npm-install meer)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/migrations ./migrations

# Uploads-map (wordt als volume gemount per omgeving)
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

EXPOSE 5000
USER node
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/index.js"]
