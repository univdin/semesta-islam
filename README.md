# SEMESTA ISLAM — Platform Ekosistem Pembelajaran Islam Terpercaya

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%206-blue.svg)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.7-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20111%2F111%20Passing-brightgreen.svg)]()
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-blue.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SEMESTA ISLAM** adalah platform ekosistem digital terpercaya yang dirancang untuk menghubungkan murid, keluarga, pendidik (*asatizah*), dan lembaga pendidikan Islam dalam lingkungan belajar yang transparan, terstruktur, dan terverifikasi (*Sanad-backed*).

---

## 💡 Nilai Utama & Pemangku Kepentingan (Stakeholders)

### 👨‍👩‍👧‍👦 Untuk Pelajar & Keluarga (B2C Marketplace)
- **Pencarian Terarah**: Menemukan pendidik Al-Qur'an, Tahsin, Fiqh, Bahasa Arab, dan Aqidah sesuai minat, lokasi, dan metode belajar (1-on-1, privat, kelompok).
- **Kepercayaan & Keamanan**: Transparansi latar belakang pendidikan, ijazah, serta silsilah sanad keilmuan yang telah diverifikasi oleh Lajnah.
- **Pemesanan Sesi Mudah**: Mengajukan jadwal dan program pembelajaran secara praktis.

### 👨‍🏫 Untuk Pendidik & Lembaga Pendidikan
- **Wadah Profesional**: Mempublikasikan profil, program pengajaran, kredensial, dan sanad keilmuan secara terstruktur.
- **Badge Verifikasi Resmi**: Memperoleh kredensial terverifikasi dari Dewan Verifikasi (Lajnah) untuk meningkatkan kepercayaan publik.
- **Manajemen Pembelajaran**: Mengelola permintaan sesi, jadwal mengajar, dan peserta didik secara efisien.

### 💰 Untuk Investor, Donatur, & Mitra Dampak Sosial
- **Dampak Sosial Berkelanjutan**: Memberdayakan ekonomi pendidik Islam dan memperluas akses pendidikan berbasis sanad yang terverifikasi di Indonesia.
- **Transparansi & Akuntabilitas**: Infrastruktur data terstruktur (*Prisma + PostgreSQL*) dengan *Audit Trail* penuh untuk melacak dampak dan pencapaian pembelajaran.
- **Potensi Scalability**: Berawal dari Marketplace B2C, platform ini dirancang modular sehingga berpotensi berkembang menjadi Infrastruktur API Verifikasi (*Verification API Infrastructure*) bagi institusi dan aplikasi mitra di masa depan.

---

## 🏛️ Arsitektur Produk & Layanan

Platform memfasilitasi alur hubungan end-to-end:

```text
  ┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
  │   PENEMUAN      │ ───▶  │ VERIFIKASI & SANAD   │ ───▶  │  PEMESANAN SESI │
  │   (/directory)  │       │   (/educator/[id])   │       │    (/booking)   │
  └─────────────────┘       └──────────────────────┘       └─────────────────┘
                                                                    │
                                                                    ▼
  ┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
  │ LAPORAN PROGRES │ ◄───  │    PELAKSANAAN       │ ◄───  │ STATUS CONFIRM  │
  │  (Management)   │       │    PEMBELAJARAN      │       │   (Educator)    │
  └─────────────────┘       └──────────────────────┘       └─────────────────┘
```

---

## 🛠️ Spesifikasi Teknologi (Tech Stack)

| Komponen                  | Teknologi                            | Keterangan                            |
| :--------------------------| :-------------------------------------| :--------------------------------------|
| **Frontend & App Router** | Next.js 15.1 (App Router) + React 19 | Server Components & Client Hooks      |
| **Bahasa & Validasi**     | TypeScript 5.7 + Zod 3.24            | Dual-layer validation (Form & API)    |
| **Styling & UI**          | Vanilla CSS + Tailwind CSS 3.4       | Responsif, modern, tanpa *AI-slop*    |
| **Persistensi Data**      | PostgreSQL 16 + Prisma 6.2 ORM       | 16 tabel relational terstruktur       |
| **Container & DB Local**  | Docker & Docker Compose              | DB lokal terisolasi & seed otomatis   |
| **Pengujian (Testing)**   | Vitest Test Runner                   | Automated unit/integration test suite |

---

## 🚀 Menjalankan Aplikasi di Localhost (Getting Started)

### Prasyarat
- **Node.js** v18+ atau v20+
- **npm** v9+
- **Docker Desktop** (daemon aktif)

### Langkah Installasi & Pengoperasian

1. **Clone Repositori & Install Dependensi**:
   ```bash
   git clone https://github.com/univdin/semesta-islam.git
   cd semesta-islam
   npm install
   ```

2. **Siapkan Environment Variables**:
   ```bash
   cp .env.local.example .env.local
   # Isi nilai placeholder sesuai layanan Anda (Supabase, Upstash, Resend)
   ```

3. **Jalankan Database PostgreSQL Lokal via Docker**:
   ```bash
   docker compose up -d db
   ```

4. **Jalankan Migrasi Database & Seeding Data**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

6. **Menjalankan Pengujian & Verifikasi Tipe Data**:
   ```bash
   # Verifikasi tipe TypeScript
   npm run typecheck

   # Menjalankan test suite otomatis
   npm test

   # Menjalankan pengujian build produksi
   npm run build
   ```

---

## ☁️ Deploy & Infrastruktur

- **Hosting**: Vercel (Hobby / free tier) — auto-deploy dari branch `main`.
- **Database**: Supabase PostgreSQL 16 (free tier) — koneksi via `DATABASE_URL` (pooler) + `DIRECT_URL` (migrasi).
- **Auth**: Supabase Auth (magic link / email) — diaktifkan saat `APP_ENV=production`.
- **CI/CD**: GitHub Actions (`npm run lint` → `typecheck` → `npm test`) dengan PostgreSQL service.
- **Keep-alive & Backup**: Workflow otomatis GitHub Actions untuk mencegah Supabase pause & backup DB berkala.

> Semua kredensial di set via environment variables di Vercel — **jangan pernah commit `.env*`**.

---

## 📚 Tata Kelola & Dokumentasi Proyek

Repositori ini dikelola secara ketat berbasis dokumentasi terstruktur (*Documentation-Driven Development*):

- 📄 **[Indeks Dokumentasi Utama (`docs/README.md`)](docs/README.md)** — Panduan lengkap seluruh dokumen spesifikasi dan audit.
- 📘 **Spesifikasi Bisnis & Produk**:
  - `docs/00_BRD.md` — Business Requirements Document
  - `docs/01_BSD.md` — Business & System Definition
  - `docs/02_PRD.md` | `docs/03_ERD.md` — Product Specs & Relational Data Model
- 📊 **Audit & Eksekusi Terkini**:
  - `docs/audit/FUNDAMENTAL_DOCS_AUDIT.md` — Audit menyeluruh keselarasan spesifikasi dan kode.
  - `docs/implementation/POST_AUDIT_EXECUTION_REPORT.md` — Laporan migrasi database & realitas runtime.

---

## 📄 Lisensi & Hak Cipta

Proyek ini dilindungi di bawah **[MIT License](LICENSE)**. Bebas dikembangkan, dipelajari, dan dikontribusikan oleh komunitas terbuka.

