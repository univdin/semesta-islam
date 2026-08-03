# LAPORAN EKSEKUSI DIREKTIF — POST-AUDIT EXECUTION REPORT

**Proyek / Project:** SEMESTA ISLAM
**Dokumen / Document:** `docs/implementation/POST_AUDIT_EXECUTION_REPORT.md`
**Tanggal / Date:** 2026-08-01
**Status:** `SELESAI / COMPLETED` — Direktif eksekusi pasca-audit telah dilaksanakan penuh dan terverifikasi
**Bahasa / Language:** Bilingual (Indonesia / English) — dokumen perencanaan sesuai arahan user

---

## 1. RINGKASAN EKSEKUTIF / EXECUTIVE SUMMARY

**ID:** Repositori SEMESTA ISLAM ditransformasi dari runtime *fixture/mock* menjadi aplikasi **data lokal nyata** (*real local-data application*) sesuai arahan *POST-AUDIT EXECUTION DIRECTIVE*: database PostgreSQL lokal (Docker) → migrasi Prisma → seed → layanan/API/UI berbasis database → pembersihan fixture → loop marketplace end-to-end yang berfungsi.

**EN:** The SEMESTA ISLAM repository was transformed from a *fixture/mock* runtime into a **real local-data application** per the POST-AUDIT EXECUTION DIRECTIVE: local PostgreSQL (Docker) → Prisma migration → seed → DB-backed services/APIs/UI → fixture cleanup → a working end-to-end marketplace loop.

| Metrik / Metric                   | Sebelum / Before                        | Sesudah / After                                                           |
| :----------------------------------| :----------------------------------------| :--------------------------------------------------------------------------|
| Persistensi / Persistence         | In-memory / hardcoded fixture           | PostgreSQL 16 (Docker) + Prisma                                           |
| Migrasi DB / DB migration         | Tidak ada / none                        | `prisma/migrations/20260801091332_init` (16 tabel data)                   |
| Seed / Seed data                  | —                                       | 7 user, 4 pendidik, 4 permintaan verifikasi, 2 booking, 2 ledger, 2 audit |
| Direktori pendidik / Directory    | `sampleEducators` statis                | `listEducatorSummaries()` dari DB (`force-dynamic`)                       |
| Detail pendidik / Educator detail | `mockEducatorDetails` + fallback edu-01 | `getEducatorDetail(id)` + `notFound()`                                    |
| Booking / Booking                 | `setTimeout` sukses palsu               | `POST /inquire` persist + `POST /confirm` + guard state                   |
| Verifikasi / Verification         | in-memory, ID `VR-${Date.now()}`        | persist `verification_requests` + AuditLog + GET status                   |
| UI Lajnah / Lajnah UI             | `mockRequests` local-state              | queue dari DB + review API dua-langkah                                    |
| Fixture / Fixtures                | `src/lib/dev/fixtures.ts`               | dihapus (zero konsumen)                                                   |
| Gate build / Build gate           | typecheck OK                            | typecheck OK + build OK + `npm test` 18/18                                |

---

## 2. MANDAT & BATASAN / MANDATE & CONSTRAINTS

**ID:** Eksekusi mengikuti *POST-AUDIT EXECUTION DIRECTIVE* (dokumen audit). Prinsip yang dipatuhi:

1. **Urutan batch:** `0 → DB FOUNDATION → 1 → 2 → 3 → 4 → 5`; tidak melompat ke Batch 5 selama loop marketplace masih mock-backed.
2. **Daftar NO-GO (§22):** tidak membuka ulang ontologi, tidak redesain skema, tidak CQRS/repository/event-sourcing, tidak SDK/OAuth/webhook/manajemen API-key, tidak mengganti UI/Prisma/validasi/state machine yang berfungsi.
3. **Keputusan TERTUTUP (CLOSED) dihormati:** SANAD ONTOLOGY, CREDENTIAL ONTOLOGY, VERIFICATION ONTOLOGY, QIRA'AT = SPECIALIZATION, MARKETPLACE = CURRENT VERTICAL, CROSS-DOMAIN CORE, OVER-ENGINEERING RISK CONTROLLED.
4. **Kredensial cloud diblokir** — Supabase/Upstash/Resend tidak boleh dipalsukan; runtime lokal PostgreSQL saja.
5. **Reuse sebelum build** — `stateMachine.ts`, `validations`, `mockAdapter`, `audit/service`, `ledger/service` dipakai ulang apa adanya.
6. **Perubahan minimal** — tugas bukan undangan redesain repositori.

**EN:** Execution followed the POST-AUDIT EXECUTION DIRECTIVE: batch order respected, NO-GO list honored, CLOSED ontology/architecture decisions respected, cloud credentials blocked (local PostgreSQL only), reuse-before-build enforced, minimal change only.

---

## 3. LINGKUNGAN & STACK / ENVIRONMENT & STACK

**ID:** Terverifikasi di awal sesi:

- **Docker** 29.6.2 (daemon aktif), port 5432 bebas sebelum compose start.
- **Node** v24.12.0, **npm** v11.16.0.
- **Stack aplikasi:** Next.js 15.1.3 (App Router), React 19, TypeScript 5.7, Tailwind CSS 3.4, Prisma 6.2.1, Zod 3.24.1, `lucide-react`, `vaul`, `framer-motion`, `tesseract.js`, `pdf-lib`.
- **Dependensi cloud yang TIDAK diwire:** `@supabase/ssr`, `@supabase/supabase-js`, `@upstash/ratelimit`, `@upstash/redis` (tetap terpasang, belum terhubung).
- **Test runner:** `vitest` ditambahkan sebagai devDependency + `vitest.config.ts` (alias `@/` → `src/`) + script `npm test` (sebelumnya tidak ada runner; suite offline ada namun tidak dapat dijalankan karena alias tidak ter-resolve).

**EN:** Verified at session start: Docker 29.6.2, Node v24.12.0, npm v11.16.0, Next.js 15.1.3, Prisma 6.2.1, Zod 3.24.1. Cloud SDKs remain installed but unwired. `vitest` added as the test runner (new devDependency, config, and `npm test` script) so the existing 18-assertion suite runs as a real gate.

---

## 4. SEBELUM vs SESUDAH / BEFORE vs AFTER

### 4.1 Pola arsitektur lama / Legacy pattern (fixture/mock)
```text
UI (page.tsx)
  └── hardcoded const / local useState      ← data palsu inline
API route (/api/v1/...)
  ├── validasi Zod → proses in-memory
  ├── ID sintetis: 'VR-1001', 'edu-01', '00000000-...-001'
  └── tanpa persist, tanpa audit trail nyata
```

### 4.2 Pola arsitektur baru / New pattern (DB-backed)
```text
UI (page.tsx)  ──(server component)──▶  src/lib/*/service.ts
                                              └── prisma (src/lib/db.ts singleton)
                                                        └── PostgreSQL (Docker) + Prisma Client

UI (client)    ──fetch──▶  /api/v1/...  → validasi Zod → service → DB + AuditLog
```

**ID:** Layanan (`src/lib/*/service.ts`) adalah satu-satunya pintu ke database; route API memvalidasi dengan Zod lalu memanggil layanan; `AuditLog` ditulis untuk setiap aksi state-changing (dengan `entityId` + snapshot status di kolom JSON `metadata`, karena model `AuditLog` kanonik tidak memiliki kolom `entity_id`).

**EN:** Services are the single gateway to the database; API routes validate with Zod then call services; every state-changing action writes an `AuditLog` (`entityId` and status snapshots stored in the JSON `metadata` column since the canonical `AuditLog` model has no dedicated `entity_id` field).

---

## 5. WALKTHROUGH TEKNIS PER FASE / TECHNICAL WALKTHROUGH BY PHASE

### PHASE 1 — Database Foundation (PostgreSQL lokal)

**File:** `docker-compose.yml` (baru), `prisma/migrations/20260801091332_init/migration.sql`, `prisma/seed.js` (baru), `package.json` (`prisma.seed`).

1. `docker compose up -d db` → container `semestaislam-db` (postgres:16-alpine), volume `semestaislam_pgdata`, healthcheck `pg_isready` → status `Up (healthy)`.
2. `npx prisma migrate dev --name init` → migrasi pertama diterapkan: 16 tabel data + `_prisma_migrations`; Prisma Client digenerate.
3. `.env` / `.env.local` sudah menunjuk `postgresql://postgres:placeholder@localhost:5432/semestaislam?schema=public` (tidak diubah).
4. `prisma/seed.js`: data deterministik dengan UUID tetap (peta `ID`), mis. learner `10000000-0000-0000-0000-000000000001`, educator `30000000-0000-0000-0000-0000000001xx`, verification request `90000000-0000-0000-0000-0000000001xx`. Dijalankan via `"prisma": { "seed": "node prisma/seed.js" }`.
   - Hasil: `users 7`, `educator_profiles 4`, `verification_requests 4`, `booking_requests 2`, `economic_ledgers 2`, `audit_logs 2`.

**Catatan operasional:** Setelah seed, daemon Docker sempat berhenti (container exit 0) — container di-restart dan seed dijalankan ulang. Percobaan pertama gagal karena Prisma `Unknown argument 'entityId'` pada audit log → diperbaiki dengan menyimpan `entityId` di dalam `metadata`.

### PHASE 2 — Data Access Layer

**File baru:** `src/lib/db.ts`, `src/lib/educators/service.ts`, `src/lib/bookings/service.ts`, `src/lib/verification/service.ts`; **diperluas:** `src/lib/audit/service.ts`.

- `db.ts`: singleton `PrismaClient` (pola `globalThis`) untuk menghindari koneksi berlebih saat hot-reload.
- `educators/service.ts`: `educatorInclude` (user.profile + courses), `EDUCATOR_METHOD_LABELS`, `toEducatorSummary`, `listEducatorSummaries({ take? })`, `getEducatorSummary(id)`, `getEducatorDetail(id)` (menambah sanadRecords.chainDescription, courses `{id,title,category}`, badges, status verifikasi terbaru).
- `bookings/service.ts`:
  - `createBookingInquiry({ ...payload, learnerUserId })` — cek pendidik ada (404 bila tidak); `$transaction`: buat `BookingRequest` (PENDING, notes memuat nama/kontak/jadwal) + `EconomicLedger` `LEARNER_POINT` (50) + `AuditLog` `BOOKING_INQUIRED`; `learnerUserId` tidak ada di kontrak kanonik §2.6 sehingga di-resolve di sisi server.
  - `confirmBooking({ bookingId, actorUserId, actorRoles })` — 404 bila tak ada; 409 bila status ≠ PENDING; 403 bila aktor bukan pemilik educator/`FOUNDER_ADMIN`; transisi → CONFIRMED + AuditLog `BOOKING_CONFIRMED`.
- `verification/service.ts`:
  - `submitVerificationRequest` — cek pendidik + deteksi permintaan aktif (SUBMITTED/UNDER_REVIEW_LAJNAH → 409); buat `VerificationRequest` + set `verifiedStatus` pendidik = SUBMITTED + AuditLog `VERIFICATION_SUBMITTED` (ktpNumber/institusi disimpan di metadata).
  - `reviewVerificationRequest` — gate peran (`isAuthorizedVerifierRole` → 403), gate transisi (`isValidVerificationTransition` → 409), verifikasi status DB aktual (bukan dari payload → 409 bila mismatch), update request + `verifiedStatus` pendidik + AuditLog `VERIFICATION_REVIEWED`.
  - `resubmitVerificationRequest` — hanya dari REJECTED/REVOKED → SUBMITTED; update + AuditLog `VERIFICATION_RESUBMITTED`.
  - `listVerificationQueue()` dan `getVerificationStatus(educatorId)` — untuk UI Lajnah dan portal pendidik.
- `audit/service.ts`: `createAuditEvent` (murni, untuk tes offline) **tetap**; ditambah `persistAuditEvent` yang memakai import prisma lazy dan menyimpan `entityId`/snapshot di `metadata`.

### PHASE 3 — Discovery Pages (DB-backed)

**File diubah:** `src/app/page.tsx`, `src/app/directory/page.tsx` (+ `DirectoryClient.tsx` baru), `src/app/educator/[id]/page.tsx`.

- **Home** `/`: `sampleEducators` (hardcoded) diganti `listEducatorSummaries({ take: 3 })`.
- **Direktori** `/directory`: menjadi server component `export const dynamic = 'force-dynamic'` membaca `listEducatorSummaries()`; UI filter/pencarian dipindah ke `DirectoryClient.tsx` (client component menerima `educators` sebagai prop).
- **Profil pendidik** `/educator/[id]`: baca `getEducatorDetail(id)`; bila tidak ditemukan → `notFound()` (sebelumnya fallback senyap ke edu-01); badge status verifikasi nyata (VERIFIED → "Pendidik Terverifikasi Lajnah"; selain itu label status).

### PHASE 4 — Booking Inquiry (Route + UI)

**File diubah:** `src/app/api/v1/bookings/inquire/route.ts`, `src/app/booking/page.tsx`.

- Route: validasi Zod → `createBookingInquiry` (persist) → `MockPaymentGatewayAdapter.createInvoice` tetap diwire sebagai adapter pra-konfigurasi → respons envelope standar `{success, statusCode, message, data}` dengan `bookingId` UUID nyata.
- Halaman booking: `setTimeout` sukses palsu dihapus; `handleSubmit` kini `fetch` POST ke `/api/v1/bookings/inquire`; `educatorId` diambil dari query string `?educatorId=` (fallback seed educator `30000000-...-0001`); error ditampilkan dari `body.message`.

### PHASE 5 — Verification Persistence

**File diubah:** `submit/review/resubmit/route.ts`; **baru:** `status/route.ts` (GET).

- `POST /verification/submit` → `submitVerificationRequest` → 201 dengan `verificationRequestId` UUID.
- `POST /verification/review` → `reviewVerificationRequest` (peran + transisi + konsistensi status DB) → 200.
- `POST /verification/resubmit` → `resubmitVerificationRequest`; `verificationRequestId` kini wajib (400 bila kosong).
- `GET /verification/status?educatorId=...` → endpoint kanonik §2.5 yang sebelumnya tidak ada → status terbaru.

### PHASE 6 — Booking Confirmation Endpoint

**File baru:** `src/app/api/v1/bookings/confirm/route.ts`.

- `POST /bookings/confirm` dengan `{bookingId, actorUserId, actorRoles}` → `confirmBooking`. Peristiwa domain `booking.confirmed` (PRD §450, WEBHOOK_CONTRACT) — dokumen 07 tidak mencantumkan endpoint ini; penambahan minimal dan dibenarkan oleh DoD ("booking inquire+confirmation persist").

### PHASE 7 — Lajnah UI (queue nyata + review API dua-langkah)

**File:** `src/app/management/lajnah/page.tsx` (server component) + `LajnahClient.tsx` (baru).

- Queue dibaca dari `listVerificationQueue()` (DB, diurutkan `createdAt desc`).
- Alur **dua-langkah sesuai state machine** `SUBMITTED → UNDER_REVIEW_LAJNAH → VERIFIED/REJECTED`:
  - item `SUBMITTED` → tombol **"Mulai Telaah (Under Review)"** (target `UNDER_REVIEW_LAJNAH`);
  - item `UNDER_REVIEW_LAJNAH` → tombol **Disetujui (Verified)** / **Tolak Permohonan**.
- Aksi memanggil `/api/v1/verification/review` dengan identitas verifier seeded `10000000-0000-0000-0000-000000000501` (`LAJNAH_VERIFIER`), lalu `router.refresh()`.

### PHASE 8 — Educator Verification Portal (API nyata)

**File diubah:** `src/app/educator/verification/page.tsx`.

- Client component memuat status via `GET /api/v1/verification/status?educatorId=30000000-...-0101` (demo).
- Menampilkan status, fingerprint SHA-256, email rekomendasi, catatan Lajnah, waktu pengajuan/pembaruan.
- Saat status `REJECTED`/`REVOKED`: form **"Kirim Ulang Berkas"** → `POST /verification/resubmit` → refresh status.

### PHASE 9 — Fixture Cleanup

**ID:** `src/lib/dev/fixtures.ts` adalah satu-satunya file fixture yang tersisa; satu-satunya konsumennya `DemoRoleSwitcher.tsx` (`DEMO_USERS`). Data demo dipindah inline ke `DemoRoleSwitcher.tsx` dengan **UUID user seeded nyata** (learner `...-001`, educator `...-101`, Lajnah `...-501`, founder `...-601`), lalu `src/lib/dev/` dihapus. Tidak ada konsumen fixture yang tersisa (diverifikasi via grep).

**EN:** The last fixture module `src/lib/dev/fixtures.ts` was removed only after its sole consumer (`DemoRoleSwitcher`) was de-fixed: demo identities were inlined with the real seeded user UUIDs, then the directory was deleted (zero remaining consumers, verified by grep).

---

## 6. INVENTORI FILE / FILE INVENTORY

### Baru / Created
| File | Peran / Role |
| :--- | :--- |
| `docker-compose.yml` | PostgreSQL 16 lokal (volume + healthcheck) |
| `prisma/migrations/20260801091332_init/migration.sql` | Migrasi pertama (16 tabel) |
| `prisma/seed.js` | Seed deterministik (UUID tetap) |
| `src/lib/db.ts` | PrismaClient singleton |
| `src/lib/educators/service.ts` | Discovery + detail pendidik (DB) |
| `src/lib/bookings/service.ts` | Booking inquiry + confirm (transaksi + ledger + audit) |
| `src/lib/verification/service.ts` | Verifikasi: submit/review/resubmit/queue/status |
| `src/app/directory/DirectoryClient.tsx` | Filter UI direktori (client) |
| `src/app/management/lajnah/LajnahClient.tsx` | Queue + review dua-langkah (client) |
| `src/app/api/v1/bookings/confirm/route.ts` | `POST /bookings/confirm` |
| `src/app/api/v1/verification/status/route.ts` | `GET /verification/status` |
| `vitest.config.ts` | Alias `@/` + runner config |

### Diubah / Modified
| File | Perubahan / Change |
| :--- | :--- |
| `src/lib/audit/service.ts` | + `persistAuditEvent` |
| `src/app/page.tsx` | home baca DB (top 3) |
| `src/app/directory/page.tsx` | server component DB-backed |
| `src/app/educator/[id]/page.tsx` | DB + `notFound()` |
| `src/app/booking/page.tsx` | POST nyata ke inquire |
| `src/app/api/v1/bookings/inquire/route.ts` | persist via service |
| `src/app/api/v1/verification/{submit,review,resubmit}/route.ts` | persist via service |
| `src/app/management/lajnah/page.tsx` | server component baca queue |
| `src/app/educator/verification/page.tsx` | API nyata + form resubmit |
| `src/components/dev/DemoRoleSwitcher.tsx` | demo user inline (UUID seeded) |
| `package.json` | `prisma.seed`, script `test`, devDep `vitest` |
| `docs/audit/IMPLEMENTATION_EVIDENCE.md` | baris bukti 13–20 + status |
| `docs/audit/IMPLEMENTATION_READINESS.md` | banner status pasca-direktif |

### Dihapus / Deleted
| File | Alasan / Reason |
| :--- | :--- |
| `src/lib/dev/fixtures.ts` (+ `src/lib/dev/`) | Zero konsumen setelah DemoRoleSwitcher di-de-fixture |

---

## 7. KONTRAK API / API CONTRACT

### Endpoint yang dipersistenkan / Made persistent
| Endpoint | Perilaku / Behavior |
| :--- | :--- |
| `POST /api/v1/bookings/inquire` | 201 + `bookingId` UUID; tulis BookingRequest + EconomicLedger(50 LEARNER_POINT) + AuditLog |
| `POST /api/v1/bookings/confirm` | 200; 403 (bukan owner/founder); 404; 409 (status ≠ PENDING) |
| `POST /api/v1/verification/submit` | 201 + `verificationRequestId` UUID; 409 (ada permintaan aktif) |
| `POST /api/v1/verification/review` | 200; 403 (peran); 409 (transisi ilegal / status DB mismatch) |
| `POST /api/v1/verification/resubmit` | 200; 400 (tanpa `verificationRequestId`); 409 (asal ≠ REJECTED/REVOKED) |
| `GET /api/v1/verification/status?educatorId=` | 200 + status terbaru; 404 (belum ada permintaan); 400 (UUID tak valid) |

### Envelope respons (dipatuhi) / Response envelope (honored)
```json
{ "success": true, "statusCode": 201, "message": "...", "data": { ... } }
```

**ID:** `learnerUserId` sengaja tidak ditambahkan ke payload kanonik `BookingInquirySchema` (kontrak §2.6) — identitas learner demo di-resolve di sisi server (`10000000-0000-0000-0000-000000000001`) hingga auth nyata tersedia. `getVerificationStatus` juga mengekspos `layer1KtpUrl`/`layer2IjazahUrl` untuk prapengisian form resubmit.

**EN:** `learnerUserId` is intentionally not added to the canonical `BookingInquirySchema` — the demo learner identity is resolved server-side until real auth exists. `getVerificationStatus` also exposes layer URLs for resubmit-form prefill.

---

## 8. VERIFIKASI RUNTIME / RUNTIME VERIFICATION (E2E)

Semua dijalankan terhadap `next start` (production build) + container PostgreSQL. Bukti lengkap di `docs/audit/IMPLEMENTATION_EVIDENCE.md` baris 13–20.

### 8.1 Discovery
```text
GET /directory            →  Ustadzah Fatimah Azzahra / Ustadz DR. Ahmad / Ustadz Abdullah Hasibuan (dari DB)
GET /educator/30000000-...-0101 →  detail nyata + "Silsilah Keilmuan"
GET /                     →  top 3 pendidik dari DB
GET /educator/30000000-...-0401 →  "Pendidik Terverifikasi Lajnah" (edu-04 VERIFIED)
```

### 8.2 Booking loop
```text
POST /api/v1/bookings/inquire
  → 201 {"bookingId":"a95f67e5-22e0-49cd-920c-f6f3fdc189a1","ledgerPointsEarned":50,"invoiceStatus":"PAID"}
POST /api/v1/bookings/confirm (actor = owner educator)
  → 200 {"bookingId":...,"status":"CONFIRMED"}
POST /api/v1/bookings/confirm (lagi)
  → 409 "Conflict: Booking cannot be confirmed from status CONFIRMED"
```

### 8.3 Verification pipeline
```text
GET  /api/v1/verification/status?educatorId=...-0101 → 200 SUBMITTED (dari seed)
POST /api/v1/verification/review (LAJNAH_VERIFIER) SUBMITTED→UNDER_REVIEW_LAJNAH → 200
POST /api/v1/verification/review (LAJNAH_VERIFIER) UNDER_REVIEW_LAJNAH→VERIFIED → 200
POST /api/v1/verification/review (role LEARNER)           → 403 Forbidden
POST /api/v1/verification/review SUBMITTED→VERIFIED (langsung) → 409 (state machine)
POST /api/v1/verification/submit (pendidik tanpa permintaan aktif) → 201 (UUID baru)
POST /api/v1/verification/resubmit REJECTED→SUBMITTED     → 200
GET  /management/lajnah   → queue DB: 2×SUBMITTED, 1×UNDER REVIEW, 2×VERIFIED
```

### 8.4 Bukti persistensi (PostgreSQL)
```text
users                | 7
educator_profiles    | 4
verification_requests| 5   (4 seed + 1 submit runtime)
booking_requests     | 3   (2 seed + 1 inquiry runtime)
economic_ledgers     | 3   (2 seed + 1 LEARNER_POINT runtime)
audit_logs           | 8   (2 seed + 6 runtime)
```
Aksi audit terpersist: `BOOKING_INQUIRED`, `BOOKING_CONFIRMED`, `VERIFICATION_SUBMITTED`×2, `VERIFICATION_REVIEWED`×2, `VERIFICATION_RESUBMITTED`, `VERIFICATION_VERIFIED`.

### 8.5 UI Lajnah (build produksi)
```text
2 × "Mulai Telaah (Under Review)"   ← item SUBMITTED
1 × "Disetujui (Verified)" + 1 × "Tolak Permohonan"  ← item UNDER_REVIEW_LAJNAH
```

**ID (pelajaran operasional):** pada pengujian awal, hasil HTML Lajnah terlihat "basi". Penyebabnya **bukan** kode, melainkan server `next dev` lama yang masih menempati port 3000 (`EADDRINUSE`); `npm start` gagal bind dan curl mengenai server lama. Setelah seluruh server dimatikan (`pkill` + verifikasi `lsof`), build produksi bersih menyajikan perilaku dua-langkah yang benar. Verifikasi runtime harus selalu mengecek siapa yang benar-benar melayani port.

---

## 9. GATE KUALITAS / QUALITY GATES

| Gate | Perintah / Command | Hasil / Result |
| :--- | :--- | :--- |
| Typecheck | `npm run typecheck` | `tsc --noEmit` — 0 error |
| Test | `npm test` | vitest — **18/18 passed** |
| Build | `npm run build` | compiled + 12/12 halaman statis |
| Prisma | `prisma migrate dev` + seed | migrasi terapkan, seed sukses |
| Lint | `npm run lint` | **TIDAK dapat dijalankan non-interaktif** (lihat §10) |

---

## 10. KETERBATASAN & KEPUTUSAN / KNOWN LIMITATIONS & DECISIONS

1. **Lint gate tidak tersedia:** repositori tidak memiliki konfigurasi ESLint apa pun (kondisi pre-existing); `next lint` meminta setup interaktif. Tidak diinisialisasi untuk menghindari scope expansion — **BUSINESS/IMPL DECISION**: inisialisasi ESLint dapat dilakukan pada milestone berikutnya bila disetujui.
2. **Auth nyata belum ada:** identitas learner/verifier demo di-resolve server-side dari user seeded. Integrasi Supabase Auth tetap *deferred* (kredensial cloud diblokir oleh direktif).
3. **Home page statis:** `/` dibake saat build (membaca DB pada waktu build). Direktori & profil pendidik bersifat `force-dynamic` (membaca DB per request).
4. **Endpoint `confirm` baru:** tidak tercantum di `docs/07_API_ENDPOINTS.md`; ditambahkan minimal karena DoD dan didukung peristiwa domain `booking.confirmed` (PRD §450). Pertimbangkan menambahkannya ke dokumen 07 pada pembaruan kontrak berikutnya.
5. **`ktpNumber` / `recommenderInstitution`** tidak memiliki kolom di `verification_requests`; disimpan di `audit_logs.metadata` (tidak ada perubahan skema, sesuai NO-GO).
6. **Vitest ditambahkan** sebagai devDependency baru (dev-only, tanpa perubahan runtime) untuk menegakkan gate "+ tests" dalam DoD.
7. **Fixture dihapus** hanya setelah zero konsumen terverifikasi via grep.
8. **State machine dua-langkah** (`SUBMITTED → UNDER_REVIEW_LAJNAH → VERIFIED/REJECTED`) adalah perilaku kanonik yang sudah ada dan kini benar-benar ditegakkan end-to-end (route + UI).

---

## 11. CARA MENJALANKAN / HOW TO RUN (WALKTHROUGH SETUP)

**ID:** Panduan reproduksi dari nol.

```bash
# 1) Start PostgreSQL lokal
docker compose up -d db
docker compose ps          # semestaislam-db → healthy

# 2) Migrasi + seed (hanya jika DB kosong / ingin reset)
npx prisma migrate deploy
npx prisma generate
node prisma/seed.js        # atau: npx prisma db seed

# 3) Jalankan aplikasi
npm run dev                # http://localhost:3000

# 4) Gate (opsional)
npm run typecheck
npm test
npm run build
```

**Walkthrough pengguna (browser):**
1. **Discover** — buka `/directory`, filter/kata kunci; buka `/educator/{uuid}` (badge verifikasi nyata).
2. **Book** — dari profil pendidik klik "Ajukan Sesi Belajar" (`/booking?educatorId=...`), isi formulir → sukses nyata (poin 50 ke ledger virtual).
3. **Confirm** — `POST /api/v1/bookings/confirm` (aktor = owner educator atau founder).
4. **Verify** — buka `/educator/verification` (status API nyata); bila REJECTED, kirim ulang via form.
5. **Lajnah** — buka `/management/lajnah`: item SUBMITTED → "Mulai Telaah", lalu Disetujui/Tolak. Status pendidik ikut berubah.

**Walkthrough teknis (curl):** contoh lengkap sudah ada di §8 (inquiry → confirm → review dua-langkah → submit → resubmit → status).

---

## 12. ROADMAP BERIKUTNYA / NEXT STEPS

**ID:** Item yang belum dieksekusi karena sengaja di luar cakupan direktif ini, atau menunggu keputusan/business approval:

1. **Batch 5 — Developer Surface** (`/developer` MVP, read-only) — hanya setelah loop marketplace fully DB-backed (kondisi sekarang sudah terpenuhi).
2. **Auth nyata** (Supabase Magic Link + RBAC) — memerlukan kredensial cloud (keputusan lingkungan).
3. **LMS / progress report & attendance** serta dashboard Learner/Educator penuh (Batch 3).
4. **Webhook `booking.confirmed` / `educator.verified`** — memerlukan keputusan (NO-GO saat ini).
5. **Inisialisasi ESLint** agar gate `npm run lint` dapat berjalan.
6. **Dokumentasi kontrak**: tambahkan `/bookings/confirm` ke `docs/07_API_ENDPOINTS.md`.
7. **Taxonomy / Sanad tree UI** dan fitur manajemen founder (CMS/ERP/RBAC).

**EN:** Remaining items are intentionally out of this directive's scope or awaiting decisions: Batch 5 developer surface (now unblocked), real auth (needs cloud credentials), full dashboards/LMS, webhooks (currently NO-GO), ESLint init, and updating `07_API_ENDPOINTS.md` with the new confirm endpoint.

---

## 13. STATUS FINAL / FINAL STATUS

```text
Directive:   POST-AUDIT EXECUTION DIRECTIVE
Status:      SELESAI / COMPLETED
Gates:       typecheck 0 error · build OK · vitest 18/18
Persistence: real local PostgreSQL (Docker) — VERIFIED (rows 13–20, IMPLEMENTATION_EVIDENCE.md)
Scope:       NO-GO list honored · CLOSED decisions respected · minimal change
Open items:  lint gate (unconfigured) · auth nyata (blocked: cloud credentials)
```

**Dokumen terkait / Related docs:** `docs/audit/IMPLEMENTATION_EVIDENCE.md` · `docs/audit/IMPLEMENTATION_READINESS.md` · `docs/implementation/PRODUCT_IMPLEMENTATION_PLAN.md` · `docs/03_ERD.md` · `docs/07_API_ENDPOINTS.md`
