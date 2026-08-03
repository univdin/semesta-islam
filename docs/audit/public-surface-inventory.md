# Public Surface Inventory — SEMESTA ISLAM

**Status:** LIVE BASELINE
**Date:** 2026-08-03
**Source of truth:** Empirical crawl of `src/app/` + `vercel deploy --prod` (https://semesta-islam.vercel.app)
**Authority:** Governed by `05_MASTER_CONTEXT.md` §5 classification. This is the canonical routing inventory.

---

## 1. Page Routes (App Router)

Legend: **PUB** = no server auth gate (public / marketing / discovery) · **AUTH** = requires `getServerIdentity` / role guard.

### 1.1 Public Pages (14)

| Route | File | Auth | Metadata | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | PUB | no | Landing — P1 SEO target |
| `/directory` | `src/app/directory/page.tsx` | PUB | no | Direktori pendidik (client filter) |
| `/discovery` | `src/app/discovery/page.tsx` | PUB | yes | Discovery eksperimen |
| `/educator/[id]` | `src/app/educator/[id]/page.tsx` | PUB | no | Profil publik + Sanad (server-rendered) |
| `/booking` | `src/app/booking/page.tsx` | PUB | no | Form booking (client) |
| `/login` | `src/app/login/page.tsx` | PUB | yes | Auth entry (demo panel) |
| `/changelog` | `src/app/changelog/page.tsx` | PUB | no | Public changelog |
| `/contributions` | `src/app/contributions/page.tsx` | PUB | yes | Dampak sosial |
| `/developer` | `src/app/developer/page.tsx` | PUB | yes | Developer docs portal (B2B deferred) |
| `/affiliate` | `src/app/affiliate/page.tsx` | PUB | yes | Program afiliasi |
| `/ambassador` | `src/app/ambassador/page.tsx` | PUB | yes | Program duta |
| `/organization` | `src/app/organization/page.tsx` | AUTH | no | Daftar organisasi |
| `/organization/[id]` | `src/app/organization/[id]/page.tsx` | AUTH | no | Detail organisasi |

### 1.2 Authenticated Pages (21)

| Route | File | Role scope | Metadata |
| :--- | :--- | :--- | :--- |
| `/member` | `src/app/member/page.tsx` | any auth | no |
| `/member/activity` | `src/app/member/activity/page.tsx` | any auth | no |
| `/member/notifications` | `src/app/member/notifications/page.tsx` | any auth | no |
| `/member/organizations` | `src/app/member/organizations/page.tsx` | any auth | no |
| `/member/points` | `src/app/member/points/page.tsx` | any auth | no |
| `/member/profile` | `src/app/member/profile/page.tsx` | any auth | no |
| `/learner/activity` | `src/app/learner/activity/page.tsx` | LEARNER | no |
| `/learner/activity/[bookingId]` | `src/app/learner/activity/[bookingId]/page.tsx` | LEARNER | no |
| `/educator/verification` | `src/app/educator/verification/page.tsx` | EDUCATOR | no |
| `/educator/workspace` | `src/app/educator/workspace/page.tsx` | EDUCATOR | no |
| `/educator/workspace/[bookingId]` | `src/app/educator/workspace/[bookingId]/page.tsx` | EDUCATOR | no |
| `/management` | `src/app/management/page.tsx` | FOUNDER_ADMIN | no |
| `/management/audit` | `src/app/management/audit/page.tsx` | FOUNDER_ADMIN | yes |
| `/management/backups` | `src/app/management/backups/page.tsx` | FOUNDER_ADMIN | no |
| `/management/communications` | `src/app/management/communications/page.tsx` | FOUNDER_ADMIN | no |
| `/management/delegations` | `src/app/management/delegations/page.tsx` | FOUNDER_ADMIN | no |
| `/management/economy` | `src/app/management/economy/page.tsx` | FOUNDER_ADMIN | no |
| `/management/governance` | `src/app/management/governance/page.tsx` | FOUNDER_ADMIN | no |
| `/management/lajnah` | `src/app/management/lajnah/page.tsx` | FOUNDER_ADMIN | no |
| `/management/organizations` | `src/app/management/organizations/page.tsx` | FOUNDER_ADMIN | no |
| `/management/people` | `src/app/management/people/page.tsx` | FOUNDER_ADMIN | no |
| `/management/system` | `src/app/management/system/page.tsx` | FOUNDER_ADMIN | no |

## 2. API Routes

### 2.1 Public / Unauthenticated

| Method | Route | File | Guard |
| :--- | :--- | :--- | :--- |
| GET | `/api/health` | `src/app/api/health/route.ts` | none (public liveness) |
| POST | `/api/auth/demo-login` | `src/app/api/auth/demo-login/route.ts` | demo mode only |

### 2.2 Authenticated / Role-gated (all under `/api/v1`)

| Method | Route | File | Guard |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/bookings/confirm` | `src/app/api/v1/bookings/confirm/route.ts` | EDUCATOR |
| POST | `/api/v1/bookings/inquire` | `src/app/api/v1/bookings/inquire/route.ts` | LEARNER |
| GET | `/api/v1/economy/balance` | `src/app/api/v1/economy/balance/route.ts` | auth |
| GET | `/api/v1/economy/ledger` | `src/app/api/v1/economy/ledger/route.ts` | auth |
| GET | `/api/v1/economy/transactions` | `src/app/api/v1/economy/transactions/route.ts` | auth |
| POST | `/api/v1/management/backups` | `src/app/api/v1/management/backups/route.ts` | FOUNDER |
| POST | `/api/v1/management/changelog` | `src/app/api/v1/management/changelog/route.ts` | FOUNDER |
| POST | `/api/v1/management/delegations` | `src/app/api/v1/management/delegations/route.ts` | FOUNDER |
| POST | `/api/v1/management/economy/adjustments` | `src/app/api/v1/management/economy/adjustments/route.ts` | FOUNDER |
| GET | `/api/v1/management/economy/overview` | `src/app/api/v1/management/economy/overview/route.ts` | FOUNDER |
| POST | `/api/v1/management/economy/reversals` | `src/app/api/v1/management/economy/reversals/route.ts` | FOUNDER |
| POST | `/api/v1/member/notifications/read-all` | `src/app/api/v1/member/notifications/read-all/route.ts` | auth |
| GET/PATCH | `/api/v1/member/profile` | `src/app/api/v1/member/profile/route.ts` | auth |
| POST | `/api/v1/organizations/[id]/members` | `src/app/api/v1/organizations/[id]/members/route.ts` | ORG_ADMIN |
| POST | `/api/v1/payments/webhook` | `src/app/api/v1/payments/webhook/route.ts` | signature |
| POST | `/api/v1/verification/resubmit` | `src/app/api/v1/verification/resubmit/route.ts` | EDUCATOR |
| POST | `/api/v1/verification/review` | `src/app/api/v1/verification/review/route.ts` | LAJNAH |
| GET | `/api/v1/verification/status` | `src/app/api/v1/verification/status/route.ts` | EDUCATOR |
| POST | `/api/v1/verification/submit` | `src/app/api/v1/verification/submit/route.ts` | EDUCATOR |

## 3. Global / Infrastructure

| Item | File | Notes |
| :--- | :--- | :--- |
| Security headers middleware | `src/middleware.ts` | nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy |
| Root layout + metadata | `src/app/layout.tsx` | global metadata (partial) |
| OpenGraph image | `src/app/opengraph-image.tsx` | exists |
| App icon | `src/app/icon.svg` | exists |
| Legacy favicon | `public/favicon.svg` | exists |
| `apple-touch-icon` | — | **MISSING** (referenced but not present) |
| `robots.txt` | — | **MISSING** |
| `sitemap.xml` | — | **MISSING** |
| `llms.txt` | — | **MISSING** |

## 4. Gaps Identified (→ F4 SEO)

1. **Only 8/34 pages** export `metadata` — 26 pages rely on layout default (F4).
2. **No `robots.ts` / `sitemap.ts` / `llms.txt`** (F4).
3. **No `apple-touch-icon`** asset (F4).
4. Public pages with 0 metadata (`/`, `/directory`, `/educator/[id]`, `/booking`, `/changelog`, `/organization*`) are the highest SEO priority (F4).
5. No structured data / JSON-LD on public pages (F6 AEO).
6. `/api/health` intentionally public for uptime/keep-alive (no sensitive data).

## 5. Notes

- `src/app/icon.svg` + `public/favicon.svg` coexist; reconcile in F4.
- Discovery, affiliate, ambassador, developer pages are currently **public** marketing surfaces (B2B dev portal is deferred scope per `docs/productization/`).
- The `/api/auth/demo-login` route must be hardened/removed in production — verify in F8.
