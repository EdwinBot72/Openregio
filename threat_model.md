# Threat Model

## Project Overview

OpenRegio is a public-facing platform for Dutch entrepreneurs with a React/Vite frontend and an Express/TypeScript backend backed by PostgreSQL. It exposes a mix of public pages, authenticated member features, Pro-only AI/document tools, and admin-only management routes. The production deployment is public on the internet, so unauthenticated and low-privilege attacker reachability matters. Mockup sandbox artifacts are development-only and out of scope unless production reachability is demonstrated.

## Assets

- **User accounts and sessions** -- email addresses, password hashes, JWT access cookies, refresh tokens, onboarding tokens, and password reset tokens. Compromise allows impersonation and access to member/admin features.
- **Member and profile data** -- business profiles, regions, proposals, votes, activity, affiliate data, consent settings, and other account-linked records. This includes personal and business-sensitive information.
- **Uploaded and analyzed documents** -- RegioBot/RAG files, brief-analysis uploads, WOO dossiers, and any object-storage-backed files. These can contain sensitive legal, regulatory, or business documents.
- **Payment and subscription data** -- Mollie customer IDs, subscription state, commissions, referral relationships, and plan entitlements. Abuse can change access level or financial state.
- **Application secrets and service credentials** -- database URL, session secret, AI API keys, SMTP credentials, and Replit object-storage credentials. Exposure could lead to full application compromise or external service abuse.
- **Admin capabilities** -- user management, exports, regional content management, analytics, commission management, and blog/deal administration. Abuse here would have platform-wide impact.

## Trust Boundaries

- **Browser to API** -- all request data from the client is untrusted. Server-side validation and authorization must be enforced regardless of client behavior.
- **Public to authenticated to Pro to admin** -- the app has multiple privilege tiers. Every route must enforce the intended boundary on the server.
- **API to PostgreSQL** -- the backend has broad read/write access to application data. Query scope mistakes can leak or modify cross-user data.
- **API to external services** -- the backend calls Mollie, AI providers, SMTP, TenderNed, KOOP, and an external brief-analysis upload backend. User-controlled data crossing this boundary can trigger SSRF, privacy leaks, or unintended third-party disclosure.
- **API to object storage** -- uploads and downloads cross between application policy and bucket objects. Private-vs-public access decisions must be enforced consistently.
- **Production vs development/test** -- non-production workflows, E2E bypasses, and mockup sandbox code should be ignored unless reachable in production. Production assumptions: NODE_ENV=production and TLS is provided by the platform.

## Scan Anchors

- **Main production entry points:** `server/index.ts`, `server/routes.ts`, `server/jwtAuth.ts`, `server/middleware/security.ts`
- **High-risk areas:** authentication/session logic, admin routes in `server/routes.ts`, payment/onboarding/webhook flows, file upload/object storage, AI/document processing, external fetch/proxy endpoints
- **Boundary map:** public marketing/content routes; authenticated member routes; Pro-only AI/tools routes; admin-only `/api/admin/*` and related management routes
- **Usually dev-only:** `artifacts/mockup-sandbox/**`, Playwright helpers/tests, non-production rate-limit bypass behavior unless production reachability is shown

## Threat Categories

### Spoofing

Attackers may attempt to impersonate users through stolen or replayed session material, weak onboarding/reset flows, or unverified service callbacks. The system must require valid signed JWTs for protected routes, keep reset/onboarding tokens unpredictable and time-limited, and ensure external callbacks cannot be abused to act on behalf of arbitrary users.

### Tampering

Because the client is untrusted, users may try to change IDs, plans, user references, or file/object references to modify records they do not own. The system must derive ownership and entitlement from the authenticated session on the server and must not trust client-supplied identifiers for authorization-sensitive writes.

### Information Disclosure

OpenRegio handles sensitive entrepreneur data and uploaded legal/business documents. The system must scope all reads to the authorized user or admin role, prevent private object-storage paths from being publicly retrievable, avoid leaking secrets or PII in logs/errors, and avoid sending user documents or extracted text to unintended third parties or insecure transport paths.

### Denial of Service

Public and low-privilege users can hit AI, file-upload, search, and external-fetch features. The system must bound request size, file size, execution time, and request rate so expensive OCR, LLM, PDF, or outbound-fetch operations cannot be abused to exhaust CPU, memory, or third-party quotas.

### Elevation of Privilege

The largest risk in this project is broken access control across user-owned records, Pro-only features, and admin surfaces. The system must verify object ownership on every user-scoped route, enforce admin checks server-side, and prevent server-side fetch or storage paths from being used to reach internal services or private resources beyond the caller’s authorization.
