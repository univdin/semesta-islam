# ERD — SEMESTA ISLAM PLATFORM

## Organization, Governance, Management & Platform Domain Model

**Document:** `ERD.md`
**Status:** Updated
**Purpose:** Canonical domain/data model for AI/LLM implementation agents.

---

# 1. MODELING DIRECTIVE

The platform consists of two connected but distinct dimensions:

```text
SEMESTA ISLAM ORGANIZATION
        │
        │ owns / governs / operates
        ▼
PLATFORM BUSINESS & SERVICE DOMAIN
```

The organization layer represents the people and structures responsible for governing and operating SEMESTA ISLAM.

The platform domain represents users, educators/providers, learners, guardians, offerings, bookings, learning/service delivery, payments, trust, content and related capabilities.

These dimensions MUST NOT be conflated.

---

# 2. HIGH-LEVEL DOMAIN MAP

```text
                           SEMESTA ISLAM
                                │
                ┌───────────────┼────────────────┐
                │               │                │
                ▼               ▼                ▼
           GOVERNANCE       MANAGEMENT          OPERATIONS
                │               │                │
                ▼               ▼                ▼
        Founder / Owner      Manager            Staff
        Investor / Donor     Executive           Finance
        Advisor / Board      Head / Lead         Marketing
                                                  Support
                                                  Verification
                                                  Content
                                                  Community
                │
                └────────────────┬────────────────┘
                                 ▼
                         PLATFORM OPERATIONS
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
              PROVIDERS       LEARNERS       GUARDIANS
                  │              │              │
                  └──────────────┼──────────────┘
                                 ▼
                             OFFERINGS
                                 │
                              BOOKING
                                 │
                              SESSION
                                 │
                     ┌───────────┴───────────┐
                     ▼                       ▼
                  PAYMENT                PROGRESS
                     │                       │
                   PAYOUT                  REPORT
```

---

# 3. IDENTITY LAYER

## 3.1 User

`User` represents a digital identity.

```text
User
- id
- email
- phone
- name
- avatar
- status
- locale
- created_at
- updated_at
```

A User may participate in multiple contexts.

```text
User
 ├── OrganizationMembership
 ├── RoleAssignment
 ├── PersonProfile
 ├── Educator
 ├── Learner
 └── Guardian
```

A User MUST NOT be assumed to have only one role.

---

# 4. ORGANIZATION

## 4.1 Organization

Represents a legal, operational, institutional, community, or partner entity.

SEMESTA ISLAM is represented as an Organization.

```text
Organization
- id
- name
- legal_name nullable
- type
- description
- status
- contact_information
- created_at
- updated_at
```

Example:

```text
Organization
└── SEMESTA ISLAM
```

Potential future organizations may include partner institutions or other approved entities.

---

# 5. ORGANIZATION TYPE

The organization type is data-driven.

Potential values:

```text
platform_owner
foundation
education_provider
community
partner
institution
other
```

Do not hardcode these values into the database schema if configuration is sufficient.

---

# 6. ORGANIZATION MEMBERSHIP

## 6.1 OrganizationMembership

Defines a person's relationship with an organization.

```text
OrganizationMembership
- id
- organization_id
- user_id
- membership_type
- status
- joined_at
- ended_at nullable
```

Relationship:

```text
Organization 1 ──── N OrganizationMembership N ──── 1 User
```

A user may belong to multiple organizations.

---

# 7. ORGANIZATIONAL ROLE

## 7.1 OrganizationalRole

Defines a position/capacity within an organization.

```text
OrganizationalRole
- id
- organization_id
- name
- description
- role_category
- status
```

Examples:

```text
Founder
Owner
Investor
Donor
Advisor
Board Member
Director
Executive
General Manager
Manager
Head
Lead
Staff
```

These are organizational roles, not necessarily application permissions.

---

# 8. ORGANIZATIONAL ROLE ASSIGNMENT

## 8.1 OrganizationalRoleAssignment

Associates a user with an organizational role.

```text
OrganizationalRoleAssignment
- id
- organization_membership_id
- organizational_role_id
- department_id nullable
- position_id nullable
- start_at
- end_at nullable
- status
```

Example:

```text
Muhammad
   │
   └── Membership → SEMESTA ISLAM
                        │
                        └── Role → Founder / Owner
```

Another user:

```text
Staff A
   │
   └── Membership → SEMESTA ISLAM
                        │
                        └── Role → Finance Staff
```

---

# 9. DEPARTMENT

## 9.1 Department

Represents an operational unit.

```text
Department
- id
- organization_id
- parent_id nullable
- name
- description
- status
```

Potential departments:

```text
Management
Operations
Marketing
Sales
Verification
Customer Support
Finance
HR
Content
Education / Learning
Community
Technology
```

Departments are configurable.

---

# 10. POSITION

## 10.1 Position

Represents an organizational position.

```text
Position
- id
- organization_id
- department_id nullable
- title
- description
- status
```

Examples:

```text
Chief Executive
General Manager
Operations Manager
Marketing Staff
Finance Staff
Verification Officer
Content Editor
Customer Support
```

`Position` describes organizational structure.

`OrganizationalRole` describes the person's organizational capacity.

`Permission` describes what the person can do inside the system.

These concepts MUST remain distinct.

---

# 11. EMPLOYMENT / ENGAGEMENT

## 11.1 EmploymentEngagement

Represents a person's formal operational relationship with SEMESTA ISLAM.

```text
EmploymentEngagement
- id
- organization_id
- user_id
- engagement_type
- position_id nullable
- department_id nullable
- start_at
- end_at nullable
- status
```

Potential engagement types:

```text
employee
contractor
part_time
intern
volunteer
advisor
consultant
```

An educator/provider does not automatically become an employee.

---

# 12. OWNERSHIP / GOVERNANCE

Organizational ownership and governance MUST be distinguished from operational employment.

## 12.1 OwnershipInterest

Represents ownership/equity or other formal ownership interests where applicable.

```text
OwnershipInterest
- id
- organization_id
- holder_user_id nullable
- holder_organization_id nullable
- ownership_type
- percentage nullable
- status
- effective_at
- ended_at nullable
```

Potential ownership types:

```text
founder
owner
shareholder
institutional
other
```

If SEMESTA ISLAM is not legally structured around equity, this entity does not need to be implemented.

---

# 13. GOVERNANCE ROLE

## 13.1 GovernanceRole

Represents formal governance capacity.

```text
GovernanceRole
- id
- organization_id
- name
- description
- status
```

Examples:

```text
Founder
Owner
Board Member
Advisor
Trustee
Supervisor
```

---

# 14. GOVERNANCE ASSIGNMENT

```text
GovernanceAssignment
- id
- organization_id
- user_id
- governance_role_id
- start_at
- end_at nullable
- status
```

This prevents the system from incorrectly treating:

```text
Founder
=
Employee
=
Administrator
```

as the same concept.

---

# 15. INVESTOR / DONOR

Investors and donors are external or internal stakeholders whose financial relationship with the organization may need to be recorded.

## 15.1 FundingParticipant

```text
FundingParticipant
- id
- organization_id
- user_id nullable
- external_name nullable
- participant_type
- contact_information
- status
```

Potential types:

```text
investor
donor
sponsor
funder
grant_provider
```

---

# 16. FUNDING

## 16.1 Funding

Represents a funding commitment or contribution.

```text
Funding
- id
- organization_id
- funding_participant_id
- funding_type
- amount
- currency
- purpose nullable
- status
- committed_at
- received_at nullable
```

Potential types:

```text
investment
donation
sponsorship
grant
```

Financial/accounting details may ultimately belong to the ERP/finance system.

---

# 17. CONTRACT

## 17.1 Contract

Represents a formal organizational agreement.

```text
Contract
- id
- organization_id
- contract_type
- title
- counterparty_type
- counterparty_id
- status
- start_at
- end_at nullable
- document_reference nullable
```

Potential contract types:

```text
employment
provider
partnership
investment
donation
vendor
service
consulting
```

Actual legal-document storage may be delegated to a document management system.

---

# 18. MANAGEMENT HIERARCHY

The organizational model supports:

```text
SEMESTA ISLAM
│
├── Governance
│   ├── Founder / Owner
│   ├── Investor / Donor
│   ├── Board
│   └── Advisor
│
├── Executive / Management
│   ├── Director
│   ├── Executive
│   ├── General Manager
│   ├── Head
│   └── Manager
│
└── Operations
    ├── Staff
    ├── Officer
    ├── Specialist
    └── Support
```

The hierarchy is organizational data.

It does not automatically determine technical permissions.

---

# 19. IAM / PLATFORM PERMISSIONS

Organizational roles and platform authorization remain separate.

```text
User
 │
 ├── OrganizationalRoleAssignment
 │        └── Founder
 │
 └── RoleAssignment
          └── PlatformAdmin
```

For example:

```text
Founder
```

may have broad governance authority but does not automatically imply every technical permission.

Conversely:

```text
PlatformAdmin
```

may have technical system authority without being the owner of SEMESTA ISLAM.

---

# 20. PLATFORM ROLE

## 20.1 Role

```text
Role
- id
- name
- description
- system_defined
- status
```

Potential roles:

```text
platform_admin
organization_admin
manager
staff
verification_officer
finance_staff
content_editor
support_agent
educator
learner
guardian
```

Exact roles are configurable according to implementation.

---

# 21. PERMISSION

```text
Permission
- id
- resource
- action
- description
```

Examples:

```text
user.read
user.update

organization.read
organization.manage

role.assign
permission.manage

verification.review
verification.approve

booking.read
booking.manage

payment.read
payout.manage

content.create
content.edit
content.publish

report.read
```

---

# 22. ROLE-PERMISSION

```text
RolePermission
- role_id
- permission_id
```

Relationship:

```text
Role 1 ──── N RolePermission N ──── 1 Permission
```

---

# 23. ROLE ASSIGNMENT

```text
RoleAssignment
- id
- user_id
- role_id
- organization_id nullable
- scope_type nullable
- scope_id nullable
- status
- created_at
- expires_at nullable
```

This allows:

```text
Platform-wide
Organization-wide
Department-level
Resource-level
```

authorization where required.

---

# 24. PERSON / PARTICIPANT DOMAIN

```text
User
 │
 ├── PersonProfile
 ├── Educator
 ├── Learner
 └── Guardian
```

A person may participate in both organizational and platform contexts.

Example:

```text
User
├── Founder of SEMESTA ISLAM
├── Platform Administrator
└── Educator
```

The model supports this without forcing the identities together.

---

# 25. EDUCATOR / PROVIDER

```text
Educator
- id
- slug (canonical, nullable, unique)   # EXP-11: canonical entity URL
- user_id
- profile_id
- headline
- biography
- experience
- teaching_mode
- service_area
- verification_status
- availability_status
- rating_summary
- created_at
- updated_at
```

Relationship:

```text
User 1 ──── 0..1 Educator
```

An educator may operate:

```text
individually
```

or through:

```text
Organization
```

Therefore an optional organization association may be used:

```text
EducatorOrganization
- educator_id
- organization_id
- relationship_type
- status
```

---

# 26. LEARNER

```text
Learner
- id
- user_id nullable
- profile_id
- date_of_birth nullable
- status
```

A learner does not require an independent login account.

---

# 27. GUARDIAN

```text
Guardian
- id
- user_id
- relationship_type
- status
```

```text
GuardianLearner
- guardian_id
- learner_id
- relationship_type
- is_primary
```

---

# 28. OFFERING

```text
Offering
- id
- educator_id
- organization_id nullable
- title
- description
- category_id
- delivery_mode
- location
- duration
- price
- currency
- status
- created_at
- updated_at
```

---

# 29. CATEGORY

```text
Category
- id
- parent_id nullable
- name
- slug
- description
- status
```

The category system remains configurable.

---

# 30. PACKAGE

```text
Package
- id
- offering_id
- name
- description
- session_count
- price
- validity_period
- status
```

---

# 31. VERIFICATION

```text
Verification
- id
- subject_type
- subject_id
- verification_type
- status
- submitted_at
- reviewed_at
- reviewer_id
- notes
```

Verification officers are organizational/platform actors.

---

# 32. BADGE

```text
Badge
- id
- name
- description
- icon
- criteria
- status
```

```text
UserBadge
- user_id
- badge_id
- awarded_at
- expires_at
- status
```

---

# 33. BOOKING

```text
Booking
- id
- offering_id
- educator_id
- learner_id
- guardian_id nullable
- package_id nullable
- status
- start_at
- end_at
- price
- currency
- notes
- created_at
```

---

# 34. SESSION

```text
Session
- id
- booking_id
- educator_id
- learner_id
- scheduled_start
- scheduled_end
- actual_start
- actual_end
- delivery_mode
- status
- notes
```

---

# 35. LEARNING / PROGRESS

```text
LearningProgram
- id
- title
- description
- category_id
- status
```

```text
LearningEnrollment
- id
- learner_id
- program_id
- educator_id nullable
- status
- enrolled_at
```

```text
LearningItem
- id
- program_id
- parent_id nullable
- title
- description
- sequence
- status
```

```text
ProgressRecord
- id
- learner_id
- educator_id
- learning_item_id nullable
- session_id nullable
- status
- score nullable
- notes
- recorded_at
```

```text
ProgressReport
- id
- learner_id
- educator_id
- guardian_id nullable
- period_start
- period_end
- summary
- status
- published_at
```

---

# 36. PAYMENT / FINANCE

```text
Payment
- id
- booking_id
- payer_id
- amount
- currency
- provider
- provider_reference
- status
- paid_at
- created_at
```

```text
Commission
- id
- payment_id
- booking_id
- rate
- amount
- currency
- status
```

```text
Payout
- id
- educator_id
- booking_id nullable
- amount
- currency
- provider
- provider_reference
- status
- processed_at
```

Organizational finance may be reconciled through an ERP/finance system.

---

# 37. REVIEW

```text
Review
- id
- booking_id
- reviewer_id
- subject_type
- subject_id
- rating
- content
- status
- created_at
```

---

# 38. CMS

```text
Content
- id
- type
- title
- slug
- body
- status
- author_id
- published_at
- created_at
- updated_at
```

Potential content types:

```text
Page
Article
KnowledgeItem
FAQ
Help
Announcement
LegalDocument
```

---

# 39. LMS

Core platform learning entities:

```text
LearningProgram
LearningItem
LearningEnrollment
ProgressRecord
ProgressReport
```

If a dedicated LMS is adopted, its internal schema remains external.

---

# 40. CRM

Potential entities:

```text
Lead
Opportunity
Interaction
Campaign
CustomerAccount
```

A `Lead` is not necessarily a `User`.

---

# 41. ERP

ERP/finance remains an integration boundary.

Potential external system-of-record:

```text
Accounting
Invoice
Expense
Ledger
Settlement
Payroll
HR
```

The core platform should retain only the operational references it requires.

---

# 42. COMMUNITY

Optional:

```text
Community
CommunityMembership
Post
Comment
```

A dedicated community platform may own these entities.

---

# 43. MESSAGING

```text
Conversation
ConversationParticipant
Message
```

Messaging must be permission/context aware.

---

# 44. NOTIFICATION

```text
Notification
- id
- user_id
- type
- title
- body
- channel
- status
- sent_at
- read_at
```

---

# 45. LEGAL / POLICY

```text
LegalDocument
- id
- type
- version
- title
- content
- status
- effective_at
- published_at
```

```text
LegalAcceptance
- id
- user_id
- legal_document_id
- accepted_at
```

Potential documents:

```text
Terms
Privacy Policy
Provider Agreement
Guardian Policy
Refund Policy
Community Guidelines
Safety Policy
```

---

# 46. AUDIT LOG

```text
AuditLog
- id
- actor_id
- action
- resource_type
- resource_id
- metadata
- created_at
```

Organizational and platform actions must be auditable where required.

---

# 47. ORGANIZATION-TO-PLATFORM RELATIONSHIP

The conceptual relationship is:

```text
                    SEMESTA ISLAM
                         │
              owns / governs / operates
                         │
                         ▼
                 PLATFORM BUSINESS
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     PROVIDERS        LEARNERS         GUARDIANS
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                     OFFERINGS
                         │
                      BOOKING
                         │
                      SESSION
```

SEMESTA ISLAM therefore sits **above the platform operational domain** as its organizational owner/operator.

---

# 48. COMPLETE RELATIONSHIP MAP

```text
SEMESTA ISLAM
│
├── GovernanceAssignment
│      └── Founder / Owner / Board / Advisor
│
├── OwnershipInterest
│      └── Owner / Shareholder where applicable
│
├── FundingParticipant
│      └── Investor / Donor / Sponsor / Grant Provider
│
├── Funding
│
├── OrganizationMembership
│      └── User
│
├── OrganizationalRoleAssignment
│      └── OrganizationalRole
│
├── EmploymentEngagement
│      └── User
│
├── Department
│      └── Position
│
├── Contract
│
└── Platform Operations
       │
       ├── Verification
       ├── Users
       ├── Providers
       ├── Bookings
       ├── Payments
       ├── Content
       ├── Support
       └── Moderation
```

---

# 49. THREE-LAYER AUTHORITY MODEL

The system MUST preserve these three layers:

```text
┌──────────────────────────────────────┐
│  GOVERNANCE                          │
│  Founder / Owner / Investor / Board  │
└──────────────────┬───────────────────┘
                   │
┌──────────────────▼───────────────────┐
│  ORGANIZATION / MANAGEMENT            │
│  Director / Manager / Staff           │
└──────────────────┬───────────────────┘
                   │
┌──────────────────▼───────────────────┐
│  PLATFORM AUTHORIZATION               │
│  Role / Permission / Scope            │
└──────────────────────────────────────┘
```

These layers may overlap in people, but they are not the same data concept.

---

# 50. MINIMUM IMPLEMENTATION

The initial implementation does NOT need every governance entity.

Minimum organizational model:

```text
Organization
OrganizationMembership
OrganizationalRole
OrganizationalRoleAssignment
Department
Position
```

Minimum governance entities should be implemented only if required:

```text
GovernanceRole
GovernanceAssignment
OwnershipInterest
FundingParticipant
Funding
Contract
EmploymentEngagement
```

The distinction must nevertheless remain present in the domain model.

---

# 51. IMPLEMENTATION RULES FOR AI AGENTS

AI agents MUST:

1. Treat `SEMESTA ISLAM` as an organizational/business entity.
2. Treat Founder/Owner as organizational/governance capacity.
3. Treat Investor/Donor as stakeholder/funding capacity.
4. Treat Manager/Staff as organizational/operational capacity.
5. Treat Platform Roles as authorization constructs.
6. Preserve the distinction between employee and educator/provider.
7. Preserve the distinction between learner and guardian.
8. Preserve organization membership separately from platform roles.
9. Use permissions rather than hardcoded role checks where appropriate.
10. Avoid creating separate systems merely because the ERD contains separate domains.

AI agents MUST NOT assume:

```text
Founder = PlatformAdmin
Investor = Admin
Manager = Owner
Staff = Employee + Provider
Educator = Employee
Guardian = Learner
OrganizationMember = PlatformAdmin
```

unless an explicit business rule establishes that relationship.

---

# 52. FINAL DOMAIN MODEL

```text
                    GOVERNANCE
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       OWNERSHIP     FUNDING       ADVISORY
          │             │
          └─────────────┼─────────────┘
                        ▼
                 SEMESTA ISLAM
                        │
                  MANAGEMENT
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      DEPARTMENTS    POSITIONS     STAFF/EMPLOYEE
                        │
                        ▼
                  OPERATIONS
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
    PROVIDERS        LEARNERS         GUARDIANS
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                    OFFERINGS
                        │
                     BOOKING
                        │
                     SESSION
                  ┌─────┴─────┐
                  ▼           ▼
               PAYMENT     PROGRESS
                  │           │
                PAYOUT      REPORT
                  │
                  └─────┬─────┘
                        ▼
                       TRUST
              Verification / Review

Supporting capabilities:
CMS · LMS · CRM · ERP · Community ·
Messaging · Notification · Search · Analytics
```

**Canonical principle:**

> `SEMESTA ISLAM` is the organizational/governance layer; management and HR operate beneath it; platform IAM controls technical access; and the marketplace/service/learning domain operates beneath the organization. These layers are related but must not be conflated.

---

# 53. CANONICAL ENTITY & KNOWLEDGE TAXONOMY (EXP-03 / Phase D–H)

Implemented additive models (see `prisma/schema.prisma`). These extend the
relational knowledge projection without a graph database.

## 53.1 Topic

```text
Topic
- id
- name
- slug (unique, canonical)
- description
- parent_id (self-reference, optional)
- status (DRAFT / PUBLISHED / ARCHIVED)
- sort_order
- created_at / updated_at
```

- `TopicAlias` provides a canonical alias seam (`alias` unique) — editorial
  synonyms, not separate entities.
- Educator ↔ Topic edges are expressed via `KnowledgeClaim.topic_id` where
  `predicate = SPECIALIZES_IN` and `status = VERIFIED`. Only VERIFIED claims
  become authoritative public relationships.
- Public pages: `/topics` (index) and `/topics/[slug]`. Thin-page quality
  gate: a topic is indexable only when it has a meaningful description OR at
  least one verified educator.

## 53.2 DigitalProfile

```text
DigitalProfile
- id
- educator_id
- platform (WEBSITE / YOUTUBE / INSTAGRAM / TIKTOK / X / FACEBOOK / OTHER)
- url
- handle
- status (SELF_DECLARED / SUBMITTED / UNDER_REVIEW / VERIFIED / REJECTED)
- verified_by_id / verified_at
- created_at / updated_at
```

Identity lifecycle: SELF_DECLARED → SUBMITTED → UNDER_REVIEW → VERIFIED | REJECTED.
Only VERIFIED profiles become authoritative `sameAs` in public Person JSON-LD.
Identity is never inferred from name/avatar similarity.

## 53.3 PlatformSetting

```text
PlatformSetting
- key (unique)
- value
- updated_by_id / updated_at
```

Typed runtime product configuration (feature flags, publishing/indexing
policy, integration status). Never holds secrets — secrets stay in env.
Mutations require `platform.configuration` capability (founder/management).

## 53.4 Public entity URL contract

```text
/educator/{slug}      (EXP-11, canonical; UUID → 308)
/topics/{slug}        (EXP-03)
/organization/{id}    (existing; slug upgrade deferred)
```

Internal transactional references remain UUIDs.

---

# 54. COMMUNITY KNOWLEDGE & ENGAGEMENT DOMAIN (Community Knowledge Directive)

Implemented additive models (see `prisma/schema.prisma`, migration
`20260803155525_community_knowledge_domain`). Community content is **soft-delete
only** — rows are never physically destroyed, preserving audit trails and
provenance. Only `VISIBLE` content is publicly readable.

## 54.1 Enums

```text
ModerationStatus   VISIBLE | HIDDEN | REPORTED | UNDER_REVIEW | REMOVED | LOCKED
CommunityTargetType EDUCATOR_PROFILE | TOPIC | QUESTION | ANSWER | COMMENT
VoteType           HELPFUL | AGREE | ENDORSE
ReportStatus       OPEN | UNDER_REVIEW | RESOLVED | REJECTED
```

Lifecycle: `VISIBLE → HIDDEN → REPORTED → UNDER_REVIEW → REMOVED → LOCKED`.
Transitions are applied by management via `applyTargetModerationState`
(`src/lib/community/state.ts`); arbitrary invalid transitions are rejected.

## 54.2 CommunityComment

```text
CommunityComment
- id
- author_id (User)
- target_type (CommunityTargetType) + target_id (polymorphic)
- parent_id (self-reference → threaded replies)
- body
- status (ModerationStatus, default VISIBLE)
- is_correction + correction_note  (corrections pathway, see §54.7)
- moderated_by_id / moderated_at / edited_at
- created_at / updated_at
```

Indexes: `(target_type, target_id, status)`, `author_id`, `(status, created_at)`.
`parent_id` uses `onDelete: SetNull`; `author_id` cascades. A comment marked
`is_correction = true` may seed a `DRAFT` `KnowledgeClaim` via
`source_comment_id` — it can never directly reach `VERIFIED` (see §54.7).

## 54.3 CommunityVote

```text
CommunityVote
- id
- voter_id (User)
- target_type (CommunityTargetType) + target_id (polymorphic)
- vote_type (VoteType: HELPFUL / AGREE / ENDORSE)
- created_at
```

Unique constraint: `(voter_id, target_type, target_id, vote_type)` — one member
holds at most one vote per (target, type); duplicates are idempotently deduped.
Self-voting is rejected server-side. Votes are a **community signal only** and
never upgrade trust or become `VERIFIED` knowledge.

## 54.4 CommunityReport

```text
CommunityReport
- id
- reporter_id (User)
- target_type + target_id (polymorphic)
- reason
- status (ReportStatus, default OPEN)
- resolution / resolved_by_id / resolved_at
- created_at / updated_at
```

Unique constraint: `(reporter_id, target_type, target_id)` — per-reporter
deduplication prevents spam-flagging the same content. Reaching the founder-set
report threshold auto-flags the target as `REPORTED`. Closing a report
(`RESOLVED`/`REJECTED`) is moderation-only.

## 54.5 CommunityQuestion / CommunityAnswer

```text
CommunityQuestion
- id
- author_id (User)
- topic_id? (Topic) / educator_id? (EducatorProfile)   ← contextual anchoring
- title / body
- status (ModerationStatus, default VISIBLE)
- moderated_by_id / moderated_at / edited_at
- created_at / updated_at
  answers: CommunityAnswer[]

CommunityAnswer
- id
- question_id (CommunityQuestion, onDelete: Cascade)
- author_id (User)
- body
- status (ModerationStatus, default VISIBLE)
- accepted_at / accepted_by_id     ← COMMUNITY_SIGNAL only
- moderated_by_id / moderated_at / edited_at
- created_at / updated_at
```

- A `LOCKED` question rejects further answers.
- Only the question author (or founder) may accept an answer; acceptance is
  idempotent, atomically replaces a prior accepted answer, and records
  `COMMUNITY_KHIDMAH` XP (= 50) once.
- An accepted answer is **COMMUNITY_SIGNAL**. It NEVER modifies
  `KnowledgeClaim.status`, verification state, `DigitalProfile` trust, educator
  verification, or `Topic` truth.

## 54.6 Notification additions

New `NotificationType` values: `COMMENT_ADDED`, `COMMENT_REPLY`,
`QUESTION_ANSWERED`, `ANSWER_ACCEPTED`, `CONTENT_REPORTED`, `CONTENT_MODERATED`
(existing `Notification` model reused; no duplicate infrastructure).

## 54.7 Corrections → knowledge candidate pathway (trust boundary)

```text
Community comment (is_correction = true)
        │  reviewed
        ▼
DRAFT KnowledgeClaim  (KnowledgeClaim.source_comment_id → CommunityComment.id)
        │  existing verification workflow
        ▼
VERIFIED  (ONLY via the existing knowledge verification machinery)
```

`KnowledgeClaim.sourceCommentId` (`source_comment_id`) references the originating
community comment (`onDelete: SetNull`). There is **no** path from any community
signal (comment, answer, vote, accepted answer) directly to `VERIFIED`.

## 54.8 Community ↔ knowledge separation (product contract)

| Layer | Becomes | Never becomes |
| --- | --- | --- |
| Community signal (comment / answer / vote / accepted answer) | contextual engagement | VERIFIED knowledge, evidence, authority |
| Knowledge candidate (correction → DRAFT claim) | existing verification pipeline | VERIFIED automatically |
| Verified knowledge (KnowledgeClaim VERIFIED) | authoritative KG projection | — |

The knowledge-graph public projection consumes **only** eligible VERIFIED
knowledge. Community interactions never silently become canonical graph facts.
