# SEMESTA ISLAM — PRODUCT IMPLEMENTATION PLAN

> **STATUS:** Database foundation (PostgreSQL 16 + Prisma) complete; DB-backed runtime (discovery, booking, verification, audit, ledger) implemented and runtime-verified. Read-only Developer Reference (`/developer`) shipped (Batch 5). See `POST_EXECUTION_VERIFICATION.md` for evidence. Current operational model follows strict priority: **`PRODUCT → USERS → CORE LOOP → PRODUCTION`**.
>
> **Batch Status:**
> - Batch 1/2/4 (independent audit) — `[PASS]`
> - Batch 5 (`/developer` read-only reference) — `[COMPLETE — APPROVED AS BASELINE 2026-08-01]`
> - Contract reconciliation (docs + one 500 security fix) — `[COMPLETE — Decisions #1–#3 LOCKED; see CONTRACT_DRIFT_REPORT.md §4]`
> - Batch 3 (Educator Workspace) — `[DEFERRED]`
>
> **MILESTONE CLOSE-OUT (2026-08-01):** Batch 5 + contract reconciliation `[COMPLETE]`. Founder decisions locked. Runtime security fix verified. **PHASE 2 — USERS READY FOR FOUNDER APPROVAL** — do not implement until explicit approval.
>
> **PHASE 2 ENTRY CHECK (prerequisite, not new work):** (1) baseline seed deterministic; (2) existing DB schema verified; (3) Supabase credentials available; (4) `@supabase/ssr` available; (5) `@supabase/supabase-js` available; (6) current MVP tests remain green.

---

## 1. Execution Sequence & Priority Map

```text
┌─────────────────────────┐     ┌─────────────────────────┐
│     PHASE 1: PRODUCT    │ ──▶ │     PHASE 2: USERS      │
│  (Discovery/Evaluation) │     │ (Authentication/Roles)  │
└─────────────────────────┘     └─────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   PHASE 4: PRODUCTION   │ ◄── │   PHASE 3: CORE LOOP    │
│  (Governance & Polish)  │     │ (Booking & Confirmation)│
└─────────────────────────┘     └─────────────────────────┘
```

---

## 2. Phase Breakdown

### PHASE 1 — PRODUCT (Discovery & Evaluation)
- **`/directory`**: Connect educator directory search and filter UI (`?category=`, `?q=`) directly to `EducatorProfile` and `CourseCatalog` database queries via Prisma. — **`[DONE — RUNTIME VERIFIED]`**
- **`/educator/[id]`**: Render full educator bio, verified badges, `SanadRecord` chains, and available course offerings fetched dynamically from PostgreSQL. — **`[DONE — RUNTIME VERIFIED]`**
- **`/developer`** (Batch 5): Read-only Developer Reference built from `src/lib/developer/registry.ts` (29 endpoint metadata entries; 6 VERIFIED / 20 DEFERRED / 3 ASPIRATIONAL). — **`[DONE — RUNTIME VERIFIED]`**

### PHASE 2 — USERS (Identity & Access)
- **Supabase Auth SSR Integration**: Connect `@supabase/ssr` to bind user sessions to database `User` records. — **`[BLOCKED — CLOUD CREDENTIALS]`** (deps installed, unused)
- **RBAC & Role Assignments**: Enforce role access control across `LEARNER`, `EDUCATOR`, `LAJNAH_VERIFIER`, and `FOUNDER_ADMIN`. — **`[BLOCKED — CLOUD CREDENTIALS]`** (interim: server-side demo identity `DEMO_LEARNER_USER_ID` / `LAJNAH_VERIFIER_USER_ID`)
- **DB Seeding (`prisma/seed.js`)**: Populate deterministic test users for seamless testing without manual registration. — **`[DONE]`** (7 users / 4 educators / 4 verification requests / 2 bookings / 2 ledgers / 5 sanad / 9 courses)

### PHASE 3 — CORE LOOP (Booking & Transactions)
- **Learner Booking Inquiry**: Wire `/booking` form and `BookingInquirySchema` to submit `BookingRequest` entries with initial status `PENDING`. — **`[DONE — RUNTIME VERIFIED]`** (`POST /api/v1/bookings/inquire` → 201; ledger accrual)
- **Educator Confirmation Action**: Build educator workspace action to transition `BookingRequest` from `PENDING` → `CONFIRMED` or `REJECTED`. — **`[API DONE]`** (`POST /api/v1/bookings/confirm` → 200, 409 on re-confirm) — **`[UI DEFERRED]`** (Batch 3 educator workspace page; reject endpoint = scope expansion, pending Founder)

### PHASE 4 — PRODUCTION (Governance & Final Polish)
- **Lajnah Verification Queue (`/management/lajnah`)**: Operationalize verification review for `VerificationRequest`, updating `EducatorProfile.verifiedStatus` to `VERIFIED` and issuing `CredentialBadge`s. — **`[REVIEW FLOW DONE — RUNTIME VERIFIED]`** (`/verification/review` state machine, role guard 403, transition guard 409; `/verification/status` 200) — **`[BADGE ISSUANCE PENDING]`** (`CredentialBadge` belum dibuat saat transisi → `VERIFIED`)
- **Quality & Verification Gates**: Validate zero type errors (`npm run typecheck`), passing test suite (`npm test`), and successful production build (`npm run build`). — **`[DONE]`** (typecheck 0, 18/18 tests, build 13/13 static pages)

---

## 3. Scope Boundaries & Deferred Features

- **Shipped (read-only)**: `/developer` Developer Reference page (metadata registry, status taxonomy `IMPLEMENTED / DEFERRED / ASPIRATIONAL / NOT_IMPLEMENTED`). This is documentation-of-code, not a developer platform.
- **Deferred Features (Post-B2C MVP)**: Full Developer API Portal (auth'd API keys, OAuth Client Credentials, Webhook Subscriptions, B2B Partner SDKs, Payment Gateway Sandboxes), Upstash rate limiting, `meta`/`PaginationMeta` list contracts, `X-Verifier-Role` header & `ApiKeyAuth` (declared `[FUTURE PROPOSAL]`). These remain preserved as hypotheses in `docs/productization/`.
- **Deferred Implementation**: Batch 3 Educator Workspace UI, `CredentialBadge` issuance on `VERIFIED`, PHASE 2 Supabase Auth SSR + RBAC (blocked on cloud credentials).
