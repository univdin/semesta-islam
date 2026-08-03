# Performance Baseline — SEMESTA ISLAM

**Status:** BASELINE SNAPSHOT
**Date:** 2026-08-03
**Environment:** Production (https://semesta-islam.vercel.app) · Vercel Hobby · Supabase PG (Tokyo pooler)

---

## 1. Summary

Home page TTFB improved **~8x** after switching from `force-dynamic` to ISR (revalidate 300s).

| Metric | Before (force-dynamic) | After (ISR) | Delta |
| :--- | :--- | :--- | :--- |
| Cold TTFB | 3.55s | 1.41s | -60% |
| Warm TTFB | 3.69s | 0.45s | -88% |
| Warm total | 3.92s | 0.48s | -88% |

## 2. Page Weight

| Asset | Size |
| :--- | :--- |
| Home HTML | ~41 KB |
| Main CSS | ~58 KB |
| First Load JS (shared) | ~102 KB |

## 3. Configuration Applied

- `next.config.mjs`: image remotePatterns for `images.unsplash.com`, `*.supabase.co`, `*.supabase.com` (enables `next/image` optimization).
- Home page `/`: `revalidate = 300` (ISR) — public marketing data, safe to cache.
- Fonts: `Inter` + `Outfit` via `next/font/google` (self-hosted, `display: swap`).
- Images: 4 `<img>` on public pages already use `loading="lazy"` + explicit alt.

## 4. Known Constraints (free tier)

- Vercel Hobby: 10s function timeout, 100 GB bandwidth/mo, ~1M function invocations.
- Supabase Free: DB 500 MB, projects pause after 7 days idle (mitigated by keep-alive cron).
- All `/api/*` routes are `force-dynamic` (needed for auth/DB) — expect 200–400ms TTFB; cold start ~1.4s.
- First load of any route hits Supabase pooler (Tokyo) — connection reuse via Prisma singleton in `src/lib/db.ts`.

## 5. Recommendations (future)

- Convert public `/<img>` to `next/image` (now enabled) for automatic WebP/AVIF + srcset.
- Lighthouse CI integration for regression tracking.
- Consider `cacheComponents`/Route Cache warm-up for API routes if traffic grows.
- Monitor bandwidth against the 100 GB free-tier cap as educators/profiles grow.

## 6. Test Baseline

- `npm run lint` / `npm run typecheck` / `npm test` (111 tests) / `npm run build` — all pass in CI.
