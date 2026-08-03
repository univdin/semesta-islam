# IMPLEMENTATION CONTRACT — SEMESTA ISLAM

**Document:** `docs/IMPLEMENTATION_CONTRACT.md`  
**Status:** Active Execution Bridge & Traceability Contract  
**Authority:** Governed by `00_BRD.md` through `10_ACCEPTANCE_CRITERIA.md` & `IMPLEMENTATION_READINESS.md`

---

## 1. PURPOSE & EXECUTION GOVERNANCE

Dokumen ini berfungsi sebagai **Kontrak Eksekusi Terlacak (Implementation Contract)** yang menghubungkan seluruh spesifikasi kanonikal dengan implementasi kode produksi. Dokumen ini memastikan bahwa setiap baris kode yang ditulis terbukti berasal dari kebutuhan bisnis, terlindungi oleh keamanan RLS, dan memiliki kriteria pengujian yang terukur.

---

## 2. STATUS IMPLEMENTASI MODEL

Setiap item implementasi diklasifikasikan menggunakan siklus status ketat:

$$\text{PLANNED} \longrightarrow \text{IMPLEMENTED} \longrightarrow \text{TESTED} \longrightarrow \text{VERIFIED} \longrightarrow \text{ACCEPTED}$$

- **PLANNED**: Ditentukan dalam kontrak tetapi belum ada kode.
- **IMPLEMENTED**: Kode sumber telah ditulis.
- **TESTED**: Pengujian otomatis/manual telah dieksekusi.
- **VERIFIED**: Bukti empiris mengonfirmasi bahwa implementasi memenuhi kontrak teknis.
- **ACCEPTED**: Memenuhi seluruh kriteria keberterimaan (Acceptance Criteria).

---

## 3. TRACEABILITY MATRIX: BUSINESS TO IMPLEMENTATION

| Requirements Traceability | Source | Strategy | Security Requirement | Test Method | Acceptance Criteria | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01. User Identity & Multi-Role Auth** | PRD §3 / ERD §3 | `CONFIGURE` (Supabase Auth, RLS) | RLS Policy: Users view/edit own profile only | Unit Test + Supabase RLS Audit | Magic link auth works, roles separated | `PLANNED` |
| **02. Educator Sanad & Credential Registry** | PRD §4 / ERD §3.2 | `INTEGRATE` (Prisma + Supabase Private Storage) | Private bucket with 15-min Signed URLs | File Signed URL Check | Sanad PDF stored privately, non-public | `PLANNED` |
| **03. 4-Layer Verification Engine** | BRD §4 / ERD §3.3 | `REUSE` (`tesseract.js`, `pdf-lib` SHA-256) | Admin/Lajnah RLS policy for document review | OCR Extraction Test & Hash Match | Hash duplicates flagged, badge issued | `PLANNED` |
| **04. Educator Directory & Precision Search** | PRD §2 / API §2.3 | `CONFIGURE` (Upstash Redis Cache + Prisma) | Public read-only, rate limited (60 req/min) | API Benchmark & Search Filter Test | Query response < 200ms, accurate filter | `PLANNED` |
| **05. Multi-Step Booking & Virtual Ledger** | PRD §5 / ERD §3.5 | `BUILD` (`MockPaymentGatewayAdapter`) | Ledger insert service-role only, zero-direct write | Ledger Balance Reconciliation Test | Multi-step booking records to ledger | `PLANNED` |
| **06. Referral & Ambassador Engine** | PRD §7 / API §2.7 | `BUILD` (Unique Code Generator + Upstash) | Anti-self referral check, rate limited | Referral Conversion Simulation | Code creation & point credit works | `PLANNED` |
| **07. Core Lightweight LMS & Progress** | PRD §8 / ERD §3.4 | `BUILD` (Progress Report Component & API) | Guardian RLS access to child report only | Progress Report Render Test | Progress report accessible by family | `PLANNED` |
| **08. Management / Founder Dashboard** | PRD §9 / API §2.8 | `BUILD` (Custom Next.js App Router `/admin`) | `FOUNDER_ADMIN` RLS role restriction | RBAC Route Guard Test | CMS, ERP, RBAC, Lajnah Queue functional | `PLANNED` |

---

## 4. DEFINISI VERTICAL SLICE PERTAMA (FIRST VERTICAL SLICE)

Untuk menghindari pembangunan horizontal yang rawan defect, pengembangan dilakukan melalui **Vertical Slice pertama** yang membuktikan alur nilai bisnis utama dari hulu ke hilir:

```text
[PUBLIC LANDING & SHOWCASE]
          ↓
[DIRECTORY SEARCH & FILTER]
          ↓
[EDUCATOR PROFILE & SANAD VIEW]
          ↓
[IDENTITY AUTH (SUPABASE MAGIC LINK)]
          ↓
[INQUIRY BOOKING REQUEST]
          ↓
[INTERNAL VIRTUAL LEDGER RECORDING]
          ↓
[MANAGEMENT AUDIT LOG & ACCEPTANCE]
```

### Lingkup Uji & Bukti pada Vertical Slice 1:
1. **Navigasi Landing & Direktori**: Pencarian Ustaz/Pendidik berdasarkan bidang ilmu (*Tahsin*, *Fiqh*, *Bahasa Arab*) dan metode (Online/Tatap Muka).
2. **Detail Profil & Sanad**: Halaman profil menampilkan riwayat sanad keilmuan & lencana verifikasi.
3. **Autentikasi Pembelajar**: Registrasi/Masuk via Supabase Auth Magic Link.
4. **Alur Booking Inkuiri**: Formulir reservasi 3-langkah yang mengirimkan inkuiri dan mencatat saldo simulasi pada `economic_ledgers`.
5. **Security & Audit**: RLS Policy memastikan pembelajar hanya melihat data booking miliknya, dan aktivitas dicatat ke `audit_logs`.

---

## 5. RESOURCE REUSE & DEPENDENCY SPECIFICATION

| Resource Name       | Package / Repo           | Ownership & License                   | Purpose & Fallback                        |
| :--------------------| :-------------------------| :--------------------------------------| :------------------------------------------|
| **Next.js 15**      | `next` (v15.1)           | Managed Framework (MIT)               | Foundation App Router & API Routes        |
| **Prisma ORM**      | `@prisma/client` (v6.2)  | Owned Schema / Generated (Apache-2.0) | Type-safe database queries & migrations   |
| **Supabase Client** | `@supabase/supabase-js`  | External Service Client (MIT)         | Auth, Storage, & RLS Enforcement          |
| **Upstash Redis**   | `@upstash/redis`         | External Service Client (MIT)         | Rate limiting API & Cache taksonomi       |
| **Tesseract.js**    | `tesseract.js` (v5.1)    | Client Library (Apache-2.0)           | OCR KTP di sisi browser (Free)            |
| **PDF-Lib**         | `pdf-lib` (v1.17)        | Client Library (MIT)                  | Extraction metadata & SHA-256 PDF hashing |
| **Vaul Drawers**    | `vaul` (v1.1)            | UI Component Library (MIT)            | Native Mobile Bottom Sheet Drawer         |
| **Framer Motion**   | `framer-motion` (v11.15) | UI Motion Engine (MIT)                | Spring physics interaction animations     |
| **Lucide Icons**    | `lucide-react` (v0.469)  | Icon Assets (ISC)                     | Icon set open-source                      |

---

## 6. ENVIRONMENT READINESS & CREDENTIAL GATE

### Status Ketersediaan Lingkungan:
- **Phase A (Engineering without live credentials)**: `[READY]` Scaffolding repositori, konfigurasi TypeScript, skema Prisma, tipe Zod, komponen UI React, dan mock API dapat dikerjakan secara langsung.
- **Phase B (Requires live external integration)**: `[BLOCKED — REQUIRES LIVE INTEGRATION]` Koneksi Supabase Auth langsung, migrasi database live, dan Upstash Redis live memerlukan pengisian `.env.local` saat verifikasi runtime.

---

## 7. RISK & DECISION REGISTER

| Risk / Decision ID | Description | Classification | Action / Decision Owner |
| :--- | :--- | :--- | :--- |
| **DECISION-01** | Rasio persentase komisi virtual platform vs pendidik | `BUSINESS DECISION REQUIRED` | Founder / Business Owner |
| **RISK-01** | Batasan kuota Supabase DB (500MB) pada Free Tier | `NON-BLOCKING` | Optimasi skema & pembersihan log periodik |
| **RISK-02** | Kecepatan OCR `tesseract.js` pada perangkat mobile lama | `NON-BLOCKING` | Tambahkan loading indicator & fallback manual input |
