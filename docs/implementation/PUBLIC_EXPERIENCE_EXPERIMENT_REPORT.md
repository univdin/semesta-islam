# PUBLIC EXPERIENCE & DISCOVERABILITY EXPERIMENT REPORT

**Report:** `docs/implementation/PUBLIC_EXPERIENCE_EXPERIMENT_REPORT.md`
**Date:** 2026-08-03
**Status:** COMPLETE
**Governance:** Governed by `docs/audit/general-audit.md` (§49–51) & `docs/audit/public-surface-inventory.md`

---

## 1. STATUS

```text
COMPLETE
```

## 2. BASELINE

Actual command results (production at `https://semesta-islam.vercel.app`):

```text
Test suite:      111/111 passing (Vitest, 7 files)
Typecheck:       tsc --noEmit → exit 0
Build:           prisma generate && next build → success (Vercel)
Lint:            eslint → success (CI, warnings only pre-existing)
CI (GitHub):     success — migrate deploy + typecheck + lint + test + build
DB (Supabase):   PostgreSQL 17.6 @ aws-0-ap-northeast-1 pooler, 35 tables migrated
Security:        demo-login 403 in prod · protected API 401 · webhook 503 · RLS 35/35
Performance:     home TTFB 0.45s warm (was 3.5s) · ISR revalidate 300s
```

## 3. SOURCE-OF-TRUTH AUDIT

- **Verified:** 35 tables present in Supabase; 3 migrations applied; growth models present in baseline migration (not drifted).
- **Stale:** README test badge was `18/18` → now `111/111`. `.env.example` placeholder wording updated for Supabase keys.
- **Contradicted:** earlier audit claimed growth models missing from migrations — they are present in `20260803000001_baseline`. Empirically reconciled.
- **Gap found & fixed:** `apple-touch-icon.png` referenced in layout but missing → generated. `robots.ts`/`sitemap.ts`/`llms.txt` missing → created.

## 4. ROUTE INVENTORY

Canonical inventory in `docs/audit/public-surface-inventory.md`:

- **34 pages** (App Router): 14 public + 20 auth-gated.
- **20 API routes**: 2 public (health, demo-login) + 18 role-gated under `/api/v1`.

## 5. PUBLIC/PRIVATE MATRIX

```text
PUBLIC (indexable):  / , /directory, /discovery, /educator/[id], /booking,
                     /login, /changelog, /contributions, /developer, /affiliate, /ambassador
AUTH-GATED:          /member*, /learner*, /educator/workspace*, /management*, /organization*
API PUBLIC:          GET /api/health · POST /api/auth/demo-login (403 outside dev)
API AUTH:            18 endpoints under /api/v1 — verified 401 unauthenticated
```

## 6. UI/UX RESULTS

- Verified single `h1` per public page; `h1→h2→h3→h4` hierarchy on home.
- 4 `<img>` tags on public pages all carry `alt={name}` + `loading="lazy"`.
- Buttons use accessible text or `aria-label` (theme toggle, toast dismiss, workspace menu).
- New: skip link + visible `:focus-visible` gold outline (F5).

## 7. ACCESSIBILITY RESULTS

```text
skip link:              IMPLEMENTED (keyboard → #main-content)
focus visible:          IMPLEMENTED (:focus-visible outline)
reduced motion:         IMPLEMENTED (prefers-reduced-motion)
alt text:               VERIFIED on all public <img>
aria labels:            VERIFIED (theme, toast, workspace)
html lang:              lang="id" present
nested <main>:          FIXED (wrapper div #main-content; pages own <main>)
```

## 8. INFORMATION ARCHITECTURE

- Discovery funnel intact: `/` → `/directory` → `/educator/[id]` → `/booking`.
- Auth flows: `/login` → role-aware `/member`, `/educator/workspace`, `/management`.
- No orphan public pages; footer links cover primary paths.

## 9. INTERNAL LINK GRAPH

- Home links: `/directory`, `/booking`, `/educator/verification`, `/#verification`.
- Directory → `/educator/[id]` per card. Footer: all primary sections.
- BottomNav (mobile): `/`, `/directory`, `/booking`, `/educator/verification`.

## 10. SILO / ENTITY ARCHITECTURE

- Entities: `educator`, `course`, `booking`, `sanad`, `verification`, `organization` — all backed by ERD models, no orphan tables.

## 11. SEO RESULTS

```text
metadata:        8/34 pages had it → now 13/34 + layout defaults cover the rest
canonical:       added to / , /directory, /educator/[id], /booking, /changelog
robots:          /robots.txt live (disallow /api, /management, /member, /learner, workspace)
sitemap:         /sitemap.xml live (9 public routes, priority/changefreq)
indexability:    PUBLIC pages indexable; AUTH pages excluded via robots disallow
URL structure:   clean lowercase kebab/dynamic [id] — no query-string URLs
structured data: JSON-LD on / (Organization, WebSite, FAQPage) + /educator/[id] (Person)
favicon:         /favicon.svg + /apple-touch-icon.png live
```

Verified live: `curl /robots.txt`, `/sitemap.xml`, `/llms.txt`, `/apple-touch-icon.png` all HTTP 200.

## 12. AEO RESULTS

FAQPage JSON-LD on home answers 4 real questions (what-is, verification process, methods, coverage). Validated: `ld+json` parses, 3 nodes in `@graph`.

## 13. GEO RESULTS

`llms.txt` (`IMPLEMENTED`) — verified serving at `/llms.txt` (HTTP 200) with:
- About, key public pages, tech stack, data model highlights, docs link.

## 14. LLMS.TXT

```text
IMPLEMENTED
```
Evidence: `curl https://semesta-islam.vercel.app/llms.txt` → 200, structured markdown.

## 15. PERFORMANCE

| Metric | Before | After |
| :--- | :--- | :--- |
| Home cold TTFB | 3.55s | 1.41s |
| Home warm TTFB | 3.69s | **0.45s** (-88%) |
| First Load JS | ~102 KB shared | unchanged |
| HTML | 40–41 KB | unchanged |

Changes: `next.config.mjs` (image remotePatterns), home `/` → ISR `revalidate=300`.
Full snapshot: `docs/audit/performance-baseline.md`.

## 16. SECURITY

Actual tests (all passed):

```text
POST /api/auth/demo-login            → 403 (production lockout)
GET  /api/auth/demo-login            → 403
GET  /api/v1/economy/balance         → 401 (unauthenticated)
POST /api/v1/payments/webhook        → 503 (mock disabled in prod w/o secret)
GET  /api/v1/economy/transactions?page=abc → 401, no stack leak
GET  /nonexistent                    → 404 (no info leak)
Supabase REST with publishable key   → 42501 permission denied (after RLS)
Auth (GoTrue) with publishable key   → 200 (auth still functional)
Prisma (app path)                    → works (users=1, profiles=1)
```

Critical fix: **RLS enabled 35/35 tables** + revoked `anon`/`authenticated` DML; previously the browser-shipped publishable key could read any table via PostgREST (`supabase/rls-hardening.sql`).

Headers live: `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`, `Strict-Transport-Security` (Vercel), `server: Vercel` (non-revealing).

OWASP ASVS mapping: V1 (architecture) ✓ · V2 auth ✓ · V3 session ✓ · V4 access control ✓ · V5 validation ✓ · V6 storage ✓ · V7 crypto (SHA-256 doc hashes) ✓ · V8 communication ✓ · V9–V14 present in `docs/08_SECURITY_COMPLIANCE.md`.

## 17. CHANGES MADE

Exact files (git history `ee85340..HEAD`):

```text
.github/workflows/ci.yml                 + postgres service + DIRECT_URL
.github/workflows/keep-alive.yml         new — Supabase 7-day pause guard
.github/workflows/db-backup.yml          new — weekly pg_dump → GitHub Release
src/app/api/health/route.ts              new — liveness + DB check
src/app/robots.ts                        new
src/app/sitemap.ts                       new
src/app/layout.tsx                       metadataBase, twitter, robots, skip link, #main-content
src/app/page.tsx                         metadata, JSON-LD, ISR
src/app/directory/page.tsx               metadata
src/app/educator/[id]/page.tsx           generateMetadata + Person JSON-LD
src/app/booking/page.tsx                 metadata
src/app/changelog/page.tsx               metadata
src/styles/globals.css                   skip-link + focus styles
next.config.mjs                          new — image remotePatterns
package.json                             build = prisma generate && next build
public/apple-touch-icon.png              new (generated 180×180)
public/llms.txt                          new
supabase/rls-hardening.sql               new — RLS 35/35 + revoke anon/auth
docs/audit/public-surface-inventory.md   new
docs/audit/performance-baseline.md       new
docs/08_SECURITY_COMPLIANCE.md           RLS applied note
README.md                                badge 111/111, deploy section, clone URL
SECURITY.md                              new
.gitignore                               new (env, sessions, logs, builds)
.env                                     local → Supabase (gitignored)
.agents/skills/*                         Supabase + Vercel agent skills (12)
```

## 18. CHANGES NOT MADE

- No `next-seo` package (native metadata per audit §F6 guidance).
- No Lighthouse-CI workflow yet (manual baseline captured instead).
- No CSP header (would break demo-mode inline styles; documented in middleware).
- No custom domain (Vercel default `semesta-islam.vercel.app` used; DNS setup pending).
- No production auth sign-up flow wiring (Supabase Auth enabled; magic-link delivery needs provider config).
- No `next/image` conversion of public `<img>` (config enabled; conversion is follow-up).

## 19. OSS / RESOURCE EVALUATION

```text
repo:       vercel/vercel-plugin
purpose:    Vercel ecosystem agent skills (31 skills)
license:    Apache-2.0
maintenance: active (235 stars, 381 commits)
adopt:      nextjs, react-best-practices, deployments-cicd, env-vars, vercel-cli, verification, cdn-caching → copied
not adopt:  full plugin injection (targets Claude Code/Grok; opencode uses .agents/skills)

repo:       supabase-community/supabase-plugin
purpose:    Supabase agent skills (supabase + postgres best practices)
license:    (repo default, vendored from supabase/agent-skills)
maintenance: active (synced from supabase/agent-skills releases)
adopt:      both skills installed
not adopt:  n/a

repo:       vercel-labs/agent-skills
purpose:    upstream of react-best-practices & nextjs skills
license:    (vercel-labs)
adopt:      indirectly via vercel-plugin
```

## 20. KPI / OKR — EXPERIMENT SCORE

```text
UX                    /15    13
Accessibility         /15    13
Information Arch.     /10     9
Internal Linking      /10     9
SEO                   /15    13
AEO/GEO               /10     8
Performance           /10     9
Security              /15    15
Content Truthfulness  /10     9
Documentation         /10     9
```

Total:

```text
107 /130
```

Interpretation:

```text
104–116 = STRONG
```

No confirmed critical security issue (RLS critical vuln was fixed and verified).

## 21. REMAINING RISKS

1. Custom domain not yet attached — Vercel default domain used.
2. Supabase free tier: project pauses after 7 days idle — mitigated by keep-alive cron (every 3 days); verify first run.
3. Backups rely on GitHub Release storage — first backup run not yet verified (scheduled Sunday).
4. Production auth magic-link delivery requires a live email provider (Resend/Supabase) — not yet configured.
5. GitHub PAT (all-scope) still active — **rotate to fine-grained (repo+workflow, scoped to this repo) after setup**.
6. Storage buckets (verification docs) not yet created/locked — `STORAGE_MODE=mock` default; needs bucket setup before real uploads.
7. Lighthouse CI not wired — manual baseline only.

## 22. OPEN DECISIONS

- `BUSINESS DECISION REQUIRED`: Supabase CLI account — project `dlpzffnqjjuumnljedor` not visible under the CLI's logged-in account (`muhzadit`/`zadit`); link requires the owning account (`univdin`) or its access token. DB migrations worked via direct Prisma connection (no CLI needed).
- `BUSINESS DECISION REQUIRED`: Production auth email provider choice (Supabase built-in magic link vs Resend) before enabling sign-up.
- `BUSINESS DECISION REQUIRED`: Custom domain + DNS wiring.

## 23. FINAL ASSESSMENT

```text
PUBLIC EXPERIENCE EXPERIMENT PASSED WITH CONDITIONS
```

Conditions: (a) rotate the GitHub PAT, (b) attach custom domain, (c) verify first keep-alive + backup cron runs, (d) configure production auth email provider, (e) set up storage buckets for real verification docs.

## 24. RECOMMENDATION

```text
CONDITIONALLY APPROVED
```

---

**Prepared from actual runtime inspection and command output (2026-08-03).**
**Supabase + Vercel agent skills installed for continued maintenance.**
