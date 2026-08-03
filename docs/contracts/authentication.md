# SEMESTA ISLAM — API AUTHENTICATION CONTRACT
**Status:** `[CONTRACT ONLY]` / `[DOCUMENT VERIFIED]` — tiers below are `[FUTURE PROPOSAL / ASPIRATIONAL]` for the post-MVP Developer Platform

This document defines the authentication model for the SEMESTA ISLAM API across its three operational tiers.

> **MVP Authentication State (2026-08-01):** No API-key/OAuth/webhook authentication is enforced by any runtime route in the B2C MVP. Runtime identity is server-side demo identity (`DEMO_LEARNER_USER_ID` / `LAJNAH_VERIFIER_USER_ID`). PHASE 2 introduces Supabase Auth SSR to replace demo identity with authenticated sessions; API keys belong to the post-MVP Developer Platform.

---

## 1. Authentication Tiers

### A. Public API Tier
- **Mechanism:** Anonymous HTTP GET access.
- **Endpoints:** `GET /api/v1/educators`, `GET /api/v1/courses`.
- **Protection:** Rate limited by client IP address.

### B. Developer API Tier
- **Mechanism:** HTTP Authorization Bearer Token (API Key).
- **Header Format:** `Authorization: Bearer sem_live_xxxx...` or `sem_test_xxxx...`.
- **Key Generation:** Generated via the `/developers/keys` Developer Portal (future portal).
- **Security:** API Keys are stored as SHA-256 hashes in the database. Raw keys are presented only once at generation time.

### C. Webhook Signature Verification
- **Mechanism:** HMAC SHA-256 Webhook Signatures.
- **Header:** `X-Semesta-Signature: t=1700000000,v1=sha256_hash_value`.
- **Validation:** Developers verify signature using their assigned Webhook Secret.

---

## 2. Environment Key Prefixes
- `sem_test_`: Test / Sandbox keys. Allowed on `localhost` and `sandbox.semestaislam.com`.
- `sem_live_`: Production keys. `[BLOCKED — CREDENTIALS REQUIRED]`.

---

## 3. Server-Only Security Requirements
1. API Keys MUST NEVER be exposed in client-side bundles or public repositories.
2. Webhook secrets MUST be stored in environment variables.
