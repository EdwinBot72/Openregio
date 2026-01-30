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

PostgreSQL is the primary database, accessed via the Neon serverless driver, with Drizzle ORM managing schema and queries. Key data models include `Bedrijfsprofielen` (business profiles), `Proposals` for democratic governance, `Votes`, `Blogs`, `Activities`, and `User Profiles` with features like `pain points` for personalization and `onboarding_tokens` for secure initial access.

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

## Pending Tasks

(Geen openstaande taken)

## External Dependencies

-   **Database**: Neon Database (PostgreSQL)
-   **AI Integration**: OpenAI (text-embedding-3-small for RAG embeddings, gpt-4o-mini for chat), pgvector for vector similarity search
-   **UI Components**: Radix UI, shadcn/ui, Lucide React, cmdk, embla-carousel, vaul
-   **Build Tools**: Vite, esbuild, tsx
-   **Styling**: Tailwind CSS
-   **Utilities**: date-fns, clsx, tailwind-merge, zod, react-hook-form