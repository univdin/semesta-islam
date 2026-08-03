# 01 — BUSINESS & SYSTEM DEFINITION

**Document:** `01_BSD.md`
**Purpose:** Canonical definition of the business, ecosystem, actors, operating model, system boundaries, and decision context.
**Audience:** Management, Operations, HR/Recruitment, Marketing, Product, Design, AI/LLM Agents, Developers
**Authority:** Canonical business/system context for downstream `PRD.md`, `ERD.md`, `OSS.md`, and implementation.

---

# 1. AGENT INSTRUCTION

Treat this document as the canonical business/system context.

The agent MUST:

* understand the business context before proposing product or implementation decisions;
* preserve the business model, terminology, actor relationships, and principles defined here;
* support multiple learning areas, educators, learners, providers, formats, and delivery models;
* distinguish **facts, validated research, decisions, hypotheses, and unresolved questions**;
* never convert an assumption or hypothesis into an established business requirement;
* never invent business, commercial, legal, organizational, religious, cultural, or operational policy;
* distinguish business decisions from product decisions and implementation decisions;
* use `BRD.md` for business requirements;
* use this document for business/system context;
* use `PRD.md` for product requirements;
* use `ERD.md` for domain/data representation;
* use `OSS.md` for reusable technology and resources;
* prefer existing suitable resources before proposing custom development;
* preserve traceability between decisions and downstream implementation;
* flag ambiguity rather than silently resolving it.

The agent MUST NOT:

* narrow the business to a single learning subject without an approved decision;
* invent brand positioning, visual identity, pricing, commission, verification policy, or operational policy;
* assume a feature exists merely because it is technically possible;
* treat marketing claims as facts;
* treat AI-generated suggestions as approved business decisions;
* introduce technical architecture into business definitions unless required to explain a system boundary.

---

# 2. CONTEXT STATUS MODEL

Every important statement used by an agent should be understood according to its evidence status.

Use these categories:

| Status       | Meaning                                                            |
| ------------ | ------------------------------------------------------------------ |
| `FACT`       | Established information supported by authoritative source          |
| `RESEARCH`   | Evidence obtained through market/user/competitor/resource research |
| `DECISION`   | Explicitly approved business/product decision                      |
| `HYPOTHESIS` | Belief requiring validation                                        |
| `OPEN`       | Decision or information not yet established                        |
| `REJECTED`   | Previously considered and explicitly rejected                      |

Agents MUST NOT silently promote:

```text
HYPOTHESIS → FACT
RESEARCH → DECISION
SUGGESTION → REQUIREMENT
POSSIBILITY → COMMITMENT
```

---

# 3. BUSINESS DEFINITION

The business provides a trusted digital environment connecting:

```text
PEOPLE SEEKING LEARNING
        ↕
EDUCATORS / LEARNING PROVIDERS
        ↕
PLATFORM
```

The platform facilitates discovery, trust, engagement, scheduling, learning/service delivery, communication, payment, progress, feedback, and ongoing relationships.

The platform is intended to become a trusted destination for discovering and accessing suitable learning services and educators.

---

# 4. CORE VALUE PROPOSITION

## For Learners & Families

The ecosystem aims to provide a convenient way to:

* discover suitable educators/providers;
* understand qualifications, experience, and relevant background;
* evaluate relevant offerings;
* compare suitable options;
* initiate engagement;
* manage learning/service activities;
* communicate with educators;
* manage payments;
* monitor progress where applicable.

## For Educators / Providers

The ecosystem aims to provide a professional channel to:

* establish a professional presence;
* present expertise and experience;
* offer learning services;
* reach relevant learners;
* receive suitable opportunities;
* manage requests and schedules;
* deliver learning/services;
* maintain learner relationships;
* report progress where applicable;
* receive compensation;
* develop sustainable professional practice.

## For the Platform

The platform creates value through:

```text
TRUST
+
DISCOVERY
+
MATCHING
+
SERVICE ENABLEMENT
+
LEARNING SUPPORT
+
TRANSACTION ENABLEMENT
+
QUALITY CONTROL
```

---

# 5. BUSINESS ECOSYSTEM

```text
                    PLATFORM
                       │
        ┌──────────────┼──────────────┐
        │              │              │
      DEMAND         SUPPLY        KNOWLEDGE
        │              │              │
   Families        Educators       Content
   Learners        Providers       Resources
        │              │              │
        └──────────────┼──────────────┘
                       │
                 SERVICE / LEARNING
                       │
                 COMMUNITY / SUPPORT
```

Potential ecosystem participants include:

* educational institutions;
* organizations;
* communities;
* partners;
* affiliates;
* operational staff;
* content creators;
* professional networks.

The inclusion and commercial role of each participant requires validation or explicit business decision.

---

# 6. PRIMARY ACTORS

## 6.1 Visitor

A person exploring the ecosystem without necessarily having an account.

Possible activities:

* discover;
* search;
* read;
* evaluate;
* contact;
* register.

---

## 6.2 Family / Guardian

A person responsible for one or more learners.

Possible activities:

* discover;
* evaluate;
* select;
* arrange learning;
* communicate;
* monitor;
* pay.

---

## 6.3 Learner

The recipient of a learning/service experience.

Possible learner contexts include:

* child;
* teenager;
* adult;
* independent learner.

The applicable access, consent, and representation model requires approved policy.

---

## 6.4 Educator / Learning Provider

A person or organization providing learning or educational services.

The ecosystem should support diverse professional backgrounds, specializations, experience levels, teaching approaches, and delivery formats.

---

## 6.5 Operations

Responsible for operational integrity.

Potential responsibilities:

* verification;
* quality control;
* support;
* moderation;
* transaction operations;
* dispute handling;
* operational administration.

Exact organizational ownership is an operational decision.

---

## 6.6 Content Team

Potential responsibilities:

* educational resources;
* knowledge;
* guides;
* help;
* editorial content;
* public information;
* legal/policy publication.

---

## 6.7 Marketing / Growth

Potential responsibilities:

* demand acquisition;
* supply acquisition;
* content distribution;
* social media;
* partnerships;
* referrals;
* campaign measurement.

---

## 6.8 Management

Owns or oversees:

* strategy;
* business performance;
* growth;
* quality;
* financial performance;
* partnerships;
* organizational development;
* major business decisions.

---

# 7. CORE BUSINESS LOOP

```text
DISCOVER
   ↓
TRUST
   ↓
SELECT
   ↓
ENGAGE
   ↓
BOOK / ENROLL
   ↓
PAY
   ↓
LEARN / RECEIVE SERVICE
   ↓
TRACK PROGRESS
   ↓
REVIEW
   ↓
RETURN / REFER
```

Not every engagement must contain every step.

The actual operational flow depends on the service model.

---

# 8. SUPPLY SIDE

The supply side consists of educators and approved learning providers.

## Supply Lifecycle

```text
PROSPECT
   ↓
INTEREST
   ↓
APPLICATION
   ↓
PROFILE
   ↓
VERIFICATION
   ↓
APPROVAL
   ↓
ONBOARDING
   ↓
PUBLISHED
   ↓
ACTIVE
   ↓
RETAINED
```

Potential acquisition channels:

* personal/professional networks;
* referrals;
* educational communities;
* social media;
* professional platforms;
* institutions;
* partnerships;
* direct outreach.

Recruitment criteria, compensation, screening, and verification standards are management/operations decisions.

---

# 9. DEMAND SIDE

Demand may consist of:

```text
FAMILY
GUARDIAN
LEARNER
ADULT LEARNER
ORGANIZATION
INSTITUTION
```

## Demand Lifecycle

```text
AWARENESS
   ↓
DISCOVERY
   ↓
SEARCH
   ↓
EVALUATION
   ↓
CONTACT
   ↓
REQUEST
   ↓
BOOK / ENROLL
   ↓
LEARNING
   ↓
RETENTION
   ↓
REFERRAL
```

The actual journey must be validated against user research.

---

# 10. TRUST MODEL

Trust is a fundamental business asset.

Potential trust signals include:

```text
IDENTITY
+
BACKGROUND
+
EXPERIENCE
+
QUALIFICATION
+
VERIFICATION
+
PROFILE TRANSPARENCY
+
REVIEWS
+
SERVICE HISTORY
+
PLATFORM GOVERNANCE
```

Trust signals must be distinguishable from:

```text
MARKETING CLAIM
PROMOTIONAL COPY
SELF-DECLARED INFORMATION
UNVERIFIED INFORMATION
```

The platform must not represent unverified information as verified.

Specific verification criteria require an approved operational policy.

---

# 11. QUALITY MODEL

Quality is multi-dimensional.

Potential dimensions:

* educator suitability;
* professional background;
* communication;
* reliability;
* attendance;
* learning/service delivery;
* learner progress;
* user satisfaction;
* reviews;
* operational conduct.

Ratings are one signal and must not automatically be treated as the complete definition of quality.

---

# 12. LEARNING MODEL

The ecosystem supports learning as both an ongoing relationship and a structured process.

Possible structures:

```text
INDIVIDUAL SESSION
GROUP SESSION
PROGRAM
COURSE
MODULE
LESSON
ACTIVITY
ASSESSMENT
```

Different offerings may require different levels of structure.

The system therefore needs to accommodate:

```text
LIGHTWEIGHT SERVICE
```

and:

```text
STRUCTURED LEARNING
```

without assuming every service follows the same model.

---

# 13. SERVICE MODEL

An educator/provider may offer one or more services.

An offering may differ by:

* learning area;
* subject;
* level;
* learner profile;
* method;
* format;
* duration;
* location;
* schedule;
* pricing;
* package;
* expected outcome.

The business model must remain extensible as new learning areas and service models are validated.

---

# 14. DELIVERY MODEL

Possible delivery models:

```text
ONLINE
OFFLINE
HYBRID
```

Offline services may depend on location.

Online services may use:

* external communication/video services;
* integrated tools;
* future platform-native capabilities.

The platform does not need to own every technology used in service delivery.

---

# 15. COMMERCIAL MODEL

The platform may generate revenue through transaction-related mechanisms.

A possible model is:

```text
CUSTOMER PAYMENT
       ↓
PLATFORM
       ├── PLATFORM REVENUE
       └── EDUCATOR / PROVIDER PAYOUT
```

Potential future commercial models may include:

* packages;
* featured visibility;
* subscriptions;
* institutional services;
* partnerships;
* other approved products.

**No pricing, commission percentage, payout rule, subscription rate, or commercial policy is authoritative unless explicitly approved.**

---

# 16. RELATIONSHIP MODEL

The ecosystem is not limited to one-time transactions.

Relationships may exist between:

```text
Family ↔ Educator
Learner ↔ Educator
Learner ↔ Program
User ↔ Content
User ↔ Community
User ↔ Support
Organization ↔ Educator
Organization ↔ Learner
```

A successful relationship may continue through:

```text
SESSION
→ BOOKING
→ PROGRAM
→ REPEAT ENGAGEMENT
→ LONG-TERM LEARNING
```

---

# 17. CONTENT & KNOWLEDGE ECOSYSTEM

Public and authenticated content may help users:

```text
DISCOVER
UNDERSTAND
LEARN
DECIDE
USE
TROUBLESHOOT
```

Potential content areas:

* educational knowledge;
* learning guides;
* methodology;
* practical resources;
* FAQs;
* help;
* stories;
* announcements;
* institutional information;
* legal/policy information.

Content is an acquisition, trust, education, and customer-success asset.

---

# 18. COMMUNITY MODEL

If community functionality is activated, it may support:

* knowledge exchange;
* discussion;
* peer support;
* educator interaction;
* learner/family interaction;
* questions and answers;
* professional networking.

Community participation is distinct from commercial transactions.

Community functionality requires:

* participation rules;
* moderation;
* reporting;
* governance;
* appropriate user controls.

---

# 19. SUPPORT MODEL

Support exists to preserve trust and service continuity.

Potential support categories:

```text
ACCOUNT
PROFILE
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

Escalation, SLA, ownership, and resolution policies require operational approval.

---

# 20. OPERATING MODEL

```text
GROWTH
│
├── Marketing
├── Acquisition
├── Partnerships
└── Referral

SUPPLY
│
├── Recruitment
├── Screening
├── Verification
├── Onboarding
└── Retention

DEMAND
│
├── Acquisition
├── Conversion
├── Activation
└── Retention

SERVICE
│
├── Booking
├── Scheduling
├── Delivery
├── Progress
└── Feedback

TRUST
│
├── Verification
├── Moderation
├── Safety
├── Disputes
└── Governance

SUPPORT
│
├── Help
├── Tickets
├── Resolution
└── Customer Experience

CONTENT
│
├── Editorial
├── Knowledge
├── Help
├── SEO
└── Media
```

This represents a capability map, not a mandatory organizational structure.

---

# 21. BUSINESS CAPABILITIES

| Capability          | Purpose                               |
| ------------------- | ------------------------------------- |
| Identity            | Establish identity and access context |
| Educator Management | Establish and maintain supply         |
| Verification        | Establish trust                       |
| Discovery           | Help demand find relevant supply      |
| Matching            | Connect needs with suitable providers |
| Offering Management | Define available services             |
| Booking             | Establish service engagements         |
| Scheduling          | Coordinate delivery                   |
| Learning            | Support structured learning           |
| Progress            | Track development                     |
| Communication       | Enable relevant interaction           |
| Commerce            | Enable payment and settlement         |
| Reviews             | Capture experience feedback           |
| Support             | Resolve user problems                 |
| Content             | Provide knowledge and information     |
| Community           | Enable peer interaction               |
| Moderation          | Protect ecosystem quality             |
| Analytics           | Measure business performance          |

These capabilities do not imply that each must be implemented in the first release.

---

# 22. BUSINESS OBJECTS

Primary conceptual objects include:

```text
USER
PERSON
FAMILY
LEARNER
EDUCATOR
EDUCATOR PROFILE
VERIFICATION
OFFERING
BOOKING
SESSION
PROGRAM
COURSE
LESSON
PROGRESS
CONTENT
COMMUNITY
CONVERSATION
PAYMENT
PAYOUT
REVIEW
SUPPORT TICKET
LEGAL DOCUMENT
POLICY ACCEPTANCE
```

The canonical domain/data representation belongs to `ERD.md`.

---

# 23. BUSINESS STATES

Important processes require explicit lifecycle states.

### Educator

```text
APPLICANT
→ UNDER_REVIEW
→ VERIFIED
→ ACTIVE
→ INACTIVE / SUSPENDED
```

### Offering

```text
DRAFT
→ REVIEW
→ PUBLISHED
→ PAUSED
→ ARCHIVED
```

### Booking

```text
REQUESTED
→ ACCEPTED
→ SCHEDULED
→ COMPLETED
```

Exceptional states may include:

```text
REJECTED
CANCELLED
EXPIRED
DISPUTED
```

### Support

```text
OPEN
→ IN_PROGRESS
→ RESOLVED
→ CLOSED
```

Actual state transitions require operational/product approval.

---

# 24. BUSINESS PRINCIPLES

## 24.1 Trust First

Trust is more important than short-term transaction volume.

## 24.2 Quality Before Scale

Supply growth must not compromise quality.

## 24.3 Professional Dignity

Educators/providers should be represented as professionals and learning partners.

## 24.4 User Value

The ecosystem exists to solve real learning and service needs.

## 24.5 Transparency

Important information concerning:

* educator status;
* service;
* price;
* booking;
* payment;
* policies

should be presented clearly.

## 24.6 Sustainable Relationships

Optimize for successful continuing relationships rather than one-off transactions alone.

## 24.7 Extensibility

Support expansion across learning areas, educators, formats, and organizational contexts.

## 24.8 Evidence Before Assumption

Important business decisions should be informed by evidence whenever evidence can reasonably be obtained.

## 24.9 Reuse Before Reinvention

Existing suitable resources should be evaluated before custom development is proposed.

---

# 25. MARKET & BRAND DISCOVERY CONTEXT

Brand and market positioning are business decisions.

They should be established through:

```text
MARKET RESEARCH
      ↓
AUDIENCE RESEARCH
      ↓
COMPETITOR / CATEGORY RESEARCH
      ↓
POSITIONING
      ↓
AUDIENCE
      ↓
PERSONALITY
      ↓
VOICE / TONE
      ↓
NARRATIVE
      ↓
BRAND GUIDELINES
```

The AI agent must not invent a finalized brand identity merely because visual implementation has begun.

Until explicitly approved, brand-related statements should be treated as:

```text
RESEARCH
HYPOTHESIS
OPEN
```

rather than `DECISION`.

---

# 26. BRAND / DESIGN BOUNDARY

Business context determines:

```text
WHO
WHY
VALUE
POSITION
AUDIENCE
TRUST
```

Brand/design context determines:

```text
HOW THE BUSINESS IS EXPRESSED
```

Product/design documentation may subsequently define:

* visual language;
* typography;
* color;
* imagery;
* composition;
* interaction;
* motion;
* component language;
* responsive behavior;
* accessibility.

The AI agent must not derive a complete visual identity directly from the BSD.

---

# 27. MARKET VALIDATION PRINCIPLE

Early execution should validate the business before excessive product construction.

Validation may involve:

```text
SOCIAL MEDIA
CONTENT
DIRECT OUTREACH
COMMUNITY
REFERRAL
EDUCATOR RECRUITMENT
PARTNERSHIPS
LANDING PAGES
INTERVIEWS
PILOTS
MANUAL OPERATIONS
```

The purpose is to obtain evidence concerning:

```text
DEMAND
SUPPLY
TRUST
POSITIONING
WILLINGNESS TO ENGAGE
WILLINGNESS TO PAY
SERVICE QUALITY
RETENTION
```

The platform should not assume that software automation is required before these business loops have evidence.

---

# 28. AI AGENT DECISION DISCIPLINE

When an agent encounters a new idea:

```text
NEW IDEA
   ↓
Is it supported by existing evidence?
   │
   ├── YES → record source/context
   │
   └── NO → classify as HYPOTHESIS
```

When encountering a proposed business decision:

```text
PROPOSAL
   ↓
Approved?
   │
   ├── YES → DECISION
   │
   └── NO → OPEN
```

When encountering a proposed implementation:

```text
REQUEST
   ↓
Business-aligned?
   │
   ├── NO → FLAG
   │
   └── YES
        ↓
Product requirement exists?
        │
        ├── YES → continue
        │
        └── NO → flag product decision
```

The agent must never silently convert:

```text
IDEA → REQUIREMENT
```

or:

```text
IMPLEMENTATION POSSIBILITY → BUSINESS DECISION
```

---

# 29. RESEARCH DISCIPLINE

When external research is requested, the agent should prefer:

1. primary sources;
2. official documentation;
3. authoritative repositories;
4. original research;
5. reputable market sources;
6. community evidence where appropriate.

For OSS/resource research, verify:

```text
REPOSITORY
MAINTENANCE
LICENSE
DOCUMENTATION
ACTIVITY
TECHNICAL FIT
SECURITY
INTEGRATION COST
```

Research results must remain distinguishable from approved decisions.

---

# 30. IMPLEMENTATION DISCIPLINE

The implementation process should follow:

```text
UNDERSTAND
   ↓
RESEARCH
   ↓
DECIDE
   ↓
MAP
   ↓
REUSE
   ↓
PLAN
   ↓
IMPLEMENT
   ↓
VERIFY
   ↓
AUDIT
   ↓
ACCEPT
```

Agents should work in bounded tasks/checkpoints.

They should not undertake broad autonomous redesign when the requested task is narrow.

---

# 31. NO-GUESSING RULE

If required information is unavailable:

```text
DO NOT GUESS.
```

Instead:

```text
IDENTIFY GAP
→ STATE WHAT IS UNKNOWN
→ CLASSIFY AS OPEN / HYPOTHESIS
→ REQUEST OR RESEARCH EVIDENCE
→ PROCEED ONLY WITH APPROPRIATE CONFIDENCE
```

This applies to:

* business policy;
* pricing;
* brand;
* market claims;
* legal interpretation;
* user behavior;
* verification criteria;
* organizational authority;
* technical resource suitability.

---

# 32. BUSINESS METRICS

## Supply

* registered educators;
* verified educators;
* active educators;
* educator activation;
* educator retention;
* educator utilization.

## Demand

* visitors;
* leads;
* registrations;
* active families;
* active learners;
* booking requests;
* completed engagements.

## Service Health

* search-to-request conversion;
* request-to-booking conversion;
* booking completion;
* cancellation;
* repeat booking;
* educator response time.

## Financial

* GMV;
* platform revenue;
* commission;
* payout;
* refund;
* average transaction value.

## Quality

* rating;
* review volume;
* completion rate;
* complaints;
* incidents;
* support resolution.

## Retention

* family retention;
* learner retention;
* educator retention;
* repeat engagement;
* referral.

Metric definitions must be finalized before they become authoritative management KPIs.

---

# 33. BUSINESS RISKS

```text
LOW TRUST
LOW QUALITY SUPPLY
INSUFFICIENT SUPPLY
LOW DEMAND
LOW CONVERSION
HIGH CANCELLATION
PAYMENT FAILURE
POOR SERVICE EXPERIENCE
SAFETY INCIDENT
CONTENT QUALITY
COMMUNITY ABUSE
REGULATORY / LEGAL RISK
OPERATIONAL OVERLOAD
UNSUSTAINABLE ECONOMICS
```

Risk mitigation belongs to management and operational governance.

---

# 34. SYSTEM BOUNDARY

The platform facilitates the ecosystem.

It does not automatically own every external capability involved in learning delivery.

External systems may provide:

* payment;
* communication;
* video;
* maps/location;
* identity verification;
* analytics;
* media infrastructure;
* notifications.

Specific technology and integrations belong to downstream product/OSS/implementation documentation.

---

# 35. PRODUCT ECOSYSTEM MAP

```text
                         PUBLIC
                           │
          ┌────────────────┼────────────────┐
          │                │                │
      DISCOVERY          CONTENT          COMMUNITY
          │                │                │
          └────────────────┼────────────────┘
                           │
                     TRUST / MATCH
                           │
             ┌─────────────┴─────────────┐
             │                           │
          DEMAND                       SUPPLY
             │                           │
      Family / Learner              Educator
             │                           │
             └─────────────┬─────────────┘
                           │
                     ENGAGEMENT
                           │
                    BOOKING / ENROLLMENT
                           │
                    SERVICE / LEARNING
                           │
                 ┌─────────┴─────────┐
                 │                   │
              PROGRESS             PAYMENT
                 │                   │
                 └─────────┬─────────┘
                           │
                      FEEDBACK
                           │
                    RETENTION / REFERRAL
```

---

# 36. DOCUMENT TRACEABILITY

Canonical documentation flow:

```text
00_BRD.md
   ↓
01_BSD.md
   ↓
02_PRD.md
   ↓
03_ERD.md
   ↓
04_OSS.md
   ↓
IMPLEMENTATION
```

Supporting context may include:

```text
MARKET RESEARCH
BRAND DISCOVERY
DESIGN CONTEXT
SECURITY / COMPLIANCE
ACCEPTANCE
```

These supporting contexts must not override an approved business decision unless explicitly updated.

---

# 37. DOCUMENT RESPONSIBILITIES

| Document       | Primary Question                                                     |
| -------------- | -------------------------------------------------------------------- |
| `BRD.md`       | Why does the business exist and what business outcomes are required? |
| `BSD.md`       | What business/system ecosystem exists and how does it operate?       |
| `PRD.md`       | What product capabilities are required?                              |
| `ERD.md`       | What domain/data concepts and relationships exist?                   |
| `OSS.md`       | What existing resources can be reused or integrated?                 |
| Implementation | How should the approved product be assembled and delivered?          |

AI agents must not move decisions between these layers without justification.

---

# 38. CHANGE CONTROL

When a proposed change affects:

```text
BUSINESS MODEL
ACTORS
VALUE PROPOSITION
MARKET
COMMERCIAL MODEL
CORE WORKFLOW
TRUST MODEL
ORGANIZATIONAL RESPONSIBILITY
```

the change is a **business/system decision**.

When a proposed change affects:

```text
USER FLOW
FEATURE
PRODUCT CAPABILITY
UX
```

the change is primarily a **product decision**.

When a proposed change affects:

```text
FRAMEWORK
LIBRARY
DATABASE
API
INFRASTRUCTURE
CODE
```

the change is an **implementation decision**.

Agents must identify the decision layer before acting.

---

# 39. CANONICAL BUSINESS POSITION

The ecosystem should be understood as:

```text
A TRUSTED LEARNING & EDUCATION ECOSYSTEM
```

connecting:

```text
PEOPLE
+
EDUCATORS / PROVIDERS
+
LEARNING
+
KNOWLEDGE
+
COMMUNITY
+
SUPPORT
+
TRANSACTIONS
```

Its central business purpose is to make access to suitable learning and qualified educators:

```text
EASIER
MORE TRUSTWORTHY
MORE PROFESSIONAL
MORE TRANSPARENT
MORE SUSTAINABLE
```

---

# 40. FINAL AGENT DIRECTIVE

Preserve this hierarchy:

```text
EVIDENCE
      ↓
BUSINESS PURPOSE
      ↓
USER VALUE
      ↓
TRUST & QUALITY
      ↓
BUSINESS DECISION
      ↓
PRODUCT REQUIREMENT
      ↓
DOMAIN MODEL
      ↓
REUSE EXISTING RESOURCES
      ↓
IMPLEMENTATION
      ↓
VERIFICATION
```

Technology must serve the approved business and product model.

The agent's responsibility is not to invent the business.

The agent's responsibility is to **understand, preserve, research, trace, implement, and verify the approved system without hallucinating missing decisions.**
