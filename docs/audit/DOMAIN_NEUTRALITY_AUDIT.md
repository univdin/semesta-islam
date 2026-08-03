# SEMESTA ISLAM — DOMAIN NEUTRALITY & SEMANTIC AUDIT
**Gate:** PRODUCT REALITY RECONCILIATION GATE
**Status:** `CLOSED — FOUNDER DECISION APPROVED`

## EXECUTIVE SUMMARY

This document audits the repository to determine whether SEMESTA ISLAM has been accidentally anchored to a specific knowledge domain (Quran/Qira'at) or if it maintains a domain-neutral ontology for Islamic knowledge and trust verification.

---

## 1. DOMAIN BIAS SCANNER RESULTS

A comprehensive repository search for domain-specific terminology reveals:

### `qiraahType` & `qiraahSanadName`
- **Occurrences:** `prisma/schema.prisma` (`qiraah_type`), `src/types/index.ts` (`qiraahSanadName`), `src/lib/validations/index.ts`.
- **Classification:** `[CURRENT VERTICAL IMPLEMENTATION]` / `[ACCIDENTAL BIAS]`
- **Analysis:** Hardcoding `qiraah` into the schema forces all Sanad/Credential records to be interpreted through the lens of Quranic recitation, preventing the system from cleanly representing Fiqh, Hadith, or general institutional credentials.

### `Hafsh`, `Ashim`, `Tahsin`, `Tahfizh`
- **Occurrences:** `src/lib/dev/fixtures.ts`, `src/app/page.tsx`, `src/app/educator/[id]/page.tsx`.
- **Classification:** `[EXAMPLE / FIXTURE]` / `[UI COPY]`
- **Analysis:** These are valid mock data entries for a specific vertical, but their hardcoding in the UI components makes the platform feel exclusively like a Quran tutoring application.

### `Lajnah`
- **Occurrences:** Widespread (`LAJNAH_VERIFIER` role, `verifiedByLajnah`, `/management/lajnah`).
- **Classification:** `[CANONICAL DOMAIN]`
- **Analysis:** "Lajnah" (Committee/Board) is a domain-neutral Islamic administrative concept suitable for the platform's core trust architecture.

---

## 2. THE `qiraahType` & `SANAD` SEMANTIC AUDIT

### 2.1 Current Semantic Meaning
- **Field:** `qiraahType` (Prisma: `SanadRecord`)
- **Current Meaning:** The specific Quranic recitation tradition (e.g., "Hafsh 'an Ashim").
- **Semantic Role:** It acts as the "Subject" or "Knowledge Domain" of the transmission credential.
- **Domain Bias:** Highly Quran-specific.

### 2.2 Distinguishing The Objects
The current implementation conflates multiple concepts into the `SanadRecord` model:
- `Sanad` (The chain of transmission)
- `Credential` / `Ijazah` (The authorization itself)
- `Subject` / `Knowledge Domain` (The topic of authorization, currently hardcoded as `qiraahType`).

*Evidence:* `[CODE VERIFIED]` — The Prisma schema `SanadRecord` requires `qiraahType` and `chainDescription` but lacks a generalized `knowledgeDomain` or `subject` field.

### 2.3 Non-Quranic Representation Test
**Q: Can the current Sanad model represent a legitimate non-Quranic scholarly transmission (e.g., an Ijazah in Sahih Al-Bukhari) without changing the schema?**
- **Representable:** `NO`
- **Required Fields Missing:** A generalized subject/domain field.
- **Quran-Specific Dependency:** `YES` (Requires filling `qiraahType` with non-Qira'ah data, which is semantically incorrect).
- **Schema Change Required:** `YES`

### 2.4 Sanad Decision Matrix

| Current Concept | Current Field      | Actual Meaning | Quran-Specific? | Domain-Neutral Candidate | Evidence | Decision |
| --------------- | ------------------ | -------------- | --------------- | ------------------------ | -------- | -------- |
| Qiraah Type     | `qiraahType`       | Subject/Topic  | YES             | `knowledgeDomain` or `subject` | Prisma schema | **NEEDS REASSESSMENT** |
| Sanad Name      | `qiraahSanadName`  | Credential Title | YES           | `credentialName`         | Zod schema | **NEEDS REASSESSMENT** |
| Chain           | `chainDescription` | Lineage Summary| NO              | `chainDescription`       | Prisma schema | **KEEP** |
| Verification    | `verifiedByLajnah` | Verifier Status| NO              | `verifiedByLajnah`       | Prisma schema | **KEEP** |

---

## 3. EDUCATOR RESOURCE REASSESSMENT

**Q: What evidence proves that Educator is the canonical top-level platform entity rather than one participant type?**
- **Evidence:** The Prisma schema revolves around `EducatorProfile` and `LearnerProfile`. `User` is the base identity.
- **Analysis:** `Educator` represents "Knowledge Provider." While functional, it implies an active teaching role rather than a passive "Scholar" or "Verified Person."
- **Status:** `[STABLE / NEEDS FOUNDER DECISION]` — It works for the tutoring marketplace hypothesis, but may restrict a broader "Trust Directory" hypothesis.

---

## 4. COURSE RESOURCE REASSESSMENT

**Q: Are Course, Schedule, and Booking core platform primitives or merely a marketplace vertical?**
- **Evidence:** `CourseCatalog`, `CourseSchedule`, and `BookingRequest` are deeply embedded in Prisma.
- **Analysis:** These models represent a fully-fledged LMS / Tutoring Marketplace. They have nothing to do with "Trust Provenance" or "Verification."
- **Status:** `[CURRENT VERTICAL SLICE]` — Booking and Courses are a specific product hypothesis layered on top of the Verification core.

---

## 5. CONCLUSION & CONTRACT DECISION

### OPTION C — CURRENT MODEL IS SEMANTICALLY OVERLOADED
The `SanadRecord` model is semantically overloaded with Quran-specific terms (`qiraahType`) that act as a barrier to domain neutrality. 

**Public Contract Rule:** The public API schema MUST NOT encode `qiraahType` as a mandatory structural concept.

**Final Sanad Gate Status:**
- Sanad Semantic Model: `[PARTIAL]`
- `qiraahType`: `[QURAN-SPECIFIC VERTICAL / SEMANTICALLY OVERLOADED]`
- Domain-Neutral Representation: `[PROPOSED - Requires replacing qiraahType with subject/domain]`
- Non-Quranic Representation Test: `[FAIL]`
- Public Contract: `[NEEDS RECONCILIATION]`
- Runtime Modification: `[NOT AUTHORIZED AT THIS GATE]`

---

## 6. SANAD DOMAIN-GENERALIZATION AUDIT

### 6.1 Current Evidence
1. **Current `qiraahType` evidence:** Found as a mandatory string column in `prisma/schema.prisma` under the `SanadRecord` model, and in `docs/contracts/schemas/sanad.schema.json`.
2. **Current `qiraahSanadName` evidence:** Found as an optional string field in `src/lib/validations/index.ts` within the `VerificationSubmitSchema` and in `src/types/index.ts`.
3. **Prisma Relationships:** `SanadRecord` belongs directly to `EducatorProfile`. This means a Sanad is strictly tied to a user acting in an Educator capacity.
4. **TypeScript/Zod Representations:** The Zod `VerificationSubmitSchema` uses `qiraahSanadName`.
5. **UI Terminology:** Hardcoded mock data repeatedly uses "Sanad Qira'ah Hafsh 'an 'Ashim thariq Asy-Syathibiyyah", anchoring the visual representation to Quranic recitation.
6. **Canonical Docs:** `ERD.md` defines it as representing scholarly chain and provenance.

### 6.2 Cross-Domain Modeling Tests
| Context | Can current model represent it? | Missing Fields | Requires Schema Expansion? | Anchored to Qira'at? |
| :--- | :--- | :--- | :--- | :--- |
| **Qur'an / Qira'at** | `YES` | None | `NO` | `YES` (By default) |
| **Hadith** | `PARTIAL` | `knowledgeDomain`, `subject` | `YES` | `YES` (Requires misusing `qiraahType`) |
| **Fiqh (e.g. Zakat)** | `NO` | `knowledgeDomain`, `credentialType` | `YES` | `YES` |
| **Classical Text** | `PARTIAL` | `textName`, `author` | `YES` | `YES` |

### 6.3 Domain-General Core vs Specific Extensions
Based on repository evidence, the current schema conflates the core trust model with Qira'at metadata.

**Common Sanad Core (Domain-Neutral):**
- `id` (Identity)
- `holderId` / `educatorId` (Subject Person)
- `knowledgeDomain` (e.g., Fiqh, Hadith, Qira'at)
- `credentialName` (e.g., Ijazah Ammah, Ijazah Khassah)
- `chainDescription` (Lineage Summary)
- `verifiedByLajnah` (Verification Status)

**Qira'at-Specific Extension (Optional):**
- `qiraahType` (e.g., Hafsh, Warsh)
- `readingTradition` / `tariq`

**Other Domain-Specific Extensions:**
- `textName` (For Classical Texts)
- `madhhab` (For Fiqh)

### 6.4 Recommended Model & Schema Decision

**CURRENT SANAD MODEL:**
Overloaded model where the primary subject is permanently hardcoded as `qiraahType`.

**CURRENT QIRAAH ASSUMPTION:**
Every Sanad is assumed to be a Quranic Qira'at transmission.

**RECOMMENDED MODEL:**
Refactor `SanadRecord` to separate the general knowledge domain from the specific Qira'at attributes. Introduce a `knowledgeDomain` or `subject` field, and demote `qiraahType` to an optional metadata field or JSON object for Qira'at-specific records.

**SCHEMA CHANGE REQUIRED:**
`YES`. The `sanad.schema.json` API contract must be updated to decouple the generic trust provenance from the Qira'at-specific metadata to prevent locking the entire developer API into a narrow vertical.

**CONFIDENCE:**
`HIGH`. The repository evidence clearly demonstrates a conflation of the general concept of Sanad with the specific vertical of Qira'at.

### 6.5 Founder Decision Required
`NEEDS FOUNDER DECISION`
The Founder must decide whether SEMESTA ISLAM intends Sanad to represent:
A. Quran/Qira'at transmission only (Keep current schema).
B. Islamic scholarly transmission generally (Approve Recommended Model).
C. A broader trust/provenance abstraction.

The Agent recommends **Option B** to preserve domain neutrality.

---

## 7. SANAD ONTOLOGY FINDING

```text
Current implementation:
SanadRecord in Prisma binds educatorId, qiraahType, chainDescription, certificateUrl, and verifiedByLajnah. It is strictly tied to EducatorProfile.

Qira'at-specific assumptions:
qiraahType is mandatory in Prisma and was originally mandatory in sanad.schema.json, forcing every Sanad to represent Quranic recitation.

Generic Sanad core:
holderId/educatorId, chainDescription, verifiedByLajnah, certificateUrl. (Sanad represents scholarly transmission lineage, NOT generic credentials or identity verification).

Credential boundary:
Credential/Ijazah is the authorization (e.g. Ijazah Teaching License, Lajnah Approval). Sanad is the lineage of transmission underlying an Ijazah (where applicable).

Verification boundary:
Verification (VerificationRequest) represents the process and status (SUBMITTED, UNDER_REVIEW_LAJNAH, VERIFIED) performed by Lajnah verifiers on identity, Ijazah hash, and ethics score.

Domain-specific metadata:
Qira'at details (e.g., qiraahType, riwayah, tariq) belong as optional metadata attributes under a Qira'at specialization, not mandatory top-level properties of every Sanad.

Cross-domain applicability:
Sanad applies to domains with scholarly lineage (Qira'at, Hadith, Fiqh transmission). Domains such as Zakat, Qurban, or Haji/Umrah rely on Credentials/Certifications/Licenses, NOT Sanad.

Fields that MUST NOT be mandatory for every Sanad:
- qiraahType (Qira'at specific)
- riwayah / tariq (Qira'at specific)
- madhhab (Fiqh specific)

Founder decision required:
YES
```

---

## 8. CORE CONCEPT MATRIX (ADDENDUM B)

| Concept              | Repository Evidence                                      | Current Meaning                      | Domain-Specific?                  | Product Role                    | Status                       |
| :---------------------| :---------------------------------------------------------| :-------------------------------------| :----------------------------------| :--------------------------------| :-----------------------------|
| **Person / User**    | `prisma/schema.prisma` (`User`, `UserProfile`)           | Base human/account identity          | NO (Domain-Neutral)               | Identity Foundation             | `[CODE VERIFIED]`            |
| **Educator**         | `prisma/schema.prisma` (`EducatorProfile`)               | Teacher / Knowledge provider profile | NO (Role-Neutral)                 | Current Vertical Anchor         | `[CODE VERIFIED]`            |
| **Learner**          | `prisma/schema.prisma` (`LearnerProfile`)                | Student / Learner profile            | NO (Role-Neutral)                 | Current Vertical Anchor         | `[CODE VERIFIED]`            |
| **Institution**      | `prisma/schema.prisma` (`institutionName`), fixtures     | Affiliated pesantren/lajnah/org      | NO (Domain-Neutral)               | Trust Authority / Affiliation   | `[CODE VERIFIED]`            |
| **Course**           | `prisma/schema.prisma` (`CourseCatalog`)                 | Teaching / Study offering            | NO (Domain-Neutral)               | Current Product Vertical        | `[CODE VERIFIED]`            |
| **Booking**          | `prisma/schema.prisma` (`BookingRequest`)                | Tutoring session booking             | NO (Domain-Neutral)               | Current Product Vertical        | `[CODE VERIFIED]`            |
| **Credential**       | `prisma/schema.prisma` (`CredentialBadge`, `ijazah_url`) | Ijazah / Badge / Qualification       | NO (Domain-Neutral)               | Core Verification Primitive     | `[CODE VERIFIED]`            |
| **Sanad**            | `prisma/schema.prisma` (`SanadRecord`)                   | Lineage of scholarly transmission    | YES (Qira'at/Hadith/Fiqh lineage) | Scholarly Provenance Record     | `[CODE VERIFIED]`            |
| **Qira'at**          | `prisma/schema.prisma` (`qiraah_type`), fixtures         | Quranic recitation tradition         | YES (Qira'at Specific)            | Current Vertical Specialization | `[CODE VERIFIED]`            |
| **Verification**     | `prisma/schema.prisma` (`VerificationRequest`)           | Lajnah review & approval workflow    | NO (Domain-Neutral)               | Core Trust Process Primitive    | `[CODE VERIFIED]`            |
| **Trust Metadata**   | `src/app/api/v1/verification/*/route.ts` (SHA-256)       | Hash integrity & audit provenance    | NO (Domain-Neutral)               | Core Security Primitive         | `[CODE VERIFIED]`            |
| **Knowledge Domain** | `src/app/page.tsx` ("Tahsin, Fiqh, Aqidah"), categories  | Subject matter area                  | NO (Domain-Neutral)               | Implied Category Concept        | `[INFERENCE / CODE DERIVED]` |
| **Service**          | `src/types/index.ts` (`LearningMethod`)                  | Delivery mode (Zoom, Home, Majelis)  | NO (Domain-Neutral)               | Current Product Vertical        | `[CODE VERIFIED]`            |
| **Event**            | N/A (None in Prisma or UI routes)                        | Scheduled event / Webinar            | NO (Domain-Neutral)               | Future Product Candidate        | `[NON-EXISTENT IN CODE]`     |

---

## 9. ONTOLOGY SAFETY & ANTI-OVERENGINEERING DIRECTIVE (ADDENDUM C)

### 9.1 Governing Principle
`SEMESTA ISLAM must be broad enough to represent the Islamic ecosystem, but narrow enough to avoid speculative ontology.`

- **No Over-Generalization:** Do NOT replace the Quran/Qira'at vertical with a giant universal framework (e.g., universal trust graph or arbitrary generic entities).
- **Provisional Contract State:** `docs/contracts/schemas/sanad.schema.json` is currently in a `[PROVISIONAL / RECONCILIATION STATE]`. Code, Prisma, and Zod schemas remain unchanged to prevent premature refactoring.
- **Evidence Classification:**
  - `User`, `EducatorProfile`, `SanadRecord`, `VerificationRequest`: `[CODE VERIFIED]`
  - `Knowledge Domain`: `[INFERENCE / CODE DERIVED]`
  - `Universal Trust Graph / Developer Platform`: `[BUSINESS HYPOTHESIS]`

---

## 10. ECOSYSTEM COVERAGE MATRIX (ADDENDUM D)

| Domain / Area | Repository Evidence | Current Capability | Existing Concepts Used | Missing Concepts | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Qur'an** | `src/app/page.tsx`, `fixtures.ts` | Directory, Search, Sanad | `SanadRecord`, `EducatorProfile` | Specialized Tajwid/Tafsir taxonomy | `[CODE VERIFIED]` |
| **Qira'at** | `prisma/schema.prisma` (`qiraah_type`) | Sanad recitation lineage | `qiraahType`, `SanadRecord` | Riwayah / Tariq structured fields | `[CODE VERIFIED]` |
| **Hadith** | `src/app/page.tsx` ("Tahsin, Fiqh...") | Implied search keyword | `EducatorProfile`, `CourseCatalog` | Isnad, Matn, Narrator chain entities | `[INFERENCE / UI DERIVED]` |
| **Fiqh** | `src/app/page.tsx`, `fixtures.ts` | Educator specialization | `EducatorProfile`, `CourseCatalog` | Madhhab, Fatawa, Legal opinion entities | `[CODE VERIFIED]` |
| **Aqidah** | `src/app/page.tsx` | Search filter placeholder | `EducatorProfile` | School of Aqidah / Text entities | `[INFERENCE / UI DERIVED]` |
| **Tafsir** | `src/app/page.tsx` | Search filter placeholder | `EducatorProfile` | Exegesis work / Book entities | `[INFERENCE / UI DERIVED]` |
| **Zakat** | N/A | None | None | Amil, Calculation, Distribution | `[NOT PRESENT IN REPOSITORY]` |
| **Qurban** | N/A | None | None | Animal, Slaughtering, Procurement | `[NOT PRESENT IN REPOSITORY]` |
| **Haji** | N/A | None | None | Manasik, Group, Permit | `[NOT PRESENT IN REPOSITORY]` |
| **Umrah** | N/A | None | None | Travel package, Muthawwif | `[NOT PRESENT IN REPOSITORY]` |
| **Islamic Education** | `prisma/schema.prisma` (`CourseCatalog`) | Course & Schedule listing | `CourseCatalog`, `CourseSchedule` | Curriculum, Exam, Grading | `[CODE VERIFIED]` |
| **Institutions** | `prisma/schema.prisma` (`institutionName`) | Affiliation name string | `EducatorProfile.institutionName` | Top-level Institution entity | `[CODE VERIFIED]` |
| **Services** | `src/types/index.ts` (`LearningMethod`) | Delivery mode (Zoom/Private/Group) | `LearningMethod`, `BookingRequest` | Service Catalog, Service SLA | `[CODE VERIFIED]` |
| **Programs / Events** | N/A | None | None | Event, Webinar, Attendance | `[NOT PRESENT IN REPOSITORY]` |

## 11. FINAL GATE CLOSURE & FOUNDER DECISION

**Status:** `CLOSED — FOUNDER DECISION APPROVED`

```text
Repository Reality:
[PASS]

Localhost Runtime:
[PASS]

Domain Neutrality:
[APPROVED]

Sanad Ontology:
[APPROVED — DOMAIN-GENERAL WITH OPTIONAL DOMAIN-SPECIFIC METADATA]

Credential Ontology:
[APPROVED — GENERAL QUALIFICATION/AUTHORIZATION]

Verification Ontology:
[APPROVED — PROCEDURAL / EVIDENCE-BASED]

Qira'at:
[APPROVED — SPECIALIZATION]

Marketplace:
[APPROVED — CURRENT PRODUCT VERTICAL]

Cross-Domain Representation:
[APPROVED AT CORE SEMANTIC LEVEL]

Over-Engineering Risk:
[CONTROLLED]

Ontology Gate:
[CLOSED]

Founder Decision:
[FINAL FOR CURRENT DEVELOPMENT STAGE]
```
