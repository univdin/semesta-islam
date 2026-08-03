# 10 — ACCEPTANCE CRITERIA & VERIFICATION MATRIX

**Document:** `10_ACCEPTANCE_CRITERIA.md`  
**Status:** Canonical Acceptance Reference  
**Audience:** QA Engineers · Product Managers · AI Implementation Agents  
**Authority:** Governed by `00_BRD.md`, `02_PRD.md`, `05_MASTER_CONTEXT.md`

---

## 1. STRATEGI VERIFIKASI & ACCEPTANCE GATE

Setiap modul dan fitur pada SEMESTA ISLAM wajib memenuhi **Acceptance Criteria (Kriteria Keberterimaan)** berikut sebelum dinyatakan siap rilis (*Production Ready*).

> **Status Legend** *(anotasi status per `2026-08-01`, tidak mengubah teks kriteria)*
> - `[MVP VERIFIED]` — terimplementasi + terverifikasi runtime/build pada localhost MVP.
> - `[PARTIAL]` — sebagian terimplementasi/terverifikasi; sisanya tercatat.
> - `[CLOUD BLOCKED]` — butuh kredensial Supabase/Upstash/email (belum disediakan).
> - `[PENDING]` — spec ada, belum diimplementasikan.
> - `[DEFERRED]` — scope post-MVP, sengaja di luar MVP saat ini.

---

## 2. ACCEPTANCE MATRIX PER MODUL UTAMA

### 2.1 Modul 1: Identity, Auth & RBAC Security
- [ ] **Auth Magic Link**: Pengguna dapat melakukan pendaftaran/masuk melalui Supabase Magic Link tanpa password. — `[CLOUD BLOCKED]`
- **RLS Policy Enforcement**: User biasa (Learner/Educator) tidak dapat mengakses data privat KTP/Sanad milik user lain di Supabase PostgreSQL. — `[CLOUD BLOCKED]`
- [ ] **Role Authorization**: Access control memisahkan hak akses 6 peran (`LEARNER`, `GUARDIAN`, `EDUCATOR`, `INSTITUTION_ADMIN`, `LAJNAH_VERIFIER`, `FOUNDER_ADMIN`). — `[PARTIAL: MVP role guard terverifikasi — 403 LEARNER / 200 LAJNAH_VERIFIER via payload verifierRoles; RBAC berbasis session = CLOUD BLOCKED (PHASE 2)]` *(Direkonsiliasi `2026-08-01`: 6 peran sesuai `03_ERD.md` §645–661 + enum Prisma `UserRole`; `INSTITUTION` bukan nilai enum.)*

### 2.2 Modul 2: Direktori Pendidik & Pencarian Presisi
- [ ] **Search & Filter Accuracy**: Filter berdasarkan keahlian (Tahsin, Fiqh, Bahasa Arab) dan metode (Online/Tatap Muka) menghasilkan data yang akurat < 200ms. — `[PARTIAL: search/filter DB-backed terverifikasi; SLA <200ms belum dibenchmark]`
- [ ] **Upstash Caching**: Request direktori publik di-cache oleh Upstash Redis untuk efisiensi kuota database. — `[CLOUD BLOCKED — DEFERRED]`
- [ ] **Sanad Silsilah View**: Tampilan profil pendidik menampilkan riwayat sanad keilmuan dan ijazah almamater secara jelas. — `[MVP VERIFIED]`

### 2.3 Modul 3: Sistem Verifikasi Kredensial 4-Lapis
- [ ] **Layer 1 (OCR KTP)**: Berkas KTP yang diunggah diproses oleh `tesseract.js` dan disimpan di *Supabase Private Storage Bucket*. — `[CLOUD BLOCKED — DEFERRED]`
- [ ] **Layer 2 (Digital Fingerprint Ijazah)**: Berkas PDF Ijazah dihitung hash SHA-256-nya dan berhasil mendeteksi indikasi duplikasi berkas. — `[PARTIAL: hash SHA-256 dihitung + divalidasi di submit API; deteksi duplikasi + private storage = CLOUD BLOCKED]`
- [ ] **Layer 3 (Token Rekomendasi)**: Email konfirmasi token otomatis terikirim via Resend/Brevo dan dapat dikonfirmasi satu-klik oleh ulama/ormas. — `[CLOUD BLOCKED — DEFERRED]`
- [ ] **Layer 4 (Ethical Score)**: Kalkulasi otomatis skor etika berdasarkan ulasan terverifikasi dan ketepatan respon. — `[PENDING: field ethicsScore diterima di review API (default 100); kalkulasi otomatis dari ulasan belum ada]`
- [ ] **Verified Badge Issuance**: Badge verifikasi berwarna emas muncul pada profil ustaz yang telah disetujui oleh Lajnah. — `[PENDING: issuance CredentialBadge saat transisi → VERIFIED belum diimplementasikan]`

### 2.4 Modul 4: Booking Inquiry & Virtual Economic Ledger
- [ ] **Multi-Step Booking**: Formulir reservasi bimbingan berjalan 3-langkah (Metode & Jadwal $\rightarrow$ Data Pembelajar $\rightarrow$ Konfirmasi). — `[MVP VERIFIED]`
- [ ] **Virtual Ledger Accrual**: Setiap inkuiri mencatat transaksi simulasi pada `economic_ledgers` (insentif poin `LearnerPoints` & komisi platform). — `[MVP VERIFIED]`
- [ ] **Pre-Wired Payment Adapter**: `MockPaymentGatewayAdapter` merespon transaksi simulasi dengan sukses dan siap diganti dengan API Key Midtrans/Xendit di kemudian hari. — `[MVP VERIFIED]`

### 2.5 Modul 5: Referral, Affiliate & Gamifikasi
- [ ] **Referral Code Generation**: Pengguna dapat membuat kode unik (`REF-USTADZ-123`). — `[DEFERRED]`
- [ ] **Conversion Tracking**: Pendaftaran pengguna baru melalui link referral secara otomatis menambah saldo poin perujuk. — `[DEFERRED]`
- [ ] **Leaderboard**: Papan peringkat ambassador menampilkan statistik perujuk terbanyak. — `[DEFERRED]`

### 2.6 Modul 6: Panel Management / Founder Dashboard
- [ ] **CMS Publishing**: Founder dapat menerbitkan dan mengedit artikel, FAQ, serta berita landing page. — `[DEFERRED]`
- [ ] **Taxonomy Engine**: Founder/Admin dapat menambah atau mengubah hirarki keilmuan, Mazhab, dan lokasi geografi. — `[DEFERRED]`
- [ ] **ERP Financial Oversight**: Dashboard menampilkan ringkasan pencatatan ledger internal dan statistik konversi pengguna. — `[DEFERRED]`

---

## 3. AUDIT PENCEGAHAN DEFECT & DEBT

1. **Zero Fake Data / Zero AI Slop**: Desain antarmuka bebas dari elemen polos generik.
2. **Free-Tier Limits Enforcement**: Seluruh integrasi dipastikan berada di bawah kuota gratis (Vercel 100GB, Supabase 500MB DB, Upstash 10k req/day).
3. **Typesafe End-to-End**: Seluruh kontrak API terintegrasi dengan validasi Zod tanpa adanya `any` tipe tak terdefinisi.
