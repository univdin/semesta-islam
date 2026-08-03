# 00 — BUSINESS REQUIREMENTS DOCUMENT

**Document:** `00_BRD.md`
**Status:** Canonical Business Requirements
**Audience:** Management · Operations · HR/Recruitment · Product · AI/LLM Agents · Developers
**Authority:** Defines the business requirements that downstream product, domain, technology, and implementation documents must satisfy.

---

# 1. AGENT INSTRUCTION

Treat this document as the **authoritative business baseline**.

The agent MUST:

* understand the business objectives before implementing product capabilities;
* preserve the business model and stakeholder relationships;
* distinguish business requirements from product and technical implementation;
* use `01_BSD.md` for the business/system definition;
* use `02_PRD.md` for product capabilities and behavior;
* use `03_ERD.md` for domain/data representation;
* use `04_OSS.md` and the resource registry for reusable technology/resources;
* avoid inventing business policies;
* avoid converting assumptions into requirements;
* identify unresolved business decisions explicitly;
* preserve traceability from business requirement → product requirement → implementation.

The agent MUST NOT silently redefine:

* the target market;
* the business model;
* stakeholder relationships;
* commercial policy;
* organizational authority;
* verification policy;
* safety policy;
* pricing;
* commission/revenue rules;
* strategic scope.

If a requested change affects these areas, classify it as:

```text
BUSINESS DECISION REQUIRED
```

This document does NOT prescribe:

```text
framework
programming language
database
infrastructure
UI implementation
API implementation
specific OSS
deployment architecture
```

---

# 2. BUSINESS SUMMARY

The business operates a trusted digital platform connecting people seeking learning and educational services with qualified educators and learning providers.

The business facilitates:

```text
DISCOVERY
→ TRUST
→ CONNECTION
→ ENGAGEMENT
→ BOOKING / ENROLLMENT
→ PAYMENT
→ LEARNING / SERVICE DELIVERY
→ PROGRESS
→ FEEDBACK
→ RETENTION
```

The intended business outcome is a sustainable ecosystem in which:

* learners and families can access suitable educators/providers;
* educators and providers can develop sustainable professional opportunities;
* learning/service relationships can continue beyond a single transaction;
* the platform creates durable value for participants and the organization.

---

# 3. BUSINESS VISION

Enable broader and easier access to trusted, qualified, and suitable learning opportunities through a professional digital ecosystem connecting learners, families, educators, providers, knowledge, and supporting services.

---

# 4. BUSINESS MISSION

The business aims to:

1. Improve access to qualified educators.
2. Reduce friction in discovering and selecting learning services.
3. Establish meaningful trust signals around educators and providers.
4. Provide educators with professional opportunities to reach learners.
5. Support effective and sustainable learning relationships.
6. Improve transparency around service, payment, and progress.
7. Build a durable learning and educational ecosystem.
8. Create sustainable commercial value for the platform and its participants.

---

# 5. BUSINESS OBJECTIVES

## 5.1 Market Objective

Establish a trusted position in the learning and education services market.

## 5.2 Demand Objective

Acquire and retain families, learners, and other people seeking learning services.

## 5.3 Supply Objective

Acquire, verify, activate, and retain qualified educators/providers.

## 5.4 Quality Objective

Maintain appropriate standards of trust, professional conduct, service quality, and learner experience.

## 5.5 Commercial Objective

Create a sustainable revenue model while maintaining transparent and fair commercial relationships.

## 5.6 Ecosystem Objective

Where validated by market demand, expand beyond individual learning transactions into:

```text
LEARNING
+
KNOWLEDGE
+
COMMUNITY
+
SUPPORT
+
PROFESSIONAL NETWORK
```

Ecosystem expansion is subject to business validation and does not imply that every capability must exist in the initial release.

---

# 6. BUSINESS STAKEHOLDERS

| Stakeholder                    | Primary Interest                                       |
| ------------------------------ | ------------------------------------------------------ |
| Management                     | Strategy, growth, sustainability                       |
| Founder / Owner                | Direction, ownership, strategic decisions              |
| Investor / Funding Stakeholder | Sustainable business performance and capital oversight |
| Learner                        | Effective learning experience                          |
| Family / Guardian              | Trust, suitability, convenience, outcomes              |
| Educator / Provider            | Professional opportunity and income                    |
| Operations                     | Quality and service continuity                         |
| Recruitment                    | Educator acquisition and onboarding                    |
| Verification Team              | Trust and qualification control                        |
| Support Team                   | User satisfaction and issue resolution                 |
| Content Team                   | Knowledge and public information                       |
| Moderator                      | Community and platform safety                          |
| Marketing                      | Demand and supply acquisition                          |
| Partners                       | Distribution and ecosystem collaboration               |

Management may define additional organizational roles without changing the external business model.

---

# 7. PRIMARY BUSINESS ACTORS

## 7.1 Demand

```text
Family
Guardian
Learner
Adult Learner
Organization / Institution
```

## 7.2 Supply

```text
Educator
Teacher
Mentor
Learning Provider
Specialist
```

Public-facing terminology may vary according to final brand and positioning decisions.

The underlying business relationship remains:

```text
DEMAND ↔ LEARNING / SERVICE PROVIDER
```

---

# 8. BUSINESS PROBLEM

The learning-services market may present several forms of friction:

* discovery is fragmented;
* quality information is inconsistent;
* trust is difficult to establish before engagement;
* educator/provider information may be incomplete;
* communication can be inefficient;
* scheduling may require manual coordination;
* payment may be disconnected from service management;
* progress reporting may be inconsistent;
* users may rely heavily on informal referrals;
* educators may lack a professional digital distribution channel.

These are **business problem hypotheses**, not automatically established market facts.

They should be validated through market research and operational evidence.

---

# 9. BUSINESS OPPORTUNITY

The opportunity is to organize fragmented learning-service demand and supply into a trusted ecosystem.

Potential value layers include:

```text
DISCOVERY
+
PROFESSIONAL PROFILES
+
VERIFICATION
+
MATCHING
+
BOOKING
+
PAYMENT
+
LEARNING SUPPORT
+
PROGRESS
+
REVIEWS
+
COMMUNITY
+
CONTENT
```

The existence of a value layer does not imply that it must be implemented in the MVP.

---

# 10. CORE BUSINESS MODEL

The core model is:

```text
                    PLATFORM
                       │
          ┌────────────┴────────────┐
          │                         │
       DEMAND                    SUPPLY
          │                         │
   Family / Learner          Educator / Provider
          │                         │
          └────────────┬────────────┘
                       │
                LEARNING / SERVICE
                       │
          ┌────────────┴────────────┐
          │                         │
       LEARNING                 PAYMENT
          │                         │
          └────────────┬────────────┘
                       │
                  FEEDBACK
                       │
                 RETENTION
```

The platform facilitates the relationship and supporting operations.

---

# 11. BUSINESS VALUE EXCHANGE

## 11.1 Demand receives

* access;
* choice;
* trust signals;
* convenience;
* professional information;
* service coordination;
* learning support;
* progress visibility where applicable.

## 11.2 Supply receives

* market access;
* professional presence;
* qualified leads;
* engagement opportunities;
* operational support;
* payment facilitation;
* reputation building;
* potential recurring relationships.

## 11.3 Platform receives

* transaction revenue where applicable;
* network effects;
* operational data necessary for service delivery and improvement;
* brand equity;
* recurring customer relationships.

The exact commercial model requires management approval.

---

# 12. TRUST REQUIREMENT

Trust is a mandatory business capability.

The business must establish mechanisms capable of distinguishing:

```text
UNVERIFIED
```

from:

```text
VERIFIED
```

and must not present unverified information as verified.

Potential trust evidence may include:

* identity;
* education;
* experience;
* credentials;
* references;
* sample work/teaching;
* reviews;
* service history;
* platform conduct;
* operational verification.

Exact verification criteria are a management/operations decision and must not be invented by an AI agent.

---

# 13. EDUCATOR / PROVIDER REQUIREMENTS

The business must provide a professional path for educators/providers to:

1. discover the opportunity;
2. register/apply;
3. create a professional profile;
4. submit required evidence;
5. undergo verification;
6. become eligible for publication;
7. publish offerings;
8. receive relevant demand;
9. manage engagements;
10. deliver services;
11. receive compensation;
12. build professional reputation.

---

# 14. DEMAND REQUIREMENTS

The business must enable prospective customers to:

1. understand available services;
2. discover relevant educators/providers;
3. evaluate suitability;
4. understand trust signals;
5. compare relevant options;
6. initiate contact;
7. request, book, or enroll;
8. pay where applicable;
9. participate in learning/service delivery;
10. monitor progress where applicable;
11. provide feedback;
12. return, renew, or refer others.

---

# 15. SERVICE REQUIREMENTS

The business must be capable of supporting different forms of learning/service delivery.

Potential formats:

```text
ONE-TO-ONE
GROUP
ONLINE
OFFLINE
HYBRID
SHORT-TERM
RECURRING
PROGRAM-BASED
```

The business must not assume that every educator/provider or service follows one operational model.

---

# 16. LEARNING REQUIREMENTS

The business may support both service-oriented and structured learning.

## 16.1 Service-oriented learning

```text
Booking
→ Session
→ Attendance
→ Progress
```

## 16.2 Structured learning

```text
Program
→ Course
→ Module
→ Lesson
→ Activity
→ Assessment
→ Progress
```

The appropriate model depends on the actual offering.

---

# 17. COMMERCIAL REQUIREMENTS

The business requires capabilities supporting:

* transparent pricing;
* secure payment;
* transaction records;
* refunds where applicable;
* educator/provider payout;
* platform revenue/commission where applicable;
* financial reconciliation;
* transaction support.

Commercial rates, commission, payout schedules, refund rules, and related policies require management approval.

AI agents must not independently determine these policies.

---

# 18. QUALITY REQUIREMENTS

The business must monitor relevant indicators including:

* educator/provider quality;
* service completion;
* reliability;
* user satisfaction;
* complaints;
* incidents;
* reviews;
* retention.

Quality management must not depend exclusively on ratings.

---

# 19. CUSTOMER SUPPORT REQUIREMENTS

Users must have a clear route to assistance.

Support should be capable of handling:

```text
ACCOUNT
VERIFICATION
DISCOVERY
BOOKING
SCHEDULE
PAYMENT
LEARNING
COMMUNICATION
SAFETY
COMMUNITY
OTHER
```

Operational ownership, escalation levels, service targets, and resolution policies must be defined by management.

---

# 20. CONTENT REQUIREMENTS

The business should maintain authoritative public information through:

* marketing pages;
* educational content;
* knowledge base;
* guides;
* FAQ;
* help center;
* announcements;
* case studies;
* testimonials;
* legal documents;
* policies.

Content should support both acquisition and customer success.

---

# 21. COMMUNITY REQUIREMENTS

If community functionality is enabled, the business must provide:

* clear participation rules;
* moderation;
* reporting;
* appropriate user controls;
* community governance;
* separation between community participation and commercial transactions where appropriate.

Community should create meaningful user value rather than exist solely as a feature checklist.

---

# 22. MARKETING REQUIREMENTS

The business must support multiple acquisition channels.

Potential channels:

```text
ORGANIC SEARCH
SOCIAL MEDIA
REFERRAL
PARTNERSHIPS
COMMUNITIES
DIRECT OUTREACH
EDUCATOR RECRUITMENT
CONTENT MARKETING
```

Marketing activities should be measurable where practical.

The initial market-entry strategy may prioritize direct and social acquisition before broader channel expansion, subject to management validation.

---

# 23. SUPPLY ACQUISITION

Educator/provider acquisition may use:

* personal networks;
* referrals;
* professional communities;
* social media;
* education communities;
* institutions;
* direct outreach;
* professional platforms;
* partnerships.

Acquisition should prioritize qualified supply rather than raw registration volume.

---

# 24. DEMAND ACQUISITION

Demand acquisition may use:

* educational content;
* search;
* social media;
* referrals;
* community;
* partnerships;
* direct campaigns;
* local/network effects.

The business should measure acquisition through meaningful engagement rather than impressions alone.

---

# 25. RETENTION REQUIREMENTS

The business should optimize for repeat value.

Potential retention mechanisms include:

* recurring learning;
* repeat booking;
* progress reporting;
* educator continuity;
* saved educators/providers;
* learning plans;
* reminders;
* community;
* knowledge;
* referrals.

Retention must be based on actual user value rather than artificial lock-in.

---

# 26. BUSINESS KPI FRAMEWORK

## 26.1 Supply KPIs

```text
Registered Educators
Verified Educators
Active Educators
Educator Activation Rate
Educator Retention
Educator Utilization
```

## 26.2 Demand KPIs

```text
Visitors
Leads
Registered Users
Active Families
Active Learners
Booking Requests
Completed Engagements
```

## 26.3 Conversion KPIs

```text
Discovery → Profile View
Profile View → Contact
Contact → Request
Request → Booking
Booking → Completion
```

## 26.4 Financial KPIs

```text
GMV
Revenue
Commission
Average Transaction Value
Refund Rate
Payout
```

## 26.5 Quality KPIs

```text
Average Rating
Completion Rate
Cancellation Rate
Complaint Rate
Incident Rate
Support Resolution
```

## 26.6 Retention KPIs

```text
Repeat Booking
30-Day Retention
90-Day Retention
Educator Retention
Referral Rate
```

Exact KPI definitions, formulas, targets, and reporting periods must be approved before becoming formal management standards.

---

# 27. BUSINESS CONSTRAINTS

The business must account for:

* trust and reputation;
* user privacy;
* learner protection;
* professional conduct;
* financial transparency;
* operational capacity;
* quality control;
* local market conditions;
* applicable regulations.

Specific legal interpretation belongs to the appropriate legal/compliance process.

---

# 28. BUSINESS ASSUMPTIONS TO VALIDATE

The following remain hypotheses until supported by evidence:

1. Users value verified educators sufficiently to influence selection.
2. Families/learners are willing to use a specialized discovery platform.
3. Qualified educators are willing to join the platform.
4. Educators accept the platform's commercial model.
5. Users value structured progress reporting.
6. Users are willing to transact through the platform.
7. Content and community can contribute to acquisition and retention.
8. Social channels and messaging channels can materially contribute to acquisition and communication.
9. The market has sufficient repeat demand to support sustainable unit economics.

AI agents MUST NOT treat these hypotheses as established facts.

---

# 29. BUSINESS RISKS

| Risk                           | Business Impact                      |
| ------------------------------ | ------------------------------------ |
| Low trust                      | Low conversion and reputation damage |
| Poor educator/provider quality | Customer dissatisfaction             |
| Insufficient supply            | Poor discovery experience            |
| Insufficient demand            | Educator/provider churn              |
| High cancellation              | Reduced trust and revenue            |
| Payment issues                 | Financial and customer risk          |
| Safety incident                | Severe reputational/operational risk |
| Weak support                   | Customer churn                       |
| Poor content                   | Low acquisition/authority            |
| Community abuse                | Reputation and safety risk           |
| Operational overload           | Reduced service quality              |
| Unsustainable economics        | Business failure                     |

---

# 30. BUSINESS PRIORITIES

Priority order:

```text
1. TRUST
2. QUALIFIED SUPPLY
3. REAL DEMAND
4. SUCCESSFUL MATCHING
5. SUCCESSFUL SERVICE / LEARNING
6. TRANSPARENT TRANSACTION
7. RETENTION
8. COMMUNITY / ECOSYSTEM EXPANSION
```

The business should not optimize secondary ecosystem capabilities before the core value exchange demonstrates viability.

---

# 31. MVP BUSINESS OUTCOME

The MVP must demonstrate that the business can repeatedly execute:

```text
QUALIFIED EDUCATOR / PROVIDER
              ↓
      DISCOVERABLE OFFERING
              ↓
         REAL CUSTOMER
              ↓
    SUCCESSFUL ENGAGEMENT
              ↓
     SUCCESSFUL TRANSACTION
              ↓
    SATISFACTORY EXPERIENCE
              ↓
       REPEAT / REFERRAL
```

The MVP is successful when this loop is operationally and commercially viable—not merely when software features are complete.

---

# 32. BUSINESS ACCEPTANCE CRITERIA

The business initiative is considered validated when evidence demonstrates that:

* qualified educators/providers can be acquired;
* users can discover suitable educators/providers;
* users are willing to engage;
* engagements can be completed;
* applicable payments can be successfully collected;
* educators/providers can be compensated;
* users report acceptable satisfaction;
* operational problems can be resolved;
* repeat demand exists;
* the economics show a credible path to sustainability.

Exact numerical thresholds must be defined by management after market validation.

---

# 33. BUSINESS BOUNDARIES

This BRD does not prescribe:

```text
FRAMEWORK
DATABASE
HOSTING
PROGRAMMING LANGUAGE
UI LIBRARY
API DESIGN
SYSTEM ARCHITECTURE
INFRASTRUCTURE
OSS IMPLEMENTATION
```

Those decisions belong to downstream documents.

---

# 34. DOCUMENT HIERARCHY

The canonical documentation chain is:

```text
00_BRD.md
   │
   │ Business requirements
   ↓
01_BSD.md
   │
   │ Business / system definition
   ↓
02_PRD.md
   │
   │ Product requirements
   ↓
03_ERD.md
   │
   │ Domain / data model
   ↓
04_OSS.md
   │
   │ Reusable resources
   ↓
REFERENCE_RESOURCE_REGISTRY.md
   │
   │ Verified implementation resources
   ↓
IMPLEMENTATION.md
   │
   │ Execution mapping
   ↓
UI_UX.md
SECURITY_COMPLIANCE.md
ACCEPTANCE.md
```

Each layer must remain traceable to the layer above it.

---

# 35. AGENT GOVERNANCE RULE

When an AI agent receives a request, evaluate it in this order:

```text
REQUEST
  ↓
Does it satisfy a business objective?
  ↓
Does it correspond to an approved business requirement?
  ↓
Does it correspond to an approved product requirement?
  ↓
Does it fit the approved domain model?
  ↓
Can an existing resource satisfy it?
  ↓
IMPLEMENT / PROPOSE
```

If the request introduces a new:

```text
business model
actor
market
pricing model
commercial policy
organizational authority
fundamental product capability
```

the agent must flag it as:

```text
BUSINESS / PRODUCT DECISION REQUIRED
```

and must not silently implement the change.

---

# 36. REQUIREMENT CHANGE CONTROL

A change to this BRD is a business-level change.

When a new requirement is proposed, record:

```text
Requirement
Reason
Business Objective
Expected Value
Affected Stakeholders
Affected Product Capability
Affected Domain
Commercial Impact
Operational Impact
Risk
Decision
```

Do not add requirements solely because they are technically convenient.

---

# 37. EVIDENCE PRINCIPLE

Business statements have different evidence levels.

The agent must distinguish:

```text
REQUIREMENT
ASSUMPTION
HYPOTHESIS
OBSERVATION
VALIDATED EVIDENCE
DECISION
UNKNOWN
```

A hypothesis must not be rewritten as a fact merely because it appears in documentation.

A business decision must not be inferred from an implementation pattern.

---

# 38. FINAL BUSINESS PRINCIPLE

The business exists to create a trusted and sustainable connection between:

```text
PEOPLE WHO WANT TO LEARN
          ↕
PEOPLE WHO CAN TEACH
          ↕
A PLATFORM / ORGANIZATION THAT MAKES
THE RELATIONSHIP EASIER,
MORE TRUSTED,
MORE TRANSPARENT,
AND MORE SUSTAINABLE
```

Technology is an enabling mechanism.

The business outcome is the successful creation and continuation of valuable learning relationships.

---

# 39. CANONICAL AGENT DIRECTIVE

For every downstream decision:

```text
BUSINESS VALUE FIRST
↓
EVIDENCE BEFORE ASSUMPTION
↓
REQUIREMENT BEFORE IMPLEMENTATION
↓
REUSE BEFORE REBUILD
↓
SIMPLE BEFORE COMPLEX
↓
VALIDATE BEFORE SCALE
```

**Do not optimize the system for technical completeness at the expense of business viability.**
