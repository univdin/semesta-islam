# Supabase Database Health Check — SEMESTA ISLAM

**Date:** 2026-08-03
**Project:** `univdin's Project` (`dlpzffnqjjuumnljedor`, ap-northeast-1 / Tokyo)
**Method:** SQL equivalence of Supabase Database Advisor checks (advisor is dashboard-only)

---

## Results (all PASS)

| Check | Result |
| :--- | :--- |
| Tables without primary key | none (35/35 have PK) |
| Foreign keys defined | 42 |
| Total DB size | 12 MB (free tier limit 500 MB — 2.4%) |
| Active connections | 1 active / 9 idle (no exhaustion) |
| Unused non-PK indexes | only unique-constraint indexes (idx_scan=0 is expected for inserts) — keep |
| Data populated | permissions 35, users 9, profiles 9, educators 4, sanads 5, courses 9, bookings 2, econ-tx 2 |

## Recommendations

- DB is tiny; no indexing action needed at current scale.
- Run this check monthly (or via `supabase db` / SQL) as data grows.
- Monitor connection count — Prisma singleton + pooler (`connection_limit=1`) keeps it low.
- Re-run `supabase/advisor-check.sql` after schema changes.

## Related

- Storage buckets: `avatars` (public), `verification-docs` (private), `sanad-certificates` (private) — `supabase/storage-buckets.sql`
- RLS: 35/35 tables — `supabase/rls-hardening.sql`
