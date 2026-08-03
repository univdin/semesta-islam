# Security Policy — SEMESTA ISLAM

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Please report security issues privately to the maintainer:

- **Email**: univdin@gmail.com
- **Subject prefix**: `[SECURITY] SEMESTA ISLAM — <short description>`

You will receive an acknowledgement within 48 hours and a remediation status update as soon as a fix is prepared.

## Scope

The following are in scope for this security policy:

- Authentication & authorization bypass
- Data exposure / information leakage (incl. API responses, logs, error messages)
- Server-Side Request Forgery (SSRF), injection, and unsafe deserialization
- Secrets handling (environment variables, keys, tokens)
- Rate limiting & abuse resistance on public API endpoints
- Session management (Supabase Auth, cookies)

## Out of Scope

- Localhost development demo credentials (documented in `docs/audit/LOCAL_DEMO_CREDENTIALS.md` — simulation only)
- Third-party dependencies (report to their respective projects)

## Security Baseline

- All credentials live in environment variables only — `.env*` files are never committed.
- Production builds run with `APP_ENV=production`, `LOCAL_DEMO_MODE=false`.
- Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, DB credentials) are never exposed to the browser bundle.
- Security headers are set via `src/middleware.ts`.
- See `docs/08_SECURITY_COMPLIANCE.md` for the full security & compliance reference.
