-- SEMESTA ISLAM — Supabase Database Health Checks
-- SQL equivalence of the dashboard Database Advisor (advisor is UI-only).
-- Run against the linked project via:  psql "$DIRECT_URL" -f supabase/advisor-check.sql
-- or via any postgres client using the session pooler.

-- 1. Tables without a primary key (should be empty)
SELECT c.relname AS table_without_pk
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i WHERE i.indrelid = c.oid AND i.indisprimary
  );

-- 2. Foreign key count
SELECT count(*) AS fk_count
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';

-- 3. Table sizes (top)
SELECT relname, pg_size_pretty(pg_total_relation_size(c.oid)) AS size
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY pg_total_relation_size(c.oid) DESC
LIMIT 10;

-- 4. Total database size
SELECT pg_size_pretty(pg_database_size('postgres')) AS total_size;

-- 5. Live row counts
SELECT relname, n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC
LIMIT 15;

-- 6. Connection state breakdown
SELECT state, count(*)::int AS connections
FROM pg_stat_activity
WHERE datname = 'postgres'
GROUP BY state;

-- 7. Unused indexes (idx_scan = 0). Unique constraint indexes showing 0 is
--    expected (writes do not increment idx_scan) — investigate only genuine
--    duplicated/ad-hoc indexes.
SELECT schemaname, relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public' AND idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey';
