# SEMESTA ISLAM — PRODUCT SCOPE REASSESSMENT
**Gate:** PRODUCT REALITY RECONCILIATION GATE
**Status:** `[EXECUTED]`

## EXECUTIVE SUMMARY

This document distinguishes what SEMESTA ISLAM is today (the implemented vertical slice) from what the canonical platform claims to be, and quarantines product/monetization hypotheses that emerged during the API documentation phase.

---

## 1. CURRENTLY IMPLEMENTED
*(What actually exists in code today)*
- Identity & Authentication Base (`User`, `UserProfile`).
- Educator Directory (Profile, Bio, Subjects).
- Verification State Machine (`SUBMITTED` -> `UNDER_REVIEW_LAJNAH` -> `VERIFIED`).
- Tutoring Marketplace (Courses, Schedules, Bookings).
- Virtual Economic Ledger (Points, Commissions).
- UI heavily tailored to Quran, Qira'at, and Tahsin tutoring (Les Ngaji).

## 2. CURRENT VERTICAL SLICE
*(What subset of the broader problem this implementation represents)*
- **B2C Quran Tutoring Marketplace.** The current UI and mock data represent a single vertical: matching learners with Quran teachers and managing their bookings/payments, supported by a Lajnah verification committee.

## 3. IMPLIED PLATFORM
*(What broader platform the data model suggests)*
- **Islamic Trust & Provenance API.** A B2B or B2D (Business-to-Developer) infrastructure where any Islamic institution, LMS, or mosque can query the verifiable credentials of an educator (not just Quran teachers).

## 4. PRODUCT HYPOTHESES (QUARANTINED)
*(Ideas that emerged during P0–P8 Productization, lacking validated demand)*
- Public Verification API (Monetization via API calls).
- Developer Portal & API Keys.
- Webhook Delivery for Partner integrations.
- Sandbox Environment as a SaaS offering.
- Institutional B2B SaaS (Pesantren Management).

*These concepts are strictly `[BUSINESS HYPOTHESIS]` and must NOT dictate the current domain ontology.*

---

## 5. REASSESSING THE CANONICAL ENTITY

**Is `Educator` the canonical top-level platform entity?**
- In a "Tutoring Marketplace," yes.
- In a "Trust & Provenance API," the canonical entity might be broader: `VerifiedPerson`, `Scholar`, or `KnowledgeProvider`.
- **Finding:** The platform's scope is currently constrained by the word "Educator," which implies an active teaching/booking relationship.

---

## 6. THE MINIMAL STABLE CONTRACT

**What is the smallest stable domain abstraction that can be exposed publicly without prematurely freezing the product scope?**

1. **Identity Profile** (Name, Avatar, Bio).
2. **Verification Status** (`VERIFIED` vs `UNVERIFIED`).
3. **Trust Metadata** (SHA-256 Document Integrity, Authority Name).

Features like `Course`, `Booking`, and `qiraahType` are unstable vertical slices. Exposing them in a v1 public API will lock the platform into a B2C Tutoring architecture, preventing it from evolving into a generalized B2B Trust Infrastructure.

---

## 7. FOUNDER DECISIONS REQUIRED

The following questions cannot be answered by the repository and require explicit Founder direction:

1. **Is SEMESTA ISLAM primarily a B2C Marketplace (Les Ngaji) or a B2B Trust Infrastructure?**
2. Should `Educator` be generalized to a broader identity (e.g., `Scholar` or `Provider`)?
3. Must the Sanad schema support non-Quranic transmissions (e.g., Fiqh, Hadith) in v1?
4. Should we pause the Developer Portal implementation until the core B2C vertical validates its product-market fit?
