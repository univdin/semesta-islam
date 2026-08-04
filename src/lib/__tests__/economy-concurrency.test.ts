/**
 * ILMIFY — Economy Concurrency & Idempotency Hardening Tests
 * Governed by audit §16/§17: concurrent spends must never overdraw, and a
 * repeated idempotency key must produce exactly one economic effect.
 *
 * These tests mock the ledger layer and exercise the service logic that
 * enforces balance-sufficiency BEFORE posting a SPEND effect.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const findUnique = vi.fn();
  const aggregate = vi.fn();
  const create = vi.fn();
  const update = vi.fn();

  return {
    findUnique,
    aggregate,
    create,
    update,
    prisma: {
      economicTransaction: {
        findUnique,
        create: vi.fn(async (a: any) => {
          const row = { id: 'tx-1', ...a.data, status: 'INITIATED' };
          // After create, internal reads (transition) resolve to the row.
          findUnique.mockResolvedValue(row);
          return row;
        }),
        update: vi.fn(async (a: any) => {
          const row = { id: a.where.id, status: a.data.status, amount: -40 };
          findUnique.mockResolvedValue(row);
          return row;
        }),
      },
      economicLedger: {
        aggregate,
        create: vi.fn(async (a: any) => ({ id: 'entry-1', ...a.data })),
      },
      auditLog: {
        create: vi.fn(async (a: any) => ({ id: 'aud-1', ...a.data })),
      },
      $transaction: async (cb: (tx: any) => Promise<any>) => {
        const tx = {
          economicTransaction: {
            findUnique,
            create: mocks.prisma.economicTransaction.create,
            update: mocks.prisma.economicTransaction.update,
          },
          economicLedger: {
            aggregate,
            create: mocks.prisma.economicLedger.create,
          },
          auditLog: mocks.prisma.auditLog,
        };
        return cb(tx);
      },
    },
  };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));
vi.mock('@/lib/audit/service', () => ({
  persistAuditEvent: vi.fn(async () => ({ id: 'aud-evt' })),
}));

import { spendPointsSafely, adjustAccountBalance } from '@/lib/economy/service';

describe('economy concurrency hardening (audit §16)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a spend exceeding current balance with INSUFFICIENT_FUNDS (no ledger effect)', async () => {
    mocks.findUnique.mockResolvedValue(null); // no prior identical tx
    mocks.aggregate.mockResolvedValue({ _sum: { amount: 30 } }); // balance = 30

    await expect(
      spendPointsSafely({
        accountOwnerId: 'acct-1',
        actorUserId: 'user-1',
        amount: 80,
        reason: 'Tebus kredit belajar',
        idempotencyKey: 'spend:acct-1:80:learn',
        source: 'TEST',
      })
    ).rejects.toThrow(/INSUFFICIENT_FUNDS/);

    // No SPEND transaction / ledger entry created for the rejected spend.
    expect(mocks.prisma.economicTransaction.create).not.toHaveBeenCalled();
    expect(mocks.prisma.economicLedger.create).not.toHaveBeenCalled();
  });

  it('allows a spend within balance and posts a negative ledger effect', async () => {
    mocks.findUnique.mockResolvedValue(null);
    mocks.aggregate.mockResolvedValue({ _sum: { amount: 100 } }); // balance = 100

    const res = await spendPointsSafely({
      accountOwnerId: 'acct-1',
      actorUserId: 'user-1',
      amount: 40,
      reason: 'Tebus kredit belajar',
      idempotencyKey: 'spend:acct-1:40:learn',
      source: 'TEST',
    });

    expect(res.duplicate).toBe(false);
    const createCall = mocks.prisma.economicTransaction.create.mock.calls[0]?.[0]?.data;
    expect(createCall).toMatchObject({ type: 'SPEND', amount: -40, accountOwnerId: 'acct-1' });
  });

  it('is idempotent: an existing key returns the original transaction with no new effect', async () => {
    mocks.findUnique.mockResolvedValue({ id: 'tx-existing', status: 'COMPLETED', amount: -40 });

    const res = await spendPointsSafely({
      accountOwnerId: 'acct-1',
      actorUserId: 'user-1',
      amount: 40,
      reason: 'Tebus kredit belajar',
      idempotencyKey: 'spend:acct-1:40:learn',
      source: 'TEST',
    });

    expect(res.duplicate).toBe(true);
    expect(mocks.prisma.economicTransaction.create).not.toHaveBeenCalled();
    expect(mocks.prisma.economicLedger.create).not.toHaveBeenCalled();
  });

  it('requires an idempotencyKey for spend (no random fallback)', async () => {
    await expect(
      spendPointsSafely({
        accountOwnerId: 'acct-1',
        actorUserId: 'user-1',
        amount: 10,
        reason: 'x',
        idempotencyKey: '',
        source: 'TEST',
      })
    ).rejects.toThrow(/idempotencyKey is required/);
  });
});

describe('economy adjustment idempotency (audit §17)', () => {
  it('rejects an adjustment without a deterministic idempotencyKey', async () => {
    await expect(
      adjustAccountBalance({
        accountOwnerId: 'acct-1',
        actorUserId: 'user-1',
        amount: 100,
        reason: 'Koreksi founder',
        idempotencyKey: '',
      })
    ).rejects.toThrow(/idempotencyKey is required/);
  });
});
