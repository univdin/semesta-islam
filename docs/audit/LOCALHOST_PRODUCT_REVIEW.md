# SEMESTA ISLAM — LOCALHOST PRODUCT REVIEW
**Gate:** PRODUCT REALITY RECONCILIATION GATE
**Status:** `[EXECUTED / FOUNDER VISUAL REVIEW PENDING]`

## EXECUTIVE SUMMARY

This document reviews the actual visual and functional reality of SEMESTA ISLAM's localhost implementation, analyzing whether the UI communicates a broad "Islamic Knowledge Platform" or a narrow "Quran Tutoring Marketplace" (vertical slice anchoring).

---

## 1. ROUTE: `/` (Homepage)

### A. PURPOSE
Landing page introducing the platform, displaying featured educators, and explaining the value proposition.

### B. USER
Prospective learners and parents/guardians searching for educators.

### C. VISIBLE PRODUCT MESSAGE
The homepage heavily features Quran-specific terminology.
- **Copy:** "Membimbing generasi Rabbani melalui direktori ustadz, guru al-Qur'an, dan lembaga keislaman..."
- **Search Placeholder:** "Cari nama ustadz, keahlian (Tahsin, Fiqh, Aqidah)..."
- **Educator Titles:** "Ustadz DR. Ahmad Al-Hafiz", "Ustadzah Fatimah Azzahra (Pembimbing Al-Qur'an Anak & Keluarga)"

### D. USER JOURNEY
Search for an educator -> View Profile -> Book.

### E. FUNCTIONAL BEHAVIOR
Search UI is present. Educator cards list specific disciplines (primarily Tahsin/Tahfizh).

### F. DOMAIN SIGNALS
The platform presents itself heavily as a directory for Quran and traditional Islamic sciences (Fiqh, Aqidah).

### G. DOMAIN BIAS
**DETECTED.** The examples and prominent terminology anchor the platform heavily as a "Quran Tutoring Marketplace" rather than a general "Trust Infrastructure" or broad LMS. The use of "Al-Hafiz", "Tahsin", and "Pesantren Tahfidz" heavily biases the visual identity.

### H. FOUNDER REVIEW
`[REQUIRES FOUNDER VISUAL REVIEW]`

---

## 2. ROUTE: `/directory` (Educator Directory)

### A. PURPOSE
Listing and filtering verified educators.

### B. USER
Learners looking for specific teaching methods or subjects.

### C. VISIBLE PRODUCT MESSAGE
Directory of verified Islamic teachers with ratings and disciplines.

### D. USER JOURNEY
Filter by category (e.g., "Tahsin") or method -> Select Educator.

### E. FUNCTIONAL BEHAVIOR
Displays mock educators.

### F. DOMAIN SIGNALS
Educator is the primary unit of value. The platform acts as a marketplace/directory.

### G. DOMAIN BIAS
**DETECTED.** The directory strongly implies a B2C marketplace model rather than B2B trust infrastructure.

### H. FOUNDER REVIEW
`[REQUIRES FOUNDER VISUAL REVIEW]`

---

## 3. ROUTE: `/educator/[id]` (Educator Profile)

### A. PURPOSE
Detailed view of an educator's credentials, bio, and courses.

### B. USER
Learners evaluating an educator's authority.

### C. VISIBLE PRODUCT MESSAGE
"Pendidik Terverifikasi Lajnah". Displays Sanad records explicitly.
- **Example Sanad:** "Sanad Qira'ah Hafsh 'an 'Ashim thariq Asy-Syathibiyyah"

### D. USER JOURNEY
Review credentials -> Book session.

### E. FUNCTIONAL BEHAVIOR
Displays Sanad arrays, badges, and a booking CTA.

### F. DOMAIN SIGNALS
Trust is established via Lajnah Verification and Sanad Chains.

### G. DOMAIN BIAS
**DETECTED.** The presentation of "Sanad" currently defaults to "Qira'ah" specific strings in the UI fixtures.

### H. FOUNDER REVIEW
`[REQUIRES FOUNDER VISUAL REVIEW]`

---

## 4. ROUTE: `/management/lajnah` (Lajnah Dashboard)

### A. PURPOSE
Portal for Lajnah verifiers to review educator submissions.

### B. USER
Users with the `LAJNAH_VERIFIER` role.

### C. VISIBLE PRODUCT MESSAGE
"Portal Verifikator Lajnah". A serious, administrative interface for reviewing credentials.

### D. USER JOURNEY
Select pending submission -> Review Ijazah Hash/Document -> Approve/Reject.

### E. FUNCTIONAL BEHAVIOR
Lists educators with `UNDER_REVIEW_LAJNAH` status.

### F. DOMAIN SIGNALS
Demonstrates that SEMESTA ISLAM contains an internal administrative trust-verification workflow, distinct from the public marketplace.

### G. DOMAIN BIAS
**NEUTRAL.** The verification workflow itself is domain-neutral, though the demo data populating it is Quran-heavy.

### H. FOUNDER REVIEW
`[REQUIRES FOUNDER VISUAL REVIEW]`

---

## PRODUCT INTERPRETATION TEST

**Q: If a completely new person saw this page without reading any documentation, what would they believe SEMESTA ISLAM is?**
**A:** A marketplace to find and hire verified Quran teachers and Islamic tutors (Les Ngaji / Privat Agama).

**Q: What does the repository/documentation claim SEMESTA ISLAM is?**
**A:** A Developer Platform, Trust Infrastructure, and API ecosystem for Islamic knowledge provenance and educator verification.

**CONCLUSION:**
Massive divergence detected. The UI communicates a B2C Tutoring Marketplace (a specific vertical slice), while the documentation claims a B2B Trust Infrastructure & API Platform.
