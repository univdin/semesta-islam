# SEMESTA ISLAM — DEVELOPER PLATFORM & CONSUMPTION MODEL
**Phase:** P4
**Status:** [BUSINESS HYPOTHESIS] [INFERENCE]

This document evaluates the concrete use cases for third-party developers consuming the SEMESTA ISLAM API, establishing the minimum viable Developer Portal and the Sandbox environment strategy.

## 1. Developer Consumption Use Cases

To prevent building an API without a clear audience, we evaluate what developers can actually build with the SEMESTA ISLAM API.

### A. Consumer Islamic Website
*Use Case:* "Find verified educators near Cirebon" embedded in a local community portal.
- **Needs:** Educator Discovery, Basic Profile Retrieval.
- **Classification:** **CORE** (Drives immediate traffic and visibility).

### B. Islamic Learning Application
*Use Case:* Third-party LMS apps needing verified educators for their own courses.
- **Needs:** Educator profile, Sanad verification proof, Booking inquiry API.
- **Classification:** **OPTIONAL** (High value, but requires robust API authentication and booking sync).

### C. Mosque / Pesantren SaaS
*Use Case:* A mosque management system automatically verifying invited speakers.
- **Needs:** Educator verification lookup, Directory integration.
- **Classification:** **PARTNER** (B2B integration, likely requires dedicated API keys and SLAs).

### D. Islamic Event Platform
*Use Case:* Event organizers searching for and verifying speakers.
- **Needs:** Speaker discovery, Verification status.
- **Classification:** **FUTURE** (A variation of the Mosque SaaS use case).

### E. AI Applications / LLMs
*Use Case:* AI agents retrieving structured, verified Islamic educators and trust metadata to answer user queries with high provenance.
- **Needs:** Structured Educator retrieval, Trust metadata.
- **Constraint:** We provide *structural trust metadata* (e.g., "Educator X is verified by Lajnah Y"), NOT theological correctness claims.
- **Classification:** **CORE** (Aligns with modern AEO/GEO discovery patterns).

### F. Business / Marketplace Integrations
*Use Case:* Affiliate networks or lead-gen sites referring users to educators for a commission.
- **Needs:** Referral generation API, Booking webhook.
- **Classification:** **FUTURE** (Requires complex economic ledger and payout infrastructure).

## 2. Developer Portal Strategy

The minimum viable Developer Portal (`/developers`) will consist of:

1. **`/developers/api`**: The interactive API Reference (powered by Scalar, as decided in P3).
2. **`/developers/guides`**: Markdown-based integration guides (e.g., "How to verify an educator's Sanad").
3. **`/developers/keys`**: Dashboard for generating API Keys (authenticated users only).

*Note: SDKs (TypeScript, Python) are marked as **FUTURE** until base API adoption is proven. OpenAPI-generated clients are sufficient for now.*

## 3. SEMESTA SANDBOX (Evolution of `LOCAL_DEMO_MODE`)

**Evaluation:**
The existing `LOCAL_DEMO_MODE=true` mechanism is highly valuable. Evolving it into a formal **SEMESTA SANDBOX** is technically feasible and commercially strategic.

**Sandbox Characteristics:**
- **Dedicated Environment:** `sandbox.semestaislam.com` or a specific API header `X-Sandbox-Mode: true`.
- **Deterministic Data:** Fake educators (e.g., "Ustadz Demo"), predefined verification states (always returns verified), and mock bookings.
- **No Production Impact:** Completely isolated database or in-memory mock adapters.
- **Demo API Keys:** Easily accessible without a rigorous vetting process.

**Decision:** **VALIDATED PRODUCT OPPORTUNITY**. The Sandbox lowers the barrier to entry for developers and is a prerequisite for a trustworthy B2B Developer Platform.

---
**Next Step:** Proceed to Phase P5 (Productization & Business Model) to determine how these developer segments translate into monetization hypotheses.
