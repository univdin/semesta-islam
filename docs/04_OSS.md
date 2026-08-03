# OSS — OPEN SOURCE & RESOURCE SPECIFICATION

**Document:** `OSS.md`
**Status:** Canonical Implementation Reference
**Audience:** AI/LLM Agent · Antigravity IDE Agent · OpenCode · Developer
**Related:** `BRD.md` · `BSD.md` · `PRD.md` · `ERD.md`

---

# 1. PURPOSE

This document defines the approved strategy for adopting:

* Open Source Software;
* GitHub repositories;
* libraries;
* frameworks;
* APIs;
* self-hosted applications;
* developer tools;
* UI resources;
* AI Agent skills/workflows;
* external infrastructure.

The objective is:

```text
RESEARCH
→ VERIFY
→ REUSE
→ ADAPT
→ INTEGRATE
→ MINIMAL CUSTOM CODE
```

Do not rebuild capabilities that already exist in suitable, maintained resources.

---

# 2. NON-NEGOTIABLE AGENT RULES

The AI Agent MUST:

1. Inspect this document before selecting dependencies.
2. Prefer established resources over custom implementation.
3. Verify repository existence before adoption.
4. Verify current maintenance/activity where relevant.
5. Verify license before adoption.
6. Inspect official documentation.
7. Check compatibility with the existing stack.
8. Reuse/adapt before rebuilding.
9. Record important adoption decisions.
10. Avoid introducing unnecessary infrastructure.

The AI Agent MUST NOT:

* invent repositories;
* invent package names;
* invent APIs;
* invent SDKs;
* assume a repository is open source without checking;
* assume a license;
* copy architecture from an abandoned project without evidence;
* introduce dependencies simply because they are popular;
* build an entire CMS/LMS/ERP/community platform when an appropriate solution exists.

---

# 3. RESOURCE PRIORITY

Use this order:

```text
1. Existing project capability
2. Official framework/library capability
3. Approved OSS
4. Official API / SDK
5. Established external service
6. Minimal custom implementation
```

Custom implementation is the last resort for commodity capabilities.

---

# 4. RESOURCE CLASSES

## 4.1 Framework

Used as the application foundation.

Examples:

```text
Next.js
React
TypeScript
```

---

## 4.2 UI / Design System

Used for frontend interfaces.

Potential resources:

```text
Tailwind CSS
shadcn/ui
Radix UI
Lucide
```

---

## 4.3 CMS

Required capabilities:

```text
Pages
Articles
Knowledge
FAQ
Media
Legal Documents
Publishing
```

Potential OSS candidates should be evaluated based on:

* Next.js compatibility;
* API/headless support;
* editorial workflow;
* media handling;
* authentication;
* PostgreSQL support;
* license;
* maintenance.

Potential candidates include:

```text
Payload CMS
Strapi
Directus
Keystone
TinaCMS
```

Do not install multiple CMS platforms.

Select one after repository/documentation verification.

---

# 5. LMS

The LMS capability is optional and should not automatically become a custom subsystem.

Potential resources:

```text
Moodle
Open edX
LearnHouse
```

Evaluate:

* curriculum;
* enrollment;
* progress;
* assessments;
* content;
* reporting;
* API;
* authentication;
* integration effort.

For lightweight provider-led progress, the core platform may be sufficient.

Adopt a full LMS only when requirements justify it.

---

# 6. ERP / BUSINESS MANAGEMENT

ERP should preferably be adopted rather than rebuilt.

Potential OSS candidates:

```text
ERPNext
Odoo Community
Apache OFBiz
```

Evaluate:

* accounting;
* finance;
* CRM;
* HR;
* payroll;
* inventory where relevant;
* API;
* integration;
* licensing;
* deployment complexity.

Do not embed a complete ERP into the core application merely to obtain basic financial records.

---

# 7. CRM

Potential resources:

```text
Twenty
EspoCRM
SuiteCRM
```

Evaluate:

* contacts;
* leads;
* opportunities;
* activities;
* pipelines;
* API;
* authentication;
* integration.

CRM should remain separate from the core booking domain.

---

# 8. COMMUNITY / FORUM

Community is optional.

Potential OSS resources:

```text
Discourse
Flarum
NodeBB
```

Evaluate:

* discussion;
* moderation;
* membership;
* notifications;
* search;
* API;
* SSO;
* mobile UX;
* integration.

Do not build a social network merely because the platform may eventually require community features.

---

# 9. SEARCH

Search requirements may begin with the primary database.

For larger discovery requirements, evaluate:

```text
Meilisearch
Typesense
OpenSearch
```

Selection criteria:

* typo tolerance;
* filtering;
* faceting;
* ranking;
* geo search;
* indexing;
* API;
* operational complexity.

Do not introduce Elasticsearch/OpenSearch-class infrastructure without actual scale/feature requirements.

---

# 10. SCHEDULING / CALENDAR

Potential resources:

```text
Cal.com
FullCalendar
React Big Calendar
```

Use existing scheduling/calendar capabilities before building custom calendar infrastructure.

---

# 11. REALTIME / MESSAGING

Potential approaches:

```text
Supabase Realtime
WebSocket / Socket.IO
Ably
Pusher
```

Selection depends on:

* existing infrastructure;
* realtime requirements;
* scale;
* persistence;
* moderation;
* operational complexity.

Do not introduce multiple realtime systems.

---

# 12. AUTHENTICATION / IAM

Prefer the existing platform authentication capability.

Potential resources/services:

```text
Supabase Auth
Auth.js
Keycloak
Clerk
```

If the application already has an adequate authentication system, do not replace it merely for architectural preference.

Authorization remains an application/domain responsibility.

---

# 13. STORAGE / MEDIA

Potential resources:

```text
S3-compatible object storage
Supabase Storage
Cloudflare R2
MinIO
```

Use object storage for:

* verification documents;
* provider media;
* profile images;
* CMS assets;
* reports;
* attachments.

Sensitive documents require controlled access and signed/private URLs where appropriate.

---

# 14. PAYMENTS

Payment processing must use established providers.

For Indonesia, evaluate official APIs/SDKs from providers such as:

```text
Midtrans
Xendit
```

Requirements:

* payment;
* webhook;
* transaction status;
* refund;
* payout where supported;
* reconciliation;
* idempotency.

Do not build a payment gateway.

Payment providers are external integrations, not OSS dependencies.

---

# 15. WHATSAPP

WhatsApp integration should use official or approved provider APIs.

Potential approach:

```text
Meta WhatsApp Business Platform / Cloud API
```

Third-party providers may be evaluated where operationally justified.

Do not rely on unofficial WhatsApp automation libraries for critical production workflows.

---

# 16. EMAIL

Potential infrastructure:

```text
Resend
Postmark
Amazon SES
SMTP provider
```

Email delivery is an infrastructure concern and should not be custom-built.

---

# 17. NOTIFICATION

Notification architecture should support:

```text
Email
WhatsApp
Push
In-app
```

Use provider APIs where appropriate.

The application should maintain notification intent/state rather than tightly coupling domain logic to a particular vendor.

---

# 18. ANALYTICS

Potential tools:

```text
PostHog
Matomo
Plausible
Umami
```

Evaluate:

* product analytics;
* privacy;
* event tracking;
* dashboards;
* self-hosting;
* cost;
* integration.

Do not build a custom analytics platform.

---

# 19. OBSERVABILITY

Potential resources:

```text
OpenTelemetry
Sentry
Grafana
Prometheus
Loki
```

Use the smallest suitable combination.

Do not deploy an entire observability stack when the application can initially operate with a managed service.

---

# 20. ADMIN / BACKOFFICE

Potential resources:

```text
Refine
React Admin
Directus
AdminJS
```

Evaluate whether the selected CMS/backend already provides adequate administration.

Avoid maintaining multiple overlapping admin systems.

---

# 21. API DOCUMENTATION

Potential resources:

```text
OpenAPI
Redoc
Swagger UI
Scalar
```

API contracts should be machine-readable.

OpenAPI should be the preferred contract format where an external API exists.

---

# 22. DOCUMENTATION

Potential resources:

```text
Hugo
Docusaurus
VitePress
Mintlify
Nextra
```

Selection depends on whether documentation is:

* public;
* developer-facing;
* internal;
* API-oriented;
* content-managed.

Do not introduce a documentation generator if the CMS already satisfies the requirement.

---

# 23. PRESENTATION / DOCUMENT ASSETS

Potential resources may include:

```text
HugoBlox
LibreOffice templates
OpenOffice templates/resources
```

Use only where relevant to the organizational/document-production workflow.

These are supporting resources, not core platform dependencies.

---

# 24. PDF / DOCUMENT GENERATION

Evaluate existing libraries before implementing document generation.

Potential resources depend on runtime:

```text
PDF libraries
HTML → PDF tools
DOCX generation libraries
Office-compatible document tools
```

Requirements should determine the technology.

Do not add a document-generation engine until an actual document-generation requirement exists.

---

# 25. FORM / VALIDATION

Potential frontend resources:

```text
React Hook Form
Zod
```

Use a consistent validation strategy.

Domain/business validation must remain server-side.

---

# 26. TABLE / DATA UI

Potential resources:

```text
TanStack Table
AG Grid
```

Use based on actual complexity.

Do not introduce enterprise-grade grid infrastructure for simple CRUD tables.

---

# 27. FILE / IMAGE PROCESSING

Evaluate:

```text
Sharp
ImageMagick
Cloudinary
S3-compatible storage
```

Use existing image/media processing capabilities.

---

# 28. MAP / GEOLOCATION

If location discovery is required, evaluate:

```text
OpenStreetMap
MapLibre
Leaflet
Google Maps Platform
Mapbox
```

Selection depends on:

* geocoding;
* maps;
* distance;
* location search;
* licensing;
* API cost.

Do not assume a map provider before validating requirements.

---

# 29. AI CAPABILITIES

AI is optional.

Potential use cases:

```text
Search assistance
Content assistance
Provider matching
Support assistance
Content classification
Translation
Moderation assistance
```

AI must remain an enhancement.

Core product functionality MUST remain operational without AI unless a requirement explicitly states otherwise.

---

# 30. AI AGENT DEVELOPMENT RESOURCES

AI coding agents should use repository-native evidence first.

Preferred workflow:

```text
READ
→ INSPECT
→ SEARCH
→ VERIFY
→ PLAN
→ PATCH
→ TEST
→ REVIEW
```

Agents should use:

* repository documentation;
* package manifests;
* existing code;
* official documentation;
* GitHub source;
* tests;
* CI;
* changelogs.

Do not rely solely on model memory for current library APIs.

---

# 31. AI CODING WORKFLOW

Recommended sequence:

```text
1. Repository discovery
2. Architecture discovery
3. Dependency discovery
4. Requirement mapping
5. OSS/resource research
6. Implementation plan
7. Smallest viable change
8. Typecheck
9. Lint
10. Tests
11. Build
12. Review diff
13. Update documentation
```

The agent must avoid large speculative rewrites.

---

# 32. GITHUB RESEARCH RULE

Before adopting a GitHub repository, verify:

```text
Repository exists
↓
Official repository
↓
License
↓
Maintenance/activity
↓
Release/version
↓
Documentation
↓
Dependencies
↓
Compatibility
↓
Security/issues
↓
Adoption decision
```

A GitHub search result alone is insufficient evidence.

---

# 33. LICENSE RULE

Every adopted OSS resource must have a verified license.

The project should maintain a machine-readable license allowlist/blocklist separately.

Example policy:

```text
ALLOW
MIT
Apache-2.0
BSD-2-Clause
BSD-3-Clause
ISC

REVIEW
LGPL
MPL
AGPL
GPL

BLOCK
Unknown / absent license
```

The actual project policy is authoritative.

Do not infer licensing from repository popularity.

---

# 34. DEPENDENCY RULE

Before adding a package:

```text
Need exists?
    ↓
Existing dependency can solve it?
    ↓
Existing platform capability?
    ↓
Approved OSS?
    ↓
Official API?
    ↓
Minimal custom code
```

Do not add duplicate libraries for the same capability without a documented reason.

---

# 35. OSS ADOPTION RECORD

For significant dependencies record:

```text
Resource
Category
Repository / Official Source
License
Version
Purpose
Integration Boundary
Status
Reason
```

Example:

```text
Resource: Payload CMS
Category: CMS
Source: Official repository/documentation
License: VERIFY
Purpose: CMS
Boundary: Content
Status: Candidate
Reason: Headless CMS capability
```

Do not mark a resource as approved until verified.

---

# 36. RESOURCE STATUS

Each candidate must have one status:

```text
CANDIDATE
RESEARCHING
VERIFIED
APPROVED
ADOPTED
REJECTED
DEPRECATED
```

`CANDIDATE` does not mean approved.

---

# 37. SELECTION CRITERIA

Score candidates against:

```text
Functional fit
Technical fit
Maintenance
Community/adoption
License
Security
Documentation
API quality
Integration complexity
Deployment complexity
Cost
Vendor dependence
Migration difficulty
```

Functional fit is more important than popularity.

---

# 38. DO NOT OVER-INTEGRATE

Avoid adopting:

```text
CMS + CMS
LMS + LMS
ERP + ERP
CRM + CRM
Search + Search
Realtime + Realtime
Analytics + Analytics
Auth + Auth
```

unless there is an explicit architectural reason.

One suitable capability is preferable to several overlapping products.

---

# 39. RECOMMENDED CAPABILITY MAP

```text
CORE APPLICATION
├── Next.js / React / TypeScript
├── Existing database
├── Existing authentication
└── Existing deployment

UI
├── Tailwind CSS
├── shadcn/ui
├── Radix UI
└── Lucide

CONTENT
└── Select ONE CMS if required

LEARNING
└── Core progress first
    └── Dedicated LMS only when justified

CRM
└── Select ONE CRM if required

ERP
└── Select ONE ERP if required

COMMUNITY
└── Select ONE community platform if required

SEARCH
└── Database search first
    └── Meilisearch / Typesense / OpenSearch when justified

PAYMENT
├── Midtrans / Xendit
└── Official APIs/SDKs

MESSAGING
├── Application messaging
└── WhatsApp integration

OBSERVABILITY
└── OpenTelemetry / Sentry / appropriate tooling

DOCUMENTATION
└── Existing CMS or dedicated documentation tool
```

---

# 40. AI AGENT DECISION RULE

When a requirement can be satisfied by an existing resource:

```text
USE
```

When an existing resource can satisfy most of it with adaptation:

```text
ADAPT
```

When integration is simpler than implementation:

```text
INTEGRATE
```

Only when none of these are appropriate:

```text
BUILD
```

---

# 41. EVIDENCE RULE

The agent must distinguish:

```text
VERIFIED FACT
INFERENCE
RECOMMENDATION
UNKNOWN
```

If current information cannot be verified:

```text
UNKNOWN — VERIFY BEFORE ADOPTION
```

Never fabricate:

* repository URLs;
* package names;
* version numbers;
* API endpoints;
* licenses;
* feature availability;
* maintenance status.

---

# 42. FINAL DIRECTIVE

The objective of `OSS.md` is not to maximize the number of technologies.

The objective is:

```text
MAXIMUM PRODUCT CAPABILITY
+
MINIMUM UNNECESSARY CUSTOM CODE
+
MINIMUM OPERATIONAL COMPLEXITY
+
VERIFIED DEPENDENCIES
```

The AI Agent should continuously prefer:

```text
REUSE
→ ADAPT
→ INTEGRATE
→ BUILD ONLY WHAT IS UNIQUE
```

over rebuilding commodity software from scratch.