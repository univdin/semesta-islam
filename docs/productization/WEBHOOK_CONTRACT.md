# SEMESTA ISLAM — WEBHOOK CONTRACT
**Phase:** P7
**Status:** [BUSINESS HYPOTHESIS] [TECHNICAL POSSIBILITY]

This document defines the proposed webhook architecture for the SEMESTA ISLAM Developer Platform, allowing B2B partners and organizations to react to domain events in real-time.

## 1. Justification
Webhooks are essential for the B2B SaaS and Partner API business models. A mosque integrating SEMESTA ISLAM needs to know immediately when a speaker's verification status is revoked or when a booking is confirmed, without aggressively polling the API.

## 2. Event Types

| Event Name | Trigger Condition | Payload Resource |
| :--- | :--- | :--- |
| `educator.verified` | `VerificationRequest` transitions to `VERIFIED` | `Educator` (Public Profile + Trust Metadata) |
| `educator.rejected` | `VerificationRequest` transitions to `REJECTED` | `Educator` |
| `verification.submitted` | `VerificationRequest` transitions to `SUBMITTED` | *Internal Lajnah Webhook Only* |
| `booking.created` | Learner submits a new `BookingRequest` | `Booking` |
| `booking.confirmed` | Educator confirms the `BookingRequest` | `Booking` |
| `booking.cancelled` | Either party cancels the `BookingRequest` | `Booking` |

## 3. Webhook Delivery & Security Model

**Signature:** 
All webhooks will be signed using HMAC SHA-256. The signature will be included in the `X-Semesta-Signature` header. Partners will verify this using their assigned Webhook Secret.

**Idempotency:** 
Every webhook payload will include a unique `eventId` (UUID). Consumers must use this to guarantee idempotent processing.

**Retry Policy:**
- If the receiving server returns `2xx`, the delivery is successful.
- If it returns `4xx` or `5xx`, or times out (after 5s), the system will retry using exponential backoff (e.g., +1m, +5m, +30m, +2h).
- Max retries: 5. After which the event is marked `FAILED` in the webhook delivery log.

**Replay Mechanism:**
Developers will have access to a `/developers/webhooks/logs` dashboard where they can manually trigger a replay of failed events.

## 4. Payload Schema Structure (JSON Schema Draft 2020-12)

```json
{
  "eventId": "uuid",
  "eventType": "educator.verified",
  "timestamp": "2026-08-01T12:00:00Z",
  "data": {
    // Standard API Resource Model payload for Educator
  }
}
```

**Next Step:** Proceed to P8 (Final Productization Master Plan) to wrap up the Cloud-Independent Integration Readiness (Auth, Rate Limiting) and compile the master roadmap.
