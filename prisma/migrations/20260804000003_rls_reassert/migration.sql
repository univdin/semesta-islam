-- ILMIFY — Idempotent RLS Re-assertion (all public tables)
-- Governed by docs/08_SECURITY_COMPLIANCE.md §1 and supabase/rls-hardening.sql.
--
-- The one-time hardening script (supabase/rls-hardening.sql) was executed before
-- several later migrations created new tables (economy, knowledge, topics,
-- digital profiles, platform settings, community). Those tables were created
-- WITHOUT RLS enabled. This migration re-asserts the fail-closed posture on
-- EVERY table in the public schema, idempotently:
--   1. ENABLE ROW LEVEL SECURITY on every table.
--   2. Drop any permissive anon/authenticated policy (defensive).
--   3. Re-revoke all DML from anon / authenticated roles.
--
-- Prisma (superuser/owner) is unaffected: table owners bypass RLS unless FORCE
-- is set, so server-side reads/writes continue to work.

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format(
      'DROP POLICY IF EXISTS "anon_read_%I" ON public.%I;', tbl, tbl
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS "auth_read_%I" ON public.%I;', tbl, tbl
    );
  END LOOP;
END $$;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM authenticated;
