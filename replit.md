# OpenRegio - Cooperative Platform for Local Entrepreneurs

## Overview

OpenRegio is a Dutch cooperative platform designed to empower local entrepreneurs by providing an alternative to large tech platforms. It facilitates business networking, offers AI-powered marketing tools, and implements a democratic governance model. Entrepreneurs can create profiles, collaborate, leverage AI for content and SEO, and participate in platform decision-making through a proposal voting system.

The project aims to foster a community-first approach with a professional full-stack application, ensuring a robust and scalable solution for its members.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, using Vite for development and Wouter for routing. State management is handled by TanStack Query, and styling is implemented with Tailwind CSS, leveraging a custom design system based on shadcn/ui and Radix UI primitives. The design emphasizes a professional aesthetic with Inter and Space Grotesk fonts and an HSL-based color system supporting light/dark themes. Key patterns include atomic design, a multi-select onboarding flow, and careful z-index management.

### Backend Architecture

The backend utilizes Express.js with TypeScript, adhering to a RESTful API design. It employs a stateless JWT-based authentication system for scalability and uses Zod for comprehensive request and response validation. The storage layer abstracts data access through an `IStorage` interface, with `DbStorage` using Drizzle ORM for PostgreSQL and `MemStorage` for development. All entities use UUIDs as primary keys.

### Data Storage Solutions

PostgreSQL is the primary database, accessed via the `pg` driver (node-postgres), with Drizzle ORM managing schema and queries. Database connection is in `db/index.ts`. Key data models include `Bedrijfsprofielen` (business profiles), `Proposals` for democratic governance, `Votes`, `Blogs`, `Activities`, and `User Profiles` with features like `pain points` for personalization and `onboarding_tokens` for secure initial access.

**RAG Vector Storage**: The platform uses pgvector extension for semantic document search. Tables:
- `rag_documents`: User-uploaded documents (PDF, images, text) with metadata including `woo_category`
- `rag_chunks`: Text chunks split on Dutch government document markers (Geachte, Betreft, Kenmerk, etc.)
- `rag_embeddings`: 1536-dimensional vectors from OpenAI text-embedding-3-small
- `leads`: Signup leads tracking with plan, region, and badge preferences

**Document Upload with OCR**: The WOO-bibliotheek supports uploading:
- PDF documents (direct text extraction)
- Images (JPG/PNG) with OCR via tesseract.js
- Plain text files
Documents are automatically processed through the RAG pipeline (chunking → embedding → storage).

### Authentication and Authorization

The system uses a robust JWT authentication flow with short-lived access tokens (httpOnly cookies) and rotating refresh tokens (stored in PostgreSQL) for enhanced security and scalability, suitable for high concurrent user loads. `bcrypt` is used for password hashing. Rate limiting is implemented for login and registration endpoints to prevent brute-force attacks. Role-Based Access Control (`requirePro` middleware) restricts certain features, like RegioBot, to Pro plan users.

### Core Features

-   **RegioBot with RAG**: A regional WOO & Legal AI assistant using Retrieval-Augmented Generation (RAG) for dossier-driven answers. Users upload PDF documents to their personal WOO-bibliotheek, which are chunked, embedded with OpenAI text-embedding-3-small, and stored using pgvector for semantic similarity search. The system uses gpt-4o-mini for answer generation with source citations. Focus: wet- en regelgeving analysis, WOO-verzoeken, mandaten, bevoegdheden. Explicitly refuses traffic violations, personal fines, and non-business-related queries. PRO-exclusive feature.
-   **WOO Categories**: Database-enforced categorization for WOO requests with 9 allowed categories (mandaat_delegatie, beleid_verordening, vergunningen, heffingen_leges, handhaving_kaders, aanbesteding, subsidies, uitvoering_partijen, openbaarheid_archief) and 1 blocked category (persoonlijk_verkeer_boete). Hard blocking via database trigger prevents non-business queries from entering the WOO library.
-   **Privacy & Consent Dashboard (AVG/GDPR Compliance)**: Enables users to manage per-field data visibility, view consent logs, export their data, and perform soft account deletion. This feature is enhanced for PRO members to allow customization of visibility settings.
-   **Affiliate System**: Allows users to refer new members and earn recurring commissions. It tracks referrals, calculates commissions, and provides an affiliate dashboard.

### Security and Observability

Security is a paramount concern, with comprehensive measures including HSTS, Content-Security-Policy, secure cookie settings, input sanitization, and type validation. File uploads are secured with MIME type validation and random filenames. Observability includes structured JSON logging for server errors and client-side error boundaries with user-friendly error displays and recovery options.

## Object Storage (IMPLEMENTED)

Personal file storage for entrepreneurs using Replit's built-in Object Storage (Google Cloud Storage):
- **Bucket ID**: replit-objstore-d1f0cf16-6b2b-44b9-9e66-6c8748d9c8b0
- **Public Directory**: /public (for publicly accessible files)
- **Private Directory**: /.private (for user-specific files with ACL)
- **Database Table**: `user_files` tracks uploaded files per user
- **Upload Flow**: Two-step presigned URL flow (metadata request → direct GCS upload)
- **API Endpoints**:
  - `POST /api/uploads/request-url` - Get presigned upload URL
  - `POST /api/user-files/register` - Register uploaded file
  - `GET /api/user-files` - List user's files
  - `DELETE /api/user-files/:id` - Delete a file
  - `GET /api/user-files/:id/download` - Download a file
- **Components**: `ObjectUploader.tsx`, `use-upload.ts` hook

## Email Integration (IMPLEMENTED)

E-mail functionaliteit is geïmplementeerd via SMTP:
- **Email adres**: info@openregio.nl
- **SMTP Host**: mail.mijndomein.nl
- **SMTP Port**: 587 (STARTTLS)
- **Geïmplementeerde functies**:
  - Welkomstberichten bij registratie
  - Wachtwoord reset emails
  - Notificatie emails (template gereed)
  - Nieuwsbrief emails (template gereed)
- **Environment variables**:
  - `SMTP_HOST` = mail.mijndomein.nl
  - `SMTP_PORT` = 587
  - `SMTP_USER` = info@openregio.nl
  - `SMTP_PASSWORD` = (secret)
  - `APP_BASE_URL` = https://openregio.replit.app

## Upload Policy

Document upload is available to all authenticated users with tiered limits:
- **Basic/Free**: 1 upload per day (enforced via `checkDailyUploadLimit` middleware in `server/routes.ts`)
- **Pro**: Unlimited uploads
- Middleware checks `rag_documents` table for today's uploads by the user
- RegioBot chat remains Pro-only

## Dashboard

Clean 3-card layout (single column, max-w-3xl):
1. **Regio-analyse** → links to /regio-analyse (public)
2. **Brief uploaden** → links to /woo-bibliotheek (auth required)
3. **WOO-verzoek maken** → links to /woo-wizard (auth required)
Admin section shown conditionally for admin users.

## Gemeenten (342 Municipalities)

The platform uses 342 official Dutch municipalities (CBS 2024) instead of regional groupings:
- `GEMEENTEN` in `shared/schema.ts` — flat array of all municipality names
- `PROVINCES_GEMEENTEN` — municipalities grouped by province (12 provinces)
- `PROVINCES_REGIONS` and `REGIONS` are backward-compatible aliases
- All dropdowns (bedrijfsprofiel, network, regiocrew) now show municipalities per province
- The `regio` field in `bedrijfsprofiel` stores the selected municipality name

## TenderNed Integratie

Live aanbestedingen van alle Nederlandse gemeenten via TenderNed public API:
- **Endpoint**: `GET /api/tenderned/aanbestedingen?gemeente=Amsterdam&limit=20`
- **Caching**: in-memory TTL-cache van 15 minuten per pagina
- **Frontend**: `/kansen/aanbestedingen` — zoek per gemeente, kaarten met deadline-badges
- **Pre-fill**: gemeente uit bedrijfsprofiel van ingelogde gebruiker
- **Geen API-key nodig** — TenderNed is volledig publiek

## Dashboard Menu Structuur (5 secties)

Sidebar met Dashboard + 4 collapsible hoofdsecties:
1. **Dashboard** — directe cockpit-link
2. **Informatie** — Regelmonitor (Beleidsmonitor), Regelkaart, RegioBot, Aanbestedingen (TenderNed), Gemeente-updates
3. **Actie** — Check mijn situatie, Documenten (WOO-bibliotheek), Juridische tools
4. **Zichtbaarheid** — Website onderhoud, Lokale vindbaarheid, Bedrijfsprofiel regio
5. **Samenwerken** — Vind partners, RegioCrew, Project starten

Regio Deals en Crowdfunding zijn uit het menu verwijderd (pagina's bestaan nog via directe URL).
Website onderhoud pagina op `/zichtbaarheid/website-onderhoud` met inhoud over "Digitale basis op orde".

## Gemeente-updates

Actuele officiële publicaties per gemeente via de KOOP SRU API (overheid.nl):
- **Endpoint**: `GET /api/gemeente-updates?gemeente=Amsterdam&limit=15`
- **Databron**: `repository.overheid.nl/sru` — officiële SRU-zoekmachine voor Gemeentebladen, raadsbesluiten, vergunningen en andere overheidspublicaties
- **Caching**: in-memory TTL-cache van 30 minuten per gemeente
- **Frontend**: `/kansen/gemeente-updates` — zoek per gemeente, kaarten met publicatietype-badge, datum, onderwerpen en link naar officielebekendmakingen.nl
- **Geen API-key nodig** — volledig publiek toegankelijk

## Regio Deals (IMPLEMENTED)

Exclusieve ledendeals en collectieve afspraken voor OpenRegio-leden:
- **Database tabel**: `regio_deals` (id, title, provider, category, description, discount, url, promo_code, valid_until, is_active, created_at)
- **Categories**: Software, Kantoor, Marketing, Verzekering, Energie, Overig
- **Ledenpagina**: `/kansen/regio-deals` — kaartweergave met categorie-filter, kortingsbadge, promocode kopieer-knop, "Claim deal" knop
- **Admin-beheer**: `/admin/regio-deals` — deals aanmaken, bewerken, actief/inactief schakelen, verwijderen
- **API Endpoints**:
  - `GET /api/regio-deals` — actieve deals (requireAuth)
  - `GET /api/regio-deals/all` — alle deals incl. inactief (requireAdmin)
  - `POST /api/regio-deals` — nieuwe deal aanmaken (requireAdmin)
  - `PUT /api/regio-deals/:id` — deal bijwerken (requireAdmin)
  - `DELETE /api/regio-deals/:id` — deal verwijderen (requireAdmin)
- **Admin sidebar**: link "Regio Deals" in Beheer-sectie
- **Voorbeelddeal**: 3 deals toegevoegd (Twinfield, Hollandia Koffie, LinkedIn)

## Pending Tasks

(Geen openstaande taken)

## External Dependencies

-   **Database**: Neon Database (PostgreSQL)
-   **AI Integration**: OpenAI (text-embedding-3-small for RAG embeddings, gpt-4o-mini for chat), pgvector for vector similarity search
-   **UI Components**: Radix UI, shadcn/ui, Lucide React, cmdk, embla-carousel, vaul
-   **Build Tools**: Vite, esbuild, tsx
-   **Styling**: Tailwind CSS
-   **Utilities**: date-fns, clsx, tailwind-merge, zod, react-hook-form