# DOMAIN RECONCILIATION — SEMESTA ISLAM

**Governed by:** `MASTER_CONTEXT.md` §5 (evidence taxonomy), `BSD.md` §2 (status classification), `MASTER_PARALLEL_EXECUTION_DIRECTIVE v3.0` §8.

Every claim below is classified per directive §1.1: `VERIFIED / IMPLEMENTED_UNVERIFIED / PARTIAL / PROVISIONAL / ASPIRATIONAL / BLOCKED / DEFERRED / REJECTED`.

---

## 1. BOOKING DOMAIN

### 1.1 Canonical current lifecycle

```text
PENDING → CONFIRMED
```

| Claim | Status | Evidence |
| --- | --- | --- |
| Only `PENDING → CONFIRMED` has a server write path | VERIFIED | `src/lib/bookings/service.ts:344` is the only `bookingRequest.update` in the repo |
| `createBookingInquiry` enforces educator + course ownership server-side | VERIFIED | `src/lib/bookings/service.ts:30-44` |
| `confirmBooking` rejects non-`PENDING` with 409 | VERIFIED | `src/lib/bookings/service.ts:318-324` |
| `confirmedAt` is derived from audit `BOOKING_CONFIRMED.createdAt`, not a booking column | VERIFIED | `src/lib/bookings/service.ts:257-266`; schema has no `confirmed_at` |
| `BookingStatus` enum contains `IN_PROGRESS / COMPLETED / CANCELLED` | VERIFIED | `prisma/schema.prisma:38-44` |
| Those extra states have no server mutation path | VERIFIED | no service/API writes them |
| UI timeline marks `IN_PROGRESS / COMPLETED` as `deferred`, `CANCELLED` as terminal branch | VERIFIED | `src/components/bookings/BookingStatusTimeline.tsx:14-18,88-104` |

### 1.2 Extension-state classification (NOT activated)

| State | Classification | Policy status | Next action |
| --- | --- | --- | --- |
| `CANCELLED` | PROVISIONAL extension | Lifecycle policy not canonical; poin-reversal policy unresolved | Register only; do NOT activate |
| `IN_PROGRESS` | PROVISIONAL extension | Needs verified session-start contract | Register only; do NOT activate |
| `COMPLETED` | PROVISIONAL extension | Needs verified completion contract | Register only; do NOT activate |
| `RESCHEDULED` | PROVISIONAL extension | Not present in enum; requires domain decision | Register only; do NOT activate |

**Decision:** Per directive §2, these are extension candidates requiring domain-policy reconciliation. They will NOT be activated in this pass. API endpoints for them are registered as `PROVISIONAL` in the API registry.

---

## 2. PAYMENT DOMAIN

| Claim | Status | Evidence |
| --- | --- | --- |
| Value model is closed-loop, non-cash, non-withdrawable | VERIFIED | DECISION-10/11 (`docs/audit/DECISION_LOG.md:28-29`); UI copy "non-tunai dan tidak dapat ditarik" |
| Payment seam = adapter boundary | VERIFIED | `src/lib/payment/mockAdapter.ts` — `PaymentGatewayAdapter {createInvoice, handleWebhook}`; mode `SIMULATED_INTERNAL`; comment "swap with Midtrans/Xendit when credentials available" (`:30-32`) |
| Mock adapter returns `PAID` immediately with `amount: 0` | VERIFIED | `mockAdapter.ts:33-49`; consumed at `src/app/api/v1/bookings/inquire/route.ts:53-59` |
| Real settlement is gated by business decision + credentials | VERIFIED | DECISION-11; `PAYMENT_PROVIDER` config does not exist yet in code |
| PRD/ERD mention Payment/Invoice/Settlement aspirationally | ASPIRATIONAL | `03_ERD.md:1055-1095`, `02_PRD.md:637-657` |
| Midtrans/Xendit adapters | ASPIRATIONAL | no code; official docs are technical references only |

**Decision:** Payment capability stays adapter-based. Production adapters (Midtrans/Xendit) are configuration-gated; no real settlement may occur merely because an adapter exists. `SIMULATED_INTERNAL — Belum ada pembayaran riil.` is preserved.

---

## 3. VERIFICATION DOMAIN

| Claim | Status | Evidence |
| --- | --- | --- |
| State machine `DRAFT→SUBMITTED→UNDER_REVIEW_LAJNAH→VERIFIED/REJECTED`, `REJECTED/REVOKED→SUBMITTED` | VERIFIED | `src/lib/verification/stateMachine.ts:8-15` |
| Service guards (verifier role, optimistic concurrency, educator ownership) | VERIFIED | `src/lib/verification/service.ts:115-193,202-277` |
| `layer4EthicsScore` field exists, default 100, no auto-calc | VERIFIED | `prisma/schema.prisma:197`; `LajnahClient.tsx:36` hardcodes `ethicsScore: 100` |
| Auto ethics formula exists only in docs | ASPIRATIONAL | `docs/08_SECURITY_COMPLIANCE.md:104-107` |
| `CredentialBadge` issuance on `→VERIFIED` | PROVISIONAL | acceptance §2.3 `[PENDING]`; model exists `schema.prisma:207-216` |
| OCR (`tesseract.js`) + PDF (`pdf-lib`) deps installed, zero usage | BLOCKED / unused | `package.json:26,30`; zero imports in `src/` |
| Duplicate SHA-256 hash detection | PROVISIONAL | acceptance §2.3 `[PARTIAL]` |
| Document storage buckets / signed URLs | BLOCKED (cloud creds) | `docs/08_SECURITY_COMPLIANCE.md:71-73`; no storage code |
| Document contents are NOT fabricated; demo exposes metadata/hash only | VERIFIED | `LajnahClient.tsx:114-119` shows hash; no viewer |

**Decision:** Do not fabricate document viewers. Storage/OCR remain adapter-based and configuration-gated. Badge issuance + ethics auto-score are PROVISIONAL — only implement against a reconciled contract (T3, adapter-first).

---

## 4. TERMINOLOGY (canonical contract)

| Term | Status | Occurrences (canonical) |
| --- | --- | --- |
| Pendidik / Ajukan Sesi / Pengajuan Sesi / Detail Pengajuan / Aktivitas Saya / Ruang Pendidik / Sesi Dikonfirmasi / Menunggu Konfirmasi / Verifikasi Lajnah / Sanad Keilmuan / Kredensial / Poin Internal / non-tunai / tidak dapat ditarik / Simulasi / Preview — belum fungsional | VERIFIED | `BookingClient.tsx`, `learner/activity/**`, `workspace/**`, `educator/[id]/page.tsx`, `BookingStatusTimeline.tsx` |
| "Poin internal platform — non-tunai dan tidak dapat ditarik." | VERIFIED | `learner/activity/page.tsx:190` |
| "SIMULATED_INTERNAL — Belum ada pembayaran riil." | VERIFIED | `BookingClient.tsx:179` |
| Forbidden: Jadwal Dikonfirmasi / Dompet Poin Khidmah / Poin Apresiasi Belajar / revenue / GMV / commission earnings / payment settlement | REJECTED | previously removed; must not be reintroduced |

**Decision:** Preserve. Any UI in this pass must use only canonical terms.

---

## 5. IDENTITY & AUTHORIZATION

| Claim | Status | Evidence |
| --- | --- | --- |
| `getServerIdentity()` is authoritative | VERIFIED | `src/lib/auth/session.ts:66-91` |
| Client payloads never supply `actorUserId/actorRoles/verifierUserId/verifierRoles` | VERIFIED | API routes resolve server-side (`bookings/confirm/route.ts:18`, `verification/review/route.ts:17`) |
| Roles come from `role_assignments` table, never client | VERIFIED | `session.ts:9,48-55` |
| Demo identity = cookie `semesta_demo_identity`, `@localhost.test`, demo-mode gated | VERIFIED | `session.ts:21-22,31-41,82-88` |
| `isDemoMode()` = `NODE_ENV!==production && APP_ENV==='development' && LOCAL_DEMO_MODE==='true'` | VERIFIED | `session.ts:31-37` |
| Demo tooling must never be exposed in production | PARTIAL — `DemoRoleSwitcher` rendered unconditionally | `src/app/layout.tsx:54` → fix in T1/T6 |

---

## 6. VERIFIED TEST BASELINE (must not regress)

```text
typecheck: PASS
tests: 28 PASS (verification 18, growth 10)
build: PASS
runtime funnel: VERIFIED
seed: deterministic, restored
```

---

*Status of this document: maintained by Contract Integrator during execution. Update only with evidence.*
