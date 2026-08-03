# LOCAL DEMO CREDENTIALS — SEMESTA ISLAM

**Document:** `docs/LOCAL_DEMO_CREDENTIALS.md`  
**Status:** Active Localhost Development Matrix  
**Authority:** Governed by `AI AGENT DIRECTIVE — LOCALHOST INSTALLATION GATE`

> [!WARNING]
> Kredensial di bawah ini adalah **KREDENSIAL SIMULASI LOKAL (LOCAL DEMO ONLY)**. Kredensial ini hanya berlaku saat `LOCAL_DEMO_MODE=true` di lingkungan localhost dan **TIDAK PERNAH DIKIRIM KE SUPABASE CLOUD ATparser PRODUKSI**.

---

## 1. LOCAL DEMO IDENTITIES MATRIX

| Identity Key | Display Name | Role | Email | Password | Allowed Demo Scenarios |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`DEV_LEARNER`** | Abdullah Ahmad | `LEARNER` | `learner.demo@localhost.test` | `DemoLearner123!` | Public landing, Direktori, Profil Sanad, Formulir Booking |
| **`DEV_EDUCATOR`** | Ustadz DR. Ahmad Al-Hafiz, M.A. | `EDUCATOR` | `educator.demo@localhost.test` | `DemoEducator123!` | Portal status verifikasi pendidik & pengajuan ulang berkas |
| **`DEV_LAJNAH`** | KH. Ma'ruf Amin | `LAJNAH_VERIFIER` | `lajnah.demo@localhost.test` | `DemoLajnah123!` | Antrean verifikasi Lajnah & evaluasi status (Verified/Rejected) |
| **`DEV_FOUNDER`** | Founder Admin | `FOUNDER_ADMIN` | `founder.demo@localhost.test` | `DemoFounder123!` | Pengelolaan platform & verifikasi Lajnah |

---

## 2. ROLE SWITCHER INTERFACE

Di lingkungan localhost, komponen **Demo Role Switcher** melayang di pojok kanan bawah layar (`bottom: 80px, right: 16px`) untuk memudahkan beralih peran instan saat menguji antarmuka tanpa perlu proses autentikasi cloud.
