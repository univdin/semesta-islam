# SEMESTA ISLAM — API ERROR HANDLING CONTRACT
**Status:** `[REPOSITORY VERIFIED]` / `[CODE VERIFIED]` — envelope semantics per Decision #3 (2026-08-01, runtime-canonical)

This document defines the standardized response envelopes and status code mappings enforced across all SEMESTA ISLAM API routes.

---

## 1. Canonical Response Envelopes

### 1.1 Success Envelope (all 2xx)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": { }
}
```

- `data` is endpoint-specific.
- `meta` / `PaginationMeta` are `[FUTURE / ASPIRATIONAL]` list-contract fields — NOT required by current MVP endpoints.

### 1.2 Error Envelope (`ErrorEnvelope`)

All non-2xx responses conform to this shape. `details` is **optional** and MUST only carry information that is safe for public/client consumption.

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed for verification submission payload",
  "details": [
    {
      "field": "ktpNumber",
      "issue": "KTP number must be 16 digits"
    }
  ]
}
```

### 1.3 5xx Responses — No Internal Leak

5xx responses MUST NOT expose internal exception details. The `error` field was removed from all runtime 500 responses (2026-08-01, 6 routes) as a security hardening measure.

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 2. HTTP Status Code Mapping

| Status Code | Meaning | Occurrences in Source Code |
| :--- | :--- | :--- |
| `200 OK` | Success | Verification review, resubmit, booking confirm, verification status |
| `201 Created` | Resource Created | Booking inquiry created, verification submitted |
| `400 Bad Request` | Validation Failure | Zod schema parse failure, invalid SHA-256 format |
| `403 Forbidden` | Authorization Failure | Insufficient verifier role in `verification/review` |
| `404 Not Found` | Resource Not Found | Unknown educator in `verification/status` |
| `409 Conflict` | Illegal State Machine Transition | Invalid verification status transition, re-confirm of CONFIRMED booking |
| `422 Unprocessable` | Semantic Business Error | Invalid document data |
| `429 Too Many Requests`| Rate Limit Exceeded | Client exceeded tier requests limit (`[FUTURE PROPOSAL]` — no runtime limiter in MVP) |
| `500 Internal Error` | Server Exception | Unhandled catch block exception |
