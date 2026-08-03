# SEMESTA ISLAM — POST-LOCALHOST PRODUCTIZATION PLAN

> [!NOTE]
> **CLASSIFICATION: [BUSINESS HYPOTHESIS / DEFERRED]**
> This document represents a future platform evolution hypothesis (B2B SaaS / Developer API). The active operational priority is 100% focused on the **B2C Islamic Learning Marketplace MVP** (`PRODUCT → USERS → CORE LOOP → PRODUCTION`).

**Phase:** P8 (Master Deliverable)
**Authority:** AI IDE Agent (Evidence-First Audit)
**Date:** August 2026

## Executive Summary
This document summarizes the findings of the Productization & Developer Platform Discovery Phase (P0–P7). It determines that SEMESTA ISLAM can successfully evolve from a functional B2C application into a robust "Verification API for Islamic Knowledge Providers."

---

## Part 1: Strategy & Architecture

**1. What SEMESTA ISLAM is today**
A functional Next.js 15 application with a Prisma/Postgres backend that acts as an Islamic educator directory with a rigorous (Lajnah-backed) verification state machine. Localhost execution is 100% verified.

**2. What it can safely expose**
The `EducatorProfile`, `SanadRecord`, `CourseCatalog`, `CredentialBadge`, and `ReviewRating` models. These form a coherent, safe Public Directory graph.

**3. What should remain internal**
`User` (emails/phones), `VerificationRequest` (sensitive ID/Ijazah imagery), `LearnerProfile` (private notes), `EconomicLedger` (finances), `AuditLog`.

**4. Which resources should become API resources**
`Educator` (Aggregate), `Sanad`, `Course`, `Booking` (Authenticated only).

**5. JSON Schema strategy**
JSON Schema Draft 2020-12 will serve as the canonical *exported* contract. We will generate it automatically from Zod via `zod-to-json-schema` to preserve the single source of truth and avoid rewriting verified architecture.

**6. OpenAPI strategy**
An OpenAPI 3.1 specification will be generated, combining the JSON Schema payloads with the existing Next.js App Router endpoints.

**7. Documentation tooling recommendation**
`@scalar/api-reference-react` is highly recommended. It offers a premium UI, native Next.js support, SSR compatibility, and a built-in interactive client.

**8. Developer Portal recommendation**
A simple structure under `/developers/api` to house the interactive documentation, accompanied by markdown guides for specific integrations (e.g., Sanad verification).

**9. Sandbox recommendation**
The existing `LOCAL_DEMO_MODE=true` is a massive asset. It will be evolved into the SEMESTA SANDBOX, allowing developers to test against deterministic fake educators without touching production data.

**10. Authentication strategy**
Anonymous GET for public discovery. Simple API Keys (Bearer Token) for programmatic Developer access. Shared secrets (`X-Semesta-Signature`) for Webhooks.

**11. Rate limiting strategy**
IP-based limits for public access; API-Key-based limits for developers (enforced via Next.js middleware, simulating Upstash Redis locally).

**12. Webhook strategy**
Crucial for B2B. Events: `educator.verified`, `educator.rejected`, `booking.created/confirmed/cancelled`. Signed via HMAC SHA-256.

**13. SDK strategy**
Deferred. Focus on a pristine OpenAPI 3.1 spec first, allowing developers to generate their own clients or use raw HTTP. Official SDKs (TypeScript/Python) are a future goal.

**14. Trust metadata strategy**
The core defensible asset. API payloads will include `verificationStatus`, `trustScore`, and a cryptographic `documentIntegrityHash` (SHA-256 of the Ijazah) to allow partners to verify physical documents without exposing PII.

---

## Part 2: Business & Opportunity

**15. Developer use cases**
- **CORE:** Consumer Islamic Websites embedding directories; AI Agents retrieving verified Islamic knowledge sources.
- **PARTNER:** Mosque/Pesantren SaaS automating speaker verification.

**16. Business opportunities**
Transitioning from a B2C directory to a B2B Verification Infrastructure provider ("The Verification API for Islamic Knowledge Providers").

**17. Monetization hypotheses**
- Free Tier (B2C discovery).
- Pay-as-you-go Developer API (Monetizing programmatic verification lookups).
- Partner Tier (White-label integrations).

---

## Part 3: Implementation & Dependencies

**18. OSS decisions**
- **Adopt:** `zod-to-json-schema`, `@scalar/api-reference-react`
- **Reject:** `swagger-ui` (dated), `@stoplight/elements` (hydration issues).

**19. Cloud dependencies**
[BLOCKED]. Supabase Postgres, Auth, and Resend are completely blocked pending real credentials. All API evolution must happen on localhost using mock adapters and SQLite/local-Postgres.

**20. Implementation roadmap**
1. Implement `zod-to-json-schema` generation.
2. Construct OpenAPI 3.1 spec object.
3. Integrate Scalar UI at `/developers/api`.
4. Test interactive sandbox via `LOCAL_DEMO_MODE`.

**21. Risks**
- Expanding the API surface before Cloud Integration introduces a gap between localhost assumptions and production reality.
- Generating OpenAPI directly from Next.js App Router requires custom scripting, as there is no universal standard for automatic generation in Next.js 15 yet.

**22. ADRs required**
- `ADR-005: JSON Schema Generation from Zod`
- `ADR-006: API Documentation with Scalar`

**23. Explicit non-goals**
- Creating SDK repositories.
- Deploying to production.
- Building a complex OAuth flow.
- Exposing the `VerificationRequest` KTP/Ijazah URLs to the public.

**24. Recommended next gate**
**CONTRACT GENERATION GATE** (Implementing the Zod to OpenAPI pipeline locally).

---

## POST-LOCALHOST PRODUCTIZATION AUDIT REPORT

Repository Boundary:
[PASS]

Domain Contract:
[PASS]

Public API Boundary:
[PASS]

JSON Schema:
[PASS]

OpenAPI:
[PASS]

Documentation Tooling:
[PASS]

Developer Consumption:
[PASS]

Sandbox:
[PASS]

Trust Model:
[PASS]

Business Model:
[HYPOTHESIS]

OSS Adoption:
[PASS]

Cloud Dependency:
[BLOCKED — CREDENTIALS REQUIRED]

Implementation Readiness:
[READY]

Recommended Next Gate:
**CONTRACT GENERATION GATE**

---

### TOP 10 DISCOVERIES
1. The domain cleanly separates public identity (`EducatorProfile`) from highly sensitive verification data (`VerificationRequest`).
2. `LOCAL_DEMO_MODE` is perfectly positioned to serve as a Developer Sandbox.
3. Exposing the SHA-256 hash of the Ijazah allows cryptographic trust without PII leakage.
4. Zod is deeply entrenched; replacing it with manual JSON Schema would be destructive.
5. Scalar offers the best SSR-compatible, premium OpenAPI rendering for Next.js 15.
6. The `User` model must be entirely stripped from API responses to prevent email scraping.
7. Verification Webhooks are the primary missing feature for B2B integration.
8. AI Answer Engines (AEO/GEO) are a highly viable, passive consumer of the Trust Metadata API.
9. Redocly lacks an interactive Try-It console in its OSS version.
10. Stoplight Elements has Web Component hydration issues in Next.js.

### TOP 10 PRODUCT OPPORTUNITIES
1. The "Verification API" for Islamic Knowledge Providers (B2B SaaS).
2. Developer Sandbox for frictionless API onboarding.
3. Cryptographic Document Verification (via SHA-256 hashes).
4. Mosque/Pesantren Integrations (automated speaker vetting).
5. Islamic Event Platform speaker sourcing.
6. AI Agent Trust Context (providing verified sources for Islamic LLM responses).
7. White-label Directory SaaS.
8. Tiered API Pricing (Free, Developer, Partner).
9. Premium Educator Profiles (B2C monetization).
10. Referral network API hooks.

### TOP 10 RISKS
1. Writing a custom Next.js App Router -> OpenAPI generator script is error-prone.
2. Zod-to-JSON-Schema edge cases with complex refinements.
3. Cloud credentials remain missing, meaning Auth/DB limitations are untested in reality.
4. Accidental exposure of `layer1KtpUrl` via a poorly structured API response.
5. Lack of production rate-limiting allows immediate API scraping.
6. B2B Verification API monetization is purely a hypothesis.
7. Webhook delivery guarantees are difficult to simulate perfectly on localhost.
8. Maintaining dual `LOCAL_DEMO_MODE` and Production logic complicates testing.
9. Upstash Redis dependency for rate limiting must be locally mocked.
10. Over-engineering SDKs prematurely.

### TOP 10 IMPLEMENTATION PRIORITIES
1. Implement `zod-to-json-schema` utility.
2. Author Zod schemas for the explicit API Response Payloads (Educator, Sanad, Course).
3. Script the OpenAPI 3.1 JSON assembly.
4. Install and configure `@scalar/api-reference-react`.
5. Build the `/developers/api` Next.js route.
6. Implement API Key middleware check (mocked for localhost).
7. Implement basic Webhook dispatcher structure (mocked).
8. Upgrade `LOCAL_DEMO_MODE` to support specific Developer Demo identities.
9. Create `ADR-005` and `ADR-006`.
10. Freeze new API endpoints until the Cloud Integration Gate is passed.

### EXPLICIT NON-GOALS
- No production database migrations.
- No Supabase Auth integration.
- No OAuth implementation.
- No Python/TypeScript SDK generation.
- No public exposure of KTP/Ijazah URLs.
