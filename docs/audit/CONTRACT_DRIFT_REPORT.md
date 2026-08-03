# SEMESTA ISLAM — CONTRACT DRIFT REPORT
**Gate:** PRODUCT REALITY RECONCILIATION GATE
**Status:** `[EXECUTED]`

## EXECUTIVE SUMMARY

This document audits the generated API contracts in `docs/contracts/` against the actual repository runtime and Productization guidelines to identify drift, contradictions, and unsupported assumptions.

---

## 1. CONTRACT RECONCILIATION MATRIX

| Contract | Repository | Runtime | Canonical Docs | Generated Contract | Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `educator.schema.json` | `EducatorProfile` | Exists | Defined | Matches Prisma | `[CODE VERIFIED]` |
| `course.schema.json` | `CourseCatalog` | Exists | Defined | Matches Prisma | `[CODE VERIFIED]` |
| `sanad.schema.json` | `SanadRecord` | Exists | Defined | **Resolved — Contract-neutral** | `[RECONCILED]` |
| `verification.schema.json`| `VerificationRequest` | Exists | Defined | Matches Routing | `[RUNTIME VERIFIED]` |
| `trust-metadata.schema.json`| N/A | N/A | Defined | Proposed Contract | `[PRODUCT HYPOTHESIS]`|

---

## 2. IDENTIFIED CONTRADICTIONS & DRIFT

### 2.1 Identifier Strategy Drift — `[RESOLVED]`
- **Runtime:** `DEV-EDUCATOR-001` (Human-readable mock IDs in fixtures/UI).
- **Prisma:** `@db.Uuid` (Strict UUIDv4).
- **OpenAPI/JSON Schema:** `format: uuid`.
- **Audit Result:** `[RUNTIME MISMATCH]`. The UI mock data uses string identifiers (`DEV-...`), but the strict OpenAPI contract demands UUIDs. The contract correctly reflects the database, but the mock fixtures will fail contract validation.
- **Resolution (2026-08-01):** Fixtures were deleted; all discovery/booking/verification flows now use real seeded UUIDs and strict UUID validation. Re-verified end-to-end against a fresh Postgres DB (`GET /educator/{uuid}` 200, invalid ID 404, non-UUID API param 400). `[RESOLVED]`.

### 2.2 Authentication Drift — `[RESOLVED]`
- **Canonical Docs:** Propose API Keys (`sem_live_xxxx`).
- **OpenAPI Contract:** `ApiKeyAuth` defined in components.
- **Runtime Implementation:** Currently NO API key middleware exists in the Next.js routes.
- **Audit Result:** `[CONTRACT DRIFT]`. The OpenAPI contract exposes security schemes that the runtime does not enforce.
- **Resolution (2026-08-01):** `ApiKeyAuth` formally declared `[FUTURE PROPOSAL — DEFERRED]` in `openapi.yaml` (not enforced by any MVP route). `[RESOLVED]`.

### 2.3 Verifier Authorization Drift — `[RESOLVED]`
- **Contract:** Mentions `X-Verifier-Role` header in OpenAPI security scheme.
- **Runtime Implementation:** The route `POST /api/v1/verification/review` expects `verifierRoles` array in the JSON *payload*, not a header.
- **Audit Result:** `[CONTRACT CONTRADICTION]`. The OpenAPI specification contradicts the actual runtime route implementation.
- **Resolution (2026-08-01):** Decision #2 — **payload-canonical**. OpenAPI now documents `verifierRoles` payload as the MVP authorization; `security: VerifierRoleAuth` removed from the review endpoint; `X-Verifier-Role` declared `[FUTURE PROPOSAL — NOT IMPLEMENTED]`. `[RESOLVED]`.
- **Superseding note (2026-08-01):** `DECISION-07` (server-derived identity) supersedes the "payload-canonical" wording above. Identity & roles (`verifierUserId`/`verifierRoles`, `actorUserId`/`actorRoles`) are never accepted from the client; they are resolved server-side from the session via `getServerIdentity()` (see `src/lib/auth/session.ts`, `DECISION_LOG.md` DECISION-07). `registry.ts` and `docs/07_API_ENDPOINTS.md` §2.5 were updated accordingly. No runtime auth change was made.

### 2.4 Sensitive Document Submission Drift
- **Internal Routes:** Accept `ktpDocumentUrl`, `ktpNumber`, `ijazahDocumentUrl`.
- **Public API Contract:** These fields are correctly absent from the public `verification.schema.json` and `educator.schema.json`.
- **Audit Result:** `[SAFE]`. The privacy boundary defined in `PRODUCT_API_BOUNDARY.md` was successfully enforced in the contracts.

### 2.5 Sanad Semantic Drift — `[RESOLVED]`
- **Runtime/Prisma:** Requires `qiraahType` (top-level persistence column).
- **Contract (`sanad.schema.json`):** Previously mirrored `qiraahType`.
- **Audit Result:** `[SEMANTIC DRIFT]`. The codebase suffers from vertical-slice anchoring (Quran-specific terminology), preventing the contract from being a true domain-neutral Trust API.
- **Resolution (2026-08-01):** Decision #1 — **contract-neutral**. Public contract now exposes semantic fields (`sanadType`, `knowledgeDomain`, `domainMetadata`); internal `qiraahType` column retained unchanged; explicit persistence→contract mapping documented in `sanad.schema.json` `$comment`. No DB migration, no runtime rename. `[RESOLVED]`.

---

## 3. REQUIRED RECONCILIATIONS — `[ALL RECONCILED 2026-08-01]`

1. ~~Fix the `X-Verifier-Role` header vs `verifierRoles` payload contradiction in OpenAPI.~~ — Done (Decision #2, payload-canonical).
2. ~~Formally declare `ApiKeyAuth` as `[FUTURE PROPOSAL]` or implement the middleware.~~ — Done (declared `[FUTURE PROPOSAL — DEFERRED]`).
3. ~~Reassess `qiraahType` in `sanad.schema.json`.~~ — Done (Decision #1, contract-neutral; no migration).

Also executed under Decision #3 (envelope/error): `error` field removed from all 6 runtime 500 responses (security hardening); `SuccessEnvelope` + optional-`details` ErrorEnvelope standardized in contract; `meta`/`PaginationMeta` marked `[FUTURE / ASPIRATIONAL]`; endpoints `bookings/confirm` + `verification/status` added to OpenAPI `[IMPLEMENTED + RUNTIME VERIFIED]`.

---

## 4. FOUNDER DECISION LOG

| Decision | Topic | Status | Runtime change |
| :--- | :--- | :--- | :--- |
| **#1** | `qiraahType` semantic drift | `[APPROVED — CONTRACT-NEUTRAL]` (no DB migration, no rename) | ❌ |
| **#2** | Verifier authorization | `[APPROVED — PAYLOAD-CANONICAL]` (`verifierRoles`; `X-Verifier-Role` + `ApiKeyAuth` = FUTURE PROPOSAL) — *lihat superseding note §2.3 (DECISION-07)* | ❌ |
| **#3** | Envelope / meta / error shape | `[APPROVED — RUNTIME-CANONICAL]` (2xx/error as-is; 500 no `error`; `meta` FUTURE) | ✅ removed `error` from 6×500 responses |
