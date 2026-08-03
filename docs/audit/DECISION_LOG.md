# DECISION LOG — SEMESTA ISLAM

**Document:** `docs/DECISION_LOG.md`  
**Status:** Active Decision Register  
**Authority:** Governed by `01_BSD.md`, `05_MASTER_CONTEXT.md`, `IMPLEMENTATION_CONTRACT.md`

---

## 1. DECISION CLASSIFICATION & GOVERNANCE

Seluruh keputusan bisnis, produk, keagamaan/etika, maupun teknis yang belum atau telah difinalisasi dicatat secara eksplisit dalam dokumen ini. **Agen AI dilarang keras membuat atau mengasumsikan keputusan bisnis/hukum secara sepihak.**

---

## 2. DECISION REGISTER MATRIX

| Decision ID     | Domain / Category      | Description                                      | Status              | Current Value / Fallback                                | Approval Authority     |
| :----------------| :-----------------------| :-------------------------------------------------| :--------------------| :--------------------------------------------------------| :-----------------------|
| **DECISION-01** | Business / Finance     | Persentase komisi virtual platform vs pendidik   | `DECISION REQUIRED` | `CONFIGURABLE_FALLBACK` (Default 0% for MVP simulation) | Founder / Owner        |
| **DECISION-02** | Infrastructure / Email | Pemilihan provider email transaksional free-tier | `PROPOSED`          | Resend Free Tier (100 emails/day)                       | Lead Architect         |
| **DECISION-03** | Security / Auth        | Metode otentikasi utama pengguna                 | `APPROVED`          | Supabase Auth Passwordless (Magic Link + OAuth)         | PRD §3 / Security §1   |
| **DECISION-04** | OCR Processing         | Lokasi eksekusi ekstraksi Teks KTP               | `APPROVED`          | Client-Side Browser via `tesseract.js` (Free, Private)  | OSS §4 / Design §2     |
| **DECISION-05** | Sanad PDF Integrity    | Metode pembuktian keaslian berkas Ijazah         | `APPROVED`          | SHA-256 Digital Fingerprint Hashing                     | Security §2 / ERD §3.2 |
| **DECISION-06** | Security / Trust       | Trust boundary & cakupan otentikasi              | `APPROVED`          | Hybrid: demo/demo surfaces tetap; otentikasi server-derived untuk operasi berprivilese (FOUNDER/SUPER_ADMIN tertinggi) | Product Owner 2026-08-01 |
| **DECISION-07** | Security / Auth        | Provider autentikasi terpilih                    | `APPROVED`          | Supabase Auth (server-derived identity; tidak pernah percaya `actorUserId`/`actorRoles` dari klien) | Product Owner 2026-08-01 |
| **DECISION-08** | Security / Auth        | Retensi identitas demo                           | `APPROVED`          | Identitas demo deterministik tetap untuk dev/testing; bukan bypass otorisasi produksi | Product Owner 2026-08-01 |
| **DECISION-09** | Security / Auth        | Operasi yang diotentikasi (6 operasi)            | `APPROVED`          | Lajnah review & queue, governance execute, commission approve, educator resubmit, booking confirm | Product Owner 2026-08-01 |
| **DECISION-10** | Business / Rewards     | Kebijakan LEARNER_POINT                          | `APPROVED`          | Engagement reward (50 poin di inquiry qualified); mock invoice PAID terpisah dari settlement | Product Owner 2026-08-01 |
| **DECISION-11** | Business / Commerce    | Scope komersial MVP                             | `APPROVED`          | Closed-loop internal value (non-cash); payment adapter boundary saja; tanpa settlement uang riil | Product Owner 2026-08-01 |
| **DECISION-12** | Business / Growth      | Scope Growth MVP                                | `APPROVED`          | XP, Reputation, Attribution, internal Commission + domain events minimal; AAR/Learning/Partner/Campaign ditunda | Product Owner 2026-08-01 |

---

## 3. UNRESOLVED DECISION DETAILS

### DECISION-01: Commercial Platform Fee Percentage
- **Status**: `DECISION REQUIRED`
- **Issue**: Persentase komisi bagi hasil platform pada transaksi internal (`FeeLedgerEntry`) belum ditentukan secara resmi di dokumen BRD/PRD.
- **Controlled Implementation Handling**: Pada kode produksi, `COMMISSION_RATE` dikonfigurasi via environment variable `PLATFORM_COMMISSION_PERCENTAGE` dengan *default 0* (tanpa memotong poin pendidik pada tahap MVP) sampai ada persetujuan tertulis dari Founder.

---

## 4. ECONOMY & SECURITY CLOSURE DECISIONS (2026-08-03)

| Decision ID     | Domain / Category      | Description                                      | Status              | Current Value / Fallback                                | Approval Authority     |
| :----------------| :-----------------------| :-------------------------------------------------| :--------------------| :--------------------------------------------------------| :-----------------------|
| **DECISION-13** | Economy / Data Model    | `EconomicLedger.amount` tipe data                  | `LOCKED`            | `Float → Int` (integer Poin; tanpa aritmetika floating-point; audited 0 non-integral rows sebelum cast) | Execution Directive 2026-08-03 |
| **DECISION-14** | DB / Migration          | Strategi histori migrasi Prisma                   | `LOCKED`            | Baseline migration (delta init→DB) + incremental migration; tanpa `db push` untuk produksi; data-safe | Execution Directive 2026-08-03 |
| **DECISION-15** | Economy / API           | Endpoint pembuatan transaksi umum                 | `LOCKED`            | TIDAK ada `POST /api/v1/economy/transactions`; transaksi hanya via domain service (booking/payment/founder governance) | Execution Directive 2026-08-03 |
| **DECISION-16** | Economy / Governance    | Penyesuaian/reversal Founder                      | `LOCKED`            | Single-step Founder (reason wajib + authorization + audit); tanpa approval 2-tahap pada slice ini | Execution Directive 2026-08-03 |
| **DECISION-17** | Payment / Adapter       | Status invoice mock                              | `LOCKED`            | Mock `createInvoice` → `PENDING` (bukan PAID); webhook HMAC signature + idempotent; `SIMULATED_INTERNAL` dipertahankan | Execution Directive 2026-08-03 |
| **DECISION-18** | Economy / Lifecycle     | Status machine transaksi ekonomi                 | `LOCKED`            | `INITIATED→AUTHORIZED→PENDING→COMPLETED`; `→FAILED/EXPIRED`; `COMPLETED→REFUNDED/REVERSED`; guarded | Execution Directive 2026-08-03 |
