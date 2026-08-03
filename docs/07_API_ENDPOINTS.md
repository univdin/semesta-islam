# 07 — API & ENDPOINT CONTRACT SPECIFICATION

**Document:** `07_API_ENDPOINTS.md`  
**Status:** Canonical API Reference  
**Audience:** Backend Engineers · Frontend Engineers · AI Agents  
**Authority:** Governed by `01_BSD.md`, `02_PRD.md`, `03_ERD.md`, `05_MASTER_CONTEXT.md`

---

## 1. API ARCHITECTURE & GENERAL CONTRACTS

Seluruh API route pada SEMESTA ISLAM dibangun di atas **Next.js App Router API Routes (`/app/api/v1/...`)** dengan validasi **Zod Schemas** dan proteksi **Supabase Auth RBAC**.

### 1.1 Standard Response Payload Structure
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 128
  }
}
```

### 1.2 Standard Error Response Payload
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Validation failed for request parameters",
  "details": [
    {
      "field": "phone",
      "issue": "Invalid phone format. Must start with +62 or 08"
    }
  ]
}
```

---

## 2. CANONICAL ENDPOINT MAP

### 2.1 Authentication & Session (`/api/v1/auth`)
| Method | Endpoint | Description | Scope / Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/magic-link` | Mengirimkan Magic Link via Supabase Auth | Public |
| `POST` | `/api/v1/auth/verify-session` | Verifikasi token sesi & mengambil data role | Authenticated |
| `POST` | `/api/v1/auth/logout` | Mengakhiri sesi pengguna | Authenticated |

### 2.2 Member Dashboard (`/api/v1/member`)
| Method | Endpoint | Description | Scope / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/member/dashboard` | Mengambil data agregat (Jadwal, Point Ledger, Referral) | Authenticated (Learner/Edu/Inst) |
| `GET` | `/api/v1/member/progress-reports` | Mengambil Laporan Perkembangan Rabbani anak | Authenticated (Learner/Guardian) |

### 2.3 Educator Directory & Sanad (`/api/v1/educators`)
| Method | Endpoint | Description | Scope / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/educators` | Pencarian & filter presisi direktori pendidik | Public (Upstash Cached) |
| `GET` | `/api/v1/educators/:id` | Detail profil pendidik, silsilah sanad, & ulasan | Public |
| `GET` | `/api/v1/educators/:id/reviews` | Mengambil daftar ulasan terverifikasi | Public |

### 2.4 LMS & Learning Engine (`/api/v1/courses` & `/api/v1/lms`)
| Method | Endpoint | Description | Scope / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/courses` | Katalog program belajar & kurikulum | Public |
| `POST` | `/api/v1/courses` | Membuat kurikulum/modul materi baru | Educator / Institution |
| `POST` | `/api/v1/lms/attendance` | Catat presisi presensi sesi mengajar | Educator |
| `POST` | `/api/v1/lms/progress-report` | Buat laporan perkembangan hafalan/talaqqi | Educator |
| `GET` | `/api/v1/lms/external-sso` | SSO Token ke LearnHouse / Moodle LMS | Authenticated Member |

### 2.5 Verification Pipeline (`/api/v1/verification`)
| Method | Endpoint | Description | Scope / Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/verification/submit` | Upload berkas KTP OCR (`tesseract.js`) & Ijazah PDF | Educator / Institution |
| `GET` | `/api/v1/verification/status` | Cek status antrean verifikasi 4-Lapis | Educator / Institution |
| `POST` | `/api/v1/verification/review` | Telaah Lajnah: transisi state machine + guard peran (identity & role diresolusi server-side dari session) | Lajnah Verifier / Founder Admin |
| `POST` | `/api/v1/verification/resubmit` | Ajukan ulang verifikasi setelah ditolak | Educator / Institution |
| `POST` | `/api/v1/verification/confirm-token` | Verifikasi rekomendasi token ulama via email | Public (Token-bound) |

### 2.6 Booking Inquiry & Virtual Ledger (`/api/v1/bookings`)
| Method | Endpoint | Description | Scope / Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/bookings/inquire` | Pengajuan multi-step booking & alokasi poin | Authenticated Learner |
| `POST` | `/api/v1/bookings/confirm` | Konfirmasi booking pending (guard pemilik/founder) | Booking Owner / Founder |
| `GET` | `/api/v1/bookings/ledger` | Riwayat pencatatan buku besar internal | Authenticated Learner |

### 2.7 Referral & Gamification (`/api/v1/referrals`)
| Method | Endpoint                          | Description                                | Scope / Access       |
| :-------| :----------------------------------| :-------------------------------------------| :---------------------|
| `POST` | `/api/v1/referrals/generate-code` | Membuat kode/link referral baru            | Authenticated Member |
| `GET`  | `/api/v1/referrals/stats`         | Statistik klik, konversi, & komisi virtual | Authenticated Member |
| `GET`  | `/api/v1/referrals/leaderboard`   | Papan peringkat ambassador terbanyak       | Public               |

### 2.8 Founder & Management Dashboard (`/api/v1/management`)
| Method | Endpoint | Description | Scope / Access |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/api/v1/management/cms/articles` | Manajemen konten artikel & landing page | Founder / CMS Admin |
| `GET` | `/api/v1/management/erp/ledger-summary` | Pengawasan pembukuan ledger & fee platform | Founder / Finance |
| `GET/PUT` | `/api/v1/management/rbac/roles` | Manajemen matriks hak akses user | Founder Admin |
| `GET/POST` | `/api/v1/management/verification/queue` | Queue audit 4-lapis Lajnah & approval badge | Lajnah Verifier / Founder |
| `GET/POST` | `/api/v1/management/taxonomy` | Tata kelola hirarki kategori, Mazhab, Sanad Tree | Founder / Admin |

---

## 3. ZOD SCHEMA VALIDATION EXAMPLES

### 3.1 Verification Submission Schema
```typescript
import { z } from 'zod';

export const VerificationSubmitSchema = z.object({
  educatorId: z.string().uuid(),
  ktpNumber: z.string().min(16).max(16),
  ktpDocumentUrl: z.string().url(),
  ijazahDocumentUrl: z.string().url(),
  ijazahSha256Hash: z.string().length(64),
  recommenderEmail: z.string().email(),
  recommenderInstitution: z.string().min(3),
  qiraahSanadName: z.string().optional()
});
```

### 3.2 Booking Inquiry Schema
```typescript
export const BookingInquirySchema = z.object({
  courseId: z.string().uuid().optional(),
  educatorId: z.string().uuid(),
  learningMethod: z.enum(['ONLINE_ZOOM', 'PRIVATE_HOME', 'GROUP_MAJELIS']),
  preferredSchedule: z.string().min(5),
  learnerName: z.string().min(2),
  contactPhone: z.string().regex(/^(\+62|08)[0-9]{8,12}$/, "Invalid phone format"),
  notes: z.string().max(500).optional()
});
```

---

## 4. RATE LIMITING & SECURITY MIDDLEWARE

Setiap API endpoint dilindungi oleh middleware **Upstash Redis Rate Limiter**:
- **Public Endpoints**: Max 60 requests / minute per IP.
- **Verification & Upload Endpoints**: Max 5 requests / minute per User ID.
- **Auth & Magic Link Endpoints**: Max 3 requests / minute per IP.

---

## 5. CONTRACT DRIFT & IMPLEMENTATION STATUS NOTES

Diperbarui `2026-08-01` (lihat `docs/implementation/POST_EXECUTION_VERIFICATION.md` untuk bukti):

- **Envelope `meta` (§1.1):** Response sukses saat ini tidak menyertakan field `meta` (hanya `success`, `statusCode`, `message`, `data`). Kosmetik — belum disinkronkan ke kode.
- **Error envelope (§1.2):** Runtime mengembalikan `{ success, statusCode, message }` (+ `error` hanya pada 500); field `error`-code dan array `details` belum diimplementasikan. Kosmetik.
- **Auth (§1) & Rate Limit (§4):** Klaim Supabase Auth RBAC dan Upstash Redis Rate Limiter bersifat aspirasional — **belum terimplementasi** (blokir kredensial cloud). Identitas role sementara diresolusi server-side (`DemoRoleSwitcher`/demo ID).
- **Endpoint terdaftar namun belum diimplementasikan (defer pasca-MVP):** `/api/v1/member/*`, `/api/v1/courses` & `/api/v1/lms/*`, `/api/v1/referrals/*`, `/api/v1/management/*`, `/api/v1/bookings/ledger`, `/api/v1/verification/confirm-token`.
- **Verifier/actor role:** identity (`verifierUserId`, `actorUserId`) dan role (`verifierRoles`, `actorRoles`) **tidak** dikirim melalui payload maupun header. Keduanya diresolusi server-side dari session (`getServerIdentity()`, DECISION-07). Dokumentasi lama yang menyebut field tersebut sebagai request body sudah dikoreksi (registry dev & §2.5 di atas).
- **`X-Verifier-Role` (OpenAPI):** header ini tidak digunakan; kontradiksi sebelumnya dengan `verifierRoles` payload sudah diselesaikan karena identity & role kini sepenuhnya server-derived (lihat `docs/audit/CONTRACT_DRIFT_REPORT.md` §2.3).

---

## 6. SLICE A — KNOWLEDGE DOMAIN (Claim/Source/Evidence) — IMPLEMENTED + RUNTIME VERIFIED

Diperbarui `2026-08-03` (Slice A, lihat `docs/audit/SEMESTA_ISLAM_HELICOPTER_VIEW.md` §17).

| Endpoint | Method | Auth | Status |
| --- | --- | --- | --- |
| `/api/v1/educators/[id]/knowledge` | GET | Public | IMPLEMENTED + RUNTIME VERIFIED (200 live) |
| `/api/v1/knowledge/claims` | POST | Auth — owning educator (self-declare UNVERIFIED) atau `verification.manage` | IMPLEMENTED (201/401/403/404) |
| `/api/v1/knowledge/claims/[id]/status` | POST | Auth — `LAJNAH_VERIFIER` / `FOUNDER_ADMIN` saja | IMPLEMENTED (200/401/403/404/409) |

Catatan:
- **Hanya klaim `VERIFIED` yang diekspos ke publik** (peraturan §8 integritas faktual). Semua klaim menyimpan provenance: `source`, `evidence`, `verifiedById`, `verifiedAt`.
- `VerificationRequest` kini menyimpan `verified_by_id` + `verified_at` (set saat review menuju `VERIFIED`, di-clear saat REJECTED/REVOKED). Diekspos sebagai `verifiedByName`/`verifiedAt` pada `GET /api/v1/verification/status`.
- Authorisasi identitas & role **server-derived** (DECISION-07) — tidak pernah dari payload.
- Rate limiting per-endpoint (rute publik/auth) dijadwalkan di Slice F.
