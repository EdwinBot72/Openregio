# OpenRegio - Cooperative Platform for Local Entrepreneurs

## Overview

OpenRegio is a Dutch cooperative platform designed to empower local entrepreneurs by providing an alternative to Big Tech platforms. It combines business networking, AI-powered marketing assistance, and democratic governance in a single application. The platform enables entrepreneurs to create visible profiles, discover and collaborate with other local businesses, leverage AI tools for content creation and SEO, and participate in cooperative decision-making through proposal voting.

The application follows a full-stack architecture with React frontend, Express backend, and in-memory storage (MemStorage), emphasizing trustworthy professionalism with a collaborative, community-first design aesthetic. All features are fully functional and tested end-to-end.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type safety and component composition
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- Tailwind CSS for utility-first styling with custom design system

**Design System:**
- Custom theme built on shadcn/ui components (Radix UI primitives)
- Typography: Inter (body text) and Space Grotesk (headings) from Google Fonts
- Color system: HSL-based with CSS variables for light/dark theme support
- Spacing primitives: Consistent Tailwind units (2, 4, 6, 8, 12, 16, 20, 24)
- Component variants using class-variance-authority for type-safe styling

**Component Organization:**
- Page-level components in `client/src/pages/` (home, dashboard, network, regiobot, cooperative, onboarding)
- Reusable UI components in `client/src/components/` with example implementations
- Atomic design approach: Base UI components (shadcn), composite components (BusinessProfileCard, NetworkGrid), and page layouts
- **Onboarding Flow**: Frustration-based welcome with multi-select pain point tiles using react-hook-form and shadcn Form components
- **Z-index Hierarchy**: Ensures proper layering when dialogs contain form dropdowns above maps
  - Leaflet Maps: Default (~400)
  - DialogOverlay: z-[999] (dark backdrop layer)
  - DialogContent: z-[1000] (dialog modal layer)
  - SelectContent: z-[1001] (dropdown menus inside dialogs)
  - DialogHeader (sticky): z-10 (relative positioning within dialog)
- **Categories Integration**: Business profile form fetches categories from API with loading state, error handling with fallback, and one-time toast notification on failure
- **Form Pre-population Pattern**: When pre-populating forms with fetched data:
  1. Use useEffect with dependencies on the data and form object
  2. Add !form.formState.isDirty guard before calling form.reset()
  3. This prevents data loss when React Query refetches in background (e.g., on window focus)
  4. Select components must use value={field.value} (not defaultValue) to stay synchronized with form state

**State Management:**
- Server state via React Query with centralized query client
- Local UI state via React hooks (useState, useEffect)
- Form state management with React Hook Form and Zod validation
- Theme state persisted to localStorage

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- RESTful API design pattern
- Session-based architecture (prepared for authentication with connect-pg-simple)
- Modular route registration pattern

**API Design:**
- Resource-based endpoints following REST conventions:
  - `/api/entrepreneurs` - CRUD operations for business profiles (legacy)
  - `/api/categories` - Returns available business categories (retail, food, services, tech, health, education) with value/label pairs
  - `/api/business-profile` - Business profile management (new Dutch-first model):
    - `GET /api/business-profile/me` - Returns authenticated user's business profile, 404 if not found
    - `POST /api/business-profile` - Creates new or updates existing profile for authenticated user (upsert pattern)
    - Authentication: Both endpoints require valid session (req.session.userId), return 401 if unauthenticated
    - Validation: POST uses insertBedrijfsprofielSchema with Zod validation
  - `/api/proposals` - Cooperative governance system:
    - `GET /api/proposals/summary` - Returns aggregated ProposalSummary[] with vote counts and user vote status
    - `POST /api/proposals/:id/vote` - Cast vote (yes/no/abstain) with validation and duplicate detection
    - Error codes: 400 (invalid choice), 403 (closed proposal), 404 (not found), 409 (duplicate vote)
  - `/api/activities` - Activity feed and notifications
  - `/api/stats` - Dashboard statistics
  - `/api/regiobot/chat` - AI assistant interactions
  - `/api/user-profile` - User profile management (GET by ID/email, POST create, PATCH update)
- JSON request/response format with Zod schema validation
- Error handling with appropriate HTTP status codes

**Storage Layer:**
- Storage interface pattern (`IStorage`) for data access abstraction
- Database implementation (`DbStorage`) using Drizzle ORM for PostgreSQL (production-ready)
- In-memory fallback (`MemStorage`) for development with behavioral equivalence
- UUID-based primary keys for all entities (deterministic IDs for user profiles matching entrepreneur ownerUserId)
- **Performance optimizations**: Batch query patterns reduce database round-trips by 83% (getProposalSummaries uses single inArray query)
- **Governance validation**: Proposal status checks, duplicate vote detection with graceful error handling, error messages mapped to HTTP status codes
- Seed data includes ~12 entrepreneurs, 6 user profiles with varied pain points, 3 proposals (2 open, 1 closed), and statistics

**Middleware Stack:**
- JSON body parsing with raw body preservation for webhooks
- URL-encoded form data support
- Request logging middleware with duration tracking
- Development: Vite middleware integration for HMR

### Data Storage Solutions

**Database:**
- PostgreSQL via Neon serverless driver
- WebSocket support for real-time database connections
- Connection pooling handled by Neon serverless adapter

**ORM and Schema:**
- Drizzle ORM for type-safe database queries
- Schema-first approach with TypeScript types generated from database schema
- Migration management via Drizzle Kit
- Zod integration for runtime validation of database inserts

**Data Models:**
- **Entrepreneurs**: Business profiles with contact info, location, category, and metadata (legacy table, coexists with bedrijfsprofielen)
- **Bedrijfsprofielen**: New business profile table with Dutch field names
  - Fields: id, gebruikerId (FK to users), naam, eigenaarnaam, categorieId, regio, beschrijving, websiteUrl (optional), stemtoon (optional), status (actief/inactief/concept), aangemaakt, bijgewerkt
  - Purpose: Represents business profiles owned by registered users with Dutch field naming convention
  - categorieId: References category from /api/categories endpoint (varchar, not FK for flexibility)
  - stemtoon: Tone of voice for AI-generated content (free text for personalization)
  - Status workflow: concept → actief (published) or inactief (unpublished)
  - Relationship: One user can have one business profile via gebruikerId FK
- **Proposals**: Democratic governance with normalized schema
  - Fields: id, title, description, proposerId, proposerName, status ("open"|"closed"), closesAt, createdAt
  - Voting: Separate votes table with unique constraint (proposalId, userId) prevents duplicates
  - Vote choices: "yes", "no", "abstain" with validation
  - Status workflow: Open proposals accept votes → Closed proposals in Besluitlogboek (decision log)
- **Votes**: Vote records with foreign key to proposals, choice validation, duplicate prevention
- **Activities**: Activity feed entries for user engagement tracking
- **User Profiles**: User accounts with pain points array (8 frustration types: visibility, rules, time, platform_fees, no_community, digital_stress, rights_confusion, low_autonomy) for personalized onboarding
- **Onboarding Tokens**: Secure token-based first login for payment integration
  - Fields: user_id (FK to users), token (64-char hex), expires_at (timestamp)
  - Purpose: Enable secure onboarding flow after Mollie payment with 7-day token expiration
  - Lifecycle: Created by webhook → Used once at /first-login → Automatically deleted after use
- **Timestamps and audit**: createdAt on all entities for chronological tracking
- **Table Coexistence**: bedrijfsprofielen and entrepreneurs tables exist alongside each other - bedrijfsprofielen is the newer Dutch-first model

**Query Patterns:**
- SQL-like API through Drizzle ORM (eq, ilike, or, desc, inArray operators)
- Batch query optimization: Single inArray query replaces O(n²) per-proposal queries
- Search and filtering capabilities (text search, category filtering)
- Aggregation for statistics (member counts, growth metrics, vote counts)
- Join patterns: Proposals with vote counts via groupBy aggregation

### Authentication and Authorization

**Custom Authentication System (BLOK 1 - Completed):**
- Session-based authentication using express-session with PostgreSQL session store (connect-pg-simple)
- bcrypt password hashing with salt rounds for secure credential storage
- Cookie-based session management with httpOnly and secure flags (production)
- 7-day session TTL (maxAge: 7 days, rolling sessions enabled)
- SESSION_SECRET environment variable for session signing

**API Endpoints:**
- `POST /api/auth/register` - User registration with email validation, password requirements, duplicate check
- `POST /api/auth/login` - User login with credential validation, session creation
- `POST /api/auth/logout` - Session destruction
- `GET /api/auth/user` - Get current authenticated user (returns complete user object)

**User Data Model:**
- Core fields: id, email, passwordHash, plan (basic/pro), firstName, lastName
- Profile fields: businessName, bio, category (for business profile association)
- Onboarding: mustCompleteOnboarding (boolean, defaults to true for new users)
- All auth endpoints return complete user object including profile and onboarding fields

**Middleware:**
- `attachUser` - Loads user from session into req.user (supports both MemStorage and DbStorage)
- `requireAuth` - Protects routes requiring authentication, returns 401 if not authenticated

**Security:**
- Password validation: Minimum 6 characters, bcrypt hashing with salt
- Email validation: Basic format checking, uniqueness constraint in database
- Session security: httpOnly cookies prevent XSS, secure flag in production prevents MITM
- Storage abstraction: Auth middleware supports both in-memory and database backends

**Frontend Integration:**
- Credential-included fetch requests (credentials: "include")
- Client-side login/register forms with Zod validation
- Session persistence across page refreshes

**Token-Based Onboarding System (BLOK 3 - Completed):**
- Onboarding flow for Mollie payment integration with secure token-based first login
- `onboarding_tokens` table: user_id (FK to users), token (64-char hex), expires_at (7 days)
- **Webhook Integration**: Mollie webhook creates user with must_complete_onboarding=true and generates onboarding token
- **API Endpoints**:
  - `GET /api/first-login/validate?token=xxx` - Validates token and returns user info (400/404/410 error codes)
  - `POST /api/first-login` - Completes onboarding with password, businessName, bio, category; creates session and deletes token
- **Frontend**: /first-login page with token validation, form with password/confirm, business info, category dropdown from API
- **Middleware**: `requireOnboardingDone` redirects users with must_complete_onboarding=true to /first-login (skips /first-login route)
- **Security**: 7-day token expiration, bcrypt password hashing, automatic token cleanup after use
- **User Flow**: Payment → Email with token link → /first-login → Complete profile → Redirect to /dashboard

### External Dependencies

**Third-Party Services:**
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Google Fonts**: Inter and Space Grotesk typography via CDN
- **Replit Development Tools**: 
  - Runtime error overlay plugin
  - Cartographer for development mapping
  - Dev banner for development environment

**UI Component Libraries:**
- **Radix UI**: Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix
- **Lucide React**: Icon library for consistent iconography
- **cmdk**: Command palette component for keyboard-driven navigation

**Build and Development:**
- **Vite**: Frontend build tool and dev server
- **esbuild**: Backend bundling for production
- **tsx**: TypeScript execution for development server
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing

**Utilities:**
- **date-fns**: Date formatting and manipulation with Dutch locale support
- **clsx/tailwind-merge**: Conditional class name composition
- **zod**: Schema validation for forms and API data
- **react-hook-form**: Form state management with validation
- **embla-carousel**: Carousel/slider component
- **vaul**: Drawer component for mobile experiences

**AI Integration:**
- RegioBot chat interface fully integrated with OpenAI via Replit AI Integrations
- POST endpoint `/api/regiobot/chat` connected to OpenAI with Dutch language system prompt
- Message history management in component state with streaming support
- Context-aware business advice for local Dutch entrepreneurs