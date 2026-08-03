# MASTER AUDIT REPORT — Founder/Management + Member/Organization Portal
## SEMESTA ISLAM — Architecture Readiness Assessment

**Date:** 2026-08-03  
**Governed by:** `MASTER_PARALLEL_EXECUTION_DIRECTIVE v3.0` + Founder Master Prompt + Member/Organization Master Prompt  
**Evidence standard:** ALL findings backed by file:line references.

---

## 1. EXECUTIVE SUMMARY

SEMESTA ISLAM has a **verified core loop** — learner books educator, educator confirms, lajnah verifies — but the platform lacks the **operational control plane** for founders and the **portal depth** for members/organizations. The data model is flat (role-enum, no RBAC), 5 growth models exist only in schema (not migrated), GUARDIAN/INSTITUTION_ADMIN are decorative, and infrastructure (email, storage, backup, health, notifications) is entirely aspirational.

**Root cause:** MVP prioritised the discovery/booking/verification transaction loop. Governance, delegation, organization management, and infrastructure were deferred. The `UserRole` enum + `RoleAssignment` model was designed as a flat grant, not a capability-based authorization system.

---

## 2. ROLE INVENTORY (Aktual vs Documented)

| Role | Schema Enum | TS Type | In Seed? | Runtime Usage | Classification |
|---|---|---|---|---|---|
| LEARNER | VERIFIED | VERIFIED | VERIFIED | VERIFIED (7 locations) | VERIFIED |
| EDUCATOR | VERIFIED | VERIFIED | VERIFIED | VERIFIED (5 locations) | VERIFIED |
| LAJNAH_VERIFIER | VERIFIED | VERIFIED | VERIFIED | VERIFIED (4 locations) | VERIFIED |
| FOUNDER_ADMIN | VERIFIED | VERIFIED | VERIFIED | VERIFIED (17 locations; hardcoded) | VERIFIED |
| GUARDIAN | VERIFIED | VERIFIED | NOT IN SEED | NEVER USED (0 guards, 0 pages) | **UNWIRED** |
| INSTITUTION_ADMIN | VERIFIED | VERIFIED | NOT IN SEED | NEVER USED (0 guards, 0 pages, 0 models) | **UNWIRED** |

---

## 3. ARCHITECTURE GAP MATRIX

### 3.1 Founder/Management Control Plane (Master Prompt #1)

| Capability | Status | Evidence/Blockers |
|---|---|---|
| Founder dashboard/overview | **MISSING** | No page, no API, no metrics aggregation page |
| Governance console | **UI-ONLY** | `src/app/management/governance/page.tsx:64` — self-declared "Preview — belum fungsional" |
| Delegation (assign staff) | **MISSING** | No staff entity, no delegation model, no invite flow |
| RBAC management UI | **MISSING** | `RoleAssignment` model exists but no CRUD UI or API |
| Capability-based access | **MISSING** | 17+ hardcoded `FOUNDER_ADMIN` string comparisons; no `can()` abstraction |
| Sensitive-action approval | **MISSING** | No approval workflow, no MFA gate |
| Audit log viewer | **MISSING** | Audit logged (6 event types) but no query API or viewer UI |
| Backup/export | **MISSING** | No backup scripts, no export endpoints |
| Email/mailing | **MISSING** | RESEND_API_KEY=placeholder; no adapter code |
| Notification system | **UI-ONLY** | ToastProvider exists but no persistent notification model |
| Changelog/releases | **MISSING** | No CHANGELOG.md, no release notes system |
| Configuration UI | **MISSING** | Env vars only; no runtime config management |
| System health monitor | **PARTIAL** | `auditGrowthSystemHealth()` exists (library) but no endpoint/UI |
| Health check endpoints | **MISSING** | No `/api/health`, no readiness probe |
| Data export | **MISSING** | No CSV/JSON/SQL export |
| Impersonation | **MISSING** | No support login, no `sudo` capability |

### 3.2 Member/Organization Portal (Master Prompt #2)

| Portal | Capability | Status |
|---|---|---|
| **LEARNER** | Dashboard | PARTIAL — `/learner/activity` as de facto dashboard, no welcome/overview |
| | Bookings | VERIFIED — list + detail + create |
| | Points ledger | VERIFIED — balance + entries |
| | Profile | MISSING — UserProfile model exists, no edit UI |
| | Settings | MISSING |
| | Progress reports | UNWIRED — model exists, no UI/API |
| | Notifications | MISSING |
| **EDUCATOR** | Workspace | VERIFIED — booking list + confirm |
| | Verification | VERIFIED — status + resubmit |
| | Course management | MISSING — read-only display, no CRUD |
| | Schedule management | MISSING — read-only, no CRUD |
| | Learner management | PARTIAL — learner name visible in bookings |
| | Profile | MISSING |
| **GUARDIAN** | Entire portal | **MISSING** — no route, no page, no seed data |
| **ORGANIZATION** | Entire concept | **MISSING** — no Organization/Institution model in schema |
| | Institution admin | **UNWIRED** — role exists, nothing to administrate |
| **ALL ROLES** | Multi-role support | PARTIAL — schema supports it, seed doesn't exercise it |
| | Role switching | MISSING — DemoRoleSwitcher swaps identities, not roles |
| | Unified dashboard | MISSING — no `/dashboard` route |
| | Notifications | MISSING — Toast system unused by any page |
| | Profile editing | MISSING — all roles |

---

## 4. AUTHORIZATION AUDIT HIGHLIGHTS

### Security Findings (from Audit #1)

| # | Severity | Finding | File:Line |
|---|---|---|---|
| A1 | **HIGH** | Verification status API — no auth, leaks PII | `app/api/v1/verification/status/route.ts:9` |
| A2 | **HIGH** | Verification submit API — no auth, anyone can submit for any educator | `app/api/v1/verification/submit/route.ts:6` |
| A3 | MEDIUM | getUserReputationAction — no auth, arbitrary user ID | `app/actions/growth.ts:68` |
| A4 | MEDIUM | evaluateComplianceStateAction — no auth | `app/actions/growth.ts:152` |
| A5 | MEDIUM | getGrowthIntelligenceAuditAction — no auth | `app/actions/growth.ts:143` |
| A6 | MEDIUM | recordAttributionAction — trusts client userId when unauthenticated | `app/actions/growth.ts:91` |
| A7 | MEDIUM | Middleware — no security headers, no route protection | `middleware.ts:12-45` |
| A8 | LOW | bookings/inquire — falls back to hardcoded DEMO_LEARNER_USER_ID | `app/api/v1/bookings/inquire/route.ts:19` |

### Anti-Pattern Inventory

- **Hardcoded role strings**: `FOUNDER_ADMIN` appears as string literal in 17+ locations
- **No capability abstraction**: Authorization is `if (roles.includes('X'))` everywhere
- **No scope model**: No SELF/ORGANIZATION/PLATFORM distinction
- **UI-ONLY authorization**: Header.tsx hides links client-side; server checks are separate

---

## 5. DATA MODEL GAPS

### Migration vs Schema Drift (Audit #5)
- **5 models** in `schema.prisma` (lines 350-425) but **missing from migration**: XpLedger, ReputationProfile, AttributionRecord, CampaignRecord, CommissionLedger
- **3 enums** in schema but missing from migration: AttributionActorType, CommissionStatus, XpActionType
- Seed.js calls `deleteMany()` on these 5 models — would fail at runtime if migration not synced

### Organization Architecture Gap
- No `Organization` model, no `OrganizationMembership`, no `OrganizationalRole`
- No `Permission`/`RolePermission` tables (ERD §20-22)
- No organization-scoped ownership on any resource
- `INSTITUTION_ADMIN` role exists but has no institution entity to administer

### AuditLog Gap
- `entityId` embedded in JSON metadata, not a column — no indexed querying
- No audit log viewer for founders
- Role assignment changes are not audited

---

## 6. REUSE ASSESSMENT

| Existing Asset | Can Reuse For |
|---|---|
| `getServerIdentity()` + `hasRole()` | Foundation for all authorization |
| `persistAuditEvent()` | Audit trail across all new features |
| `PaymentGatewayAdapter` pattern | Adapter pattern for email/storage/OCR |
| `ToastProvider`/`useToast` | Notification UI (needs persistence layer) |
| `stateMachine.ts` | Booking/verification lifecycle extensions |
| `env.ts` Zod validation | Runtime configuration schema |
| `RoleAssignment` model | Extend with `organizationId`/`scopeType` for RBAC |
| `LajnahClient.tsx` review flow | Template for delegation/invite flows |
| `BookingClient.tsx` form pattern | Configuration forms, profile editing |
| `EducatorCard.tsx` profile display | Member/org profile cards |

---

## 7. TARGET ARCHITECTURE

```
┌──────────────────────────────────────────────┐
│           FOUNDER GOVERNANCE LAYER           │
│  Delegation | Audit | Config | Approval     │
│  Backup | Export | Health | System          │
└──────────────────┬───────────────────────────┘
                   │ monitors / controls / delegates
                   ▼
┌──────────────────────────────────────────────┐
│          ORGANIZATION PORTAL LAYER           │
│  Dashboard | Members | Roles | Programs     │
│  Reports | Settings | Org Audit             │
└──────────────────┬───────────────────────────┘
                   │ manages organization scope
                   ▼
┌──────────────────────────────────────────────┐
│             MEMBER PORTAL LAYER              │
│  Dashboard | Activity | Profile | Settings  │
│  Notifications | Progress | Points          │
│  ┌─────────┬──────────┬──────────┐          │
│  │ Learner │ Educator │ Guardian │          │
│  └─────────┴──────────┴──────────┘          │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│        DOMAIN SERVICES (Existing)            │
│  Bookings | Verification | Ledger | Growth  │
│  Payment (mock) | Audit                     │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│      INFRASTRUCTURE / ADAPTERS               │
│  Email | Storage | OCR | Notifications      │
│  Health | Backup | Export                   │
└──────────────────────────────────────────────┘
```

**Core principle:** Management UI → API → Authorization → Domain Service → Repository → Data.  
**Never:** Management UI → Database directly.

---

## 8. ROLE × CAPABILITY MATRIX (Proposal)

| Capability | Founder | Co-Founder | Org Admin | Org Staff | Learner | Educator | Guardian | Lajnah | Auditor |
|---|---|---|---|---|---|---|---|---|---|
| View platform overview | ✓ | ✓ | R | ✗ | ✗ | ✗ | ✗ | R | R |
| Manage users | ✓ | scoped | scoped | ✗ | ✗ | ✗ | ✗ | ✗ | R |
| Assign roles | ✓ | approval | scoped | ✗ | ✗ | ✗ | ✗ | ✗ | R |
| View audit log | ✓ | ✓ | scoped | scoped | ✗ | ✗ | ✗ | R | ✓ |
| Manage verification | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | R |
| Manage bookings | ✓ | scoped | scoped | scoped | self | self | dependents | ✗ | R |
| Manage courses | ✓ | ✓ | ✓ | scoped | ✗ | self | ✗ | ✗ | R |
| Configure platform | ✓ | approval | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | R |
| Backup/export | ✓ | scoped | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | R |
| Manage CMS | ✓ | ✓ | ✓ | scoped | ✗ | ✗ | ✗ | ✗ | R |
| Email/mailing | ✓ | ✓ | scoped | scoped | ✗ | ✗ | ✗ | ✗ | ✗ |
| Impersonate | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View own activity | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit own profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |

**Legend:** ✓ full · scoped (org/user) · R read-only · approval requires founder · ✗ denied

---

## 9. SECURITY RISKS

| Risk | Severity | Recommendation |
|---|---|---|
| Unprotected verification APIs expose PII | HIGH | Add auth gates to status and submit endpoints |
| No capability-based authorization | HIGH | Implement `can(user, action, resource)` before adding delegation |
| No organization isolation | HIGH | Build organization scoping before Institution features |
| 5 models not migrated | MEDIUM | Run incremental migration for growth infrastructure |
| Hardcoded role strings everywhere | MEDIUM | Centralize to `src/lib/auth/roles.ts` constants |
| No security headers | MEDIUM | Add CSP/HSTS via middleware |
| No health check endpoints | MEDIUM | Add `/api/health` for monitoring |
| Toast unused by any page | LOW | Wire toast into mutation flows |
| Audit logs unwatchable | HIGH | Add audit query API + Founder audit viewer |

---

## 10. IMPLEMENTATION PLAN

### WAVE 0 — SECURITY FOUNDATION (prerequisite)
| Track | Deliverable | Dependencies |
|---|---|---|
| **S0-AUTH** | Fix 6 security findings (verification API gates, server action auth) | None |
| **S0-SCHEMA** | Incremental migration for 5 missing growth models + 3 enums | None |
| **S0-RBAC** | `src/lib/auth/roles.ts` constants + `can()` capability function + scope model | S0-AUTH |
| **S0-ADAPTER** | Email adapter interface + Storage adapter interface | env.ts |

### WAVE 1 — MEMBER PORTAL (parallel)
| Track | Deliverable | Dependencies |
|---|---|---|
| **T1-DASH** | Unified `/dashboard` role-aware entry point | S0-AUTH |
| **T1-PROFILE** | Profile editing for all roles (use UserProfile model) | S0-AUTH |
| **T1-LEARNER** | Learner dashboard, progress reports, settings | T1-DASH, S0-SCHEMA |
| **T1-EDUCATOR** | Course/schedule CRUD, learner management | T1-DASH |
| **T1-GUARDIAN** | Guardian portal (pages, seed, auth) — DECISION REQUIRED on whether to implement or defer | S0-AUTH |

### WAVE 2 — ORGANIZATION PORTAL
| Track | Deliverable | Dependencies |
|---|---|---|
| **T2-ORG** | Organization/Institution model + migration | S0-SCHEMA |
| **T2-MEMBER** | OrganizationMembership model + invite/accept | T2-ORG |
| **T2-ROLE** | Organization-scoped RoleAssignment extension | T2-ORG, S0-RBAC |
| **T2-DASH** | Organization admin dashboard | T2-ORG, T2-MEMBER |

### WAVE 3 — FOUNDER GOVERNANCE
| Track | Deliverable | Dependencies |
|---|---|---|
| **T3-DELEGATE** | Staff invitation, role assignment, revocation | S0-RBAC, T2-ORG |
| **T3-AUDIT** | Audit log query API + Founder audit viewer | S0-AUTH |
| **T3-CONFIG** | Runtime configuration management UI | env.ts |
| **T3-DASH** | Founder dashboard with live metrics | S0-AUTH |

### WAVE 4 — INFRASTRUCTURE
| Track | Deliverable | Dependencies |
|---|---|---|
| **T4-EMAIL** | Resend adapter + transactional email (booking, verification) | S0-ADAPTER |
| **T4-STORAGE** | Supabase/local storage adapter + document upload pipeline | S0-ADAPTER |
| **T4-NOTIFY** | Persistent notification model + in-app delivery + email | S0-AUTH |
| **T4-HEALTH** | `/api/health` endpoint + infra monitoring | S0-AUTH |
| **T4-BACKUP** | pg_dump script + export endpoints | None |

### WAVE 5 — COMMUNICATION & POLISH
| Track | Deliverable | Dependencies |
|---|---|---|
| **T5-CMS** | Content management (articles, pages) | S0-AUTH |
| **T5-CHANGELOG** | Release notes system | T5-CMS |
| **T5-MAILING** | Announcement/bulk email | T4-EMAIL |
| **T5-UX** | Toast wiring, a11y sweep, responsive consistency | All tracks |

### PARALLEL EXECUTION MATRIX

```
WAVE 0 ── sequential (security foundation must come first)
WAVE 1 ── T1-DASH + T1-PROFILE first, then T1-LEARNER/EDUCATOR/GUARDIAN in parallel
WAVE 2 ── sequential within wave (model → membership → roles → dashboard)
WAVE 3 ── T3-DELEGATE + T3-AUDIT + T3-CONFIG in parallel; T3-DASH after
WAVE 4 ── T4-EMAIL/STORAGE/NOTIFY/HEALTH in parallel; T4-BACKUP independent
WAVE 5 ── T5-CMS → T5-CHANGELOG; T5-MAILING parallel; T5-UX continuous
```

---

## 11. DECISIONS REQUIRED

| # | Decision | Options | Impact |
|---|---|---|---|
| D1 | **Implement GUARDIAN role?** | (A) Yes, build guardian portal · (B) Defer to post-MVP · (C) Remove from enum | Wave 1 scope |
| D2 | **Implement INSTITUTION_ADMIN + Organization?** | (A) Yes, Wave 2 · (B) Keep role but defer · (C) Remove until needed | Wave 2 scope |
| D3 | **Capability-based RBAC or extend Role enum?** | (A) Full capability model · (B) Hybrid (role groups + scope) · (C) Keep flat roles | Architecture |
| D4 | **Email provider?** | Resend (proposed in DECISION-02) vs alternatives | Wave 4 |
| D5 | **Storage provider?** | Supabase Storage vs S3-compatible vs local-only | Wave 4 |
| D6 | **Backup frequency/retention?** | Policy decision for production | Wave 4 |
| D7 | **Impersonation allowed?** | If yes: founder-only + time-limited + full audit + visible banner | Wave 3 |
| D8 | **Multi-organization for users?** | (A) Yes · (B) One org per user | Wave 2 data model |
| D9 | **Co-Founder role?** | (A) Add to enum · (B) Use capability-based delegation instead | Wave 3 |

---

## 12. FILE REGISTRY — Key Files by Domain

| Domain | Key Files |
|---|---|
| Auth/Identity | `src/lib/auth/session.ts`, `src/middleware.ts`, `src/app/api/auth/demo-login/route.ts` |
| Verification | `src/lib/verification/service.ts`, `stateMachine.ts`, `src/app/api/v1/verification/*` |
| Bookings | `src/lib/bookings/service.ts`, `src/app/api/v1/bookings/*`, `BookingClient.tsx` |
| Educator | `src/lib/educators/service.ts`, `src/app/educator/workspace/*`, `verification/*` |
| Learner | `src/app/learner/activity/*`, `src/app/booking/*` |
| Management | `src/app/management/governance/page.tsx`, `lajnah/page.tsx`, `LajnahClient.tsx` |
| Growth/XP | `src/lib/growth/*`, `src/app/actions/growth.ts` |
| Audit | `src/lib/audit/service.ts`, `prisma/schema.prisma:335-346` |
| Ledger | `src/lib/ledger/service.ts` |
| Payment | `src/lib/payment/mockAdapter.ts` |
| Schema | `prisma/schema.prisma`, `prisma/migrations/*` |
| Config | `src/lib/env.ts`, `.env*` files |
| UI System | `src/components/ui/*`, `src/app/layout.tsx` |

---

## 13. VERIFICATION GATES

Per acceptance criteria:

```
WAVE 0 gate: typecheck + test + lint + build PASS
WAVE 1 gate: each portal page typechecks, tests for profile/activity auth
WAVE 2 gate: organization isolation tests pass (Org A cannot access Org B)
WAVE 3 gate: all founder actions produce audit events, delegation revocation works
WAVE 4 gate: health endpoint returns 200, email adapter sends, storage uploads
WAVE 5 gate: E2E smoke test, a11y audit, lint 0 errors
```

---

*Audit complete. No coding performed per Master Prompt directives. Awaiting decision on D1-D9 before Wave 0 implementation.*
