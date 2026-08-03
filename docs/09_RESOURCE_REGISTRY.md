# 09 — APPROVED RESOURCE & OPEN SOURCE REGISTRY

**Document:** `09_RESOURCE_REGISTRY.md`  
**Status:** Canonical Resource Reference  
**Audience:** All Developers · AI Agents · DevOps Engineers  
**Authority:** Governed by `04_OSS.md`, `05_MASTER_CONTEXT.md`

---

## 1. APPROVED OPEN SOURCE REPOSITORIES & BOILERPLATES

Sesuai dengan direktif [04_OSS.md](file:///Users/mac/Downloads/PROYEK/SEMESTAISLAM/docs/04_OSS.md), berikut adalah daftar repositori open-source terverifikasi yang digunakan sebagai referensi arsitektur:

| Nama Repositori | URL / Reference | Peran & Alasan Integrasi | Lisensi | Status Teruji |
| :--- | :--- | :--- | :--- | :--- |
| **NextBase Starter** | `github.com/nextbase-labs/nextbase` | Referensi arsitektur Next.js App Router + Supabase RLS Cookie Auth. | MIT | Terverifikasi |
| **LearnHouse LMS** | `github.com/learnhouse/learnhouse` | Referensi kandidat OSS LMS untuk integrasi kuis/ujian sanad terpisah. | AGPL-3.0 / API SSO | Terverifikasi |
| **Vaul Sheet Engine** | `github.com/emilkowalski/vaul` | Native Mobile Bottom Sheet Drawer dengan gestur *swipe-to-dismiss*. | MIT | Terverifikasi |
| **Tesseract.js OCR** | `github.com/naptha/tesseract.js` | Client-side JS OCR untuk ekstraksi teks KTP tanpa API OCR berbayar. | Apache-2.0 | Terverifikasi |
| **PDF-Lib** | `github.com/Hopding/pdf-lib` | Parsing metadata PDF & pemrosesan hashing SHA-256 berkas ijazah. | MIT | Terverifikasi |

---

## 2. VERIFIED NPM PACKAGES & DEPENDENCIES

### 2.1 Core Framework & Data
```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.47.0",
    "@supabase/ssr": "^0.5.2",
    "@prisma/client": "^6.2.0",
    "@upstash/redis": "^1.34.0",
    "@upstash/ratelimit": "^2.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "prisma": "^6.2.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0"
  }
}
```

### 2.2 UI, Icons & Animations
```json
{
  "dependencies": {
    "lucide-react": "^0.469.0",
    "vaul": "^1.1.2",
    "framer-motion": "^11.15.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  }
}
```

### 2.3 Verification & Document Processing
```json
{
  "dependencies": {
    "tesseract.js": "^5.1.1",
    "pdf-lib": "^1.17.1",
    "resend": "^4.0.0"
  }
}
```

---

## 3. FREE-TIER CLOUD RESOURCE SPECIFICATIONS & LIMITS

| Provider | Service Tier | Batasan Kuota Gratis | Peruntukan di SEMESTA ISLAM |
| :--- | :--- | :--- | :--- |
| **Vercel** | Hobby Plan (Free) | 100GB Bandwidth / bulan, Serverless Executions | Hosting Next.js Web App & API Routes |
| **Supabase** | Free Tier | 500MB Database, 1GB Storage, 50,000 MAU Auth | PostgreSQL DB, RLS Auth, Storage Buckets |
| **Upstash** | Free Tier | 10,000 requests / hari | Redis Cache Taksonomi & API Rate Limiting |
| **GitHub** | Free Plan | Unlimited Public/Private Repos, 2,000 Action Mins | Source Control & CI/CD Pipelines |
| **Resend / Brevo** | Free Plan | 100 - 300 email / hari | Transaksional Email Konfirmasi Token Sanad |

---

## 4. PEDOMAN KEPATUHAN LISENSI & REUSE DISCIPLINE

1. **Pemeriksaan Lisensi Wajib**: Sebelum mengadopsi paket NPM baru, pastikan lisensi bersifat **MIT, Apache-2.0, BSD, atau ISC**. Lisensi GPL/AGPL hanya diperbolehkan sebagai layanan microservice terpisah via API/SSO.
2. **Reuse Before Custom Code**: Dilarang membuat fungsi utilitas kustom dari nol jika sudah tersedia pada paket terverifikasi di atas (misal: penanganan form Zod, gestur Bottom Sheet Vaul, atau icon Lucide).
