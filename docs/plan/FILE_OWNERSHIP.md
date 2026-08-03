# FILE OWNERSHIP — SEMESTA ISLAM (Parallel Execution)

**Governed by:** directive §14/§15.

Rule: No two parallel agents own the same shared file. If a track needs another track's file, it MUST create a **handoff request** (do not edit silently).

## 1. SHARED (controlled) FILES — coordination required

| File | Owner | Rule |
| --- | --- | --- |
| `prisma/schema.prisma` | Schema Integrator | only verified-contract changes |
| `prisma/migrations/**` | Schema Integrator | incremental, one per domain contract |
| `prisma/seed.js` | Data/Infra | demo-only destructive; guarded |
| `prisma/seed.production.js` | Data/Infra | idempotent bootstrap |
| `package.json` | Foundation | scripts + deps |
| `src/types/index.ts` | Contract Integrator | shared types only |
| `src/lib/validations/**` | Contract Integrator | per-domain files |
| `src/lib/env.ts` | Foundation | env schema + accessor |
| `src/app/layout.tsx` | T1 (gating) → T6 (provider) | sequenced: T1 gates, then T6 adds provider |
| `src/components/ui/Header.tsx` / `HeaderServer.tsx` | T1 | nav/login; T4 supplies founder-removal content as handoff |
| `src/lib/developer/registry.ts` | Release Integrator | status reconciliation at T7 |
| `docs/**` | per §5 / release | owner per domain; T7 consolidates |

## 2. TRACK OWNERSHIP

| Track | Owning paths |
| --- | --- |
| T1 — AUTH/ACCESS/SETUP | `src/lib/auth/**`, `src/middleware.ts`, `src/app/login/**`, `src/app/setup/**`, `src/app/api/v1/auth/**`, `src/components/auth/**` |
| T2 — BOOKING | `src/lib/bookings/**`, `src/app/api/v1/bookings/**`, `src/app/api/v1/payments/**`, `src/components/bookings/**`, `src/lib/payment/**` |
| T3 — VERIFICATION/STORAGE | `src/lib/verification/**`, `src/lib/security/**`, `src/lib/storage/**`, `src/app/management/lajnah/**`, `src/app/educator/verification/**`, `src/components/lajnah/**` |
| T4 — ROLE/DASHBOARDS | `src/app/learner/**`, `src/app/educator/**`, `src/app/guardian/**`, `src/app/institution/**`, `src/app/management/{governance,founder}/**`, `src/components/dashboard/**`, `src/lib/referrals/**`, `src/app/api/v1/{member,referrals}/**` |
| T5 — PRODUCT MODULES | `src/lib/{cms,taxonomy,lms,erp,rbac}/**`, `src/app/api/v1/{courses,lms,management}/**`, `src/app/courses/**`, `src/app/management/{cms,taxonomy,erp,rbac}/**` |
| T6 — UX SYSTEM | `src/components/ui/ToastProvider.tsx`, `Toaster.tsx`, `useToast.ts`, modal/sheet, client mutation components (toast swap) |
| T7 — RELEASE | `docs/10`, `docs/07`, `src/lib/developer/registry.ts`, `README.md`, CI/CD, `docs/audit/DECISION_LOG.md` |

## 3. HANDOFF CONTRACT (directive §19)

Every track completion produces: TRACK / STATUS / FILES CREATED / FILES MODIFIED / CONTRACTS / DECISIONS / TESTS / RUNTIME EVIDENCE / KNOWN LIMITATIONS / REGISTRY UPDATES / HANDOFF NOTES.

## 4. DEFAULT OWNERSHIP MATRIX (directive §14)

| Area | Owner | Area | Owner |
| --- | --- | --- | --- |
| Prisma schema | Schema Integrator | learner/educator dashboards | T4 |
| migrations | Schema Integrator | CMS | T5 |
| shared types | Contract Integrator | LMS | T5 |
| env | Foundation | taxonomy | T5 |
| package.json | Foundation | RBAC | T5 |
| seed | Data/Infra | toast | T6 |
| middleware | T1 | registry | Release Integrator |
| auth | T1 | acceptance docs | Release Integrator |
| bookings | T2 | verification | T3 |

---

*Maintained by Release Integrator.*
