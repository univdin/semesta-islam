# SEMESTA ISLAM — BUSINESS MODEL DISCOVERY

> [!NOTE]
> **CLASSIFICATION: [BUSINESS HYPOTHESIS / DEFERRED]**
> This document represents a future platform evolution hypothesis (B2B SaaS / Developer API). The active operational priority is 100% focused on the **B2C Islamic Learning Marketplace MVP** (`PRODUCT → USERS → CORE LOOP → PRODUCTION`).

**Phase:** P5
**Status:** [BUSINESS HYPOTHESIS] [INFERENCE]

This document outlines the productization and monetization hypotheses for the SEMESTA ISLAM platform. Every model below is explicitly separated into technical possibility, unvalidated hypothesis, or validated demand.

---

## 1. Core Platform (B2C & C2C)

### A. Public Directory
- **Customer:** End users (Learners / Guardians).
- **Value:** Discovering verified Islamic educators safely.
- **Pricing:** Free (Ad-supported or loss-leader for bookings).
- **Technical Dependency:** Next.js App Router, Educator Profile DB.
- **Evidence:** [TECHNICAL POSSIBILITY] (Core UI exists).

### B. Educator Verification
- **Customer:** Independent Islamic Educators.
- **Value:** Gaining the "Verified by Lajnah" trust credential to increase booking rates.
- **Pricing:** One-time verification fee or annual subscription.
- **Operational Dependency:** Human Lajnah review team scaling.
- **Evidence:** [BUSINESS HYPOTHESIS] (Verification state machine exists in code, but willingness to pay is unproven).

### C. Booking Infrastructure
- **Customer:** Independent Islamic Educators.
- **Value:** Lead generation and secure booking management.
- **Pricing:** Commission % on successful bookings.
- **Technical Dependency:** Payment Gateway, Economic Ledger.
- **Evidence:** [TECHNICAL POSSIBILITY] (Booking inquiry API exists).

---

## 2. Developer Platform (B2B & SaaS)

### D. Verification API (Trust Infrastructure)
- **Customer:** Islamic Apps, Event Platforms, Pesantren SaaS.
- **Problem:** Other platforms cannot manually verify the credentials of every speaker/educator they onboard.
- **Value:** Instant, programmatic verification of an educator's Sanad and standing via API.
- **Pricing:** Tiered Usage API (e.g., $X per 1,000 verification lookups).
- **Technical Dependency:** OAuth / API Keys, OpenAPI Contract.
- **Evidence:** [BUSINESS HYPOTHESIS] (The "Stripe for Islamic Trust" model).

### E. Organization SaaS
- **Customer:** Mosques, Pesantren, Islamic Schools, Travel Organizers.
- **Problem:** Managing a roster of verified educators, scheduling, and internal payouts.
- **Value:** A white-label or managed dashboard leveraging the SEMESTA directory.
- **Pricing:** Monthly SaaS Subscription (Seats + Usage).
- **Technical Dependency:** Organization role hierarchy, Multi-tenant database schema.
- **Evidence:** [TECHNICAL POSSIBILITY] (Requires significant expansion of `RoleAssignment` and a new `Organization` entity).

### F. Premium Educator Profile
- **Customer:** Established Educators / Institutes.
- **Value:** Higher visibility in search, analytics dashboard, advanced booking rules.
- **Pricing:** Monthly Subscription.
- **Evidence:** [BUSINESS HYPOTHESIS].

---

## 3. Product Positioning Evaluation

**Hypothesis:** *"Stripe-like infrastructure for verified Islamic educators"*
- **Evaluation:** Highly ambitious. Stripe handles money (objective). SEMESTA handles trust (subjective, requires a trusted Lajnah authority). If the Lajnah authority is universally respected, this API positioning is extremely powerful. 

**Recommended Positioning:** *"The Verification API for Islamic Knowledge Providers"*
- **Rationale:** Start by offering the Public Directory as a B2C proof-of-concept, then monetize the Verification API for B2B partners who need to integrate trusted speakers into their own platforms.

## 4. Proposed API Tiers

1. **FREE TIER:** 
   - Anonymous access to public Educator profiles (Rate-limited).
   - Access to Sandbox for development.
2. **DEVELOPER TIER (Pay-as-you-go):**
   - API Keys.
   - Higher rate limits for programmatic Educator lookup.
3. **PARTNER TIER (Custom Pricing):**
   - Direct Verification Webhooks.
   - White-label verification integrations.

**Next Step:** Proceed to Phase P6 (Trust / Provenance Data Governance) to define exactly what the "Trust" asset is.
