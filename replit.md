# OpenRegio - Cooperative Platform for Local Entrepreneurs

## Overview

OpenRegio is a Dutch cooperative platform designed to empower local entrepreneurs by providing an alternative to Big Tech platforms. It combines business networking, AI-powered marketing assistance, and democratic governance in a single application. The platform enables entrepreneurs to create visible profiles, discover and collaborate with other local businesses, leverage AI tools for content creation and SEO, and participate in cooperative decision-making through proposal voting.

The application follows a full-stack architecture with React frontend, Express backend, and PostgreSQL database, emphasizing trustworthy professionalism with a collaborative, community-first design aesthetic.

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
- Page-level components in `client/src/pages/` (home, dashboard, network, regiobot, cooperative)
- Reusable UI components in `client/src/components/` with example implementations
- Atomic design approach: Base UI components (shadcn), composite components (BusinessProfileCard, NetworkGrid), and page layouts

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
  - `/api/proposals` - Cooperative governance and voting
  - `/api/activities` - Activity feed and notifications
  - `/api/stats` - Dashboard statistics
  - `/api/regiobot/chat` - AI assistant interactions
- JSON request/response format with Zod schema validation
- Error handling with appropriate HTTP status codes

**Storage Layer:**
- Storage interface pattern (`IStorage`) for data access abstraction
- In-memory implementation (`MemStorage`) for development
- Database implementation using Drizzle ORM for PostgreSQL
- UUID-based primary keys for all entities

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
- **Entrepreneurs**: Business profiles with contact info, location, category, and metadata
- **Proposals**: Democratic governance with voting mechanisms (for/against/abstain)
- **Activities**: Activity feed entries for user engagement tracking
- Timestamps and audit fields on all entities

**Query Patterns:**
- SQL-like API through Drizzle ORM (eq, ilike, or, desc operators)
- Search and filtering capabilities (text search, category filtering)
- Aggregation for statistics (member counts, growth metrics)

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

**AI Integration (Planned):**
- RegioBot chat interface prepared for AI service integration
- POST endpoint `/api/regiobot/chat` ready for external AI API connection
- Message history management in component state