# SEMESTA ISLAM — SANDBOX CONTRACT & DEMO IDENTITY SPECIFICATION
**Status:** `[RUNTIME VERIFIED]` (Base `LOCAL_DEMO_MODE=true` exists in code)

This document specifies the contract for the SEMESTA SANDBOX and Local Demo Mode.

---

## 1. Local Demo Mode Baseline (`LOCAL_DEMO_MODE=true`)

When `LOCAL_DEMO_MODE=true` is set in `.env`:
- Database operations use deterministic mock identities and state adapters without requiring live Supabase credentials.
- In-memory data guarantees reproducible test runs across developer machines.

---

## 2. Deterministic Demo Identities

| Identity Role | Mock UUID | Mock Email | Behavior / Characteristics |
| :--- | :--- | :--- | :--- |
| `EDUCATOR` | `11111111-1111-1111-1111-111111111111` | `educator.demo@semestaislam.com` | Verified educator with Qira'at Sanad records. |
| `LEARNER` | `00000000-0000-0000-0000-000000000002` | `learner.demo@semestaislam.com` | Active learner identity for booking inquiries. |
| `LAJNAH_VERIFIER` | `99999999-9999-9999-9999-999999999999` | `verifier.lajnah@semestaislam.com` | Verifier identity authorized to execute `verification/review`. |
| `UNAUTHORIZED` | `88888888-8888-8888-8888-888888888888` | `unauth@semestaislam.com` | Non-verifier user used for testing 403 Forbidden responses. |

---

## 3. Sandbox Response Markers

All responses returned by the SEMESTA SANDBOX environment MUST include explicit header and metadata markers to prevent confusing mock data with real religious credentials:

Header:
```text
X-Semesta-Environment: sandbox
```

Payload metadata:
```json
{
  "_meta": {
    "environment": "sandbox",
    "isDemoData": true
  }
}
```
