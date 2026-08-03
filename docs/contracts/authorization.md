# SEMESTA ISLAM — AUTHORIZATION & RBAC CONTRACT
**Status:** `[REPOSITORY VERIFIED]` / `[CODE VERIFIED]` — authorization semantics per Decision #2 (2026-08-01, **payload-canonical**)

This document defines the Role-Based Access Control (RBAC) and scope authorization rules enforced across the API boundary.

> **Decision #2 (2026-08-01):** The canonical MVP authorization for `/verification/review` is the **`verifierRoles` array in the JSON payload**. `X-Verifier-Role` header and `ApiKeyAuth` are `[FUTURE PROPOSAL]` and NOT enforced at runtime. PHASE 2 (Supabase Auth SSR + RBAC) will replace payload/demo identity with authenticated session + server-side identity.

---

## 1. Domain Roles (`UserRole` Enum)

| Role                | Definition & Authority Scope                                                  |
| :--------------------| :------------------------------------------------------------------------------|
| `LEARNER`           | End user searching for educators and submitting booking inquiries.            |
| `GUARDIAN`          | Parent/guardian booking on behalf of a minor learner.                         |
| `EDUCATOR`          | Educator managing profiles, courses, and submitting verification requests.    |
| `INSTITUTION_ADMIN` | Admin of an Islamic institution/Pesantren managing affiliated educators.      |
| `LAJNAH_VERIFIER`   | Authorized verifier empowered to review and transition verification requests. |
| `FOUNDER_ADMIN`     | System superadmin with full platform oversight.                               |

---

## 2. Server-Side Verification Role Guard (`isAuthorizedVerifierRole`)

In `src/lib/verification/stateMachine.ts`:
- Endpoints like `POST /api/v1/verification/review` strictly enforce that `verifierRoles` contains `LAJNAH_VERIFIER` or `FOUNDER_ADMIN`.
- Violations return `HTTP 403 Forbidden`: `Forbidden: Insufficient privileges.`

---

## 3. Developer API Scopes (Future)

> `[FUTURE PROPOSAL — DEFERRED]` Belongs to the post-MVP Developer Platform. No runtime middleware enforces these scopes.

For third-party developers, API Keys will be scoped:
- `read:educators` — Access public profiles and courses.
- `read:sanad` — Access verified Sanad records.
- `write:bookings` — Submit booking inquiries on behalf of end users.
- `read:verification_status` — Query verification status by document hash.
