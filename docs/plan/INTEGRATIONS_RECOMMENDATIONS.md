# Free / Open Integrations & Marketplace Recommendations — SEMESTA ISLAM

**Date:** 2026-08-03
**Status:** RECOMMENDATIONS (free / open tier)
**Relevant only when they earn their keep — no speculative installs.**

---

## 1. Agent / Developer Tools (installed)

| Integration | Type | What it adds | Source |
| :--- | :--- | :--- | :--- |
| Supabase skills (`supabase`, `supabase-postgres-best-practices`) | Agent skill | Correct Supabase API/RLS/Postgres guidance for AI agents | `npx skills add supabase/agent-skills` |
| Vercel skills (`vercel-nextjs`, `vercel-react-best-practices`, `vercel-deployments-cicd`, `vercel-env-vars`, `vercel-vercel-cli`, `vercel-verification`, `vercel-cdn-caching`) | Agent skill | Next.js/React perf, deploy, env, CLI, verification guidance | https://github.com/vercel/vercel-plugin |

## 2. Recommended Free Integrations (not yet active)

### A. GitHub → quality & security (all free)
| Integration | Purpose | Cost | Install |
| :--- | :--- | :--- | :--- |
| **Dependabot** (built-in) | Auto PR for dependency updates / security advisories | Free | Repo → Settings → Security → Dependabot (enable) |
| **CodeQL** (GitHub Advanced Security, free for public repos) | Static code security scanning | Free (public) | `.github/workflows/codeql.yml` |
| **Secret scanning** (built-in) | Detect leaked tokens in pushes | Free | Repo Settings → enable |

### B. Vercel Marketplace (free tier options)
| Integration | Purpose | Cost | Notes |
| :--- | :--- | :--- | :--- |
| **Vercel Analytics** | Web analytics (Core Web Vitals + page views) | Free tier (Hobby) | Add via Vercel dashboard → Analytics |
| **Speed Insights** | Real-user performance monitoring | Free tier | Dashboard → Speed Insights |
| **Observability (Log Drains)** | Streaming logs to third-party | Free (self-host drain) | Keep on Vercel native logs for now |

### C. Supabase
| Integration | Purpose | Cost | Notes |
| :--- | :--- | :--- | :--- |
| **Database Advisor** | Index/query/RLS health checks in dashboard | Included | Dashboard → Database → Advisor |
| **pg_cron** | Scheduled jobs (in-DB) | Extension (free) | Future: replace GH-Actions keep-alive? No — keep GH cron (simpler). |

## 3. Explicitly NOT recommended (now)
- Vercel Blob/Edge Config/Neon — not needed; Supabase storage covers it.
- AI Gateway / v0 / Turbopack-only upgrades — out of current scope.
- Sentry (paid) — use Vercel logs + health endpoint until traffic justifies it.
- Upsert-based marketplaces (e.g., Lemonsqueezy) — payment is `mock` today; revisit with real payment provider decision.

## 4. Quick Wins (do next, 100% free)
1. Enable **Dependabot** + **CodeQL** + **Secret scanning** on GitHub (5 min).
2. Enable **Vercel Analytics** + **Speed Insights** (Hobby free).
3. Attach **custom domain** (DNS only) — improves SEO trust.
4. Run **Supabase Database Advisor** monthly from the dashboard.
