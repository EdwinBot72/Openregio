# OpenRegio - Cooperative Platform for Local Entrepreneurs

## Overview

OpenRegio is a Dutch cooperative platform empowering local entrepreneurs by offering an alternative to large tech platforms. It integrates business networking, AI-powered marketing, and democratic governance. The platform enables entrepreneurs to create visible profiles, collaborate, utilize AI tools for content and SEO, and participate in cooperative decision-making through proposal voting.

The application features a full-stack architecture with a React frontend, Express backend, and in-memory storage (MemStorage) for development, emphasizing professionalism and a community-first design.

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

## External Dependencies

**Third-Party Services:**
- Neon Database (PostgreSQL).
- Google Fonts (Inter, Space Grotesk).
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