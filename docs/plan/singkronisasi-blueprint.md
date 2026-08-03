# SEMESTA ISLAM — TOTAL PLATFORM BLUEPRINT

**Status:** Master Architecture Blueprint
**Target:** Production-ready platform
**Architecture:** Modular, policy-driven, adapter-based, auditable
**Primary UX:** Member-first, organization-aware, founder-controlled
**Authorization:** Identity → Membership → Capability → Scope → Policy → Domain Service
**Economy:** Closed-loop internal platform economy
**Payment:** External adapter, gateway-ready
**Governance:** Founder/Owner controlled, delegated by capability
**Operations:** Managed through internal control plane
**Environment:** Local/demo ↔ Production
**Execution:** Parallel after dependency/foundation lock

---

# 1. VISION

SEMESTA ISLAM bukan sekadar:

> Directory → Booking → Verification.

Target akhirnya adalah **Islamic learning & service platform** yang mempunyai:

```text
PUBLIC EXPERIENCE
        │
        ▼
MEMBER EXPERIENCE
        │
        ├── Learner
        ├── Educator
        ├── Guardian
        ├── Institution Member
        └── Other specialized members
        │
        ▼
ORGANIZATION EXPERIENCE
        │
        ├── Institution
        ├── Foundation
        ├── Community
        └── Partner Organization
        │
        ▼
PLATFORM CONTROL PLANE
        │
        ├── Operations
        ├── People
        ├── Access
        ├── Content
        ├── Communication
        ├── Economy
        ├── Audit
        ├── Backup
        ├── System
        └── Governance
```

Dengan prinsip:

> **Member menggunakan platform. Organization mengelola aktivitasnya. Staff menjalankan pekerjaan yang didelegasikan. Founder mengendalikan governance dan seluruh platform.**

---

# 2. FOUR PRIMARY BOUNDARIES

Arsitektur harus memisahkan empat boundary utama.

## A. Public Experience

Untuk pengguna yang belum masuk.

```text
Home
Directory
Educator Profile
Discovery
Content
Booking
Verification information
About
FAQ
Legal
```

Tidak mempunyai akses ke private member data.

---

## B. Member Portal

Untuk pengguna individual.

```text
Dashboard
Profile
Activity
Sessions
Learning
Poin
Benefits
Notifications
Settings
```

Member hanya memperoleh data/action yang sesuai identity, role, capability, dan scope.

---

## C. Organization Portal

Untuk organisasi.

```text
Organization Dashboard
Members
Roles
Programs
Educators
Sessions
Learning
Reports
Communications
Settings
Audit
```

Organization A tidak boleh melihat private data Organization B.

---

## D. Management Control Plane

Untuk Founder/Owner dan delegated staff.

```text
Overview
People
Access
Operations
Organizations
Content
Communications
Economy
Payments
Audit
Backups
System
Integrations
Configuration
Governance
```

Founder/Management **bukan** "member dengan role super".

Ini adalah **control/governance plane**.

---

# 3. CORE ARCHITECTURAL LAW

Seluruh platform mengikuti:

```text
Identity
   ↓
Membership / Role
   ↓
Capability
   ↓
Scope
   ↓
Policy
   ↓
Domain Service
   ↓
Repository
   ↓
Database
```

Bukan:

```text
UI
 ↓
Prisma
```

Dan bukan:

```text
if role === "ADMIN"
```

yang tersebar di seluruh codebase.

Dokumen sumber juga secara eksplisit mengarahkan capability-based authorization dan scope model, bukan role explosion. 

---

# 4. IDENTITY

Identity adalah siapa pengguna sebenarnya.

Production:

```text
Supabase Auth
```

Local/demo:

```text
semesta_demo_identity
```

Server harus menentukan identity.

**Client tidak boleh menentukan actor.**

Dilarang mempercayai:

```text
actorUserId
actorRole
actorRoles
verifierUserId
organizationId
```

yang dikirim client tanpa server-side validation.

---

# 5. ROLE MODEL

Role yang sudah ada harus menjadi baseline:

```text
LEARNER
EDUCATOR
GUARDIAN
INSTITUTION_ADMIN
LAJNAH_VERIFIER
FOUNDER_ADMIN
```

Tetapi audit sebelumnya menunjukkan `GUARDIAN` dan `INSTITUTION_ADMIN` masih belum terhubung secara nyata. 

**Jangan langsung membuat puluhan role baru.**

Evaluasi:

```text
existing role
        ↓
capabilities
        ↓
scope
```

Jika delegated administration membutuhkan role tambahan, gunakan **organization membership / capability assignment**, bukan role explosion.

---

# 6. CAPABILITY MODEL

Contoh capability:

```text
platform.dashboard.read

member.profile.read
member.profile.update
member.activity.read

booking.read
booking.create
booking.confirm
booking.cancel
booking.complete

verification.submit
verification.review

organization.read
organization.update
organization.members.read
organization.members.manage
organization.roles.assign
organization.programs.manage
organization.reports.read
organization.audit.read
organization.export

content.read
content.create
content.update
content.publish

communication.send
mailing.create
mailing.send

economy.read
economy.grant
economy.adjust
economy.reverse
economy.freeze

payment.read
payment.manage

audit.read
audit.export

backup.create
backup.read
backup.restore

system.health.read

configuration.read
configuration.manage

rbac.read
rbac.manage
```

Capability final harus diturunkan dari audit repository, bukan dibuat secara spekulatif.

---

# 7. SCOPE MODEL

Minimal:

```text
SELF
ASSIGNED
ORGANIZATION
PLATFORM
GLOBAL
```

Contoh:

```text
booking.read:self
booking.manage:organization

verification.review:platform

audit.read:self
audit.read:organization
audit.read:platform

content.manage:platform
```

Dengan demikian:

> Role mengatakan **apa yang dapat dilakukan**.

> Scope mengatakan **terhadap apa**.

---

# 8. MEMBER PORTAL

Semua member mendapatkan shell/dashboard yang konsisten.

```text
Member Portal
│
├── Dashboard
├── Aktivitas
├── Sesi
├── Pembelajaran
├── Poin
├── Benefit
├── Notifikasi
├── Profil
└── Pengaturan
```

Tetapi kontennya role-aware.

---

# 9. LEARNER PORTAL

```text
Dashboard
├── Sesi aktif
├── Pengajuan
├── Aktivitas
├── Pembelajaran
├── Poin
├── Benefit
└── Profile
```

Existing:

```text
/learner/activity
/learner/activity/[bookingId]
```

harus direuse dan ditingkatkan, bukan diganti tanpa alasan.

---

# 10. EDUCATOR PORTAL

```text
Ruang Pendidik
├── Ringkasan
├── Pengajuan Sesi
├── Sesi
├── Profil Pendidik
├── Verifikasi Lajnah
├── Kredensial
├── Pembelajaran
├── Aktivitas
└── Pengaturan
```

Existing:

```text
/educator/workspace
/educator/workspace/[bookingId]
/educator/verification
```

menjadi foundation.

---

# 11. GUARDIAN PORTAL

Jika role `GUARDIAN` dipertahankan, jangan berhenti pada enum.

Target:

```text
Guardian Dashboard
├── Anggota yang diasuh
├── Aktivitas
├── Sesi
├── Progress
├── Laporan
└── Settings
```

Guardian hanya melihat dependent yang memang memiliki relationship sah.

Tidak boleh:

```text
guardian → seluruh learner
```

---

# 12. MEMBER PROFILE

Profile harus menjadi identity surface yang konsisten.

```text
Profile
├── Personal information
├── Contact
├── Role
├── Organization membership
├── Verification status
├── Activity
├── Security
└── Settings
```

Sensitive identity fields harus server-authorized.

---

# 13. NOTIFICATION CENTER

Bukan hanya toast.

Pisahkan:

### Toast

Feedback singkat:

```text
Berhasil
Gagal
Peringatan
Informasi
```

### Notification Center

Persistent:

```text
Notifikasi
├── Booking
├── Verification
├── Learning
├── Organization
├── Economy
├── System
└── Security
```

### Email

Untuk komunikasi yang memang membutuhkan email.

---

# 14. ORGANIZATION MODEL

Organization adalah boundary tenancy/management.

Konseptual:

```text
Organization
│
├── Members
│
├── Memberships
│
├── Roles
│
├── Programs
│
├── Resources
│
├── Educators
│
├── Sessions
│
├── Reports
│
├── Communications
│
└── Audit
```

Sebelum membuat model baru:

> Cari terlebih dahulu apakah schema saat ini sudah memiliki entity yang dapat diperluas.

Prioritas:

```text
REUSE
↓
EXTEND
↓
ADAPTER
↓
NEW MODEL
```

Ini merupakan kontrak eksplisit dari blueprint sebelumnya. 

---

# 15. ORGANIZATION MEMBERSHIP

Jangan menjadikan:

```text
User.role = ORGANIZATION_ADMIN
```

sebagai satu-satunya mekanisme.

Seseorang dapat:

```text
User
 ├── Organization A → Manager
 ├── Organization B → Staff
 └── Platform → Member
```

jika domain memang membutuhkannya.

Membership harus menentukan:

```text
user
organization
role
capabilities
scope
status
createdAt
expiresAt?
```

---

# 16. ORGANIZATION DASHBOARD

```text
Organization
│
├── Overview
├── Members
├── Programs
├── Educators
├── Sessions
├── Learning
├── Reports
├── Communications
├── Audit
└── Settings
```

Metrics harus berasal dari domain data nyata.

Tidak boleh membuat:

```text
fake statistics
mock revenue
invented member counts
```

---

# 17. ORGANIZATION DELEGATION

Organization Admin dapat, sesuai capability:

```text
Invite member
Assign role
Revoke role
Suspend membership
Assign responsibility
Manage programs
Manage reports
Manage communications
```

Tetapi tidak boleh otomatis:

```text
manage platform
manage other organizations
change global economy policy
change platform payment
manage founder
```

---

# 18. FOUNDER / OWNER CONTROL PLANE

Founder memiliki:

```text
/management
```

sebagai control plane.

Target information architecture:

```text
Management
│
├── Overview
├── People
├── Access
├── Organizations
├── Operations
├── Content
├── Communications
├── Economy
├── Payments
├── Audit
├── Backups
├── System
├── Integrations
├── Configuration
└── Governance
```

Beberapa route mungkin sudah ada dengan nama berbeda. **Reuse existing architecture terlebih dahulu.**

---

# 19. FOUNDER OVERVIEW

Founder harus dapat melihat:

```text
Members
Organizations
Bookings
Verification
Learning activity
Economy
Payments
System health
Security events
Recent audit events
```

Bukan dashboard yang penuh vanity metrics.

---

# 20. DELEGATED MANAGEMENT

Founder dapat:

```text
Invite staff
Assign capability
Set scope
Set organization scope
Set expiration
Suspend access
Revoke access
Review activity
```

Contoh:

```text
Founder
   ↓
Operations Manager
   ├── booking.read
   ├── booking.manage
   └── member.support

Content Manager
   ├── content.read
   ├── content.create
   ├── content.update
   └── content.publish

Auditor
   ├── audit.read
   └── audit.export
```

Contoh tersebut adalah **arsitektur target**, bukan keputusan final role bisnis.

---

# 21. SENSITIVE ACTIONS

Tindakan berisiko tinggi harus dapat membutuhkan:

```text
Authorization
+
Re-authentication / MFA
+
Reason
+
Approval
+
Audit
```

Contoh:

```text
Change RBAC
Change payment configuration
Change economy policy
Bulk export
Restore backup
Delete critical data
Impersonation
Security configuration
Founder account changes
```

---

# 22. AUDIT SYSTEM

Audit harus menjadi platform-wide primitive.

Event minimal:

```text
LOGIN
LOGOUT
ROLE_ASSIGNED
ROLE_REVOKED
CAPABILITY_GRANTED
CAPABILITY_REVOKED

BOOKING_CREATED
BOOKING_CONFIRMED
BOOKING_CANCELLED

VERIFICATION_SUBMITTED
VERIFICATION_REVIEWED

POINT_GRANTED
POINT_SPENT
POINT_REVERSED
POINT_ADJUSTED

PAYMENT_CREATED
PAYMENT_PAID
PAYMENT_FAILED
PAYMENT_REFUNDED

CONFIG_CHANGED
BACKUP_CREATED
BACKUP_RESTORED
EXPORT_CREATED

IMPERSONATION_STARTED
IMPERSONATION_ENDED
```

Audit record:

```text
actor
action
entity
entityId
before
after
reason
timestamp
requestId
```

Dokumen sumber secara eksplisit mensyaratkan metadata tersebut untuk operasi ekonomi sensitif. 

---

# 23. AUDIT VISIBILITY

```text
Member
   ↓
Own activity

Organization Admin
   ↓
Organization activity

Founder
   ↓
Platform audit

Auditor
   ↓
Read-only assigned scope
```

Temuan audit saat ini menunjukkan audit sudah ditulis tetapi belum memiliki viewer/control plane yang memadai. 

---

# 24. ECONOMY

Ekonomi internal adalah domain tersendiri.

```text
SEMESTA ECONOMY
│
├── Earn
├── Grant
├── Spend
├── Reverse
├── Adjust
├── Policy
├── Audit
└── Controls
```

Canonical source:

```text
EconomicLedger
```

Jangan membuat ledger paralel jika existing `EconomicLedger` sudah memenuhi fungsi tersebut. 

---

# 25. MEMBER ECONOMY UX

UI harus **brand-first dan ringkas**.

Gunakan:

```text
Poin Saya
Aktivitas Poin
Diperoleh
Digunakan
Apresiasi
Benefit
Detail Aktivitas
```

Jangan memenuhi UI dengan penjelasan legal.

Definisi formal:

```text
Poin Internal
```

berada di:

```text
TOR
TOS
Economic Policy
Member Agreement
Payment Terms
```

Blueprint sumber juga sudah menggeser terminology legal tersebut keluar dari UI utama. 

---

# 26. ECONOMY LEDGER

Flow:

```text
Business Event
     ↓
Economic Policy
     ↓
Economic Transaction
     ↓
EconomicLedger
     ↓
Balance
     ↓
Member Portal
```

Tidak boleh:

```text
user.points += amount
```

---

# 27. ECONOMIC SAFETY

Wajib:

```text
Immutable transaction
Idempotency
Atomic mutation
Authorization
Ownership validation
Balance validation
Reversal
Audit
Integrity checks
```

Tidak boleh:

```text
client → amount
client → actor
client → balance
```

---

# 28. PAYMENT BOUNDARY

Payment berada di luar internal economy.

```text
External Money
     ↓
PaymentGatewayAdapter
     ↓
Payment
     ↓
Business Policy
     ↓
EconomicLedger
```

Adapter:

```text
MockPaymentGatewayAdapter
MidtransPaymentGatewayAdapter
XenditPaymentGatewayAdapter
```

Minimal contract:

```text
createPayment()
getPaymentStatus()
handleWebhook()
refund()
```

Blueprint sumber secara eksplisit menetapkan `MockPaymentGatewayAdapter` sebagai simulasi **payment boundary**, bukan simulasi ekonomi internal. 

---

# 29. MOCK ≠ MOCK ECONOMY

Local:

```text
PAYMENT_PROVIDER=mock
```

Production:

```text
PAYMENT_PROVIDER=midtrans
```

atau:

```text
PAYMENT_PROVIDER=xendit
```

Tetapi:

```text
EconomicLedger
```

tetap sama.

Jadi:

> **Mock adapter adalah demo/test implementation untuk transaksi eksternal, bukan fondasi palsu untuk ekonomi internal.**

---

# 30. PAYMENT → ECONOMY

Payment:

```text
Payment Created
      ↓
Gateway
      ↓
Webhook
      ↓
Signature Verification
      ↓
Payment = PAID
      ↓
Business Policy
      ↓
EconomicLedger
```

Payment **tidak otomatis berarti Poin**.

Hanya policy eksplisit yang dapat menghasilkan:

```text
PAYMENT_COMPLETED
→ CREDIT POIN
```

Blueprint sumber menegaskan pemisahan tersebut. 

---

# 31. PAYMENT SECURITY

Wajib:

```text
Webhook signature verification
Idempotency
Event validation
Status validation
Replay protection
Audit
```

Client redirect:

> **bukan bukti pembayaran final.**

Duplicate webhook:

```text
same event
↓
already processed
↓
no duplicate ledger transaction
```

---

# 32. COMMUNICATION PLATFORM

Pisahkan:

```text
In-App Notification
Email
Mailing
Announcement
System Alert
```

Architecture:

```text
Domain Event
     ↓
Notification Policy
     ├── In-App
     ├── Email
     └── Other channel
```

Dengan adapter:

```text
EmailAdapter
NotificationAdapter
```

---

# 33. EMAIL

Target:

```text
Transactional Email
```

Contoh:

```text
Magic Link
Booking notification
Verification result
Organization invitation
Password/security event
System alert
```

Provider dapat:

```text
Resend
Supabase Auth
SMTP
```

Pemilihan provider harus dicatat di resource registry.

---

# 34. MAILING

Mailing berbeda dari transactional email.

```text
Mailing
├── Audience
├── Campaign
├── Template
├── Schedule
├── Delivery
├── Unsubscribe
└── Analytics
```

Staff marketing dapat mengelola sesuai capability.

Tidak boleh memberikan akses:

```text
mailing.send
```

kepada semua staff.

---

# 35. CHANGELOG / RELEASES

Platform membutuhkan:

```text
/management/releases
```

dan public-facing:

```text
/changelog
```

Internal:

```text
Draft
Review
Publish
Archive
```

Public:

```text
What's New
Release Notes
Product Updates
```

Changelog bukan sekadar markdown statis jika Founder ingin delegasi penuh.

---

# 36. CMS / CONTENT

CMS menjadi domain tersendiri:

```text
Content
├── Articles
├── Pages
├── Knowledge
├── FAQ
├── Announcements
├── Legal
└── Changelog
```

Capability:

```text
content.read
content.create
content.update
content.publish
content.archive
```

Publishing dapat memerlukan approval sesuai policy.

---

# 37. BACKUP

Backup harus mencakup:

### Database

```text
PostgreSQL
Supabase
pg_dump
Managed backup
```

### Files

```text
Supabase Storage
Google Drive
S3-compatible storage
```

### Configuration

Jangan backup secrets secara plaintext.

---

# 38. GOOGLE DRIVE / GOOGLE WORKSPACE

Google bukan database utama.

Google Drive dapat menjadi:

```text
Backup destination
Document archive
Export destination
Operational document repository
```

Flow:

```text
SEMESTA
   ↓
Backup / Export Service
   ↓
Storage Adapter
   ↓
Google Drive
```

Jika menggunakan Google Workspace:

```text
Google OAuth
Google Drive API
Google Workspace APIs
```

Credentials harus disimpan server-side.

Tidak boleh:

```text
browser → service account secret
```

---

# 39. BACKUP CONTROL PLANE

Founder dapat:

```text
View backup status
Create backup
Download/export
Verify backup
View retention
View history
Restore
```

Restore adalah sensitive action:

```text
Founder
+
approval/re-auth
+
audit
```

Staff biasa:

```text
backup.read
```

tidak otomatis:

```text
backup.restore
```

---

# 40. DISASTER RECOVERY

Wajib memiliki:

```text
Backup
↓
Verification
↓
Restore test
↓
Recovery procedure
```

Bukan hanya:

> "backup tersedia."

Backup yang tidak pernah diuji restore bukan recovery strategy yang lengkap.

---

# 41. DATA EXPORT

Target:

```text
Export Member
Export Organization
Export Audit
Export Economy
Export Reports
```

Format:

```text
CSV
JSON
PDF
```

sesuai kebutuhan domain.

Bulk export adalah sensitive capability.

---

# 42. SYSTEM HEALTH

Founder workspace:

```text
System Health
├── Database
├── Authentication
├── Storage
├── Email
├── Payment
├── Queue/Cron
├── External APIs
├── Environment
└── Application Version
```

Minimal endpoints:

```text
/health
/live
/ready
```

Reuse existing health infrastructure jika tersedia.

---

# 43. OBSERVABILITY

Track:

```text
request
error
latency
domain event
background task
payment webhook
ledger mutation
notification delivery
backup
```

Economy-specific:

```text
economic_transaction_success
economic_transaction_failure
duplicate_transaction_prevented
payment_webhook_received
payment_webhook_duplicate
payment_webhook_invalid
ledger_integrity_error
negative_balance_prevented
manual_adjustment
```

Blueprint sumber sudah mendefinisikan observability tersebut. 

---

# 44. CONFIGURATION MANAGEMENT

Pisahkan tiga kelas.

### Infrastructure

Tidak boleh diedit dari UI:

```text
DATABASE_URL
SERVICE_ROLE_KEY
deployment secrets
```

### Application

Founder dapat mengelola:

```text
feature flags
platform settings
campaign settings
notification policies
default configuration
```

### Security

Sangat sensitif:

```text
RBAC
payment configuration
storage configuration
authentication policy
```

Perubahan dapat memerlukan:

```text
Founder approval
+
audit
```

---

# 45. FEATURE FLAGS

Target:

```text
ECONOMY_ENABLED
POINT_EARNING_ENABLED
POINT_SPENDING_ENABLED
MANUAL_ADJUSTMENT_ENABLED
PAYMENT_ENABLED
```

Sehingga:

```text
Payment OFF
Economy ON
```

atau:

```text
Spending OFF
Earning ON
```

tanpa mematikan seluruh platform.

---

# 46. SUPPORT / IMPERSONATION

Impersonation **tidak boleh otomatis dibuat hanya karena founder membutuhkan support**.

Jika diperlukan:

```text
Founder-only
time-limited
explicit reason
full audit
visible banner
restricted sensitive actions
```

Dan:

```text
impersonation_started
impersonation_ended
```

harus diaudit.

Temuan audit saat ini menunjukkan fitur ini belum ada. 

---

# 47. GOVERNANCE / APPROVAL

Sensitive action dapat menggunakan:

```text
Request
↓
Approval
↓
Execution
↓
Audit
```

Contoh:

```text
Change RBAC
Change commission
Restore backup
Bulk export
Economy adjustment
Payment configuration
```

Jangan membuat approval workflow yang kompleks sebelum kebutuhan nyata teridentifikasi.

---

# 48. INTERNAL WORKSPACE STRUCTURE

Target:

```text
/management
│
├── overview
├── people
├── access
├── organizations
├── operations
├── content
├── communications
├── economy
├── payments
├── audit
├── backups
├── system
├── integrations
├── settings
└── governance
```

Route existing harus dipetakan dahulu.

Jangan membuat duplicate route hanya demi struktur ideal.

---

# 49. SECURITY CONTROL

Audit seluruh repository untuk:

```text
client-supplied actor identity
client-supplied organization ID
client-supplied role
IDOR
cross-organization access
role spoofing
permission bypass
UI-only authorization
hardcoded user ID
hardcoded organization ID
service-role exposure
```

Ini bukan sekadar checklist.

Setiap finding harus memiliki:

```text
Severity
Evidence
Impact
Remediation
Test
```

---

# 50. DATABASE PRINCIPLE

Sebelum schema baru:

```text
Inspect existing schema
Inspect services
Inspect repository
Inspect migrations
Inspect seed
Inspect tests
```

Kemudian:

```text
REUSE
↓
EXTEND
↓
ADAPTER
↓
NEW MODEL
```

Hindari duplicate:

```text
PointLedger
WalletLedger
RewardLedger
EconomyLedger
```

jika:

```text
EconomicLedger
```

sudah menjadi canonical ledger.

---

# 51. RESOURCE REGISTRY

`docs/09_RESOURCE_REGISTRY.md` menjadi registry resmi.

Kategori:

```text
AUTH
RBAC
DATABASE
RLS
ORGANIZATION
STORAGE
BACKUP
GOOGLE
EMAIL
MAILING
NOTIFICATION
CMS
CHANGELOG
AUDIT
OBSERVABILITY
PAYMENT
ECONOMY
DEPLOYMENT
DISASTER_RECOVERY
```

Setiap resource:

```text
Name
Type
Official URL
GitHub
License
Purpose
Current Usage
Target Usage
Status
Adapter Required?
Security Notes
Adoption Decision
```

Gunakan **official documentation dan official repositories** terlebih dahulu.

---

# 52. RESOURCE / OPEN-SOURCE PRINCIPLE

Jangan memasukkan library hanya karena populer.

Evaluasi:

```text
License
Maintenance
Security
Next.js compatibility
Supabase compatibility
Vercel compatibility
Cost
Self-hostability
Vendor lock-in
API quality
Community
```

Dan setiap resource harus menjawab:

> **Apa yang benar-benar kita adopsi dari resource ini?**

---

# 53. RECOMMENDED RESOURCE CATEGORIES TO RESEARCH

AI Agent harus melakukan web/GitHub research untuk:

### Authorization

```text
Supabase Auth
Supabase RLS
CASL / capability authorization
policy-based authorization
```

### Storage

```text
Supabase Storage
Google Drive API
S3-compatible storage
```

### Email

```text
Resend
Supabase Auth email
SMTP
```

### Backup

```text
PostgreSQL pg_dump
Supabase backup
Google Drive API
S3
```

### Observability

```text
health checks
structured logging
error monitoring
deployment tracking
```

### Notifications

```text
in-app notification
event-driven notification
email adapter
```

### Audit

```text
append-only audit
audit event model
structured audit metadata
```

Resource tersebut harus diverifikasi terhadap stack SEMESTA ISLAM, bukan diadopsi otomatis.

---

# 54. API ARCHITECTURE

Target domain:

```text
/api/v1/auth/**
/api/v1/member/**
/api/v1/organizations/**
/api/v1/bookings/**
/api/v1/verification/**
/api/v1/economy/**
/api/v1/payments/**
/api/v1/content/**
/api/v1/notifications/**
/api/v1/management/**
/api/v1/system/**
```

Namun endpoint existing harus direuse.

Jangan membuat duplicate endpoint hanya untuk memenuhi naming convention.

---

# 55. DOMAIN SERVICE RULE

Semua mutation:

```text
API
 ↓
Identity
 ↓
Authorization
 ↓
Validation
 ↓
Domain Service
 ↓
Transaction
 ↓
Audit
```

Untuk privileged action:

```text
Management
 ↓
Authorization
 ↓
Policy
 ↓
Approval if required
 ↓
Domain Service
 ↓
Audit
```

Tidak boleh:

```text
Management UI
 ↓
Prisma.update()
```

---

# 56. ROLE × CAPABILITY MODEL

Matrix final harus dihasilkan setelah audit.

Format:

| Capability              | Founder |      Co-Founder | Org Admin |  Manager |    Staff | Auditor | Member |
| ----------------------- | ------: | --------------: | --------: | -------: | -------: | ------: | -----: |
| Platform overview       |       ✓ |          scoped |         ✗ |        ✗ |        ✗ |    read |      ✗ |
| Member management       |       ✓ |          scoped |       org |      org | assigned |    read |   self |
| Organization management |       ✓ |          scoped |       own | assigned |        ✗ |    read |      ✗ |
| RBAC management         |       ✓ | approval/scoped |       org |        ✗ |        ✗ |    read |      ✗ |
| Booking management      |       ✓ |          scoped |       org |      org | assigned |    read |    own |
| Verification            |       ✓ |          scoped |         ✗ |        ✗ |        ✗ |    read |    own |
| Economy view            |       ✓ |          scoped |  org/read |     read | assigned |    read |    own |
| Economy adjustment      |       ✓ |        approval |         ✗ |        ✗ |        ✗ |       ✗ |      ✗ |
| Payment management      |       ✓ |        approval |         ✗ |        ✗ |        ✗ |    read |    own |
| Content                 |       ✓ |          scoped |       org | assigned | assigned |    read |   read |
| Mailing                 |       ✓ |          scoped |       org | assigned | assigned |       ✗ |      ✗ |
| Backup                  |       ✓ |          scoped |         ✗ |        ✗ |        ✗ |    read |      ✗ |
| Restore                 |       ✓ |        approval |         ✗ |        ✗ |        ✗ |       ✗ |      ✗ |
| Audit                   |       ✓ |          scoped |       org | assigned | assigned |       ✓ |    own |

**Ini target proposal, bukan keputusan bisnis final.**

---

# 57. FOUNDER OVERSIGHT

Founder/Management harus dapat:

### Observe

```text
Member
Organization
Booking
Verification
Learning
Economy
Payment
System
Security
Audit
```

### Control

```text
Delegation
Access
Organization
Policy
Economy
Payment
Content
Communication
Backup
System
```

Tetapi:

> Founder tetap melewati domain service dan audit.

Tidak boleh ada:

```text
Founder bypass
```

yang menghindari business rules.

---

# 58. PRODUCTION ENVIRONMENT

### Localhost

```text
Demo identity
Seeded data
Mock payment
Simulated external services
```

### Production

```text
Supabase Auth
PostgreSQL
RLS
Private Storage
Real email provider
Real backup destination
Real payment adapter when enabled
Real monitoring
```

Arsitektur domain harus sama.

Yang berubah adalah provider/adapter dan environment.

---

# 59. PAYMENT PRODUCTION READINESS

Production tidak berarti payment gateway harus langsung aktif.

Target:

```text
Payment architecture READY
        ↓
Credentials AVAILABLE?
        ↓
Business/legal approval?
        ↓
Provider enabled?
```

Jika belum:

```text
PAYMENT_PROVIDER=mock
```

tetap valid sebagai development/test adapter.

Dokumen sumber juga mencatat bahwa saat ini payment masih closed-loop simulation dan gateway nyata belum terpasang. 

---

# 60. ACCEPTANCE — MEMBER

Member harus dapat:

```text
Login
↓
Dashboard sesuai role
↓
View own data
↓
Perform authorized actions
↓
Receive feedback
↓
View activity
↓
Manage profile/settings
↓
Receive notifications
```

---

# 61. ACCEPTANCE — ORGANIZATION

Organization harus dapat:

```text
Manage organization
↓
Manage members
↓
Manage roles/capabilities
↓
Manage programs/resources
↓
Manage activities
↓
View reports
↓
Communicate
↓
View scoped audit
↓
Configure organization
```

---

# 62. ACCEPTANCE — FOUNDER

Founder harus dapat:

```text
View entire platform
↓
Monitor members
↓
Monitor organizations
↓
Delegate capabilities
↓
Revoke access
↓
Monitor audit
↓
Control policies
↓
Manage sensitive operations
↓
Monitor infrastructure
↓
Backup/export
↓
Intervene when necessary
```

Tetapi tetap melalui authorization + policy + audit.

---

# 63. ACCEPTANCE — SECURITY

Wajib lulus:

```text
Unauthenticated → denied
Wrong role → denied
Wrong organization → denied
Wrong scope → denied
Client actor spoofing → denied
IDOR → denied
Cross-org leakage → denied
Privilege escalation → denied
Service-role exposure → denied
```

---

# 64. TEST MATRIX

### Authorization

```text
identity
role
capability
scope
policy
```

### Organization isolation

```text
Org A → Org A ✓
Org A → Org B ✗
```

### Member isolation

```text
User A → own ✓
User A → User B ✗
```

### Founder

```text
Founder → platform ✓
Founder mutation → audit ✓
```

### Delegation

```text
staff permitted capability ✓
staff forbidden capability ✗
expired delegation ✗
revoked delegation ✗
```

### Economy

```text
credit
debit
reversal
adjustment
idempotency
concurrency
authorization
audit
```

### Payment

```text
create
webhook
signature
duplicate webhook
invalid webhook
refund
policy integration
```

### Backup

```text
create
verify
export
restore authorization
restore audit
```

---

# 65. PARALLEL EXECUTION ARCHITECTURE

Setelah foundation dikunci:

```text
                 FOUNDATION
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
      T1 RBAC      T2 Member    T3 Organization
        │            │            │
        ├────────────┼────────────┤
        │            │            │
        ▼            ▼            ▼
      T4 Economy   T5 Management  T6 Communication
        │            │            │
        ├────────────┼────────────┤
        ▼            ▼            ▼
      T7 Backup     T8 System     T9 Content
        │            │            │
        └────────────┼────────────┘
                     ▼
               T10 Integration
                     │
                     ▼
               T11 Acceptance
```

---

# 66. TRACK OWNERSHIP

Setiap track wajib memiliki:

```text
OWNER
EXCLUSIVE FILES
SHARED FILES
DEPENDENCIES
INPUT CONTRACT
OUTPUT CONTRACT
TESTS
GATE
```

Tidak boleh mengatakan "parallel" apabila dua agent mengubah:

```text
schema.prisma
types/index.ts
layout.tsx
middleware.ts
package.json
```

secara bersamaan tanpa ownership protocol.

---

# 67. FOUNDATION WAVE

Foundation harus mengunci:

```text
Identity
Authorization
Capability
Scope
Audit primitive
Provider abstraction
Environment configuration
Types
Validation
```

Baru setelah itu track domain dapat berjalan paralel.

---

# 68. MANAGEMENT TRACKS

### Track A

```text
RBAC / Authorization
```

### Track B

```text
Member Portal
```

### Track C

```text
Organization Portal
```

### Track D

```text
Founder Management
```

### Track E

```text
Economy / Payment
```

### Track F

```text
Email / Mailing / Notification
```

### Track G

```text
Backup / Storage / Export
```

### Track H

```text
CMS / Changelog
```

### Track I

```text
System Health / Observability
```

### Track J

```text
Security / Tests / Acceptance
```

---

# 69. DOCUMENTATION REGISTRY

Minimal:

```text
docs/
├── 03_ERD.md
├── 07_API_ENDPOINTS.md
├── 08_SECURITY_COMPLIANCE.md
├── 09_RESOURCE_REGISTRY.md
├── 10_ACCEPTANCE_CRITERIA.md
├── audit/
│   ├── MASTER_AUDIT_REPORT.md
│   └── DECISION_LOG.md
├── architecture/
│   ├── AUTHORIZATION.md
│   ├── ORGANIZATION.md
│   ├── ECONOMY.md
│   ├── PAYMENT.md
│   └── MANAGEMENT.md
└── deploy/
    ├── RUNBOOK.md
    └── DISASTER_RECOVERY.md
```

Nama file mengikuti existing repository jika sudah tersedia.

---

# 70. DECISION DISCIPLINE

AI Agent **tidak boleh diam-diam menetapkan**:

```text
staff hierarchy
founder authority
commission
point conversion
payment policy
backup retention
mailing policy
data deletion
organization policy
impersonation policy
```

Jika belum ditentukan:

```text
DECISION REQUIRED
```

Tetapi keputusan teknis yang sudah ditetapkan dalam blueprint dapat langsung diterapkan.

---

# 71. ANTI-SCOPE-CREEP

Tidak boleh:

```text
New role tanpa alasan
New ledger tanpa alasan
New wallet model
New payment model jika existing boundary cukup
New organization model sebelum schema audit
New notification provider tanpa adapter justification
New storage provider tanpa requirement
```

Prioritas:

```text
REUSE
→ EXTEND
→ ADAPTER
→ NEW ENTITY
```

---

# 72. RESOURCE RESEARCH OUTPUT

AI Agent harus menghasilkan:

```text
Resource
Official Documentation
Official GitHub
License
Version/Status
Why relevant
Current SEMESTA equivalent
Adoption decision
Implementation notes
Security notes
```

Kategori:

```text
Supabase Auth
Supabase RLS
Google Drive API
Google Workspace
Resend
PostgreSQL backup
S3-compatible storage
RBAC/policy libraries
Notification systems
Observability
Audit patterns
CMS
Payment gateways
```

---

# 73. FINAL TARGET ARCHITECTURE

```text
                         SEMESTA ISLAM
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
        ▼                     ▼                      ▼
     PUBLIC                MEMBERS             ORGANIZATIONS
        │                     │                      │
 Directory              Learner                 Institution
 Discovery              Educator                Foundation
 Content                Guardian                Community
 Booking                Profile                 Partner
        │                     │                      │
        └─────────────────────┼──────────────────────┘
                              │
                              ▼
                     DOMAIN SERVICES
                              │
       ┌──────────────┬───────┼────────┬─────────────┐
       ▼              ▼       ▼        ▼             ▼
    Booking       Learning  Economy  Verification  Content
       │              │       │        │             │
       └──────────────┴───────┼────────┴─────────────┘
                              │
                              ▼
                    AUTHORIZATION LAYER
                              │
                 Identity → Capability → Scope
                              │
                              ▼
                    MANAGEMENT CONTROL PLANE
                              │
       ┌─────────┬────────────┼────────────┬──────────┐
       ▼         ▼            ▼            ▼          ▼
    People    Operations   Economy      Content    System
       │         │            │            │          │
       └─────────┴────────────┼────────────┴──────────┘
                              │
                              ▼
                         AUDIT / POLICY
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
          DATABASE         STORAGE          EXTERNAL
             │                │                │
         PostgreSQL       Supabase/Drive    Payment
                                            Email
                                            APIs
```

---

# 74. DEFINITIVE PRINCIPLES

### Principle 1 — Member-first

Member UX harus sederhana.

### Principle 2 — Organization-aware

Organization adalah scope, bukan sekadar label.

### Principle 3 — Founder-controlled

Founder memiliki governance authority.

### Principle 4 — Delegation without abdication

Founder dapat mendelegasikan pekerjaan tanpa kehilangan kontrol.

### Principle 5 — Authorization server-side

UI visibility bukan security.

### Principle 6 — Audit everything sensitive

Privileged action harus traceable.

### Principle 7 — Economy ledger-first

`EconomicLedger` adalah source of truth.

### Principle 8 — Payment-independent economy

Payment gateway adalah external boundary.

### Principle 9 — Adapter-first integrations

Google, email, payment, storage, dan provider lain tidak boleh mengotori domain core.

### Principle 10 — Production architecture from day one

Local/demo hanya mengganti provider, bukan mengganti domain architecture.

### Principle 11 — Reuse before invention

```text
REUSE → EXTEND → ADAPTER → NEW
```

### Principle 12 — Parallel execution with ownership

Parallel hanya jika dependency dan shared-file ownership jelas.

---

# 75. DEFINITION OF DONE — TOTAL PLATFORM

Blueprint ini dianggap berhasil diimplementasikan apabila:

```text
✓ Member Portal lengkap
✓ Role-aware dashboard
✓ Organization Portal lengkap
✓ Organization isolation
✓ Capability-based authorization
✓ Scope-based authorization
✓ Founder Control Plane
✓ Delegated staff/co-founder access
✓ Approval untuk sensitive actions
✓ Platform-wide audit viewer
✓ Economy ledger production-ready
✓ Payment adapter gateway-ready
✓ Mock payment untuk development
✓ Email adapter
✓ Mailing
✓ Notification center
✓ CMS
✓ Changelog
✓ Backup
✓ Restore
✓ Export
✓ Google Drive integration-ready
✓ System health
✓ Observability
✓ Configuration management
✓ Security controls
✓ E2E authorization tests
✓ Organization isolation tests
✓ Economy tests
✓ Payment webhook tests
✓ Backup/restore authorization tests
✓ Documentation registry
✓ Acceptance matrix
✓ Production deployment runbook
```

Dan yang paling penting:

> **Founder/Owner dapat menyerahkan operasi harian kepada staf atau co-founder berdasarkan capability dan scope, tetapi tetap dapat melihat, membatasi, mencabut, mengaudit, dan mengambil kembali kontrol kapan pun diperlukan.**

Itulah bentuk **platform operating system** yang menurut saya paling tepat untuk SEMESTA ISLAM—bukan sekadar kumpulan dashboard, melainkan **Member Experience + Organization Experience + Governance Control Plane + Economic/Payment Infrastructure** yang berada di atas satu authorization dan audit foundation.
