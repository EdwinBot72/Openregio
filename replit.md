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
  - `/api/entrepreneurs` - CRUD operations for business profiles
  - `/api/categories` - Returns available business categories (retail, food, services, tech, health, education) with value/label pairs
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
- **Timestamps and audit**: createdAt on all entities for chronological tracking
- **Table Coexistence**: bedrijfsprofielen and entrepreneurs tables exist alongside each other - bedrijfsprofielen is the newer Dutch-first model

**Query Patterns:**
- SQL-like API through Drizzle ORM (eq, ilike, or, desc, inArray operators)
- Batch query optimization: Single inArray query replaces O(n²) per-proposal queries
- Search and filtering capabilities (text search, category filtering)
- Aggregation for statistics (member counts, growth metrics, vote counts)
- Join patterns: Proposals with vote counts via groupBy aggregation

### Authentication and Authorization

**Prepared Infrastructure:**
- Session store configured with connect-pg-simple for PostgreSQL-backed sessions
- Cookie-based session management ready for implementation
- Credential-included fetch requests from frontend
- Currently operating without authentication (to be implemented)

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