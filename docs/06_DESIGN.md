# 06 — DESIGN SYSTEM & PHYSICAL UX SPECIFICATION

**Document:** `06_DESIGN.md`  
**Status:** Canonical Design Reference  
**Audience:** UI/UX Engineers · AI Agents · Frontend Developers  
**Authority:** Governed by `00_BRD.md`, `01_BSD.md`, `02_PRD.md`, `05_MASTER_CONTEXT.md`

---

## 1. DESIGN PHILOSOPHY & BRAND IDENTITY

SEMESTA ISLAM mengusung filosofi **Islamic Modern Aesthetics & Stoic UX**. Desain ditujukan untuk memunculkan kesan **terpercaya, teduh, Rabbani, dan profesional** tanpa ornamen berlebihan (*anti-AI slop*).

### 1.1 Palet Warna Kanonikal (CSS Custom Properties)
```css
:root {
  /* Brand Primary & Heritage */
  --primary-emerald: #0F3D2E;         /* Kedalaman keilmuan & keteduhan */
  --primary-emerald-light: #16533F;   /* Hover state primary */
  --primary-emerald-dark: #09271D;    /* Footer & Dark accents */

  /* Accent Gold (Kemuliaan Sanad & Keindahan) */
  --accent-gold: #D4AF37;             /* Badge verifikasi, karsa, & highlight */
  --accent-gold-light: #F3E5AB;       /* Soft background badge */
  --accent-gold-hover: #B89428;       /* Active state gold */

  /* Surface & Background */
  --bg-cream: #FBF9F5;                /* Neutral warm background */
  --bg-surface: #FFFFFF;              /* Card & Modal surface */
  --bg-card: rgba(255, 255, 255, 0.85);/* Glassmorphic card surface */

  /* Text & Typography Colors */
  --text-primary: #1E293B;            /* High-contrast readable body text */
  --text-secondary: #64748B;          /* Subtitles & metadata */
  --text-muted: #94A3B8;              /* Placeholders & disabled states */
  --text-on-dark: #F8FAFC;            /* Text on dark surfaces */

  /* Functional Status Colors */
  --success-green: #10B981;           /* Verified badge & positive indicator */
  --warning-amber: #F59E0B;           /* Pending verification status */
  --error-rose: #EF4444;              /* Validation errors & alert */

  /* Border & Elevation */
  --border-color: rgba(15, 61, 46, 0.12);
  --border-color-gold: rgba(212, 175, 55, 0.3);
  --shadow-soft: 0 10px 30px -5px rgba(15, 61, 46, 0.08);
  --shadow-glow: 0 15px 35px -5px rgba(212, 175, 55, 0.18);
}

/* Dark Mode Overrides */
[data-theme="dark"] {
  --bg-cream: #0B1411;
  --bg-surface: #121F1B;
  --bg-card: rgba(18, 31, 27, 0.85);
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --border-color: rgba(255, 255, 255, 0.1);
  --shadow-soft: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
}
```

---

## 2. NATIVE MOBILE-FIRST APP SHELL ARCHITECTURE

Tampilan antarmuka utama mengadopsi standar **Mobile Native App Experience** pada perangkat seluler (320px–430px) yang secara adaptif bertransisi menjadi **Desktop Fluid Grid** pada breakpoint `md:` (768px) dan `lg:` (1024px).

### 2.1 Mobile Bottom Navigation & Safe-Area Insets
- **Bottom Navigation Bar**: Selalu terikat (*fixed*) di bagian bawah layar mobile dengan memperhitungkan `env(safe-area-inset-bottom)`.
- **Icon Target**: 4 Tab Navigasi Utama: *Beranda*, *Pendidik*, *Verifikasi*, dan *Program*.
- **Touch Ergonomics (Hukum Fitts)**: Target sentuh minimal `44x44pt` dengan *Thumb Safe Zone* di area bawah-tengah layar.

### 2.2 Vaul Bottom Sheet Drawer System
- Modul filter, detail pendidik, dan formulir pengajuan inkuiri pada perangkat seluler dibuka dalam bentuk **Bottom Sheet Drawer** (efek *swipe-to-dismiss* dan *snap points*).
- Pada layar desktop (`md:` ke atas), Bottom Sheet secara otomatis bertransisi menjadi **Floating Centered Modal Dialog**.

---

## 3. UI/UX FISIKA PERGERAKAN (SPRING MOTION MECHANICS)

Sistem antarmuka menolak animasi linier kaku (*cubic-bezier standard*) dan menggunakan **Spring Motion Mechanics** (stiffness, damping, mass) untuk menciptakan kesan pergerakan alami seperti benda fisik.

### 3.1 Parameter Fisika Animasi
- **Bottom Sheet Entry**: Stiffness `300`, Damping `30`, Mass `1`.
- **Button Active Press**: `transform: scale(0.96-0.97)` dengan durasi 150ms.
- **Card Hover Elevation**: `transform: translateY(-4px)` dengan bayangan berpijar halus.
- **Tactile Vibration Feedback**: Triggers `navigator.vibrate(10)` pada interaksi penting di perangkat mobile.

---

## 4. TAMPILAN MULTI-PORTAL & AKSESIBILITAS

### 4.1 Portal Member / Users Layout
- **Dashboard Learner**: Kartu jadwal bimbingan, *Learning Progress Report*, Dompet Poin (`LearnerPoints`), dan Kode Referral.
- **Dashboard Ustaz/Pendidik**: Pengaturan jam ketersediaan, riwayat sanad, status verifikasi 4-lapis, dan insentif.
- **Dashboard Lembaga**: Manajemen pendidik terikat, profil organisasi, dan akreditasi.

### 4.2 Portal Management / Founders Layout
- **CMS Panel**: Editor artikel, landing page announcements, FAQ, dan kebijakan legal.
- **ERP & Financial Oversight**: Pengawasan ledger internal, rincian simulasi komisi platform, dan statistik konversi referral.
- **RBAC Matrix Panel**: Pengaturan hak akses 5 tingkat (`FOUNDER_ADMIN`, `LAJNAH_VERIFIER`, `INSTITUTION_ADMIN`, `EDUCATOR`, `LEARNER`).
- **Lajnah Verification Pipeline**: Audit 4-lapis KTP OCR (`tesseract.js`), keaslian ijazah SHA-256 (`pdf-lib`), dan token rekomendasi ulama.
- **Taxonomy Engine**: Hirarki kategori keilmuan, Mazhab, Sanad Tree, dan Geografi Lokasi.

---

## 5. KEPATUHAN AKSESIBILITAS (WCAG 2.1 AA)

- **Kontras Warna**: Minimum rasio kontras 4.5:1 untuk teks biasa dan 3:1 untuk teks besar/badge.
- **Keyboard Navigasi**: Indikator fokus jelas (`outline: 2px solid var(--accent-gold)`) pada navigasi `Tab`.
- **Screen Reader Support**: Penggunaan tag HTML5 semantik (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`) dan atribut ARIA (`aria-expanded`, `aria-label`, `role="dialog"`).
