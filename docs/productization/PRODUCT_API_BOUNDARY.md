# SEMESTA ISLAM — PRODUCT API BOUNDARY
**Phase:** P0
**Status:** [REPOSITORY VERIFIED]

This document classifies every domain entity in the current Prisma schema (`prisma/schema.prisma`) according to its appropriate visibility and exposure level for a Developer Platform.

## Classification Taxonomy
- **PUBLIC**: Safe for anonymous access. Suitable for public API endpoints.
- **AUTHENTICATED**: Safe for the owning user only.
- **PARTNER**: Available to authorized B2B partners.
- **DEVELOPER**: Specific to developer platform consumption.
- **VERIFIER**: Available only to users with the `LAJNAH_VERIFIER` role.
- **ADMIN**: Available only to system administrators.
- **INTERNAL**: Strictly for backend orchestration. Never exposed directly.
- **SENSITIVE**: Contains PII, credentials, or private documents.
- **PRIVATE**: Strictly restricted to the owner; highly confidential.

---

## 1. Identity & Profile Domain

| Entity | Classification | Justification / Notes |
| :--- | :--- | :--- |
| `User` | **INTERNAL / SENSITIVE** | Core identity table. Contains email, phone, and system status. Must never be exposed directly in public APIs. |
| `UserProfile` | **PUBLIC** | Contains public-facing data: `fullName`, `avatarUrl`, `bio`, `locationCity`. Safe to expose as part of an educator or public learner profile representation. |
| `RoleAssignment` | **INTERNAL** | Used purely for backend RBAC (Role-Based Access Control). Not a public API resource. |
| `LearnerProfile` | **AUTHENTICATED / PRIVATE** | Contains `guardianName` and `notes`. Should only be visible to the learner, their guardian, or an educator they have an active booking with. |

## 2. Educator & Verification Domain

| Entity | Classification | Justification / Notes |
| :--- | :--- | :--- |
| `EducatorProfile` | **PUBLIC** | The primary directory resource. Safe to expose `title`, `teachingMethod`, `ratingAverage`, `reviewsCount`, and `verifiedStatus`. |
| `SanadRecord` | **PUBLIC** | Core trust asset. `qiraahType`, `chainDescription`, and `verifiedByLajnah` are public. *Note: `certificateUrl` must be evaluated to ensure it does not leak PII.* |
| `VerificationRequest` | **VERIFIER / SENSITIVE** | Contains highly sensitive PII (`layer1KtpUrl`, `layer2IjazahUrl`). Must ONLY be exposed to `LAJNAH_VERIFIER` and the owning educator. |
| `CredentialBadge` | **PUBLIC** | Public trust metadata. Safe to expose on the educator's profile. |

## 3. Course Catalog & LMS Domain

| Entity | Classification | Justification / Notes |
| :--- | :--- | :--- |
| `CourseCatalog` | **PUBLIC** | Defines what an educator teaches. Safe for anonymous public discovery. |
| `CourseSchedule` | **PUBLIC** | Defines availability. Safe for anonymous public discovery. |
| `LearningProgressReport`| **PRIVATE** | Sensitive educational progress. Visible only to the educator and the specific learner. |

## 4. Booking & Economic Domain

| Entity | Classification | Justification / Notes |
| :--- | :--- | :--- |
| `BookingRequest` | **AUTHENTICATED** | Transactional intent. Visible only to the participating learner and educator. |
| `EconomicLedger` | **INTERNAL / PRIVATE** | Financial/token balances. Visible only to the account owner and system admins. |
| `ReferralCode` | **AUTHENTICATED / PARTNER** | Used for growth. Publicly usable, but ownership metrics (`clickCount`) are private to the owner. |
| `ReferralConversion` | **INTERNAL / PRIVATE** | Tracks who converted. Privacy implications mean this shouldn't be publicly queryable. |
| `ReviewRating` | **PUBLIC** | Educator reviews. Safe to expose publicly to build trust. |
| `AuditLog` | **ADMIN / INTERNAL** | System integrity logs. Never exposed to consumers. |

---

## Key Productization Discoveries [REPOSITORY VERIFIED]

1. **The Public Directory is Safe**: `EducatorProfile`, `SanadRecord`, `CourseCatalog`, `CourseSchedule`, `CredentialBadge`, and `ReviewRating` form a highly coherent, safe-to-expose Public API graph.
2. **Verification is Strictly Internal**: `VerificationRequest` cannot be an API resource for external developers. It is strictly a `VERIFIER` boundary.
3. **Identity Must Be Shielded**: The `User` model must be rigorously separated from `UserProfile` in all API responses to prevent email/phone leakage.

**Next Step:** Proceed to Phase P1 (Domain Contract Extraction) to define the explicit API resources for the entities classified as PUBLIC and AUTHENTICATED.
