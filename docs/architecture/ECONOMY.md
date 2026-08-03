# ECONOMY — Internal Economy Architecture

**Status:** IMPLEMENTED (Economy & Security Closure slice)
**Evidence:** tests `economy-transactions.test.ts` (17), `payment-adapter.test.ts` (13), `economy-security.test.ts` (20); runtime curl verification with demo identities.

## Canonical Model

```text
EconomicTransaction → EconomicLedger entries → Balance projection
```

- `EconomicLedger` is the **canonical append-only source of truth** (`prisma/schema.prisma`).
- `EconomicTransaction` is the lifecycle/orchestration record (`type`, `status`, `actor`, `accountOwner`, `amount Int`, `currency`, `idempotencyKey`, `source`, `reference`, `reason`, `reversalOfId`, `organizationId`, timestamps).
- Balance is ALWAYS a projection (`getAccountLedger` / `reconcileLedgerEntries` in `src/lib/ledger/service.ts`). `balance += amount` is forbidden as the authoritative operation.

## Transaction Lifecycle

```text
INITIATED → AUTHORIZED → PENDING → COMPLETED
                                  ├─→ REFUNDED
                                  └─→ REVERSED
PENDING → FAILED | EXPIRED
```

Guarded transitions only via `src/lib/economy/service.ts` (`TRANSACTION_TRANSITIONS`). Invalid transitions fail deterministically.

## Idempotency

- Scoped `idempotencyKey` per command (e.g. `booking-inquiry:{bookingId}`, `booking-confirm-fee:{bookingId}`, `payment:paid:{eventId}`, `reversal:{transactionId}`).
- Unique DB constraint + service pre-check. Duplicate execution returns the existing result, never a second economic effect.
- `reversalOfId` is a separate concept: "which transaction does this reversal reverse?" (unique per original).

## Reversal & Adjustment

- `reverseTransaction` / `refundTransaction`: append a negative REVERSAL ledger entry referencing the original transaction (`reversalOfId`) and original entry; the original entry is never mutated/deleted. The original transaction is marked `REVERSED` / `REFUNDED`.
- `adjustAccountBalance`: founder-governed `ADJUSTMENT` with mandatory `reason` + authorization (`economy.adjust`) + audit (`ECONOMIC_ADJUSTMENT_CREATED`).
- No arbitrary balance-edit endpoint; all mutations flow through the service layer.

## Reconciliation

- `reconcileAccount` — projects balance from the ledger (always PASSED).
- `reconcileTransaction` — compares `sum(ledger entries)` to `transaction.amount`; mismatch → `RECONCILIATION_FAILED` + audit; no auto-correction.
- `reconcilePayment` — a PAID payment must have a COMPLETED domain transaction; mismatch → `RECONCILIATION_FAILED`.

## Authorization (economy capabilities)

| Capability | Founder | ORG_OWNER | ORG_ADMIN | Delegable? |
|---|---|---|---|---|
| economy.transaction.view | ✓ | org-scoped | org-scoped | ✓ |
| economy.transaction.create | ✓ | ✗ | ✗ | ✓ |
| economy.commission.view | ✓ | ✗ | ✗ | ✓ |
| economy.ledger.view | ✓ | org-scoped | org-scoped | ✓ |
| economy.adjust | ✓ | ✗ | ✗ | ✗ founder-only |
| economy.reversal | ✓ | ✗ | ✗ | ✗ founder-only |
| economy.refund | ✓ | ✗ | ✗ | ✗ founder-only |

Members: SELF-scoped via `authorize()` ownership grant for `economy.transaction.view`. Organization roles never grant platform-wide economy access.

## Booking Integration

- `createBookingInquiry` → `executeEconomicEffect` (EARN, `booking-inquiry:{bookingId}`) — booking code never writes the ledger directly.
- `confirmBooking` → platform fee via `executeEconomicEffect` (FEE_COLLECTION, `booking-confirm-fee:{bookingId}`) only when commission > 0. Only `PENDING → CONFIRMED` has an active write path.

## Files

- `src/lib/economy/service.ts`
- `src/lib/ledger/service.ts` (reused projection engine)
- `src/app/api/v1/economy/{balance,transactions,ledger}/route.ts`
- `src/app/api/v1/management/economy/{overview,adjustments,reversals}/route.ts`
- `src/app/member/points/page.tsx`, `src/app/management/economy/page.tsx`
