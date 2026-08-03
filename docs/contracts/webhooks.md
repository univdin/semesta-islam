# SEMESTA ISLAM — WEBHOOK ARCHITECTURE & SECURITY SPECIFICATION
**Status:** `[TECHNICAL PROPOSAL]` / `[DOCUMENT VERIFIED]`

This document specifies the HMAC SHA-256 Webhook delivery mechanism for partner applications.

---

## 1. Webhook Signature Generation

Every outgoing webhook payload is signed using HMAC SHA-256:

```text
signature = HMAC-SHA256(webhook_secret, timestamp + "." + json_body)
```

Header sent to recipient:
```text
X-Semesta-Signature: t=1700000000,v1=a1b2c3d4e5f6...
```

---

## 2. Security & Verification Steps for Receivers
1. Extract timestamp `t` and signature `v1` from `X-Semesta-Signature`.
2. Check timestamp tolerance: Reject if `|current_time - t| > 300 seconds` (prevents replay attacks).
3. Compute expected HMAC SHA-256 signature over `${t}.${request_body}`.
4. Compare expected signature with `v1` using constant-time string comparison.

---

## 3. Idempotency & Retry Schedule
- Each payload includes a unique `eventId` (UUID).
- Recipient MUST record processed `eventId` values to handle duplicate deliveries gracefully.
- Delivery retries occur on non-2xx responses:
  - Attempt 1: Immediate
  - Attempt 2: +1 minute
  - Attempt 3: +5 minutes
  - Attempt 4: +30 minutes
  - Attempt 5: +2 hours
- After 5 failures, event enters `DEAD_LETTER` queue for manual developer replay.
