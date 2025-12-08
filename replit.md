# OpenRegio - Cooperative Platform for Local Entrepreneurs

## Overview

OpenRegio is a Dutch cooperative platform empowering local entrepreneurs by offering an alternative to large tech platforms. It integrates business networking, AI-powered marketing, and democratic governance. The platform enables entrepreneurs to create visible profiles, collaborate, utilize AI tools for content and SEO, and participate in cooperative decision-making through proposal voting.

The application features a full-stack architecture with a React frontend, Express backend, and PostgreSQL database (via Neon), emphasizing professionalism and a community-first design.

## Deployment Status

**Beta-Ready**: ✅ All features implemented and tested
**Database**: ✅ PostgreSQL provisioned and schema synchronized (development)
**Production Deployment**: ⚠️ Requires manual database migration step (see DEPLOYMENT.md)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript
- Vite for building and development
- Wouter for routing
- TanStack Query for server state management
- Tailwind CSS for styling with a custom design system built on shadcn/ui.

**Design System:**
- Custom theme based on shadcn/ui components (Radix UI primitives).
- Typography: Inter (body) and Space Grotesk (headings).
- HSL-based color system with CSS variables for light/dark themes.
- Consistent spacing units.
- Component variants using `class-variance-authority`.

**Key Features & Patterns:**
- Atomic design approach for components.
- Onboarding flow with multi-select pain point tiles using React Hook Form.
- Z-index hierarchy for proper layering of UI elements (e.g., dialogs over maps).
- Dynamic category fetching with robust error handling and form pre-population logic.

### Backend Architecture

**Technology Stack:**
- Express.js with TypeScript
- RESTful API design
- Session-based architecture
- Modular route registration.

**API Design:**
- Resource-based endpoints for entrepreneurs, categories, business profiles, proposals, activities, stats, RegioBot interactions, and user profiles.
- Supports CRUD operations and specific actions like voting on proposals.
- Authentication with session-based `userId`.
- Zod schema validation for all requests and responses.
- Consistent error handling with appropriate HTTP status codes.

**Storage Layer:**
- `IStorage` interface for data access abstraction.
- `DbStorage` using Drizzle ORM for PostgreSQL (production).
- `MemStorage` for development.
- UUID-based primary keys.
- Performance optimizations using batch queries (e.g., `inArray` for proposal summaries).
- Seed data for development environment.

**Middleware Stack:**
- JSON body parsing.
- Request logging.
- Vite middleware integration for HMR in development.

### Data Storage Solutions

**Database:**
- PostgreSQL via Neon serverless driver.
- WebSocket support for real-time connections.

**ORM and Schema:**
- Drizzle ORM for type-safe queries.
- Schema-first approach with TypeScript types and Drizzle Kit for migrations.
- Zod integration for runtime validation.

**Data Models:**
- **Entrepreneurs**: Legacy business profiles.
- **Bedrijfsprofielen**: New Dutch-first business profile model with fields like `naam`, `eigenaarnaam`, `categorieId`, `beschrijving`, `stemtoon`, and `status` (concept, actief, inactief). One-to-one relationship with users.
- **Proposals**: For democratic governance, including `title`, `description`, `proposerId`, `status`, and `closesAt`. Separate `Votes` table for user votes.
- **Votes**: Records user votes on proposals, ensuring uniqueness per user per proposal.
- **Activities**: For tracking user engagement.
- **User Profiles**: Including `pain points` for personalized onboarding.
- **Onboarding Tokens**: Secure, time-limited tokens for initial login post-payment integration.
- Timestamps (`createdAt`) for all entities.

### Authentication and Authorization

**Custom Authentication:**
- Session-based using `express-session` and `connect-pg-simple`.
- `bcrypt` for password hashing.
- Cookie-based session management with `httpOnly` and `secure` flags.
- API endpoints for registration, login, logout, and fetching the current user.
- User data model includes `email`, `passwordHash`, `plan`, `firstName`, `lastName`, and `mustCompleteOnboarding`.
- `attachUser` and `requireAuth` middleware for session and authentication management.

**Token-Based Onboarding:**
- `onboarding_tokens` table for secure first login after Mollie payment.
- Webhook integration to create users and tokens.
- API endpoints for token validation and completing onboarding.
- `requireOnboardingDone` middleware for redirecting new users.

**Role-Based Access Control:**
- `requirePro` middleware restricts features (e.g., RegioBot) to Pro plan users.
- Frontend displays upgrade prompts for Basic users.

**Document Upload System:**
- Multer-based file upload middleware with type validation and size limits (10MB).
- `Documents` table stores metadata.
- Supports PDF, Word, TXT, JPEG, PNG.
- User-specific folder structure (`/uploads/{userId}/`).
- API endpoints for uploading and retrieving user documents (Pro-only).

**RegioBot Modes (BLOK 6 - Completed):**
- Three specialized modes for different business needs:
  - **General**: Algemene bedrijfsassistent voor SEO, strategieën en zakelijke processen
  - **Legal**: Juridische uitleg-assistent (GEEN formeel advies) voor documenten en brieven in begrijpelijke taal
  - **Marketing**: AI-marketeer voor social posts, blogs en aanbiedingen
- Mode-based system prompts with detailed instructions per mode
- Frontend UI with Tabs component for mode selection (Algemeen, Juridisch, Marketing)
- Each mode has unique welcome message and quick action buttons
- Conversation history support for better context in longer chats
- Mode switching resets conversation with new welcome message
- All features remain Pro-only via `requirePro` middleware

**Beta-Ready UI & Legal (BLOK 7 - Completed):**
- **Homepage (/):**
  - Professional hero section with value proposition
  - Two clear CTA buttons: "Word Basis lid – €9,95" and "Word Pro – €19,95 (incl. RegioBot)"
  - Inloggen button in top-right navigation
  - Feature cards showcasing Lokaal Netwerk, RegioBot AI, and Democratisch Platform
  - Testimonials section with social proof
  - Membership plan comparison section with detailed features
  - Footer with platform links, juridisch section (privacy/voorwaarden), and contact info
- **Dashboard (/dashboard):**
  - Personalized welcome with business name from bedrijfsprofiel
  - Plan badge showing BASIC or PRO status
  - Plan info display below welcome message
  - Navigation via sidebar to all features
  - Contextual recommendations based on user pain points
- **Legal Pages:**
  - /privacy: AVG-compliant privacy statement covering data collection, usage, security, and user rights
  - /voorwaarden: General terms covering membership, payment, platform use, liability (including RegioBot disclaimer), and applicable law
  - Both pages have professional layout with back-to-home navigation
  - Footer links to legal pages on all public pages
- **Security Hardening (Privacy-First):**
  - Security headers middleware (`server/middleware/security.ts`):
    - HSTS (Strict-Transport-Security)
    - Content-Security-Policy (strict in production, geen unsafe-inline/eval voor scripts)
    - X-Frame-Options: DENY
    - X-Content-Type-Options: nosniff
    - Referrer-Policy: strict-origin-when-cross-origin
  - Session management:
    - 24-hour timeout (privacy-first)
    - Secure cookies (httpOnly, SameSite=strict in production)
    - Rolling sessions for idle timeout
  - Upload security:
    - Random filenames (UUID-based, geen client info)
    - MIME type validation tegen extensie
    - Gevaarlijke dubbele extensies geblokkeerd
  - Local fonts (Inter, Space Grotesk - geen Google Fonts CDN)
  - Session-based CSRF protection via express-session
  - Zod schema validation on all API endpoints
  - Upload routes protected with requirePro middleware (authenticated Pro users only)
  - Input sanitization and type validation throughout
- **Beta-Ready Status:**
  - Professional, trustworthy design throughout
  - Consistent Dutch language and terminology
  - All pages have proper data-testid attributes for testing
  - No LSP errors, fully type-safe codebase

**Privacy & Consent Dashboard (AVG Compliance - Completed):**
- **Database Tables:**
  - `field_visibility`: Per-field visibility settings (public/members/region_only/private)
  - `consent_log`: Audit trail of all visibility changes with timestamps
  - `deletedAt` field on users table for soft delete functionality
- **API Endpoints:**
  - GET /api/privacy/dashboard: Full privacy data in one call
  - GET/POST /api/privacy/visibility: View/update field visibility
  - GET /api/privacy/consent-log: View last 10 visibility changes
  - GET /api/privacy/export: Download all user data as JSON
  - POST /api/privacy/delete-account: Soft delete account (requires "VERWIJDER" confirmation)
- **Frontend (/privacy-dashboard):**
  - Profile overview with current stored data
  - Per-field visibility controls (email, telefoon, adres, website, beschrijving)
  - Consent change history display
  - Data export button (JSON download)
  - Account deletion with double confirmation (type "VERWIJDER")
- **AVG Rights Implemented:**
  - Right to access (data export)
  - Right to erasure (soft delete with 30-day data retention)
  - Consent management with audit trail

**PRO-Exclusive Data & Consent Control (Completed):**
- **Business Logic:**
  - Basic members: All fields default to "private" (privacy-first)
  - PRO members: Can customize per-field visibility (public/members/region_only/private)
  - Visibility rules apply equally to all viewers (no plan-check in canViewField)
  - PRO-exclusive = configuration rights, not read access
- **Database:**
  - `users.visibility_settings`: JSON column storing per-field visibility
  - Uses UUID-based foreign keys for field_visibility and consent_log tables
  - Automatic migrations in db-migrate.ts ensure schema consistency
- **API Endpoints (PRO-only via requirePro middleware):**
  - GET /api/pro/visibility-settings: Fetch current visibility settings
  - POST /api/pro/visibility-settings: Update visibility (Zod validated)
- **Frontend (/pro/visibility-settings):**
  - Table-based UI showing each field with current value and visibility selector
  - Explanation of visibility levels (Openbaar, Alleen leden, Alleen mijn regio, Privé)
  - Save button with loading state and toast notifications
- **Sidebar Integration:**
  - "Zichtbaarheidsbeheer" link only visible for PRO members
- **Helper Functions (server/utils/visibility.ts):**
  - parseVisibilitySettings: Parse JSON with fallback to defaults
  - canViewField: Check visibility based on viewer status and region
  - getVisibleFields: Get visibility map for all fields
- **Sidebar Navigation:** Privacy & Gegevens link in Account section

## External Dependencies

**Third-Party Services:**
- Neon Database (PostgreSQL).
- Local fonts (Inter, Space Grotesk - self-hosted, geen Google CDN).
- Replit AI Integrations (for RegioBot).

**UI Component Libraries:**
- Radix UI (unstyled primitives).
- shadcn/ui (styled components).
- Lucide React (icons).
- cmdk (command palette).

**Build and Development:**
- Vite (frontend).
- esbuild (backend bundling).
- tsx (TypeScript execution).
- Tailwind CSS (styling).

**Utilities:**
- date-fns (date manipulation).
- clsx/tailwind-merge (class name utilities).
- zod (schema validation).
- react-hook-form (form state).
- embla-carousel (carousel).
- vaul (drawer component).