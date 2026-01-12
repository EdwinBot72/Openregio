# OpenRegio - Cooperative Platform for Local Entrepreneurs

## Overview

OpenRegio is a Dutch cooperative platform designed to empower local entrepreneurs by providing an alternative to large tech platforms. It facilitates business networking, offers AI-powered marketing tools, and incorporates a democratic governance model. The platform allows entrepreneurs to create profiles, collaborate, leverage AI for content and SEO, and participate in cooperative decision-making through proposal voting. The project aims to foster local economic growth and community engagement through a robust, professional, and community-centric platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, using Vite for development and Wouter for routing. State management is handled by TanStack Query, and styling is achieved with Tailwind CSS, leveraging a custom design system based on shadcn/ui. The design system employs HSL-based color variables for theme support, consistent spacing, and an atomic design approach for components.

### Backend Architecture

The backend utilizes Express.js with TypeScript, implementing a RESTful API design. It features a stateless JWT-based authentication system with httpOnly cookies for access tokens and PostgreSQL for refresh tokens. All requests and responses are validated using Zod schemas. The architecture includes modular route registration, consistent error handling, and `IStorage` interface for data access abstraction using Drizzle ORM for PostgreSQL in production and `MemStorage` for development.

### Data Storage Solutions

The primary database is PostgreSQL, accessed via Neon's serverless driver. Drizzle ORM is used for type-safe queries and schema management. Key data models include `Bedrijfsprofielen` (business profiles), `Proposals` for democratic voting, `Votes`, `Activities`, `User Profiles` with pain points for onboarding, and `RegioMarkt` tables for a B2B deal network. `onboarding_tokens` are used for secure initial logins.

### Authentication and Authorization

Authentication is handled by a stateless JWT system with access tokens (15 min expiry) and refresh tokens (7 days) with rotation. Password hashing is done with `bcrypt`. Rate limiting is implemented for login and registration endpoints to prevent brute-force attacks. Role-Based Access Control (`requirePro` middleware) restricts certain features, like RegioBot, to Pro plan users. Token-based onboarding integrates with payment systems for secure user creation.

### Key Features & Design Patterns

- **RegioMarkt:** An exclusive B2B deal network for Pro members. Features one slot per business category per region (exclusivity via unique constraint), lead sharing between businesses, deal tracking with referral fees, and region-based filtering. Dashboard at `/regiomarkt` with Slots, Leads, and Deals tabs.
- **RegioBot:** An AI assistant with three specialized modes (General, Legal, Marketing) offering tailored support, conversation history, and Pro-only access.
- **Privacy & Consent Dashboard:** Implements AVG (GDPR) compliance with per-field visibility settings, a consent log, data export functionality, and soft-delete options for accounts. Pro members have granular control over their data visibility.
- **Security Hardening:** Includes comprehensive security headers (HSTS, CSP, X-Frame-Options), secure cookie settings, input sanitization, MIME type validation for uploads, and local fonts to enhance privacy and security.
- **Observability:** Structured JSON logging for server errors, a client-side error boundary, and a `QueryState` component for handling loading, empty, and error states in the UI.

## External Dependencies

**Third-Party Services:**
- Neon Database (PostgreSQL)
- Replit AI Integrations (for RegioBot)

**UI Component Libraries:**
- Radix UI (unstyled primitives)
- shadcn/ui (styled components)
- Lucide React (icons)
- cmdk (command palette)

**Build and Development:**
- Vite (frontend)
- esbuild (backend bundling)
- tsx (TypeScript execution)
- Tailwind CSS (styling)

**Utilities:**
- date-fns (date manipulation)
- clsx/tailwind-merge (class name utilities)
- zod (schema validation)
- react-hook-form (form state)
- embla-carousel (carousel)
- vaul (drawer component)