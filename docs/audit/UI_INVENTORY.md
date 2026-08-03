# UI & ROUTE IMPLEMENTATION INVENTORY — SEMESTA ISLAM

**Document:** `docs/UI_INVENTORY.md`  
**Status:** Active Production Component Inventory  
**Authority:** Governed by `docs/06_DESIGN.md` & `AI AGENT DIRECTIVE`

---

## 1. ROUTE & PAGE MANIFEST

| Route | Source File | Layout / Type | Required Role | Data Source | Interactive Elements | Local Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`/`** | `src/app/page.tsx` | Public Landing | Public | `listEducatorSummaries` (DB) | Search box, Category Filter, Quick Navigation | `[RUNNABLE]` |
| **`/directory`** | `src/app/directory/page.tsx` | Educator Directory | Public | `listEducatorSummaries` (DB) | Keyword search, Tag filters | `[RUNNABLE]` |
| **`/educator/[id]`** | `src/app/educator/[id]/page.tsx` | Educator Profile | Public | `getEducatorDetail` (DB); invalid ID → `404` | Tabbed Bio, Sanad silsilah, Booking CTA | `[RUNNABLE]` |
| **`/booking`** | `src/app/booking/page.tsx` | Booking Inquiry | `LEARNER` | Form State & API Route | Multi-step form, Zod client validation | `[RUNNABLE]` |
| **`/educator/verification`** | `src/app/educator/verification/page.tsx` | Educator Portal | `EDUCATOR` | `GET /api/v1/verification/status` (DB) | Status display, Reviewer notes, Resubmit CTA | `[RUNNABLE]` |
| **`/management/lajnah`** | `src/app/management/lajnah/page.tsx` | Lajnah Dashboard | `LAJNAH_VERIFIER` | `listVerificationQueue` (DB) | Status review actions (Approve/Reject) | `[RUNNABLE]` |
| **`/developer`** | `src/app/developer/page.tsx` | Developer API Reference | Public (read-only) | `src/lib/developer/registry.ts` (static typed metadata) | Section/endpoint navigation (anchor + details) | `[RUNNABLE]` |

---

## 2. API ROUTE MANIFEST

| Route Path | HTTP Method | Zod Contract | Auth / Role Requirement | Persistence Adapter | Local Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`/api/v1/bookings/inquire`** | `POST` | `BookingInquirySchema` | Authenticated Learner | Prisma / Postgres + `MockPaymentGatewayAdapter` | `[RUNNABLE]` |
| **`/api/v1/bookings/confirm`** | `POST` | `BookingConfirmSchema` | Booking Owner / Founder | Prisma / Postgres + Audit Trail | `[RUNNABLE]` |
| **`/api/v1/verification/submit`** | `POST` | `VerificationSubmitSchema` | Authenticated Educator | Prisma / Postgres + SHA-256 Fingerprint | `[RUNNABLE]` |
| **`/api/v1/verification/status`** | `GET` | `VerificationStatusQuery` | Educator / Founder | Prisma / Postgres | `[RUNNABLE]` |
| **`/api/v1/verification/review`** | `POST` | `LajnahReviewSchema` | `LAJNAH_VERIFIER` / `FOUNDER_ADMIN` | Prisma / Postgres + State Machine + Audit Trail | `[RUNNABLE]` |
| **`/api/v1/verification/resubmit`** | `POST` | `VerificationSubmitSchema` | Authenticated Educator | Prisma / Postgres + State Machine + Audit Trail | `[RUNNABLE]` |

---

## 3. REUSABLE UI COMPONENTS INVENTORY

- **`Header`** (`src/components/ui/Header.tsx`): Top bar navigation, brand logo, & theme toggle switch.
- **`BottomNav`** (`src/components/ui/BottomNav.tsx`): Native mobile bottom navigation bar with safe-area inset (`env(safe-area-inset-bottom)`).
- **`EducatorCard`** (`src/components/ui/EducatorCard.tsx`): Educator card displaying verification badge, rating, & expertise chips.
- **`DemoRoleSwitcher`** (`src/components/dev/DemoRoleSwitcher.tsx`): Local development identity switcher for switching between `DEV_LEARNER`, `DEV_EDUCATOR`, `DEV_LAJNAH`, and `DEV_FOUNDER`.
