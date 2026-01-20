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

### Authentication and Authorization

The system uses a robust JWT authentication flow with short-lived access tokens (httpOnly cookies) and rotating refresh tokens (stored in PostgreSQL) for enhanced security and scalability, suitable for high concurrent user loads. `bcrypt` is used for password hashing. Rate limiting is implemented for login and registration endpoints to prevent brute-force attacks. Role-Based Access Control (`requirePro` middleware) restricts certain features, like RegioBot, to Pro plan users.

### Core Features

-   **RegioBot**: An AI assistant offering specialized modes (General, Legal, Marketing) for various business needs, providing context-aware support. This is a PRO-exclusive feature.
-   **Privacy & Consent Dashboard (AVG/GDPR Compliance)**: Enables users to manage per-field data visibility, view consent logs, export their data, and perform soft account deletion. This feature is enhanced for PRO members to allow customization of visibility settings.
-   **Affiliate System**: Allows users to refer new members and earn recurring commissions. It tracks referrals, calculates commissions, and provides an affiliate dashboard.

### Security and Observability

Security is a paramount concern, with comprehensive measures including HSTS, Content-Security-Policy, secure cookie settings, input sanitization, and type validation. File uploads are secured with MIME type validation and random filenames. Observability includes structured JSON logging for server errors and client-side error boundaries with user-friendly error displays and recovery options.

## External Dependencies

-   **Database**: Neon Database (PostgreSQL)
-   **AI Integration**: Replit AI (for RegioBot)
-   **UI Components**: Radix UI, shadcn/ui, Lucide React, cmdk, embla-carousel, vaul
-   **Build Tools**: Vite, esbuild, tsx
-   **Styling**: Tailwind CSS
-   **Utilities**: date-fns, clsx, tailwind-merge, zod, react-hook-form