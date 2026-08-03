# SEMESTA ISLAM — API ROADMAP & OSS ADOPTION
**Phase:** P7 & P8
**Status:** [INFERENCE] [BUSINESS HYPOTHESIS]

This document outlines the implementation roadmap for the Developer Platform evolution, including the Cloud-Independent Integration Readiness strategy (Auth, Rate Limiting) and OSS adoption decisions.

## 1. Cloud-Independent Integration Readiness

Before cloud deployment, the following architectures must be designed and verified locally (using mock adapters if necessary):

### A. Authentication Strategy
- **Public API:** Anonymous access via HTTP GET.
- **Developer API:** Bearer Token (API Keys). Keys generated via the Developer Portal, stored securely with hashed representations in the database.
- **Organization SaaS / Webhooks:** Shared webhook signing secrets (`X-Semesta-Signature`).
- **OAuth:** [REJECTED] for now. Overly complex for the initial Developer Platform rollout.

### B. Rate Limiting Strategy
- **Public API:** Strict IP-based rate limiting (e.g., 60 req / min) to prevent scraping.
- **Developer API:** API Key-based rate limiting (e.g., 1000 req / min) based on the Developer Tier.
- **Implementation:** Next.js Middleware. (Upstash Redis is listed in the registry, but can be simulated locally with a memory store during development).

### C. SDK Strategy
- **Decision:** Do NOT manually author SDKs yet.
- **Approach:** Rely on the high-quality OpenAPI 3.1 specification (generated from Zod/JSON Schema). Developers can use tools like `openapi-typescript-codegen` or standard HTTP clients. Custom SDKs are a [FUTURE] requirement once adoption is proven.

## 2. OSS Adoption Decisions

The following OSS libraries were evaluated against the requirement to not unnecessarily bloat the application or introduce incompatible licenses.

| Package | Purpose | License | Decision | Justification |
| :--- | :--- | :--- | :--- | :--- |
| `zod-to-json-schema` | Schema export | ISC | **ADOPT** | High fidelity Zod to Draft 2020-12 conversion. |
| `@scalar/api-reference-react`| API Documentation | MIT | **ADOPT** | Premium UI, native Next.js support, built-in Try-It sandbox. |
| `redoc` | API Documentation | MIT | **REFERENCE ONLY** | Lacks interactive Try-It console in OSS tier. |
| `swagger-ui` | API Documentation | Apache 2 | **REJECT** | Outdated UI; difficult to integrate seamlessly with Next.js App Router. |
| `@stoplight/elements` | API Documentation | MIT | **REJECT** | Web Components cause hydration issues in modern React 19. |

## 3. Implementation Priority Roadmap

1. **Gate 1: Contract Generation (Current Focus)**
   - Implement `zod-to-json-schema` utility.
   - Author API Response Zod schemas for the explicit Public Resources (`Educator`, `Course`, `Sanad`).
   - Generate `openapi.json` locally.

2. **Gate 2: Developer Portal Rendering**
   - Integrate Scalar.
   - Build `/developers/api` to render the `openapi.json`.
   - Verify Developer UX (Try-It functionality using `LOCAL_DEMO_MODE`).

3. **Gate 3: Cloud Integration (BLOCKED)**
   - Migrate DB to Supabase.
   - Implement real API Key issuance & Upstash rate limiting.
   - Enable Webhook dispatcher.

**Next Step:** Proceed to P8 to compile the Final Master Deliverable (`docs/POST_LOCALHOST_PRODUCTIZATION_PLAN.md`).
