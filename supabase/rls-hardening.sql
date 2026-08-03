-- SEMESTA ISLAM — Supabase RLS Hardening
-- Governed by docs/08_SECURITY_COMPLIANCE.md §1.
--
-- Rationale:
--   The application reads/writes ONLY through Prisma (server-side, postgres
--   superuser via DIRECT_URL/pooler). The browser bundle ships the publishable
--   (anon) key for Supabase AUTH ONLY — never for data access (src/lib/supabase/client.ts
--   is unused for queries). Therefore the REST/PostgREST surface must be locked:
--   RLS enabled on every table + no permissive policy for anon/authenticated.
--   Prisma is unaffected (table owner bypasses RLS unless FORCE is set).
--
-- Verified 2026-08-03: before this, the publishable key could read users emails
-- via POST /rest/v1/users?select=email with only the publishable key.

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    -- Drop any pre-existing permissive policies (defensive, idempotent).
    EXECUTE format(
      'DROP POLICY IF EXISTS "anon_read_%I" ON public.%I;', tbl, tbl
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS "auth_read_%I" ON public.%I;', tbl, tbl
    );
  END LOOP;
END $$;

-- Revoke direct DML from anon / authenticated roles across public schema.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

-- Default privileges: any future table stays locked for anon/authenticated.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM authenticated;

-- Keep service_role untouched (server-side bootstrap ops; used by edge functions
-- if ever deployed). Explicitly scope to anon/authenticated only.
