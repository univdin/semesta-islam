# RESOURCE REGISTRY — SEMESTA ISLAM (External Resources)

**Governed by:** directive §4 / §18.

Classifies every external technical reference used or needed. `AUTHORITATIVE` = governs WHAT; `OFFICIAL` = explains HOW; `EXPLORATORY` = optional, unverified.

Fields: RESOURCE ID · NAME · TYPE · URL · PURPOSE · TRACK · STATUS.

---

## A. AUTHORITATIVE (govern WHAT — must not be contradicted)

| ID | Name | Type | URL | Purpose | Track | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-A1 | SEMESTA ISLAM BRD | repo doc | `docs/00_BRD.md` | vision, outcomes, actors | all | VERIFIED |
| R-A2 | BSD | repo doc | `docs/01_BSD.md` | system boundaries, status taxonomy | all | VERIFIED |
| R-A3 | PRD | repo doc | `docs/02_PRD.md` | functional capabilities | all | VERIFIED |
| R-A4 | ERD | repo doc | `docs/03_ERD.md` | canonical data model | all | VERIFIED |
| R-A5 | OSS & Resource Strategy | repo doc | `docs/04_OSS.md` | reuse + license discipline | Foundation | VERIFIED |
| R-A6 | MASTER_CONTEXT | repo doc | `docs/05_MASTER_CONTEXT.md` | system prompt, §64 loop | all | VERIFIED |
| R-A7 | MASTER_PARALLEL_EXECUTION_DIRECTIVE v3.0 | external | provided | governs this pass | all | VERIFIED |

## B. OFFICIAL (explain HOW — fetch before writing engine/API code)

| ID | Name | Type | URL | Purpose | Track | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-O1 | Next.js 15 App Router docs | official | https://nextjs.org/docs | dynamic API, RSC, middleware | T1/T4 | ACTIVE |
| R-O2 | Prisma 6 docs | official | https://www.prisma.io/docs | schema/migrations/seed | Schema | ACTIVE |
| R-O3 | PostgreSQL 16 docs | official | https://www.postgresql.org/docs/16/ | types, indexes, constraints | Schema | ACTIVE |
| R-O4 | Tailwind CSS 3.4 docs | official | https://tailwindcss.com/docs | utility system | T6 | ACTIVE |
| R-O5 | Zod 3.24 docs | official | https://zod.dev | runtime validation | all | ACTIVE |
| R-O6 | Vitest 2 docs | official | https://vitest.dev | test runner | all | ACTIVE |
| R-O7 | React 19 docs | official | https://react.dev | server/client components | T1/T6 | ACTIVE |
| R-O8 | Supabase SSR docs | official | https://supabase.com/docs | auth adapter, middleware | T1 | BLOCKED (cloud) |
| R-O9 | Resend API docs | official | https://resend.com/docs | transactional email | T1 | BLOCKED (cloud) |
| R-O10 | Upstash Ratelimit docs | official | https://github.com/upstash/ratelimit | rate limiting | T1/T5 | BLOCKED (cloud) |
| R-O11 | Tesseract.js docs | official | https://github.com/naptha/tesseract.js | OCR KTP adapter | T3 | PROVISIONAL |
| R-O12 | pdf-lib docs | official | https://pdf-lib.org | PDF hash/metadata | T3 | PROVISIONAL |
| R-O13 | Midtrans docs | official | https://docs.midtrans.com | production payment adapter | T2 | PROVISIONAL (gated) |
| R-O14 | Xendit docs | official | https://docs.xendit.co | production payment adapter | T2 | PROVISIONAL (gated) |
| R-O16 | Node `crypto` (built-in) | official | https://nodejs.org/api/crypto.html | HMAC webhook signature (mock adapter) | T2 | ACTIVE (no new dependency) |
| R-O15 | shadcn/ui | official | https://ui.shadcn.com | component conventions (already vendored) | T6 | VERIFIED |

## C. EXPLORATORY (optional, unverified — never change WHAT)

| ID | Name | Type | URL | Purpose | Track | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-E1 | Growth-loop references | blog | — | gamification/xp patterns | T4/T5 | EXPLORATORY |
| R-E2 | Sanad-chain exemplars | article | — | credential chain UX | T3 | EXPLORATORY |
| R-E3 | Marketplace-policy samples | article | — | lifecycle policy drafting | T2 | EXPLORATORY |

---

## D. RESOURCE DISCIPLINE (binding)

1. External resources explain HOW; canonical docs explain WHAT. Conflicts resolve to canonical docs (§1.2).
2. Add a dependency/package only if it appears in an `AUTHORITATIVE`/`OFFICIAL` row with a verified contract — never from memory.
3. Every new external URL used in code must be recorded here before use.

*Maintained by Release Integrator.*
