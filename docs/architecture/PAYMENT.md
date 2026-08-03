# PAYMENT — External Payment Boundary

**Status:** ADAPTER-READY / SIMULATED (Economy & Security Closure slice)
**Evidence:** tests `payment-adapter.test.ts` (13); runtime webhook curl with valid/invalid signature.

## Boundary

```text
External Provider → PaymentGatewayAdapter → verified webhook
→ Payment → EconomicTransaction → EconomicLedger → Balance projection
```

- Payment is an **external boundary**, strictly separate from the internal economy. It is NEVER the source of truth for internal balance.
- The gateway/adapter NEVER mutates internal balance — it returns normalized events; only `src/lib/payment/service.ts` decides economic effects.

## Adapter (`src/lib/payment/mockAdapter.ts`)

- Canonical development/simulation implementation of `PaymentGatewayAdapter`.
- `SIMULATED_INTERNAL` marker preserved: internal, non-cash, non-withdrawable value. "Belum ada pembayaran riil."
- `createInvoice` returns **PENDING** (never pretends a real payment completed immediately).
- Webhook requires HMAC-SHA256 signature (`PAYMENT_MOCK_SECRET`, default dev secret) and validates payload/status.
- Idempotent per `eventId` (duplicate events return the already-processed result).
- `refund` supports PAID-invoice refund semantics.
- Future Midtrans/Xendit implement the same boundary (no SDKs installed in this slice).

## Provider Selection

`PAYMENT_PROVIDER` env (`mock | midtrans | xendit`, default `mock`). Only `mock` is implemented; `midtrans`/`xendit` throw `PaymentProviderError` as documented boundaries. Production mock webhook requires an explicit `PAYMENT_MOCK_SECRET` (otherwise 503).

## Webhook Flow (`src/app/api/v1/payments/webhook/route.ts`)

1. Signature verification (HMAC) → invalid → 401, no persistence.
2. Payload/status validation → invalid → 400.
3. Payment persisted idempotently (`externalId = eventId`, unique).
4. PAID event → `EconomicTransaction` (EARN) via `executeEconomicEffect` → ledger entry → audit (`PAYMENT_PAID`).
5. Duplicate event → returns existing result, exactly one economic effect.

## Explicitly Absent

No cash-out, withdrawal, payout, fiat wallet, cryptocurrency, or real gateway SDK in this slice.

## Files

- `src/lib/payment/mockAdapter.ts`
- `src/lib/payment/service.ts`
- `src/app/api/v1/payments/webhook/route.ts`
