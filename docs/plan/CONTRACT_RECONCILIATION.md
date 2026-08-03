# CONTRACT RECONCILIATION — SEMESTA ISLAM

**Governed by:** directive §1.2 authority order (LOCKED DECISIONS → CANONICAL DOCS → VERIFIED CODE → ACCEPTANCE/TESTS → REGISTRIES → PLAN → EXTERNAL REFS → EXAMPLES).

Purpose: record every known contract drift between canonical documentation and the verified implementation, and its disposition. Update only with evidence.

---

## 1. AUTHORITY ORDER (applied)

```text
LOCKED BUSINESS / DOMAIN DECISIONS        (DECISION_LOG.md: DECISION-01..12)
CANONICAL SEMESTA ISLAM DOCUMENTATION     (docs/00..10, docs/plan/*)
CURRENT VERIFIED IMPLEMENTATION           (src/** + runtime evidence)
ACCEPTANCE / TEST EVIDENCE                (docs/10, src/lib/__tests__)
API / ERD / ARCHITECTURE REGISTRIES       (docs/07, docs/03, src/lib/developer/registry.ts)
IMPLEMENTATION PLAN                       (docs/plan/*, MASTER_PARALLEL_EXECUTION_DIRECTIVE v3.0)
EXTERNAL TECHNICAL REFERENCES             (official docs)
EXPLORATORY EXAMPLES
```

---

## 2. DRIFT LEDGER

| ID | Contract source | Claim in contract | Verified reality | Disposition |
| --- | --- | --- | --- | --- |
| C1 | `03_ERD.md` | 22 models match schema | Migration has only 17 tables/5 enums; 5 growth models + 3 enums missing from migration; local DB synced via `db push` (no `_prisma_migrations`) | RECONCILE in foundation: new verified migration; keep incremental |
| C2 | `08_SECURITY_COMPLIANCE.md` §1 | RLS policies on tables | Zero `CREATE POLICY`/`ENABLE ROW LEVEL SECURITY` in migration; docs-only | BLOCKED (needs Supabase); register policy SQL as deploy step |
| C3 | `08_SECURITY_COMPLIANCE.md` §2 | `audit_logs` has `entity_id UUID NOT NULL`, `actor_id → auth.users` | Local `AuditLog` has no `entity_id`; actor is local `users` FK; entityId flattened to JSON metadata | PARTIAL; keep local FK; add `entityId` in migration only when domain contract requires |
| C4 | `07_API_ENDPOINTS.md` | ~27 endpoints documented | Only 6 implemented (`bookings/inquire,confirm`; `verification/submit,review,status,resubmit`) + dev `auth/demo-login` | Register each missing endpoint with status; do NOT auto-implement |
| C5 | `07_API_ENDPOINTS.md` §5 | Upstash rate limiting + Supabase RBAC | Not implemented; deps installed, unused | BLOCKED (cloud creds); documented aspirational |
| C6 | `09_RESOURCE_REGISTRY.md` §2.3 | `resend ^4.0.0` in deps | Not in `package.json` | Registry correction needed (T7) |
| C7 | `10_ACCEPTANCE_CRITERIA.md` | 17 criteria, all unchecked; 4 `[MVP VERIFIED]` tags | Matches (zero fully production-ready) | Maintain; update per evidence only |
| C8 | DECISION_LOG D1 | 6-role enum canonical | Code `UserRole` = 6 roles ✓; seed covers 4/6 (no GUARDIAN/INSTITUTION_ADMIN user) | Keep; add seed demo users only with contract |
| C9 | `01_BSD.md`/`06_DESIGN.md` | 5-role wording in some docs | Code = 6 roles | Drift recorded; docs fix in T7 |
| C10 | `session.ts` | Demo mode triple gate | Present ✓ | Keep |
| C11 | PRD §42 | GMV/Revenue/Commission/Earnings dashboards | Value model non-tunai; metrics would fabricate money semantics | REJECTED for use; dashboards use truthful metrics only |
| C12 | `docs/02_PRD.md` | Magic-link auth | Blocked (cloud); `/login` is a static mockup | T1 implements Quick Demo Portal + adapter |
| C13 | Acceptance §2.3 | OCR KTP / duplicate hash / ethics auto-score / badge on VERIFIED | Deps unused; no code | PROVISIONAL, adapter-gated (T3) |
| C14 | `middleware.ts` | Session refresh only, no protection | True | T1 adds demo-aware protection; never sole security layer |
| C15 | `layout.tsx` | `DemoRoleSwitcher` unconditional | True → leaks dev tooling to prod UI | T1/T6 gate by server-derived `isDemoMode()` |

---

## 3. CONTRACT-CONFORMANCE COMMITMENTS (binding)

1. No new entity/model is added solely because an aspirational document mentions it (`directive §1.1, §9`).
2. No lifecycle state beyond `PENDING → CONFIRMED` is activated without a reconciled domain contract (`directive §2, §8`).
3. Payment stays closed-loop non-cash; real settlement gated (`DECISION-11`).
4. Canonical Indonesian terminology is preserved; forbidden terms never reintroduced.
5. `getServerIdentity()` remains the sole authority; clients never supply actor/verifier identities.
6. Demo tooling is never exposed in production.

---

## 4. VERIFIED BASELINE (reconfirmed)

```text
typecheck PASS · test 28/28 PASS · build PASS · runtime funnel VERIFIED · seed restored
DB: booking_requests = 2 (1 PENDING, 1 CONFIRMED)
```

*Maintained by Contract Integrator.*
