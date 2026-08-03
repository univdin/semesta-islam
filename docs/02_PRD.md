# PRD — SEMESTA ISLAM PLATFORM

**Document:** `PRD.md`
**Status:** Updated
**Audience:** AI/LLM Agent · Antigravity IDE Agent · OpenCode · Developer · Product/Operations
**Authority:** Product requirements aligned with `BRD.md`, `BSD.md`, `ERD.md`, and `OSS.md`.

---

# 1. PRODUCT DEFINITION

SEMESTA ISLAM is a digital platform operated by **SEMESTA ISLAM** as an organization, connecting people, families, educators, mentors, learning providers, organizations, and communities through trusted discovery, engagement, learning/service delivery, and supporting operational capabilities.

The platform consists of:

```text
Organization
→ Governance
→ Management & Operations
→ Platform
→ Users / Providers / Learners / Guardians
→ Offerings / Engagements / Learning
```

The product supports multiple subject areas and service/learning categories.

The domain taxonomy must therefore be configurable rather than hardcoded around a single subject.

---

# 2. PRODUCT STRUCTURE

```text
SEMESTA ISLAM
│
├── Governance
│   ├── Founder / Owner
│   ├── Investor / Donor
│   ├── Advisor / Board
│   └── Other stakeholders
│
├── Management
│   ├── Executive
│   ├── Manager
│   ├── Head / Lead
│   └── Staff
│
├── Operations
│   ├── Verification
│   ├── Finance
│   ├── Support
│   ├── Marketing
│   ├── Content
│   └── Community
│
└── Platform
    ├── Discovery
    ├── Providers
    ├── Learning
    ├── Booking
    ├── Communication
    ├── Commerce
    ├── Trust
    ├── CMS
    ├── LMS
    ├── CRM
    ├── ERP integrations
    └── Community
```

---

# 3. PRODUCT OBJECTIVES

## 3.1 Primary

1. Provide a trusted platform for discovering suitable educators, mentors, learning providers and related services.
2. Give providers a credible channel to present their capabilities and receive engagements.
3. Establish verification and trust mechanisms.
4. Simplify discovery, booking, scheduling, communication and payment.
5. Support structured learning/service delivery and progress reporting.
6. Give SEMESTA ISLAM management and staff appropriate operational controls.
7. Provide a modular foundation that can adopt CMS, LMS, CRM and ERP capabilities without rebuilding them unnecessarily.

---

# 4. PRODUCT ACTORS

## 4.1 Governance

```text
Founder / Owner
Investor / Donor
Advisor / Board
```

Governance actors oversee the organization and its strategic direction.

They are not automatically technical administrators.

---

## 4.2 Management

```text
Director
Executive
General Manager
Head
Manager
Lead
```

Management actors supervise organizational functions and operations.

---

## 4.3 Staff / Operations

```text
Verification Officer
Finance Staff
Customer Support
Marketing Staff
Content Editor
Community Staff
Operations Staff
```

Access is controlled through permissions and organizational scope.

---

## 4.4 Platform Participants

```text
Educator / Mentor / Provider
Learner
Guardian / Family
Organization / Partner
```

These users participate in the actual platform services.

---

# 5. IDENTITY VS ROLE

The product MUST distinguish:

```text
User Identity
≠
Organization Membership
≠
Governance Role
≠
Organizational Role
≠
Platform Role
≠
Permission
```

Example:

```text
User A
├── Founder of SEMESTA ISLAM
├── Organization Member
├── Platform Administrator
└── Educator
```

The product must support such combinations without creating duplicate accounts.

---

# 6. GOVERNANCE EXPERIENCE

Governance capabilities may include:

* organizational overview;
* strategic metrics;
* financial overview;
* operational overview;
* stakeholder/funding information;
* management reporting;
* governance documents.

Governance access is determined by organizational authority and explicit permissions.

---

# 7. MANAGEMENT EXPERIENCE

Management dashboard may include:

```text
Overview
Users
Providers
Verification
Bookings
Sessions
Customers
Finance
Content
Support
Marketing
Reports
```

The dashboard must expose information relevant to the manager's organizational scope.

A manager of one department must not automatically see unrelated restricted data.

---

# 8. STAFF EXPERIENCE

Staff receive task-oriented interfaces.

Examples:

### Verification

```text
Verification Queue
Provider Profiles
Documents
Review
Decision
```

### Finance

```text
Payments
Commission
Payouts
Refunds
Reconciliation
```

### Support

```text
Tickets
Users
Bookings
Conversations
Resolution
```

### Content

```text
Pages
Articles
Knowledge
FAQ
Legal
Media
```

---

# 9. PUBLIC EXPERIENCE

Public users can access:

```text
Home
Explore
Categories
Providers
Offerings
Knowledge
Help
About
Legal
Contact
```

Public pages should support:

* SEO;
* responsive/mobile-first UX;
* structured metadata;
* fast loading;
* clear calls to action.

---

# 10. DISCOVERY

Users must be able to discover providers and offerings.

Search/filter capabilities may include:

```text
Category
Location
Delivery Mode
Gender where applicable
Price
Rating
Availability
Verification
Experience
```

Ranking should prioritize useful and trustworthy results.

The exact ranking formula should remain configurable.

---

# 11. PROVIDER PROFILE

Provider profile may contain:

```text
Profile
Biography
Experience
Qualifications
Expertise
Categories
Delivery Mode
Location
Availability
Pricing
Verification
Badges
Ratings
Reviews
Offerings
```

Sensitive verification documents must never be exposed publicly.

---

# 12. OFFERING

Providers can publish one or more offerings.

An offering contains:

```text
Title
Description
Category
Delivery Mode
Location
Duration
Price
Availability
Status
```

Offerings may be:

* individual sessions;
* recurring services;
* packages;
* structured programs.

---

# 13. CATEGORY SYSTEM

Categories must be configurable.

```text
Category
└── Subcategory
    └── Offering
```

The product must not require a code deployment merely to add or modify a normal category.

---

# 14. VERIFICATION

Provider verification is a core trust capability.

Lifecycle:

```text
Registered
→ Profile Created
→ Verification Submitted
→ Under Review
→ Verified
```

Alternative states:

```text
Rejected
Suspended
Expired
```

Verification may evaluate approved criteria such as:

* identity;
* qualification;
* experience;
* sample;
* affiliation;
* other business-defined evidence.

The exact criteria belong to operational policy.

---

# 15. BADGES

Badges communicate verified attributes.

Examples:

```text
Verified
Experienced
Organization Affiliated
Highly Rated
Complete Profile
```

Official badges must only be awarded through authorized workflows.

---

# 16. BOOKING

Core journey:

```text
Discover
→ Select
→ Request
→ Provider Response
→ Confirm
→ Payment
→ Session
→ Completion
→ Review
```

Booking statuses may include:

```text
Requested
Accepted
Confirmed
Completed
Cancelled
Rejected
Expired
No Show
Refunded
```

---

# 17. SCHEDULING

MVP scheduling must support:

* provider availability;
* session date/time;
* duration;
* delivery mode;
* conflict prevention.

Advanced calendar synchronization may be integrated later.

---

# 18. SESSION

A booking may contain one or more sessions.

Session capabilities:

* scheduling;
* attendance/status;
* start/end;
* notes;
* completion;
* progress recording.

---

# 19. LEARNING / SERVICE PROGRESS

The platform must support basic provider-led progress tracking.

A provider may record:

* target;
* achievement;
* notes;
* status;
* recommendations.

Guardians/learners can view authorized progress.

---

# 20. LEARNING PROGRAM

For structured learning, the platform may support:

```text
Learning Program
→ Learning Item
→ Enrollment
→ Progress
→ Report
```

Advanced LMS capabilities should be provided by an adopted LMS when appropriate rather than unnecessarily recreated.

---

# 21. PROGRESS REPORT

Authorized providers may publish periodic reports containing:

* reporting period;
* achievement;
* areas for improvement;
* educator/provider notes;
* next recommendations.

Visibility is controlled by authorization and learner/guardian relationship.

---

# 22. GUARDIAN / FAMILY

Guardian functionality:

* manage associated learners;
* discover providers;
* book services;
* manage payments;
* view sessions;
* view progress;
* receive reports;
* manage relevant consent/settings.

A learner may be a minor and may therefore not require an independent login.

---

# 23. LEARNER

Learner functionality:

* maintain learning profile where appropriate;
* participate in sessions;
* view assigned learning/service information;
* view progress where authorized;
* provide reviews where eligible.

---

# 24. COMMUNICATION

Communication may occur through:

```text
In-app messaging
Email
WhatsApp
Other approved channels
```

Communication access must be contextual and permission-aware.

Examples:

```text
Booking participants
Guardian ↔ Provider
Support ↔ User
Operations ↔ Provider
```

---

# 25. NOTIFICATIONS

Notification channels:

```text
In-app
Email
Push
WhatsApp
```

Potential events:

```text
Registration
Verification
Booking
Payment
Session
Progress Report
Review
Support
Policy
```

---

# 26. PAYMENT

The platform must support:

* payment initiation;
* payment status;
* provider reference;
* transaction amount;
* refunds where supported.

Payment processing must use approved payment providers.

The platform should not implement its own payment gateway.

---

# 27. COMMISSION

Commission is configurable.

Transaction model:

```text
Gross Amount
− Platform Commission
− Adjustments / Refunds
=
Provider Amount
```

Actual financial settlement must remain traceable.

---

# 28. PAYOUT

Provider payout must support:

* amount;
* provider;
* reference;
* status;
* processing timestamp.

Payment-provider capabilities should be reused.

---

# 29. REVIEWS

Eligible participants may review completed engagements.

Requirements:

* authorized reviewer;
* booking association;
* rating;
* optional text;
* moderation;
* reporting;
* duplicate prevention according to policy.

---

# 30. CMS

The platform requires editorial/public content capabilities.

Core content:

```text
Pages
Articles
Knowledge
FAQ
Help
Announcements
Legal Documents
Media
```

CMS should preferably be adopted from an approved OSS or external platform rather than custom-built.

---

# 31. KNOWLEDGE BASE

Knowledge supports:

* guides;
* articles;
* educational resources;
* FAQs;
* explanations;
* platform documentation;
* trust/safety information.

Required capabilities:

* categories;
* search;
* related content;
* author;
* publication state;
* SEO metadata.

---

# 32. HELP DESK

Public:

```text
FAQ
Help Center
Contact
```

Authenticated:

```text
Support Request
Ticket
Conversation
Status
Resolution
```

Internal support staff can manage support cases within assigned permissions.

---

# 33. LEGAL / POLICY

The platform must support versioned documents such as:

```text
Terms
Privacy Policy
Provider Agreement
Guardian Policy
Refund Policy
Community Guidelines
Safety Policy
```

Where acceptance is required:

```text
User
→ Legal Document Version
→ Acceptance Record
```

---

# 34. CRM

CRM capabilities may include:

```text
Lead
Opportunity
Interaction
Campaign
Customer Account
```

A lead does not automatically become a registered user.

CRM should support marketing and relationship management without contaminating the core booking domain.

---

# 35. ERP / BUSINESS OPERATIONS

ERP is an organizational capability and integration boundary.

Potential domains:

```text
Finance
Accounting
Invoice
Expense
Settlement
Payroll
HR
Reporting
```

The platform should integrate with an ERP where appropriate rather than rebuild an ERP.

---

# 36. HR / PEOPLE MANAGEMENT

SEMESTA ISLAM may manage:

```text
Employees
Contractors
Volunteers
Consultants
Advisors
Departments
Positions
Engagements
```

An educator/provider is not automatically an employee.

---

# 37. ORGANIZATION MANAGEMENT

The platform must support:

```text
Organization
Organization Membership
Department
Position
Organizational Role
Organizational Role Assignment
```

This allows SEMESTA ISLAM to operate with a structured management hierarchy.

---

# 38. GOVERNANCE

Where required:

```text
Founder / Owner
Investor / Donor
Advisor / Board
```

may be represented through governance and funding structures.

Governance information must not automatically become public platform information.

---

# 39. AUTHORIZATION

Authorization follows:

```text
User
→ Role Assignment
→ Role
→ Permission
→ Scope
→ Resource
```

Permissions may be:

```text
user.read
user.manage

provider.read
provider.manage

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

Server-side authorization is mandatory.

---

# 40. ROLE EXAMPLES

```text
Founder / Owner
→ Governance authority

Director / Manager
→ Organizational management

Staff
→ Operational functions

Verification Officer
→ Provider verification

Finance Staff
→ Finance operations

Content Editor
→ CMS

Support Agent
→ Support

Platform Admin
→ Technical administration

Educator
→ Provider functions

Guardian
→ Family/learner functions

Learner
→ Learning/session functions
```

A person may hold multiple roles.

---

# 41. ADMIN / OPERATIONS PANEL

The panel should expose modules according to permission.

```text
Overview
Users
Organizations
Providers
Verification
Bookings
Sessions
Payments
Payouts
Reviews
Support
Moderation
CMS
Knowledge
Legal
Reports
Settings
```

Do not expose every module to every staff member.

---

# 42. DASHBOARDS

## Executive / Management

```text
Users
Providers
Verified Providers
Bookings
GMV
Revenue / Commission
Retention
Conversion
Operations
```

## Provider

```text
Profile
Offerings
Availability
Bookings
Sessions
Learners
Progress
Reviews
Earnings
```

## Guardian

```text
Family
Learners
Bookings
Sessions
Payments
Progress
Reports
Messages
```

## Operations

```text
Verification Queue
Bookings
Payments
Payouts
Support
Moderation
Content
```

---

# 43. FRONTEND REQUIREMENTS

Frontend must be:

* mobile-first;
* responsive;
* accessible;
* SEO-friendly;
* fast;
* permission-aware;
* consistent with the approved UI/design system.

Public and authenticated interfaces may use separate navigation structures.

---

# 44. UI/UX INFORMATION ARCHITECTURE

## Public

```text
Home
Explore
Categories
Providers
Offerings
Knowledge
Help
About
Legal
```

## User

```text
Dashboard
Bookings
Sessions
Messages
Progress
Payments
Profile
Settings
```

## Provider

```text
Dashboard
Profile
Offerings
Availability
Bookings
Sessions
Learners
Progress
Reviews
Earnings
```

## Management

```text
Dashboard
Organization
People
Departments
Providers
Verification
Operations
Finance
CRM
CMS
Support
Reports
```

---

# 45. ANALYTICS

Product events should include:

```text
search
provider_view
offering_view
registration
verification_started
verification_completed
booking_requested
booking_confirmed
payment_completed
session_completed
progress_published
review_submitted
```

Organizational analytics should be separated from personally sensitive information where appropriate.

---

# 46. AUDITABILITY

The platform must audit sensitive actions including:

```text
Role Assignment
Permission Changes
Verification Decisions
Payment Adjustments
Refunds
Payouts
Account Suspension
Content Publication
Policy Changes
```

---

# 47. SECURITY / PRIVACY

Requirements:

* secure authentication;
* server-side authorization;
* role and permission enforcement;
* scoped access;
* audit logs;
* secure file handling;
* data minimization;
* consent management;
* secure payment integration;
* appropriate protection of learner/minor data.

---

# 48. SEO / PUBLIC WEB

Public content should support:

* crawlable pages;
* metadata;
* canonical URLs;
* structured data where appropriate;
* sitemap;
* Open Graph;
* semantic HTML;
* programmatic pages where justified.

Private data must never become indexable public content.

---

# 49. MVP

## MUST

### Organization

* organization;
* memberships;
* organizational roles;
* basic management roles;
* permissions.

### Identity

* registration/login;
* profile;
* role assignment.

### Provider

* provider profile;
* offerings;
* verification;
* badges.

### Discovery

* search;
* filters;
* provider pages;
* offering pages.

### Engagement

* booking;
* basic scheduling;
* sessions;
* communication.

### Learning

* progress;
* progress reports.

### Commerce

* payment;
* commission;
* payout.

### Trust

* rating;
* review;
* moderation.

### Operations

* administration;
* verification;
* user management;
* booking management;
* transaction management.

### Content

* public pages;
* knowledge;
* FAQ;
* legal documents.

---

# 50. SHOULD

```text
Advanced scheduling
Packages
Notifications
WhatsApp integration
CRM
Organization management
Provider analytics
Advanced moderation
Calendar integration
```

---

# 51. COULD

```text
Dedicated LMS
Community/forum
Video classroom
AI matching
Advanced recommendation
B2B
ERP integration
Native mobile application
```

---

# 52. DO NOT BUILD BY DEFAULT

The AI Agent must not introduce these merely because they appear in the long-term domain:

```text
Microservices
Complete ERP
Complete LMS
Complete Social Network
Custom Video Infrastructure
Custom Payment Gateway
Custom Search Engine
Custom IAM
Complex AI Recommendation Engine
Native Mobile Apps
```

Use existing OSS/platform services where appropriate.

---

# 53. SYSTEM BOUNDARIES

```text
                         SEMESTA ISLAM
                              │
                Governance / Management / HR
                              │
                              ▼
                    CORE PLATFORM DOMAIN
                              │
        ┌─────────────┬───────┼────────┬─────────────┐
        ▼             ▼       ▼        ▼             ▼
      CMS            LMS     CRM      ERP         COMMUNITY
        │             │       │        │             │
        └─────────────┴───────┼────────┴─────────────┘
                              │
                              ▼
                     PLATFORM EXPERIENCE
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
          Discovery       Engagement        Operations
              │               │                │
          Providers        Booking          Admin
          Offerings        Session          Finance
          Search           Payment          Verification
                          Progress           Support
```

These are capability boundaries, not mandatory separate applications.

---

# 54. SYSTEM-OF-RECORD

```text
Identity
→ Auth/Identity system

Users / Providers / Bookings
→ Core platform

Editorial content
→ CMS

Structured learning
→ LMS if adopted

CRM records
→ CRM if adopted

Accounting / HR
→ ERP/HR system if adopted

Payment settlement
→ Payment provider + platform transaction record

Analytics
→ Analytics platform
```

Avoid unnecessary duplication of authoritative data.

---

# 55. OSS / INTEGRATION PRINCIPLE

Implementation follows:

```text
Existing capability
→ Approved OSS
→ External service/API
→ Minimal custom code
```

The AI Agent must consult `OSS.md` and the project's approved resource registry before introducing dependencies.

---

# 56. IMPLEMENTATION DIRECTIVE

The AI Agent must:

1. Read `BRD.md`.
2. Read `BSD.md`.
3. Read `PRD.md`.
4. Read `ERD.md`.
5. Read `OSS.md`.
6. Inspect the existing repository.
7. Map existing implementation.
8. Identify reusable components.
9. Verify relevant OSS/API resources.
10. Produce an evidence-based implementation plan.
11. Reuse existing capabilities before creating new ones.
12. Implement only approved requirements.
13. Validate implementation against the PRD and ERD.

The AI Agent must not invent:

* requirements;
* business rules;
* APIs;
* repositories;
* dependencies;
* user roles;
* permissions;
* integrations;
* domain entities.

If information is unavailable, mark it as:

```text
UNKNOWN
```

or:

```text
REQUIRES_DECISION
```

rather than inventing an answer.

---

# 57. FEATURE COMPLETION

A feature is complete only when all applicable layers agree:

```text
Requirement
↓
UX / UI
↓
Frontend
↓
Backend
↓
Database / Domain
↓
Authorization
↓
Integration
↓
Validation
```

Frontend-only implementation is not considered complete when backend authorization or persistence is required.

---

# 58. SUCCESS METRICS

## Organization

* operational efficiency;
* staff productivity;
* verification turnaround;
* support resolution;
* financial reconciliation.

## Supply

* registered providers;
* verified providers;
* provider activation;
* time-to-first-booking;
* provider retention.

## Demand

* discovery conversion;
* profile-to-booking conversion;
* booking completion;
* repeat usage;
* customer retention.

## Trust

* verification rate;
* average rating;
* complaint rate;
* dispute rate.

## Commerce

* GMV;
* completed transactions;
* commission;
* payout success;
* refund rate.

## Learning / Service

* session completion;
* repeat engagement;
* progress-report completion;
* learner/guardian satisfaction.

---

# 59. CANONICAL DOMAIN RELATIONSHIP

```text
                 SEMESTA ISLAM
                       │
          ┌────────────┴────────────┐
          │                         │
     GOVERNANCE                 MANAGEMENT
          │                         │
 Founder / Owner              Manager / Staff
 Investor / Donor                   │
 Advisor / Board                    │
          │                         │
          └────────────┬────────────┘
                       ▼
                  OPERATIONS
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
                  ┌────┴────┐
                  ▼         ▼
               PAYMENT   PROGRESS
                  │         │
                PAYOUT    REPORT
                  │
                  └────┬────┘
                       ▼
                      TRUST

Supporting capabilities:
CMS · LMS · CRM · ERP · Community ·
Search · Messaging · Notification · Analytics
```

---

# 60. CANONICAL RULE

**SEMESTA ISLAM is the organizational/governance layer. Management and staff operate the organization. Platform IAM controls technical access. Providers, learners, guardians and organizations participate in the platform's service and learning domain. CMS, LMS, CRM, ERP and community are supporting capabilities with explicit system boundaries.**

The implementation must preserve these distinctions while remaining as simple as practical.