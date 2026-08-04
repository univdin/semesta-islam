# 08 — SECURITY, COMPLIANCE & AUDIT TRAIL SPECIFICATION

**Document:** `08_SECURITY_COMPLIANCE.md`  
**Status:** Canonical Security Reference  
**Audience:** Security Engineers · Database Administrators · AI Agents  
**Authority:** Governed by `01_BSD.md`, `03_ERD.md`, `05_MASTER_CONTEXT.md`

---

## 1. SUPABASE ROW LEVEL SECURITY (RLS) POLICIES

Seluruh tabel relasional di Supabase PostgreSQL wajib mengaktifkan **Row Level Security (RLS)** untuk mencegah kebocoran data antar-pengguna.

> **APPLIED 2026-08-03:** RLS diaktifkan pada **35/35** tabel yang ada saat itu (`supabase/rls-hardening.sql`).
> **CLOSED 2026-08-04:** skema kini **47 tabel relasional** (46 model + `_prisma_migrations`).
> Re-run `supabase/rls-hardening.sql` (idempotent) pada **2026-08-04** terhadap **remote
> Supabase** (via DIRECT_URL, port 5432) menutup gap 5 tabel komunitas
> (`community_comments`, `community_votes`, `community_reports`, `community_questions`,
> `community_answers`) yang dibuat setelah hardening awal. Verifikasi terakhir: **47/47
> tabel `relrowsecurity = on`**, **5/5 tabel komunitas RLS aktif**, dan **0 privilege
> SELECT** untuk role `anon` maupun `authenticated` di seluruh `public` schema.
> Akses `anon` + `authenticated` (PostgREST) dicabut total — aplikasi membaca/menulis
> hanya via Prisma server-side. Verifikasi: publishable key kini mendapat `42501
> permission denied` pada `/rest/v1/*`; auth (GoTrue) dan Prisma tetap berfungsi.
>
> **LINTER SUPPABASE (2026-08-04) — DISPOSISI:**
> - `rls_enabled_no_policy` INFO (47/47 tabel) = **BY DESIGN, diterima.** RLS aktif
>   tanpa policy apa pun = deny-all bagi `anon`/`authenticated`; akses satu-satunya
>   via Prisma (service role). Penambahan policy justru membuka jalur yang sengaja ditutup.
> - `unindexed_foreign_keys` INFO (PERFORMANCE) = **DITERIMA/DI-DEFER.** Tabel belum
>   berisi data produksi; pembuatan ~40 index FK kini premature (beban maintenance tanpa
>   manfaat kueri). Evaluasi ulang saat volume data aktual tumbuh.
> - `unused_index` INFO = **DITERIMA.** Index belum terpakai karena tabel kosong;
>   penghapusan salah (akan dibutuhkan saat data masuk).
> Semua temuan linter adalah level INFO; tidak ada temuan ERROR/WARN.

### 1.1 Protected Tables & Policy Rules

#### A. Table `user_profiles`
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Pengguna dapat membaca data profil publik pengguna lain
CREATE POLICY "Public profiles are readable by everyone" 
ON user_profiles FOR SELECT 
USING (true);

-- Pengguna hanya dapat memperbarui data profil milik sendiri
CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = user_id);
```

#### B. Table `verification_requests` (Sensitif KTP & Sanad)
```sql
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Pendidik hanya dapat melihat status verifikasi milik sendiri
CREATE POLICY "Educators can view own verification request" 
ON verification_requests FOR SELECT 
USING (auth.uid() = educator_user_id);

-- Hanya Lajnah & Founder Admin yang dapat membaca seluruh pengajuan verifikasi
CREATE POLICY "Lajnah and Founder can view all verification requests" 
ON verification_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_name IN ('FOUNDER_ADMIN', 'LAJNAH_VERIFIER')
  )
);
```

#### C. Table `economic_ledgers` (Data Keuangan Internal)
```sql
ALTER TABLE economic_ledgers ENABLE ROW LEVEL SECURITY;

-- Pengguna hanya dapat melihat pencatatan ledger milik sendiri
CREATE POLICY "Users view own economic ledger" 
ON economic_ledgers FOR SELECT 
USING (auth.uid() = account_owner_id);

-- Pengubahan ledger hanya dapat dilakukan oleh Server-side Service Role
CREATE POLICY "No direct client insert into ledger" 
ON economic_ledgers FOR INSERT 
WITH CHECK (false);
```

---

## 2. PRIVASI BERKAS & SHA-256 DIGITAL HASHING

### 2.1 Private vs Public Supabase Storage Buckets
- **Public Bucket (`avatars`, `public-assets`)**: Foto profil, banner kursus, dan logo lembaga.
- **Private Bucket (`verification-docs`, `sanad-certificates`)**: KTP, paspor, dan berkas Ijazah PDF. Akses hanya diberikan melalui **Signed Temporary URLs** (berlaku maksimal 15 menit) khusus untuk Lajnah terotorisasi.

### 2.2 SHA-256 Digital Fingerprint Ijazah
Setiap berkas Ijazah/Sanad PDF yang diunggah akan dihitung nilai hash SHA-256-nya sebelum disimpan:
$$\text{Hash} = \text{SHA-256}(\text{Binary Content of PDF File})$$
Jika ada pendaftaran lain yang mengunggah berkas dengan hash identik atas nama ustaz berbeda, sistem secara otomatis menandai adanya indikasi duplikasi berkas (*Anti-Fraud System*).

---

## 3. AUDIT TRAIL LOGGING SCHEMA

Setiap tindakan penting (perubahan role, approval verifikasi, transaksi ledger, pengubahan taksonomi) dicatat ke dalam tabel `audit_logs`:

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    action_type VARCHAR(100) NOT NULL, -- e.g. "VERIFICATION_APPROVED", "ROLE_UPDATED"
    entity_affected VARCHAR(100) NOT NULL, -- e.g. "verification_requests", "user_roles"
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. ALGORITMA SCORING ETIKA PENDIDIK (LAYER 4)

Skor etika pendidik dihitung secara otomatis untuk menjaga integritas ekosistem:

$$\text{Ethics Score} = (\text{Rating Avg} \times 40) + (\text{Response Rate \%} \times 30) + (\text{Completion Rate \%} \times 30) - (\text{Violations Count} \times 25)$$

- Jika Skor Etika < 70, status verifikasi pendidik secara otomatis masuk ke dalam peninjauan ulang (*Lajnah Ethics Audit Queue*).
