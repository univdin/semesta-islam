# LIVE INTEGRATION CHECKLIST — SEMESTA ISLAM

**Document:** `docs/LIVE_INTEGRATION_CHECKLIST.md`  
**Status:** `BLOCKED — CREDENTIALS REQUIRED`  
**Authority:** Governed by `docs/IMPLEMENTATION_CONTRACT.md` & AI Agent Directive

---

## 1. ENVIRONMENT KEY PROVISIONING AUDIT (2026-08-01 13:40)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Status: `MISSING / PLACEHOLDER`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Status: `MISSING / PLACEHOLDER`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Status: `MISSING / PLACEHOLDER` (Server-only secret)
- [ ] `DATABASE_URL` — Status: `MISSING / PLACEHOLDER` (Supabase PostgreSQL Transaction Pooler)
- [ ] `DIRECT_URL` — Status: `MISSING / PLACEHOLDER` (Supabase PostgreSQL Direct Session Connection)
- [ ] `UPSTASH_REDIS_REST_URL` — Status: `MISSING / PLACEHOLDER`
- [ ] `UPSTASH_REDIS_REST_TOKEN` — Status: `MISSING / PLACEHOLDER`
- [ ] `RESEND_API_KEY` — Status: `MISSING / PLACEHOLDER`

---

## 2. DATABASE & PRISMA MIGRATION GATE

- [ ] Execute `npx prisma db push` against development Supabase PostgreSQL. (`BLOCKED — CREDENTIALS REQUIRED`)
- [ ] Verify 14 canonical tables created in Supabase database schema (`users`, `user_profiles`, `educator_profiles`, `sanad_records`, `verification_requests`, `credential_badges`, `course_catalogs`, `course_schedules`, `learning_progress_reports`, `booking_requests`, `economic_ledgers`, `referral_codes`, `referral_conversions`, `audit_logs`). (`BLOCKED`)
- [ ] Verify foreign keys, indexes, and primary key UUID constraints. (`BLOCKED`)

---

## 3. SUPABASE AUTH & RLS SECURITY RUNTIME GATE

- [ ] Provision test user accounts (Learner, Educator, Lajnah Verifier, Founder Admin). (`BLOCKED`)
- [ ] Apply RLS Policies SQL script from `docs/08_SECURITY_COMPLIANCE.md`. (`BLOCKED`)
- [ ] **Public RLS Test**: Verify unauthenticated visitor can read directory but cannot access private buckets or user profiles. (`BLOCKED`)
- [ ] **Learner RLS Test**: Verify Learner A can read own booking but receives RLS error trying to read Learner B's booking. (`BLOCKED`)
- [ ] **Educator RLS Test**: Verify Educator A can update own schedule but cannot edit another educator's verification requests. (`BLOCKED`)
- [ ] **Lajnah RLS Test**: Verify only Lajnah role can mutate `verification_requests` status to `VERIFIED`. (`BLOCKED`)

---

## 4. PRIVATE STORAGE & SIGNED URL GATE

- [ ] Create private storage buckets in Supabase Dashboard (`ktp-documents-private`, `sanad-ijazah-private`). (`BLOCKED`)
- [ ] Verify direct URL access to private bucket objects returns `403 Forbidden`. (`BLOCKED`)
- [ ] Verify server-generated signed URLs expire after 15 minutes (`900` seconds). (`BLOCKED`)

---

## 5. END-TO-END VERTICAL SLICE ACCEPTANCE GATE

- [x] Visitor opens `/` $\rightarrow$ `/directory` $\rightarrow$ `/educator/[id]`. (`[RUNTIME VERIFIED]` locally via Docker Postgres; LIVE BLOCKED)
- [ ] Learner logs in via Supabase Magic Link Auth. (`BLOCKED`)
- [x] Learner submits booking inquiry on `/booking` $\rightarrow$ API `/api/v1/bookings/inquire`. (`[RUNTIME VERIFIED]`: 201 + DB persist)
- [x] Database verifies record in `booking_requests` and `economic_ledgers` tables. (`[RUNTIME VERIFIED]`)
- [x] Lajnah Verifier approves verification on `/management/lajnah` $\rightarrow$ API `/api/v1/verification/review`. (`[RUNTIME VERIFIED]`: state machine + role guards)
- [x] Database verifies immutable record created in `audit_logs` table. (`[RUNTIME VERIFIED]`: 14 rows / 6 action types on fresh DB)
