# OpenRegio - Cooperative Platform for Local Entrepreneurs

## Overview

OpenRegio is a Dutch cooperative platform designed to empower local entrepreneurs by offering an alternative to large tech platforms. It provides tools for business networking, AI-powered marketing, and a democratic governance model. Members can create profiles, collaborate, leverage AI for content and SEO, and participate in platform decision-making through a proposal voting system. The platform aims to foster a community-first approach with a professional, robust, and scalable full-stack application.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, using Vite for development and Wouter for routing. State management is handled by TanStack Query. Styling is implemented with Tailwind CSS, leveraging a custom design system based on shadcn/ui and Radix UI primitives, with a professional aesthetic and HSL-based color system supporting light/dark themes. Key patterns include atomic design and a multi-select onboarding flow.

### Backend Architecture

The backend uses Express.js with TypeScript, following a RESTful API design. It features stateless JWT-based authentication and Zod for request/response validation. Data access is abstracted via an `IStorage` interface, with `DbStorage` using Drizzle ORM for PostgreSQL and `MemStorage` for development. All entities use UUIDs as primary keys.

### Data Storage Solutions

PostgreSQL, accessed via Drizzle ORM, is the primary database. Key data models include business profiles, proposals, votes, blogs, activities, and user profiles with `pain points` and `onboarding_tokens`. For RAG, the `pgvector` extension stores `rag_documents`, `rag_chunks`, and `rag_embeddings` (1536-dimensional vectors from OpenAI's text-embedding-3-small). Leads data is also stored.

### Authentication and Authorization

The system implements JWT authentication with short-lived access tokens and rotating refresh tokens for security. `bcrypt` handles password hashing. Rate limiting is applied to login/registration. Role-Based Access Control (`requirePro`, `requireAdmin` middleware) restricts features by plan and admin status. All auth logic is consolidated in `server/jwtAuth.ts` — dead legacy files (`simpleAuth.ts`, `auth.ts`, `middleware/auth.ts`) have been removed. Admin detection uses `user.role === "admin" || user.role === "master"` (DB-driven, no hardcoded emails). The master account has `role: "master"`.

### Core Features

-   **RegioBot with RAG**: A regional WOO & Legal AI assistant using Retrieval-Augmented Generation for dossier-driven answers. It processes user-uploaded documents (PDF, images with OCR, text) by chunking and embedding them with OpenAI's `text-embedding-3-small`, storing them via `pgvector` for semantic search. Answers are generated using `gpt-4o-mini` with source citations. It focuses on wet- en regelgeving analysis, WOO-verzoeken, mandates, and authorities, explicitly refusing non-business queries. This is a PRO-exclusive feature.
-   **WOO Categories**: Enforced database categorization for WOO requests, allowing specific categories and blocking personal/non-business queries.
-   **Privacy & Consent Dashboard (AVG/GDPR Compliance)**: Allows users to manage data visibility, view consent logs, export data, and perform soft account deletion. PRO members have enhanced customization options.
-   **Affiliate System**: Tracks referrals and calculates recurring commissions for members.
-   **Object Storage**: Personal file storage for entrepreneurs using Replit's built-in Object Storage (Google Cloud Storage) with public and private directories, tracked in a `user_files` database table. It uses a two-step presigned URL upload flow.
-   **Email Integration**: Implemented via SMTP for welcome messages, password resets, notifications, and newsletters.
-   **TenderNed Integration**: Displays live public tenders from Dutch municipalities via the TenderNed public API, with in-memory caching and pre-filling based on user profiles.
-   **Brief Analyse**: An AI function using Gemini 2.5-flash (with gpt-4o-mini fallback) to analyze government letters, extracting key information like sender, document type, legal basis, and recommended actions.
-   **Gemeente-updates**: Displays official publications per municipality from the KOOP SRU API (overheid.nl), with in-memory caching and search functionality.
-   **Regio Deals**: Manages exclusive member deals and collective agreements via a `regio_deals` database table, with admin management and a dedicated member interface.
-   **Admin Cockpit**: Central admin dashboard at `/admin` with platform stats and navigation to all admin sections. Sub-pages: Woo-monitoring (`/admin/woo`), Regio-beheer (`/admin/regios`), Platform-inzicht (`/admin/inzicht`), Gebruikers (`/admin/users`), Blogs, Commissies, Regio Deals. All require `requireAdmin` middleware.

### Security and Observability

Security measures include HSTS, Content-Security-Policy, secure cookie settings, input sanitization, type validation, and secure file uploads with MIME type validation and random filenames. Observability features structured JSON logging for server errors and client-side error boundaries.

## Product Strategie — 3 Killer Features

- **Simpele regel**: Basis = kijken en meedoen, Pro = tools gebruiken en initiatieven starten
- **Feature matrix**:
  | Feature | Basis | Pro |
  |---|---|---|
  | Regio-inzicht | ✔ | ✔ uitgebreid |
  | Brief analyse | ✔ beperkt | ✔ volledig |
  | RegioBot | ✔ beperkt | ✔ onbeperkt |
  | Woo uitleg | ✔ | ✔ |
  | Woo-verzoek maken | ❌ | ✔ |
  | Woo dossiers | ❌ | ✔ |
  | Bedrijfsprofiel | ✔ basis | ✔ uitgebreid |
  | Website onderhoud | ❌ | ✔ |
  | Samenwerken meedoen | ✔ | ✔ |
  | Project starten | ❌ | ✔ |

## Homepage Redesign (March 2026)

Nieuwe 7-sectie opbouw op basis van structuurdocument:
- **Hero**: "Grip op regels, zichtbaarheid en ondernemerschap in je regio." — knoppen: Bekijk dashboard + Ontdek wat er speelt; hero-card met 4 feature-rijen
- **Het probleem**: 4 probleemkaarten (regels, brieven, digitaal, administratie)
- **Regio-analyse**: interactieve AI-tool (behouden)
- **Wat OpenRegio doet**: 3 grote oplossingsblokken (brieven/regels, zichtbaarheid, samenwerking)
- **GROW-sectie**: donkerblauwe sectie met G/R/O/W acronym
- **Dashboard uitleg**: uitleg + CSS-mockup van dashboard
- **Voor wie**: 4 doelgroepkaarten
- **Membership + CTA**: prijskaarten behouden, CTA aangepast naar "Start met OpenRegio"

## External Dependencies

-   **Database**: Neon Database (PostgreSQL), pgvector
-   **AI Integration**: OpenAI (text-embedding-3-small, gpt-4o-mini), Gemini 2.5-flash, tesseract.js (for OCR)
-   **UI Components**: Radix UI, shadcn/ui, Lucide React, cmdk, embla-carousel, vaul
-   **Build Tools**: Vite, esbuild, tsx
-   **Styling**: Tailwind CSS
-   **Utilities**: date-fns, clsx, tailwind-merge, zod, react-hook-form
-   **Object Storage**: Replit's built-in Object Storage (Google Cloud Storage)
-   **Email Service**: SMTP (via mail.mijndomein.nl)
-   **External APIs**: TenderNed public API, KOOP SRU API (overheid.nl)