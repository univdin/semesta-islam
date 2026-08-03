/**
 * SEMESTA ISLAM — Internal Economy Transaction Service Tests
 * Covers lifecycle state machine, idempotency, reversal/adjustment, integer
 * enforcement, ledger immutability, and reconciliation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const transactions: any[] = [];
  const ledgers: any[] = [];
  const auditLogs: any[] = [];

  const findUnique = async ({ where, include }: any) => {
    const row =
      transactions.find((t) => (where.id ? t.id === where.id : t.idempotencyKey === where.idempotencyKey)) ?? null;
    if (row && include?.entries) return { ...row, entries: ledgers.filter((l) => l.transactionId === row.id) };
    return row;
  };

  return {
    transactions,
    ledgers,
    auditLogs,
    prisma: {
      economicTransaction: {
        findUnique,
        findFirst: async ({ where, include }: any) => {
          const row =
            transactions.find(
              (t) =>
                (!where.source || t.source === where.source) &&
                (!where.reference || t.reference === where.reference) &&
                (!where.status || t.status === where.status)
            ) ?? null;
          if (row && include?.entries) return { ...row, entries: ledgers.filter((l) => l.transactionId === row.id) };
          return row;
        },
        findMany: async ({ where }: any) =>
          transactions
            .filter(
              (t) =>
                (!where?.accountOwnerId || t.accountOwnerId === where.accountOwnerId) &&
                (!where?.organizationId || t.organizationId === where.organizationId)
            )
            .sort((a, b) => b.createdAt - a.createdAt),
        create: async ({ data }: any) => {
          if (data.idempotencyKey && transactions.some((t) => t.idempotencyKey === data.idempotencyKey)) {
            const err: any = new Error('Unique constraint failed');
            err.code = 'P2002';
            throw err;
          }
          const row = { id: `tx-${transactions.length + 1}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          transactions.push(row);
          return row;
        },
        update: async ({ where, data }: any) => {
          const row = transactions.find((t) => t.id === where.id);
          Object.assign(row, data);
          return row;
        },
        count: async () => transactions.length,
      },
      economicLedger: {
        create: async ({ data }: any) => {
          const row = { id: `el-${ledgers.length + 1}`, ...data, createdAt: new Date() };
          ledgers.push(row);
          return row;
        },
        findMany: async ({ where }: any) =>
          ledgers.filter((l) => !where?.transactionId || l.transactionId === where.transactionId),
        aggregate: async ({ where }: any) => ({
          _sum: {
            amount: ledgers
              .filter(
                (l) => l.entryType === 'LEARNER_POINT' && (!where?.accountOwnerId || l.accountOwnerId === where.accountOwnerId)
              )
              .reduce((s, l) => s + l.amount, 0),
          },
        }),
        count: async () => ledgers.length,
      },
      auditLog: {
        create: async ({ data }: any) => {
          const row = { id: `aud-${auditLogs.length + 1}`, ...data, createdAt: new Date() };
          auditLogs.push(row);
          return row;
        },
      },
    },
  };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

import {
  createEconomicTransaction,
  authorizeTransaction,
  pendingTransaction,
  completeTransaction,
  failTransaction,
  reverseTransaction,
  adjustAccountBalance,
  executeEconomicEffect,
  reconcileTransaction,
  reconcileAccount,
} from '@/lib/economy/service';

beforeEach(() => {
  mocks.transactions.length = 0;
  mocks.ledgers.length = 0;
  mocks.auditLogs.length = 0;
});

const ACTOR = 'u-actor';
const OWNER = 'u-learner';

describe('transaction lifecycle', () => {
  it('walks INITIATED → AUTHORIZED → PENDING → COMPLETED and posts a ledger entry', async () => {
    const created = await createEconomicTransaction({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      idempotencyKey: 'booking-inquiry:b1',
      source: 'BOOKING_INQUIRY',
      reference: 'b1',
    });
    expect(created.transaction.status).toBe('INITIATED');
    expect(created.duplicate).toBe(false);

    await authorizeTransaction({ transactionId: created.transaction.id, actorUserId: ACTOR });
    await pendingTransaction({ transactionId: created.transaction.id, actorUserId: ACTOR });
    const completed = await completeTransaction({ transactionId: created.transaction.id, actorUserId: ACTOR });

    expect(completed.transaction.status).toBe('COMPLETED');
    expect(mocks.ledgers).toHaveLength(1);
    expect(mocks.ledgers[0].amount).toBe(50);
    expect(mocks.ledgers[0].transactionId).toBe(created.transaction.id);
  });

  it('rejects invalid transitions deterministically', async () => {
    const created = await createEconomicTransaction({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 10,
      source: 'TEST',
    });
    // complete from INITIATED is invalid
    await expect(
      completeTransaction({ transactionId: created.transaction.id, actorUserId: ACTOR })
    ).rejects.toThrow(/expected PENDING/);

    await authorizeTransaction({ transactionId: created.transaction.id, actorUserId: ACTOR });
    // authorize twice (AUTHORIZED → AUTHORIZED) is invalid
    await expect(
      authorizeTransaction({ transactionId: created.transaction.id, actorUserId: ACTOR })
    ).rejects.toThrow(/expected INITIATED/);
  });

  it('failure produces no ledger effect', async () => {
    const created = await createEconomicTransaction({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      source: 'TEST',
    });
    await failTransaction({ transactionId: created.transaction.id, actorUserId: ACTOR });
    expect(mocks.transactions[0].status).toBe('FAILED');
    expect(mocks.ledgers).toHaveLength(0);
  });

  it('expiration produces no ledger effect', async () => {
    const created = await createEconomicTransaction({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      source: 'TEST',
    });
    const { expireTransaction } = await import('@/lib/economy/service');
    await expireTransaction(created.transaction.id, ACTOR);
    expect(mocks.transactions[0].status).toBe('EXPIRED');
    expect(mocks.ledgers).toHaveLength(0);
  });
});

describe('idempotency', () => {
  it('same request twice → single transaction + single ledger entry', async () => {
    const input = {
      type: 'EARN' as const,
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      idempotencyKey: 'booking-inquiry:b1',
      source: 'BOOKING_INQUIRY',
      reference: 'b1',
    };
    const first = await executeEconomicEffect(input);
    const second = await executeEconomicEffect(input);

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(mocks.transactions.length).toBe(1);
    expect(mocks.ledgers.length).toBe(1);
  });

  it('completed-first retry does not duplicate the balance effect', async () => {
    const input = {
      type: 'EARN' as const,
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      idempotencyKey: 'booking-inquiry:b1',
      source: 'BOOKING_INQUIRY',
      reference: 'b1',
    };
    await executeEconomicEffect(input);
    const retry = await createEconomicTransaction(input);
    expect(retry.duplicate).toBe(true);
    expect(mocks.ledgers.length).toBe(1);
  });

  it('failed-first retry returns the existing failed result without new effect', async () => {
    const created = await createEconomicTransaction({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      idempotencyKey: 'booking-inquiry:b1',
      source: 'BOOKING_INQUIRY',
      reference: 'b1',
    });
    await failTransaction({ transactionId: created.transaction.id, actorUserId: ACTOR });
    const retry = await createEconomicTransaction({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      idempotencyKey: 'booking-inquiry:b1',
      source: 'BOOKING_INQUIRY',
      reference: 'b1',
    });
    expect(retry.duplicate).toBe(true);
    expect(retry.transaction.status).toBe('FAILED');
    expect(mocks.ledgers).toHaveLength(0);
  });
});

describe('reversal & adjustment', () => {
  it('reversal nets the balance to zero and never mutates the original entry', async () => {
    const result = await executeEconomicEffect({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      idempotencyKey: 'booking-inquiry:b1',
      source: 'BOOKING_INQUIRY',
      reference: 'b1',
    });
    const originalEntryAmount = mocks.ledgers[0].amount;

    const rev = await reverseTransaction({
      transactionId: result.transaction.id,
      actorUserId: ACTOR,
      reason: 'Poin salah diberikan',
    });
    expect(rev.duplicate).toBe(false);
    expect(rev.transaction.status).toBe('REVERSED');
    expect(mocks.ledgers.length).toBe(2);
    expect(mocks.ledgers[1].amount).toBe(-50);
    // reversal transaction runs its full lifecycle to COMPLETED and references
    // the original transaction + original ledger entry.
    const revTx = mocks.transactions.find((t) => t.id === rev.reversalTransaction.id);
    expect(revTx.status).toBe('COMPLETED');
    expect(revTx.reversalOfId).toBe(result.transaction.id);
    expect(mocks.ledgers[1].reversalOfId).toBe(mocks.ledgers[0].id);
    // original entry untouched
    expect(mocks.ledgers[0].amount).toBe(originalEntryAmount);
    // net balance = 0
    const account = await reconcileAccount(OWNER);
    expect(account.totalPoints).toBe(0);
  });

  it('duplicate reversal is rejected deterministically (no additional effect)', async () => {
    const result = await executeEconomicEffect({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      idempotencyKey: 'booking-inquiry:b1',
      source: 'BOOKING_INQUIRY',
      reference: 'b1',
    });
    await reverseTransaction({ transactionId: result.transaction.id, actorUserId: ACTOR, reason: 'Salah' });
    // A second reversal of the same transaction is rejected by the status
    // guard (original is now REVERSED) — no new economic effect.
    await expect(
      reverseTransaction({ transactionId: result.transaction.id, actorUserId: ACTOR, reason: 'Salah lagi' })
    ).rejects.toThrow(/REVERSED/);
    expect(mocks.ledgers.length).toBe(2);
  });

  it('reversal requires an explicit reason', async () => {
    const result = await executeEconomicEffect({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      source: 'BOOKING_INQUIRY',
    });
    await expect(
      reverseTransaction({ transactionId: result.transaction.id, actorUserId: ACTOR })
    ).rejects.toThrow(/reason/);
  });

  it('adjustment appends an ADJUSTMENT entry and requires a reason', async () => {
    await expect(
      adjustAccountBalance({ accountOwnerId: OWNER, actorUserId: ACTOR, amount: 25, reason: '' })
    ).rejects.toThrow(/reason/);

    const adj = await adjustAccountBalance({
      accountOwnerId: OWNER,
      actorUserId: ACTOR,
      amount: 25,
      reason: 'Koreksi poin oleh Founder',
      idempotencyKey: 'adjustment:u-learner:1',
    });
    expect(adj.duplicate).toBe(false);
    expect(adj.transaction.status).toBe('COMPLETED');
    expect(mocks.ledgers).toHaveLength(1);
    expect(mocks.ledgers[0].amount).toBe(25);
    expect(mocks.auditLogs.some((a) => a.actionType === 'ECONOMIC_ADJUSTMENT_CREATED')).toBe(true);
  });

  it('adjustment duplicate is idempotent', async () => {
    const input = { accountOwnerId: OWNER, actorUserId: ACTOR, amount: 25, reason: 'Koreksi', idempotencyKey: 'adjustment:u-learner:1' };
    await adjustAccountBalance(input);
    const second = await adjustAccountBalance(input);
    expect(second.duplicate).toBe(true);
    expect(mocks.ledgers).toHaveLength(1);
  });
});

describe('integer enforcement', () => {
  it('rejects floating-point amounts', async () => {
    await expect(
      createEconomicTransaction({
        type: 'EARN',
        actorUserId: ACTOR,
        accountOwnerId: OWNER,
        amount: 1.5,
        source: 'TEST',
      })
    ).rejects.toThrow(/integer/);
  });

  it('rejects zero amounts', async () => {
    await expect(
      createEconomicTransaction({
        type: 'EARN',
        actorUserId: ACTOR,
        accountOwnerId: OWNER,
        amount: 0,
        source: 'TEST',
      })
    ).rejects.toThrow(/non-zero/);
  });
});

describe('reconciliation', () => {
  it('matching account passes and projects balance', async () => {
    await executeEconomicEffect({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      source: 'BOOKING_INQUIRY',
    });
    const account = await reconcileAccount(OWNER);
    expect(account.status).toBe('RECONCILIATION_PASSED');
    expect(account.totalPoints).toBe(50);
  });

  it('mismatch produces RECONCILIATION_FAILED without automatic correction', async () => {
    const result = await executeEconomicEffect({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      source: 'BOOKING_INQUIRY',
    });
    // Simulate an inconsistent extra entry appended directly (should never be
    // possible via the service, but reconciliation must detect it).
    mocks.ledgers.push({
      id: 'el-corrupt',
      transactionId: result.transaction.id,
      accountOwnerId: OWNER,
      amount: 30,
      createdAt: new Date(),
    });
    const rec = await reconcileTransaction(result.transaction.id);
    expect(rec.status).toBe('RECONCILIATION_FAILED');
    expect(rec.actual).toBe(80);
    expect(mocks.auditLogs.some((a) => a.actionType === 'RECONCILIATION_FAILED')).toBe(true);
  });

  it('matching transaction passes', async () => {
    const result = await executeEconomicEffect({
      type: 'EARN',
      actorUserId: ACTOR,
      accountOwnerId: OWNER,
      amount: 50,
      source: 'BOOKING_INQUIRY',
    });
    const rec = await reconcileTransaction(result.transaction.id);
    expect(rec.status).toBe('RECONCILIATION_PASSED');
  });
});
