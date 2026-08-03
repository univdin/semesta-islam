# MASTER EXPERIMENT PROMPT

## SEMESTA ISLAM — SYSTEM-WIDE AI AGENT TEST, VALIDATION & EXPERIMENT

**MODE: EXPERIMENTAL EXECUTION — NOT PLAN MODE**

Anda sedang diuji sebagai **AI IDE Engineering Agent** pada repository SEMESTA ISLAM.

Tujuan utama eksperimen ini BUKAN sekadar menambah fitur.

Tujuan utamanya adalah menguji apakah Anda mampu:

1. memahami repository aktual;
2. membedakan fakta runtime/code/schema dari dokumentasi;
3. mendeteksi dokumentasi yang stale, kontradiktif, atau tidak lengkap;
4. menemukan source of truth yang benar;
5. melakukan perubahan secara aman;
6. menjaga backward compatibility;
7. menjaga security boundary;
8. menguji perubahan secara nyata;
9. melakukan runtime verification;
10. menghasilkan evidence yang dapat diaudit;
11. tidak mengarang fitur/status yang belum terbukti;
12. tidak terjebak dalam PLAN-ONLY LOOP.

---

# 1. HARD DIRECTIVE

Jangan mulai dengan membuat implementation plan panjang.

Jangan menganggap dokumen Markdown sebagai kebenaran hanya karena dokumen tersebut bernama:

* MASTER
* BLUEPRINT
* EXECUTION
* CONTRACT
* AUDIT
* REGISTRY
* ARCHITECTURE
* ROADMAP
* REPORT
* DECISION LOG

Semua dokumen tersebut harus dianggap:

> **CLAIM / CANDIDATE SPECIFICATION UNTIL VERIFIED.**

Repository aktual adalah objek eksperimen.

Untuk setiap klaim penting, prioritaskan evidence dengan urutan:

```text
RUNTIME BEHAVIOR
    ↓
DATABASE / SCHEMA
    ↓
ACTUAL SOURCE CODE
    ↓
TESTS
    ↓
CONFIG / ENV CONTRACT
    ↓
API CONTRACT / ROUTES
    ↓
REGISTRY / GENERATED ARTIFACT
    ↓
DOCUMENTATION
    ↓
OLD PLAN / ASSUMPTION
```

Urutan ini bukan berarti dokumentasi tidak penting.

Dokumentasi penting sebagai intended design, tetapi tidak boleh dianggap implemented reality sebelum diverifikasi.

---

# 2. FIRST PRINCIPLE

Sebelum mengubah kode, jawab melalui evidence:

### A. Apa yang benar-benar ada?

* routes
* APIs
* services
* domain logic
* Prisma schema
* migrations
* database state
* authentication
* authorization
* permissions
* organization isolation
* portals
* dashboards
* transaction/economy
* booking
* verification
* growth
* notification
* email
* backup
* integration
* changelog
* audit
* management control plane
* tests
* seed
* runtime behavior

### B. Apa yang hanya diklaim ada?

### C. Apa yang sebagian ada?

### D. Apa yang implemented tetapi belum verified?

### E. Apa yang verified tetapi dokumentasinya stale?

### F. Apa yang dokumentasinya benar tetapi implementasinya belum ada?

### G. Apa yang memiliki kontradiksi?

Jangan memperbaiki kontradiksi secara diam-diam.

Catat dan jelaskan.

---

# 3. SCOPE — SYSTEM WIDE

Eksperimen ini TIDAK boleh hanya berfokus pada Internal Economy.

Audit dan uji seluruh domain yang saat ini ada di repository.

Minimal:

## Identity & Authentication

* session
* demo authentication
* Supabase/auth abstraction
* login
* logout
* identity resolution
* server-derived identity
* middleware
* unauthorized behavior

## Authorization & Governance

* capabilities
* platform roles
* organization roles
* permission scopes
* ownership
* organization isolation
* delegation
* expiry
* founder control
* fail-closed behavior
* IDOR protection

## Member Portal

* `/member`
* profile
* notifications
* organizations
* activity
* points/economy if implemented

## Organization Portal

* organization list
* organization detail
* members
* invitations
* scoped access
* cross-organization isolation

## Founder / Management Control Plane

* `/management`
* people
* organizations
* delegations
* audit
* backups
* communications
* system
* economy if implemented
* monitoring
* control vs observation boundaries

## Booking

* inquiry
* confirm
* ownership
* organization scope
* ledger/economy interaction
* lifecycle
* idempotency
* audit

DO NOT activate unsupported booking states merely because enums exist.

## Verification

* submit
* status
* review
* resubmit
* educator ownership
* Lajnah permissions
* PII exposure
* authorization
* state machine

## Internal Economy

Only if actually present:

* transaction
* ledger
* balance projection
* points
* rewards
* commissions
* adjustment
* reversal
* refund
* idempotency
* reconciliation

Do not assume the economy blueprint has already been implemented.

## External Payment

Verify actual implementation:

* payment adapter
* mock adapter
* provider abstraction
* webhook
* signature verification
* idempotency
* payment state
* provider configuration

Do NOT add real Midtrans/Xendit/etc. merely because documentation mentions them.

## Growth

* XP
* attribution
* referral
* commission
* reputation
* intelligence
* compliance

Check every server action for authentication and IDOR.

## Notification

* persistent notifications
* mutation events
* read/unread
* authorization
* delivery boundary

## Email / Mailing

* adapter
* simulation
* Gmail boundary
* marketing/bulk mailing
* transactional email
* credentials
* secrets

## Backup / Storage

* backup provider
* local simulation
* Google Drive boundary
* restore behavior
* dry-run
* authorization
* audit
* secret exclusion

## Changelog / Communications

* draft
* publish
* visibility
* audit
* member-facing output

## Integrations

* IntegrationHealth
* IntegrationJob
* retry state
* provider boundary
* configuration
* failure handling

## Database

* Prisma schema
* migrations
* migration history
* schema drift
* indexes
* foreign keys
* uniqueness
* enums
* nullable fields
* data integrity

## Developer / Engineering Infrastructure

* env validation
* seed
* production seed
* lint
* typecheck
* test
* build
* CI
* registry
* developer tooling

---

# 4. DOCUMENTATION TRUST EXPERIMENT

Before relying on any `docs/*.md`, create an evidence classification.

For each relevant document:

```text
DOCUMENT
STATUS:
  VERIFIED_CURRENT
  PARTIALLY_CURRENT
  STALE
  CONTRADICTED
  ASPIRATIONAL
  UNKNOWN

EVIDENCE:
  source files
  schema
  runtime
  tests
  commands

CONFLICTS:
  ...

RECOMMENDATION:
  retain
  update
  archive
  replace
```

Do not modify documentation merely to make it agree with code.

First determine which side represents the intended architecture.

If code is wrong and documentation represents the approved contract:

```text
DOCUMENT = intended source of truth
CODE = implementation defect
```

If documentation is obsolete:

```text
CODE/RUNTIME = current reality
DOCUMENT = stale
```

If neither can establish the intended decision:

```text
DECISION REQUIRED
```

Do not invent the decision.

---

# 5. SOURCE-OF-TRUTH MATRIX

Create a temporary experimental matrix:

| Domain        | Intended Source | Runtime Source | Implementation | Tests | Docs | Conflict |
| ------------- | --------------- | -------------- | -------------- | ----- | ---- | -------- |
| Auth          | ?               | ?              | ?              | ?     | ?    | ?        |
| Authorization | ?               | ?              | ?              | ?     | ?    | ?        |
| Organization  | ?               | ?              | ?              | ?     | ?    | ?        |
| Booking       | ?               | ?              | ?              | ?     | ?    | ?        |
| Verification  | ?               | ?              | ?              | ?     | ?    | ?        |
| Economy       | ?               | ?              | ?              | ?     | ?    | ?        |
| Payment       | ?               | ?              | ?              | ?     | ?    | ?        |
| Growth        | ?               | ?              | ?              | ?     | ?    | ?        |
| Notification  | ?               | ?              | ?              | ?     | ?    | ?        |
| Backup        | ?               | ?              | ?              | ?     | ?    | ?        |
| Email         | ?               | ?              | ?              | ?     | ?    | ?        |
| Management    | ?               | ?              | ?              | ?     | ?    | ?        |

Do not fabricate entries.

---

# 6. EXPERIMENTAL METHOD

For each domain:

```text
DISCOVER
→ VERIFY
→ BREAK
→ OBSERVE
→ FIX ONLY IF JUSTIFIED
→ TEST
→ RUNTIME VERIFY
→ DOCUMENT EVIDENCE
```

The experiment must intentionally test failure paths.

Do not only test happy paths.

---

# 7. SECURITY EXPERIMENT

Attempt controlled negative tests for:

### Authentication

* unauthenticated API access
* forged user ID
* forged actor ID
* forged organization ID
* forged owner ID
* forged role
* forged capability

### Authorization

Attempt:

```text
learner → another learner
learner → another organization
org staff → founder controls
org admin → another organization
staff → restricted management
delegated user → expired delegation
delegated user → revoked delegation
delegated user → out-of-scope organization
```

Expected result must be:

```text
DENIED
```

and preferably:

```text
401 / 403 / 404
```

according to the existing contract.

Do not weaken authorization merely to make tests pass.

---

# 8. IDOR EXPERIMENT

For every endpoint accepting identifiers, attempt substitution:

```text
userId
actorId
ownerId
organizationId
membershipId
bookingId
transactionId
ledgerId
verificationId
notificationId
backupId
delegationId
```

Never trust identifiers from the client when server identity can determine the correct owner.

Record every successful unauthorized access as:

```text
CRITICAL EXPERIMENT FAILURE
```

---

# 9. MULTI-TENANCY EXPERIMENT

Create a matrix:

```text
ORG A
  owner
  admin
  manager
  staff
  member

ORG B
  owner
  admin
  manager
  staff
  member
```

Attempt:

```text
read A from B
write A from B
invite into A from B
view A transaction from B
view A booking from B
view A members from B
delegate across A/B
```

Expected:

```text
DENIED
```

unless explicit capability + valid scope exists.

---

# 10. DELEGATION EXPERIMENT

Test:

```text
grant
active
expired
revoked
wrong organization
wrong scope
wrong capability
sensitive capability
founder-only capability
```

Verify:

```text
delegation NEVER bypasses:
- organization boundary
- ownership
- expiry
- revocation
- audit
- founder-only restrictions
```

---

# 11. INTERNAL ECONOMY EXPERIMENT

If economy is implemented, verify:

```text
Transaction
    ↓
Ledger Entries
    ↓
Balance Projection
```

Never:

```text
balance += amount
```

as authoritative state.

Test:

* duplicate transaction
* concurrent transaction
* duplicate webhook
* failed transaction
* completed transaction
* reversal
* adjustment
* refund
* reconciliation mismatch
* ledger immutability
* integer/money precision
* organization scope

If economy is NOT implemented:

DO NOT implement it automatically as part of this experiment.

Report:

```text
ECONOMY STATUS = NOT IMPLEMENTED / PARTIAL / IMPLEMENTED / VERIFIED
```

---

# 12. PAYMENT EXPERIMENT

If payment adapter exists:

Verify:

```text
frontend
   ↓
payment adapter
   ↓
provider
   ↓
verified webhook
   ↓
domain transaction
   ↓
ledger
```

Payment provider must NEVER become the internal balance source of truth.

For simulation:

```text
SIMULATED_INTERNAL
```

must remain clearly non-production.

Do not add real payment SDKs during this experiment unless explicitly required.

---

# 13. IDEMPOTENCY EXPERIMENT

For every mutation that can have economic or stateful side effects:

Test:

### Test A

same request twice.

Expected:

```text
one side effect
```

### Test B

same request concurrently.

Expected:

```text
one side effect
```

### Test C

first attempt fails.

Expected:

```text
retry behaves correctly
```

### Test D

first attempt completes.

Expected:

```text
retry returns existing result
```

### Test E

duplicate webhook.

Expected:

```text
no duplicate economic effect
```

---

# 14. STATE MACHINE EXPERIMENT

Where state machines exist:

Attempt every invalid transition.

Example:

```text
PENDING → CONFIRMED
```

may be valid.

But:

```text
COMPLETED → INITIATED
```

must not be possible.

Never allow arbitrary:

```text
status = clientInput
```

for guarded domain state.

---

# 15. DATABASE EXPERIMENT

Verify:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Inspect:

```text
_prisma_migrations
migration history
schema drift
indexes
unique constraints
foreign keys
nullable fields
enum consistency
```

Never execute:

```text
prisma db push
```

as a substitute for production migration during this experiment.

Never destroy/reset the database merely to make migrations green.

If migration history is fundamentally inconsistent:

```text
STOP
REPORT
PROPOSE SAFE BASELINE/RECONCILIATION
```

Do not silently repair production history.

---

# 16. API EXPERIMENT

Enumerate actual routes from the repository.

For every route determine:

```text
METHOD
PATH
AUTH
ROLE
CAPABILITY
SCOPE
OWNER CHECK
ORG CHECK
INPUT VALIDATION
MUTATION
AUDIT
ERROR
IDEMPOTENCY
```

Do not generate API documentation from stale Markdown alone.

Generate the matrix from actual source code first.

---

# 17. UI EXPERIMENT

Verify that UI does not imply functionality that backend does not actually support.

Search for:

```text
button
form
action
mutation
link
status
payment
withdraw
refund
approve
publish
backup
restore
delete
```

For every visible action:

```text
Does the backend actually implement it?
Does authorization exist?
Does it fail safely?
Does it produce audit evidence?
```

If UI is aspirational:

```text
label it Preview / Simulation / Not Functional
```

Do not make fake functionality appear production-ready.

---

# 18. TERMINOLOGY EXPERIMENT

Preserve the established product terminology.

Examples:

```text
Pendidik
Ajukan Sesi
Pengajuan Sesi
Aktivitas Saya
Ruang Pendidik
Verifikasi Lajnah
Sanad Keilmuan
Kredensial
Poin
Riwayat
Aktivitas
Reward
Transaksi
```

Avoid unnecessary explanatory UI copy.

Legal/business qualification belongs primarily in Terms/Policy.

Where required:

```text
Poin internal platform — non-tunai dan tidak dapat ditarik.
```

Simulation must remain explicit:

```text
SIMULATED_INTERNAL — Belum ada pembayaran riil.
```

Do not redesign the UI during this experiment.

---

# 19. FOUNDER CONTROL EXPERIMENT

Founder must be able to:

```text
OBSERVE
CONTROL
AUDIT
```

but must NOT bypass the domain security model.

Test:

```text
Founder
Staff
Org Owner
Org Admin
Org Manager
Org Staff
Org Member
Learner
Educator
Lajnah
```

Determine exactly what each role can:

```text
VIEW
CREATE
UPDATE
DELETE
APPROVE
REVERSE
ADJUST
DELEGATE
AUDIT
CONFIGURE
```

Do not invent permissions merely to fill a matrix.

---

# 20. MANAGEMENT CONTROL PRINCIPLE

Founder/management should be a:

> CONTROL PLANE

not:

> GOD MODE

Sensitive actions must still have:

```text
authorization
reason
audit
scope
state validation
```

Never implement:

```text
founder can directly modify arbitrary database state
```

as a shortcut.

---

# 21. BACKUP / RESTORE EXPERIMENT

Verify:

```text
backup creation
checksum
metadata
provider abstraction
authorization
audit
secret exclusion
restore dry-run
```

Never backup:

```text
.env
API secrets
cookies
session tokens
private keys
OAuth secrets
```

unless explicitly required by a secure secrets-management architecture.

---

# 22. EMAIL / GOOGLE WORKSPACE EXPERIMENT

Verify whether Google integration is:

```text
SIMULATION
STUB
CONFIGURED
CONNECTED
PRODUCTION-READY
```

Do not classify an adapter stub as production integration.

For every Google capability:

```text
Google Drive
Gmail
Workspace Admin SDK
OAuth
Service Account
Domain-Wide Delegation
```

record the actual configuration dependency.

Do not install unnecessary Google SDKs merely because documentation references them.

---

# 23. TEST QUALITY EXPERIMENT

Do not only run existing tests.

Determine whether tests are actually meaningful.

For important authorization/economy/state behavior:

```text
happy path
negative path
boundary
IDOR
concurrency
duplicate
expired
revoked
cross-org
unauthenticated
```

A test that merely mocks away the security boundary is not sufficient evidence.

---

# 24. BASELINE PRESERVATION

Before modification capture:

```text
git status
git diff
npm run typecheck
npm test
npm run lint
npm run build
npx prisma validate
npx prisma migrate status
```

Record actual results.

Do not claim baseline results from previous reports unless reproduced.

If baseline is already broken:

```text
BASELINE FAILURE
```

and distinguish:

```text
pre-existing
introduced by experiment
unknown
```

---

# 25. EXPERIMENTAL CHANGE POLICY

You MAY modify code when:

1. a verified defect is found;
2. the intended contract is sufficiently established;
3. the fix is minimal;
4. regression risk is controlled;
5. tests can prove the fix.

You MUST NOT modify code merely because:

* a document says it should exist;
* an old roadmap says it is next;
* a TODO exists;
* another framework would be "better";
* a newer architecture seems attractive;
* an OSS library could replace existing code;
* a feature would be nice to have.

---

# 26. REUSE-FIRST

Before creating a new abstraction search the repository.

Prefer existing:

```text
auth
authorization
permissions
session
audit
ledger
growth
payment adapter
notification
organization
delegation
integration
backup
```

Do NOT create duplicate:

```text
auth system
RBAC system
ledger
notification system
audit system
organization system
payment abstraction
```

unless the existing implementation is demonstrably incapable of satisfying the verified contract.

---

# 27. OSS / EXTERNAL RESOURCE RULE

External research is allowed only when it materially helps resolve an implementation question.

If researching OSS:

record:

```text
PROJECT
URL
LICENSE
PURPOSE
WHY NEEDED
WHY EXISTING CODE IS INSUFFICIENT
INTEGRATION COST
SECURITY IMPLICATION
```

Do not adopt OSS merely because it is popular.

Prefer:

```text
existing architecture
→ standard library
→ lightweight OSS
→ heavyweight framework
```

in that order.

---

# 28. AI AGENT SELF-CHECK

At every major step ask yourself:

```text
Am I implementing something because:
A. runtime evidence requires it?
B. verified contract requires it?
C. security requires it?
D. test failure requires it?

OR

E. because a document says so?
F. because it seems architecturally elegant?
G. because I assume the product should have it?
```

Only A-D automatically justify implementation.

E-G require additional verification.

---

# 29. KPI / OKR FOR THIS EXPERIMENT

## OBJECTIVE

Determine whether the AI Agent can safely evolve a complex production-oriented repository without hallucinating architecture, trusting stale documentation, weakening security, or entering plan-only loops.

### KR1 — Repository Truth

Target:

```text
100% critical domains mapped
100% critical source-of-truth conflicts identified
0 undocumented major assumptions
```

### KR2 — Security

Target:

```text
0 confirmed critical IDOR
0 unauthorized cross-org access
0 forged identity acceptance
0 founder-only mutation exposed to lower roles
0 expired delegation bypass
0 revoked delegation bypass
```

### KR3 — Regression

Target:

```text
existing tests remain green
typecheck PASS
lint 0 errors
build PASS
runtime smoke tests PASS
```

### KR4 — Evidence

Every implemented fix must have:

```text
source evidence
test evidence
runtime evidence where applicable
```

### KR5 — Documentation Integrity

Target:

```text
no document marked VERIFIED unless evidence supports it
no stale document silently treated as truth
all changed contracts synchronized after verification
```

### KR6 — Architecture

Target:

```text
0 duplicate auth systems
0 duplicate ledger systems
0 duplicate audit systems
0 unnecessary external dependencies
0 real payment gateway accidentally activated
```

### KR7 — Security Boundary

Target:

```text
Founder = control + observe + audit
Staff = delegated capabilities
Organization = scoped tenancy
Member = self-scoped access
External payment = adapter boundary
Internal economy = ledger authority
```

---

# 30. EXPERIMENT SCORE

At the end calculate:

```text
SYSTEM TRUTH SCORE
SECURITY SCORE
ARCHITECTURE SCORE
TEST SCORE
RUNTIME SCORE
DOCUMENTATION SCORE
EXECUTION DISCIPLINE SCORE
```

Each:

```text
0–20
```

Total:

```text
/ 140
```

Interpretation:

```text
126–140 = EXCELLENT
112–125 = STRONG
98–111  = ACCEPTABLE WITH GAPS
84–97   = WEAK
<84     = FAILED EXPERIMENT
```

But:

> A single CRITICAL security failure overrides the numerical score.

---

# 31. FAILURE CLASSIFICATION

Every discovered issue must be classified:

```text
P0 CRITICAL
P1 HIGH
P2 MEDIUM
P3 LOW
P4 DOCUMENTATION / COSMETIC
```

Also:

```text
BUG
SECURITY
ARCHITECTURE
DATA
MIGRATION
UX
DOCUMENTATION
CONFIGURATION
DEPENDENCY
DEFERRED
DECISION_REQUIRED
```

---

# 32. DO NOT HIDE FAILURES

If something cannot safely be implemented:

DO NOT fake completion.

Use:

```text
BLOCKED
PARTIAL
DEFERRED
DECISION_REQUIRED
```

with evidence.

Never convert:

```text
STUB → VERIFIED
MOCK → PRODUCTION
DOCUMENTED → IMPLEMENTED
IMPLEMENTED → VERIFIED
```

without evidence.

---

# 33. EXECUTION ORDER

Use this order:

```text
0. BASELINE
1. REPOSITORY DISCOVERY
2. DOCUMENT TRUST AUDIT
3. SOURCE-OF-TRUTH MATRIX
4. SECURITY EXPERIMENT
5. DOMAIN EXPERIMENT
6. DATABASE EXPERIMENT
7. API EXPERIMENT
8. MULTI-TENANCY EXPERIMENT
9. IDEMPOTENCY / STATE EXPERIMENT
10. UI TRUTHFULNESS EXPERIMENT
11. TARGETED FIXES
12. TEST
13. RUNTIME VERIFICATION
14. REGRESSION
15. DOCUMENT SYNCHRONIZATION
16. FINAL EXPERIMENT REPORT
```

Do NOT spend the majority of execution time writing a plan.

---

# 34. STOP CONDITIONS

Immediately stop destructive implementation if:

```text
database state is ambiguous
migration history cannot be safely reconciled
production data may be destroyed
security boundary is unclear
source-of-truth conflict has no governing decision
business policy is unknown
```

Then report:

```text
BLOCKED
WHY
EVIDENCE
SAFE OPTIONS
RECOMMENDED NEXT DECISION
```

---

# 35. REQUIRED FINAL REPORT

Produce:

# SYSTEM-WIDE AI AGENT EXPERIMENT REPORT

## 1. STATUS

```text
COMPLETE
PARTIAL
BLOCKED
FAILED
```

## 2. EXECUTIVE RESULT

What did the agent actually discover?

## 3. BASELINE

Actual commands and results.

## 4. SOURCE-OF-TRUTH AUDIT

What was reliable?

What was stale?

What contradicted what?

## 5. DOMAIN STATUS

| Domain        | Status | Evidence | Risk |
| ------------- | ------ | -------- | ---- |
| Auth          |        |          |      |
| Authorization |        |          |      |
| Member        |        |          |      |
| Organization  |        |          |      |
| Management    |        |          |      |
| Booking       |        |          |      |
| Verification  |        |          |      |
| Economy       |        |          |      |
| Payment       |        |          |      |
| Growth        |        |          |      |
| Notification  |        |          |      |
| Backup        |        |          |      |
| Email         |        |          |      |
| Integration   |        |          |      |

## 6. SECURITY RESULTS

Map:

```text
SEC-01...
SEC-02...
...
```

But do NOT assume these IDs are still valid.

If new findings exist, add them.

## 7. IDOR RESULTS

Actual attack attempts and results.

## 8. MULTI-TENANCY RESULTS

Actual cross-org tests.

## 9. ECONOMY RESULTS

Only if applicable.

## 10. PAYMENT RESULTS

Only if applicable.

## 11. DATABASE / MIGRATION RESULTS

Actual schema/migration state.

## 12. API MATRIX

Actual implementation status.

## 13. ROLE / PERMISSION MATRIX

Actual verified capability behavior.

## 14. RUNTIME EVIDENCE

Include:

```text
route
role
request
expected
actual
status
```

## 15. TEST RESULTS

Actual:

```text
typecheck
test
lint
build
prisma validate
prisma generate
prisma migrate status
runtime smoke
```

## 16. CHANGES MADE

List exact files.

For every file:

```text
why changed
what changed
evidence
```

## 17. CHANGES NOT MADE

Important.

Explain what was intentionally left untouched and why.

## 18. DOCUMENTATION INTEGRITY

List:

```text
CURRENT
STALE
CONTRADICTED
ASPIRATIONAL
REQUIRES DECISION
```

## 19. KPI / OKR SCORE

Calculate the experiment score.

## 20. REMAINING RISKS

No euphemism.

## 21. OPEN DECISIONS

Only decisions that genuinely require founder/product/architecture authority.

## 22. FINAL ASSESSMENT

Choose exactly one:

```text
SYSTEM-WIDE EXPERIMENT PASSED
SYSTEM-WIDE EXPERIMENT PASSED WITH CONDITIONS
SYSTEM-WIDE EXPERIMENT FAILED — SECURITY BLOCKER
SYSTEM-WIDE EXPERIMENT FAILED — ARCHITECTURE BLOCKER
SYSTEM-WIDE EXPERIMENT FAILED — EXECUTION BLOCKER
```

## 23. RECOMMENDATION

Choose:

```text
APPROVED
CONDITIONALLY APPROVED
NOT APPROVED
```

---

# 36. FINAL HARD RULE

The most important test is not:

> "How many files did you change?"

The most important test is:

> "Can you prove that what you changed was necessary, safe, consistent with the actual system, and still works?"

A smaller verified change is better than a large speculative implementation.

Do not optimize for code volume.

Optimize for:

```text
TRUTH
SECURITY
INTEGRITY
EVIDENCE
REVERSIBILITY
MAINTAINABILITY
```

Begin now.

Do not ask for approval to enter plan mode.

Do not return a plan as the final result.

**Execute the experiment.**

# MASTER EXPERIMENT PROMPT

# SEMESTA ISLAM — PUBLIC EXPERIENCE, DISCOVERABILITY, SEO/AEO/GEO, UI/UX & SECURITY EXPERIMENT

**MODE: EXPERIMENTAL EXECUTION**

**IMPORTANT:**
Ini adalah kelanjutan dari `SYSTEM-WIDE AI AGENT EXPERIMENT`.

Jangan menganggap dokumen Markdown lama sebagai source of truth.

Jangan menganggap SEO/AEO/GEO sebagai sekadar pemasangan metadata.

Jangan melakukan redesign besar-besaran.

Tujuan eksperimen ini adalah membuktikan apakah **public-facing product surface** SEMESTA ISLAM benar-benar:

* usable;
* accessible;
* crawlable;
* indexable;
* internally well-linked;
* semantically understandable;
* machine-readable;
* discoverable;
* performant;
* secure;
* truthful;
* conversion-ready;
* maintainable.

---

# 1. PRIMARY OBJECTIVE

Audit dan uji seluruh lapisan:

```text
PUBLIC PRODUCT
│
├── UI / UX
├── Accessibility
├── Information Architecture
├── Navigation
├── Pages
├── Routes
├── Internal Links
├── Content Silo
├── SEO
├── Structured Data
├── AEO
├── GEO
├── LLM Discoverability
├── Crawlability
├── Indexability
├── Performance
├── Security
├── Trust
├── Conversion
└── Observability
```

Jangan mengoptimalkan satu lapisan dengan mengorbankan lapisan lain.

---

# 2. SOURCE-OF-TRUTH RULE

Sebelum menggunakan:

```text
docs/*.md
README
SEO documentation
blueprint
roadmap
design specification
architecture document
```

verifikasi terlebih dahulu terhadap:

```text
actual routes
actual page files
actual components
actual metadata
actual rendered HTML
actual API
actual database
actual runtime
actual links
actual tests
actual browser behavior
```

Classification:

```text
VERIFIED_CURRENT
PARTIALLY_CURRENT
STALE
CONTRADICTED
ASPIRATIONAL
UNKNOWN
```

Dokumentasi tidak boleh dinyatakan benar hanya karena terlihat authoritative.

---

# 3. EXPERIMENT BASELINE

Capture:

```bash
git status
npm run typecheck
npm test
npm run lint
npm run build
npx prisma validate
```

Kemudian jalankan aplikasi.

Gunakan browser automation untuk menguji actual rendered experience.

Prefer Playwright untuk E2E/browser verification.

Playwright saat ini mendukung Chromium, Firefox, WebKit dan juga menyediakan CLI/MCP yang dapat digunakan oleh coding agents.

---

# 4. ROUTE INVENTORY EXPERIMENT

Jangan membaca daftar halaman dari Markdown.

Generate route inventory dari repository aktual.

Cari:

```text
src/app/**/page.tsx
src/app/**/route.ts
src/pages/**
```

Kemudian klasifikasikan:

```text
PUBLIC
AUTHENTICATED
MEMBER
ORGANIZATION
MANAGEMENT
API
SYSTEM
ERROR
REDIRECT
```

Untuk setiap route:

| Route | Type | Auth | Indexable | Linked | Metadata | Structured Data | Status |
| ----- | ---- | ---- | --------- | ------ | -------- | --------------- | ------ |

Cari:

* orphan pages;
* dead pages;
* duplicate routes;
* redirect loops;
* inaccessible pages;
* pages linked nowhere;
* pages accidentally exposed;
* authenticated pages accidentally indexable.

---

# 5. PUBLIC / PRIVATE BOUNDARY

Ini WAJIB.

Public pages:

```text
boleh crawl
boleh index jika memang intended
```

Private pages:

```text
/member
/organization
/management
/account
/admin
/API
```

harus:

```text
authenticated
authorization protected
non-indexable
```

Jangan mengandalkan:

```text
robots.txt
```

sebagai security boundary.

Security harus berasal dari server-side authorization.

---

# 6. UI / UX EXPERIMENT

Audit actual interface, bukan hanya source code.

Gunakan browser.

Test:

```text
desktop
tablet
mobile
keyboard
slow network
empty state
loading state
error state
unauthorized state
404
500
long content
short content
no data
large data
```

Audit:

### Visual hierarchy

* page title;
* section hierarchy;
* primary CTA;
* secondary CTA;
* destructive actions;
* status;
* feedback;
* navigation.

### Interaction

* button works;
* link works;
* form works;
* loading state exists;
* error state exists;
* success state exists;
* disabled state is meaningful.

### UX consistency

Check:

```text
spacing
typography
buttons
forms
cards
tables
dialogs
toasts
badges
navigation
breadcrumbs
pagination
empty states
```

Do not introduce another UI system if one already exists.

---

# 7. BRAND / COPY EXPERIMENT

Do not make UI copy verbose.

Prefer established terminology:

```text
Pendidik
Ajukan Sesi
Pengajuan Sesi
Aktivitas Saya
Ruang Pendidik
Verifikasi Lajnah
Sanad Keilmuan
Kredensial
Poin
Riwayat
Aktivitas
Reward
Transaksi
```

Do not replace branded product language with generic SaaS terminology unless evidence requires it.

Avoid unnecessary explanatory paragraphs.

Use:

```text
short label
clear action
clear state
```

Legal detail belongs in legal documents unless the UI contract requires disclosure.

---

# 8. ACCESSIBILITY EXPERIMENT

Target:

```text
WCAG 2.2 AA
```

but do not claim complete WCAG compliance from automated scanning alone.

Use:

```text
axe-core
Playwright
Lighthouse
manual keyboard testing
```

`axe-core` supports automated WCAG testing and reports issues that require manual review as incomplete; its own documentation notes that automation does not catch every accessibility issue.

Test:

```text
keyboard navigation
focus visibility
focus order
skip navigation
headings
landmarks
labels
ARIA
button semantics
link semantics
form errors
contrast
alt text
screen-reader naming
dialog focus trap
mobile touch targets
reduced motion
```

Do NOT solve accessibility by blindly adding ARIA.

Prefer native semantic HTML.

---

# 9. RESPONSIVE EXPERIMENT

Test minimum:

```text
mobile narrow
mobile standard
tablet
desktop
wide desktop
```

Check:

```text
horizontal overflow
navigation collapse
tables
forms
dialogs
cards
long titles
long usernames
long organization names
buttons
CTA placement
```

No page should become functionally unusable on mobile.

---

# 10. INFORMATION ARCHITECTURE

Determine actual hierarchy:

```text
Home
│
├── Discovery
│   ├── Pendidik
│   ├── Categories
│   ├── Services
│   └── Knowledge
│
├── Transaction
│   ├── Ajukan Sesi
│   └── Pengajuan Sesi
│
├── Trust
│   ├── Verifikasi Lajnah
│   ├── Kredensial
│   └── Sanad Keilmuan
│
├── Content
│   ├── Articles
│   ├── Guides
│   ├── FAQ
│   └── Topics
│
└── Account
    ├── Member
    ├── Organization
    └── Management
```

BUT:

Do not assume this hierarchy is correct.

Derive the actual information architecture first.

Then compare against intended product architecture.

---

# 11. PAGE PURPOSE EXPERIMENT

Every public page must have ONE primary purpose.

Classify:

```text
DISCOVERY
EDUCATION
TRUST
CONVERSION
TRANSACTION
NAVIGATION
REFERENCE
```

For each page determine:

```text
Who is this page for?
What question does it answer?
What action should the visitor take?
What entity does it represent?
What pages should link to it?
What pages should it link to?
```

If no clear answer exists:

```text
PAGE PURPOSE = UNCLEAR
```

Do not automatically delete the page.

---

# 12. INTERNAL LINKING EXPERIMENT

Build actual link graph:

```text
PAGE → PAGE
```

Detect:

```text
orphan pages
dead ends
isolated content
excessive click depth
navigation loops
duplicate destinations
weak hub pages
```

Target:

```text
important public page
≤ 3 meaningful clicks from a major hub
```

unless there is a legitimate reason otherwise.

Internal links must use meaningful anchors.

Avoid:

```text
click here
learn more
read more
```

where a descriptive anchor is possible.

---

# 13. SILO / TOPICAL AUTHORITY EXPERIMENT

Do NOT create artificial SEO silos.

Build silos around actual product entities and user intent.

Example:

```text
TOPIC
│
├── HUB
│   ├── supporting article
│   ├── supporting guide
│   ├── FAQ
│   ├── entity page
│   └── conversion page
```

Check:

```text
hub authority
semantic relevance
internal links
entity relationships
breadcrumbs
canonical URLs
duplicate content
```

Do not create hundreds of thin pages merely to increase URL count.

---

# 14. ENTITY ARCHITECTURE

Identify actual entities from the application.

Potential examples:

```text
Pendidik
Organization
Service
Course
Article
KnowledgeItem
Credential
Verification
Booking
Location
Topic
```

For each entity determine:

```text
canonical URL
name
description
type
relationships
parent
children
related entities
```

The URL architecture should reflect actual entity relationships.

---

# 15. URL EXPERIMENT

Audit:

```text
slug
case
trailing slash
query parameters
pagination
filters
sorting
locale
canonical
redirect
```

Detect:

```text
duplicate URLs
parameter explosion
indexable filters
non-canonical duplicates
broken slugs
slug collisions
```

Prefer stable semantic URLs.

Do not expose database IDs unless there is a real product reason.

---

# 16. SEO METADATA EXPERIMENT

Every indexable page should have appropriate:

```text
title
description
canonical
robots directive
Open Graph
Twitter/X metadata where appropriate
language
viewport
```

But do NOT blindly require identical metadata on every page.

Metadata must be page-specific where the page is dynamic.

Check:

```text
duplicate title
duplicate description
missing title
missing description
too-long title
too-long description
wrong canonical
canonical to non-indexable page
canonical loops
```

Next.js App Router already provides metadata conventions and metadata routes; use native Next.js capabilities before introducing another SEO abstraction.

`next-seo` may be inspected as an implementation/reference option, but MUST NOT be added automatically. It is currently an actively maintained Next.js SEO library with JSON-LD support.

---

# 17. ROBOTS / SITEMAP EXPERIMENT

Verify actual:

```text
/robots.txt
/sitemap.xml
```

Check:

```text
robots syntax
sitemap location
indexable URLs
private URLs
canonical consistency
404 URLs in sitemap
redirect URLs in sitemap
duplicate URLs
```

Never use robots.txt to hide sensitive data.

---

# 18. STRUCTURED DATA EXPERIMENT

Identify actual schema.org entities.

Potentially:

```text
Organization
Person
WebSite
WebPage
BreadcrumbList
Article
FAQPage
Course
EducationalOrganization
Service
Event
```

But:

> NEVER add structured data merely because it exists in a checklist.

Only emit schema supported by actual visible page content.

Verify:

```text
JSON-LD validity
entity consistency
canonical URL
name
description
sameAs
relationships
```

No fake ratings.

No fake reviews.

No fake prices.

No fake availability.

No fake credentials.

No structured-data spam.

---

# 19. AEO — ANSWER ENGINE OPTIMIZATION

Treat AEO as:

> making the actual information easy for answer engines to understand and cite.

Audit:

```text
clear definitions
direct answers
question headings
concise summaries
entity clarity
source attribution
FAQ where genuinely useful
structured data
internal links
freshness
authoritative references
```

For important informational pages:

```text
Question
→ direct answer
→ explanation
→ evidence
→ related entities
→ next action
```

Do not keyword-stuff.

Do not create fake FAQ blocks merely for SEO.

---

# 20. GEO — GENERATIVE ENGINE OPTIMIZATION

Treat GEO as:

```text
machine-readable
entity-consistent
source-grounded
well-structured
citation-friendly
```

Test whether an independent LLM can correctly answer:

```text
What is SEMESTA ISLAM?
What does it offer?
Who is it for?
What is a Pendidik?
How does verification work?
What is a Kredensial?
What is an Organization?
How does Ajukan Sesi work?
What does Poin mean?
Who operates the platform?
```

Use actual public pages as the evidence source.

If an LLM produces incorrect answers:

```text
identify missing/ambiguous source content
```

Do not simply add more keywords.

---

# 21. LLMS.TXT EXPERIMENT

Evaluate whether `/llms.txt` is useful.

Do NOT treat it as a guaranteed search-ranking mechanism.

The `llms.txt` proposal describes it as a complementary machine-readable overview alongside sitemap/robots, not a replacement for them. It is still an open proposal.

If implemented, it must:

```text
describe actual product
link to real public pages
avoid private URLs
avoid stale claims
avoid secrets
avoid marketing hallucinations
```

Potential structure:

```text
# SEMESTA ISLAM

> concise factual description

## Product

...

## Core Concepts

...

## Public Pages

...

## Trust & Verification

...

## Organizations

...

## Knowledge

...

## Policies

...
```

Generate from verified public information.

---

# 22. MACHINE-READABLE CONTENT

Where useful, evaluate:

```text
/llms.txt
structured JSON-LD
RSS/Atom if content model supports it
sitemap
canonical URLs
clean HTML
```

Do not create duplicate content formats unless there is a consumer/use case.

---

# 23. PERFORMANCE EXPERIMENT

Use:

```text
Lighthouse
Lighthouse CI
Playwright
browser performance APIs where useful
```

Lighthouse audits performance, accessibility, SEO and best practices; Lighthouse CI can run these checks continuously and enforce budgets/regression thresholds in CI.

Measure:

```text
LCP
INP
CLS
TTFB
JS payload
CSS payload
image size
font loading
third-party scripts
render blocking
hydration
server response
```

Do not optimize Lighthouse score at the expense of real UX.

---

# 24. PERFORMANCE BUDGET

Establish realistic budgets after measuring the actual application.

Potential gates:

```text
no major regression
no uncontrolled JS growth
no oversized hero image
no unnecessary third-party script
no accidental client-side rendering
```

Do not impose arbitrary numbers without baseline evidence.

---

# 25. IMAGE EXPERIMENT

Check:

```text
alt
width
height
aspect ratio
responsive loading
lazy loading
priority
format
compression
Open Graph image
```

Detect:

```text
broken images
layout shift
oversized assets
duplicate images
missing OG images
```

---

# 26. FONT EXPERIMENT

Audit:

```text
font loading
font-display
subset
weights
fallback
layout shift
duplicate fonts
unused weights
```

Do not load five font families when one is sufficient.

---

# 27. SECURITY — PUBLIC SURFACE

Perform controlled security testing.

Audit:

```text
XSS
CSRF
IDOR
open redirect
SSRF
SQL injection
command injection
path traversal
file upload
unsafe HTML
unsafe Markdown
unsafe URL
cookie flags
security headers
CORS
cache poisoning
sensitive response caching
```

Use OWASP ASVS 5.0 as a verification reference, not as a reason to blindly implement everything. OWASP describes ASVS as a comprehensive, testable standard for web application security; version 5.0 is the current stable release.

---

# 28. SECURITY HEADERS

Verify actual response headers:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
frame protection
Strict-Transport-Security
```

Do not blindly add CSP if it breaks the application.

First inspect:

```text
scripts
inline styles
inline scripts
third-party resources
analytics
images
fonts
iframe
```

Then design a CSP compatible with the actual application.

---

# 29. COOKIE / SESSION EXPERIMENT

Verify:

```text
HttpOnly
Secure
SameSite
expiration
scope
domain
path
session rotation
logout invalidation
```

Never expose authentication secrets to client JavaScript unnecessarily.

---

# 30. CACHE / SEO SECURITY EXPERIMENT

Pay special attention to:

```text
authenticated pages
personalized pages
organization pages
management pages
API responses
```

Ensure private responses cannot be cached and served to another user.

Test:

```text
User A
→ request

User B
→ same URL

Expected:
B NEVER receives A's private data
```

---

# 31. CONTENT SECURITY EXPERIMENT

Any user/content/admin supplied:

```text
HTML
Markdown
URLs
images
JSON
rich text
```

must be treated as untrusted.

If using HTML AST processing or Markdown pipelines, sanitize where required.

The unified/rehype ecosystem explicitly warns that improper HTML handling can create XSS risk and recommends sanitization for unsafe trees.

---

# 32. CONVERSION EXPERIMENT

For every important public page:

Determine:

```text
entry point
value proposition
trust signal
primary CTA
secondary CTA
next page
conversion event
```

Do NOT add popups everywhere.

Do NOT add fake urgency.

Do NOT manipulate users.

Measure whether the funnel is coherent:

```text
Discovery
↓
Trust
↓
Understanding
↓
Intent
↓
Action
```

---

# 33. TRUST EXPERIMENT

Check visible trust signals:

```text
identity
organization
verification
credentials
sanad
policies
contact
terms
privacy
changelog
system status where applicable
```

Never expose private operational information merely to create "trust".

---

# 34. ERROR / EMPTY STATE EXPERIMENT

Every important public/product page should have intentional:

```text
loading
empty
error
unauthorized
not found
success
```

states where relevant.

No:

```text
undefined
null
NaN
Unhandled error
blank screen
```

---

# 35. LINK INTEGRITY EXPERIMENT

Scan all internal links.

Detect:

```text
404
500
redirect chain
redirect loop
wrong route
stale route
dead CTA
dead nav
wrong anchor
```

For every important public route:

```text
incoming links
outgoing links
```

must be known.

---

# 36. SEO / SECURITY INTERSECTION

Explicitly test:

```text
private pages accidentally indexable
private content in sitemap
PII in public HTML
PII in structured data
authenticated pages cached
private URLs in llms.txt
private API URLs exposed in public navigation
admin links in public pages
```

This section is mandatory.

---

# 37. AI AGENT EXPERIMENT

Ask the agent to test itself.

Questions:

```text
Did I trust documentation without verification?

Did I add a dependency unnecessarily?

Did I modify UI without understanding the existing design system?

Did I create SEO pages without product purpose?

Did I expose private routes to crawlers?

Did I add structured data unsupported by visible content?

Did I confuse AEO/GEO with keyword stuffing?

Did I weaken authorization to make a page work?

Did I claim accessibility compliance from automation alone?

Did I claim SEO success without crawl/index evidence?

Did I claim GEO success without answer-quality testing?

Did I make a mock integration look production-ready?
```

---

# 38. REUSE-FIRST RESOURCE POLICY

Before adding tools:

```text
inspect existing dependencies
inspect existing components
inspect existing metadata
inspect existing test infrastructure
inspect existing design system
```

Only introduce a dependency if:

```text
clear capability gap
meaningful value
maintained project
compatible license
acceptable security
acceptable bundle/runtime cost
```

---

# 39. RECOMMENDED OPEN-SOURCE REFERENCES

Use these as **references/tools**, not mandatory dependencies.

### Browser / E2E / AI-agent testing

**Microsoft Playwright**

[github.com/microsoft/playwright](https://github.com/microsoft/playwright?utm_source=chatgpt.com)

Useful for:

```text
E2E
responsive testing
route testing
browser automation
visual verification
AI-agent browser automation
```

Playwright explicitly supports browser testing and automation for coding agents, including MCP.

---

### Accessibility

**Deque axe-core**

[github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core?utm_source=chatgpt.com)

Use for:

```text
WCAG automated checks
ARIA
labels
landmarks
contrast-related checks
```

Do not treat it as a replacement for manual accessibility testing.

---

### Performance / SEO / Accessibility

**Google Lighthouse**

[github.com/GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse?utm_source=chatgpt.com)

Use for:

```text
performance
accessibility
SEO
best practices
```

---

### CI regression gates

**Lighthouse CI**

[github.com/GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci?utm_source=chatgpt.com)

Use for:

```text
PR audits
performance budgets
SEO regression
accessibility regression
historical comparison
```

---

### SEO / JSON-LD reference

**Next SEO**

[github.com/garmeeh/next-seo](https://github.com/garmeeh/next-seo?utm_source=chatgpt.com)

Use primarily as:

```text
reference
implementation inspiration
JSON-LD reference
```

Do not install automatically because Next.js already has native metadata conventions.

---

### LLM discoverability

**AnswerDotAI / llms-txt**

[github.com/AnswerDotAI/llms-txt](https://github.com/AnswerDotAI/llms-txt?utm_source=chatgpt.com)

Use to evaluate:

```text
llms.txt
LLM-readable site context
machine-readable content hierarchy
```

Important:

```text
llms.txt = supplementary proposal
NOT SEO replacement
NOT security mechanism
NOT indexing guarantee
```

---

### HTML / content processing

**rehype / unified**

[github.com/rehypejs/rehype](https://github.com/rehypejs/rehype?utm_source=chatgpt.com)

Useful when the project actually needs:

```text
HTML AST
Markdown transformation
content processing
heading/link processing
sanitization pipeline
```

Do not add it merely for SEO.

---

### Security verification

**OWASP ASVS**

[github.com/OWASP/ASVS](https://github.com/OWASP/ASVS?utm_source=chatgpt.com)

Use:

```text
verification checklist
security requirements
test matrix
```

Pin the version used in evidence.

Current stable reference:

```text
ASVS 5.0.0
```

---

### AI application security

**OWASP AISVS**

[github.com/OWASP/AISVS](https://github.com/OWASP/AISVS?utm_source=chatgpt.com)

Use only if SEMESTA begins exposing:

```text
LLM features
AI agents
AI-generated content
AI actions
prompt-driven workflows
```

AISVS provides testable security requirements specifically for AI-enabled applications.

---

# 40. OPTIONAL OSS — DO NOT INSTALL AUTOMATICALLY

Potential future references:

```text
Pagefind
Unlighthouse
Pa11y
next-seo
rehype plugins
structured-data libraries
SEO crawlers
```

But the agent must first answer:

```text
What problem exists?
Can Next.js/native tooling solve it?
Can existing code solve it?
What is the cost of adding dependency?
```

Only then consider adoption.

---

# 41. REQUIRED EXPERIMENT ARTIFACTS

Create evidence documents only after actual investigation.

Suggested:

```text
docs/plan/PUBLIC_SURFACE_AUDIT.md
docs/plan/IA_LINK_GRAPH.md
docs/plan/SEO_AEO_GEO_AUDIT.md
docs/plan/UX_ACCESSIBILITY_AUDIT.md
docs/plan/SECURITY_PUBLIC_SURFACE_AUDIT.md
docs/plan/PERFORMANCE_AUDIT.md
```

IMPORTANT:

These documents must NOT become another unverified source of truth.

Each finding must contain:

```text
FINDING
SOURCE
EVIDENCE
CURRENT STATUS
RISK
RECOMMENDATION
VERIFICATION
```

---

# 42. IMPLEMENTATION RULE

Do not automatically fix every finding.

Classify:

```text
P0 blocker
P1 high
P2 medium
P3 low
P4 cosmetic
```

Fix immediately only when:

```text
security-critical
broken navigation
broken accessibility
broken public functionality
broken canonicalization
broken indexing
serious performance regression
```

Otherwise register for controlled remediation.

---

# 43. SEO IMPLEMENTATION PRIORITY

If remediation is justified, use this order:

```text
1. Crawlability
2. Indexability
3. Canonicalization
4. URL integrity
5. Information architecture
6. Internal linking
7. Page purpose
8. Metadata
9. Structured data
10. Content quality
11. AEO
12. GEO
13. Performance
14. Continuous monitoring
```

Do NOT start with keywords.

---

# 44. AEO/GEO IMPLEMENTATION PRIORITY

Use:

```text
1. factual clarity
2. entity clarity
3. semantic HTML
4. authoritative page structure
5. structured data
6. internal linking
7. concise answers
8. machine-readable representation
9. llms.txt if useful
10. testing against actual LLM queries
```

Do NOT create an "AI SEO hack".

---

# 45. UI/UX IMPLEMENTATION PRIORITY

Use:

```text
1. broken functionality
2. navigation
3. accessibility
4. responsive behavior
5. information hierarchy
6. consistency
7. feedback states
8. visual polish
9. animation
```

Animation is last.

---

# 46. DESIGN SYSTEM RULE

Reuse existing:

```text
tokens
typography
spacing
components
buttons
cards
forms
navigation
colors
```

Do not introduce:

```text
second Tailwind token system
second component library
second typography system
```

unless the current system is proven insufficient.

---

# 47. PERFORMANCE RULE

Never optimize by blindly:

```text
removing SSR
removing semantic HTML
removing metadata
removing content
removing accessibility
adding excessive client-side caching
```

Optimize based on actual measurement.

---

# 48. FINAL KPI / OKR

## OBJECTIVE

Make SEMESTA ISLAM's public surface discoverable, usable, trustworthy, secure and machine-understandable without compromising product integrity.

### KR1 — Public Route Integrity

```text
100% public routes inventoried
0 critical broken public routes
0 orphaned critical pages
0 private pages accidentally publicly accessible
```

### KR2 — UX

```text
0 critical broken interactions
0 critical mobile usability issues
0 dead primary CTAs
100% important flows have loading/error/success states
```

### KR3 — Accessibility

```text
0 critical axe violations
0 serious keyboard-navigation blockers
0 unlabeled critical form controls
0 critical focus traps
```

Automated score is not considered proof of full WCAG compliance.

### KR4 — SEO

```text
0 critical crawl errors
0 private URLs in sitemap
0 broken canonicals
0 duplicate canonical conflicts
100% important public pages have valid metadata
```

### KR5 — Internal Linking

```text
0 orphan critical pages
0 broken internal links
0 critical content hubs without meaningful outbound links
```

### KR6 — AEO/GEO

For a defined question set:

```text
≥ 90% factual answer accuracy
≥ 90% correct entity identification
≥ 90% correct canonical/public source identification
```

Do not count an answer as successful merely because it mentions the brand.

### KR7 — Security

```text
0 critical public-surface vulnerabilities
0 confirmed IDOR
0 private-data leakage
0 auth bypass
0 private-page indexing exposure
```

### KR8 — Performance

Measure baseline first.

Then target:

```text
no regression
```

before imposing aggressive absolute thresholds.

### KR9 — Documentation

```text
0 major claims marked VERIFIED without evidence
100% changed public contracts documented after verification
```

---

# 49. EXPERIMENT SCORE

Score:

```text
UX                    /15
Accessibility         /15
Information Arch.     /10
Internal Linking      /10
SEO                   /15
AEO/GEO               /10
Performance           /10
Security              /15
Content Truthfulness  /10
Documentation         /10
```

Total:

```text
/130
```

Interpretation:

```text
117–130 = EXCELLENT
104–116 = STRONG
91–103  = ACCEPTABLE WITH GAPS
78–90   = WEAK
<78     = FAILED
```

Any confirmed critical security issue overrides the numerical score.

---

# 50. REQUIRED FINAL REPORT

# PUBLIC EXPERIENCE & DISCOVERABILITY EXPERIMENT REPORT

## 1. STATUS

```text
COMPLETE
PARTIAL
BLOCKED
FAILED
```

## 2. BASELINE

Actual command results.

## 3. SOURCE-OF-TRUTH AUDIT

What was verified?

What was stale?

What contradicted?

## 4. ROUTE INVENTORY

Actual routes.

## 5. PUBLIC/PRIVATE MATRIX

Actual access behavior.

## 6. UI/UX RESULTS

## 7. ACCESSIBILITY RESULTS

## 8. INFORMATION ARCHITECTURE

## 9. INTERNAL LINK GRAPH

## 10. SILO / ENTITY ARCHITECTURE

## 11. SEO RESULTS

Include:

```text
metadata
canonical
robots
sitemap
indexability
URL structure
structured data
```

## 12. AEO RESULTS

Actual question set + actual results.

## 13. GEO RESULTS

Actual question set + factual accuracy.

## 14. LLMS.TXT

```text
NOT IMPLEMENTED
IMPLEMENTED
EXPERIMENTAL
VERIFIED USEFUL
```

with evidence.

## 15. PERFORMANCE

Actual Lighthouse / runtime results.

## 16. SECURITY

Actual tests.

Map against:

```text
OWASP ASVS
```

where appropriate.

## 17. CHANGES MADE

Exact files.

## 18. CHANGES NOT MADE

Important.

## 19. OSS / RESOURCE EVALUATION

For every candidate:

```text
repo
purpose
license
maintenance
reason to adopt
reason not to adopt
```

## 20. KPI / OKR

Actual score.

## 21. REMAINING RISKS

## 22. OPEN DECISIONS

## 23. FINAL ASSESSMENT

Choose exactly one:

```text
PUBLIC EXPERIENCE EXPERIMENT PASSED
PUBLIC EXPERIENCE EXPERIMENT PASSED WITH CONDITIONS
PUBLIC EXPERIENCE EXPERIMENT FAILED — SECURITY BLOCKER
PUBLIC EXPERIENCE EXPERIMENT FAILED — UX BLOCKER
PUBLIC EXPERIENCE EXPERIMENT FAILED — DISCOVERABILITY BLOCKER
PUBLIC EXPERIENCE EXPERIMENT FAILED — EXECUTION BLOCKER
```

## 24. RECOMMENDATION

```text
APPROVED
CONDITIONALLY APPROVED
NOT APPROVED
```

---

# 51. FINAL EXECUTION RULE

Do not turn this experiment into:

```text
"install 20 SEO packages"
```

Do not turn it into:

```text
"redesign the website"
```

Do not turn it into:

```text
"generate 500 SEO pages"
```

Do not turn it into:

```text
"add llms.txt and declare GEO complete"
```

Do not turn it into:

```text
"make Lighthouse 100 at all costs"
```

The objective is:

```text
REAL PRODUCT
      ↓
REAL PAGES
      ↓
REAL USERS
      ↓
REAL CONTENT
      ↓
REAL ENTITY RELATIONSHIPS
      ↓
REAL LINKS
      ↓
REAL CRAWLABILITY
      ↓
REAL MACHINE UNDERSTANDING
      ↓
REAL SECURITY
      ↓
REAL PERFORMANCE
      ↓
REAL EVIDENCE
```

**Begin with repository discovery and actual runtime inspection.**

Do not trust the previous Markdown.

Do not create a plan-only response.

  **AUDIT → EXPERIMENT → FIX JUSTIFIED FINDINGS → TEST → VERIFY → DOCUMENT EVIDENCE.**