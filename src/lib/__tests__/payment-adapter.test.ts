/**
 * SEMESTA ISLAM — Payment Adapter Boundary Tests
 * Covers the canonical mock adapter: SIMULATED_INTERNAL marker, PENDING
 * invoices, signature verification, idempotent webhooks, refund semantics, and
 * the payment→domain-transaction path (adapter never mutates balance).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const transactions: any[] = [];
  const ledgers: any[] = [];
  const auditLogs: any[] = [];
  const payments: any[] = [];
  const bookings: any[] = [];

  return {
    transactions,
    ledgers,
    auditLogs,
    payments,
    bookings,
    prisma: {
      payment: {
        findUnique: async ({ where }: any) =>
          payments.find((p) => (where.id ? p.id === where.id : p.externalId === where.externalId)) ?? null,
        create: async ({ data }: any) => {
          const row = { id: `pay-${payments.length + 1}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          payments.push(row);
          return row;
        },
        update: async ({ where, data }: any) => {
          const row = payments.find((p) => p.id === where.id);
          Object.assign(row, data);
          return row;
        },
      },
      bookingRequest: {
        findUnique: async ({ where }: any) => bookings.find((b) => b.id === where.id) ?? null,
      },
      economicTransaction: {
        findUnique: async ({ where }: any) =>
          transactions.find((t) => (where.id ? t.id === where.id : t.idempotencyKey === where.idempotencyKey)) ?? null,
        findFirst: async ({ where }: any) =>
          transactions.find(
            (t) =>
              (!where.source || t.source === where.source) &&
              (!where.reference || t.reference === where.reference) &&
              (!where.status || t.status === where.status)
          ) ?? null,
        create: async ({ data }: any) => {
          const row = { id: `tx-${transactions.length + 1}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          transactions.push(row);
          return row;
        },
        update: async ({ where, data }: any) => {
          const row = transactions.find((t) => t.id === where.id);
          Object.assign(row, data);
          return row;
        },
      },
      economicLedger: {
        create: async ({ data }: any) => {
          const row = { id: `el-${ledgers.length + 1}`, ...data, createdAt: new Date() };
          ledgers.push(row);
          return row;
        },
        findMany: async ({ where }: any) => ledgers.filter((l) => !where?.transactionId || l.transactionId === where.transactionId),
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
vi.mock('@/lib/env', () => ({ env: { PAYMENT_PROVIDER: 'mock', NODE_ENV: 'test' } }));

import {
  MockPaymentGatewayAdapter,
  signMockWebhook,
} from '@/lib/payment/mockAdapter';
import { handlePaymentWebhook } from '@/lib/payment/service';

beforeEach(() => {
  mocks.transactions.length = 0;
  mocks.ledgers.length = 0;
  mocks.auditLogs.length = 0;
  mocks.payments.length = 0;
  mocks.bookings.length = 0;
  mocks.bookings.push({ id: 'booking-uuid-1', learnerUserId: 'u-learner', status: 'PENDING' });
});

const adapter = new MockPaymentGatewayAdapter();

function signedEvent(overrides: Record<string, any> = {}) {
  const payload = {
    eventId: 'evt-1',
    bookingId: 'booking-uuid-1',
    amount: 50,
    status: 'PAID',
    ...overrides,
  };
  return { payload, signature: signMockWebhook(payload) };
}

describe('mock adapter — invoice', () => {
  it('creates a PENDING invoice with SIMULATED_INTERNAL marker', async () => {
    const invoice = await adapter.createInvoice({
      bookingId: 'booking-uuid-1',
      learnerUserId: 'u-learner',
      amount: 50,
      description: 'Simulasi',
    });
    expect(invoice.status).toBe('PENDING');
    expect(invoice.mode).toBe('SIMULATED_INTERNAL');
    expect(invoice.invoiceId).toMatch(/^MOCK-INV-/);
  });
});

describe('mock adapter — webhook signature', () => {
  it('accepts a valid signature and returns a normalized event', async () => {
    const { payload, signature } = signedEvent();
    const event = await adapter.handleWebhook(payload, signature);
    expect(event.eventId).toBe('evt-1');
    expect(event.status).toBe('PAID');
    expect(event.amount).toBe(50);
  });

  it('rejects an invalid signature', async () => {
    await expect(adapter.handleWebhook({ eventId: 'x', bookingId: 'booking-uuid-1', amount: 50, status: 'PAID' }, 'bad-signature')).rejects.toThrow(/SIGNATURE/);
  });

  it('rejects a payload missing required fields', async () => {
    const { payload, signature } = signedEvent({ amount: undefined });
    await expect(adapter.handleWebhook(payload, signature)).rejects.toThrow(/PAYLOAD/);
  });

  it('rejects an unsupported status', async () => {
    const { payload, signature } = signedEvent({ status: 'INVALID' });
    await expect(adapter.handleWebhook(payload, signature)).rejects.toThrow(/STATUS/);
  });

  it('is idempotent per eventId (duplicate webhook returns the same result)', async () => {
    const { payload, signature } = signedEvent();
    const first = await adapter.handleWebhook(payload, signature);
    const second = await adapter.handleWebhook(payload, signature);
    expect(second).toEqual(first);
  });
});

describe('mock adapter — refund', () => {
  it('refunds only a PAID invoice', async () => {
    const local = new MockPaymentGatewayAdapter();
    const invoice = await local.createInvoice({
      bookingId: 'booking-uuid-1',
      learnerUserId: 'u-learner',
      amount: 50,
      description: 'Simulasi',
    });
    // mark PAID via webhook
    const { payload, signature } = signedEvent();
    await local.handleWebhook(payload, signature);
    const refund = await local.refund(invoice.invoiceId);
    expect(refund.refunded).toBe(true);
  });

  it('rejects refunding a non-PAID invoice', async () => {
    const local = new MockPaymentGatewayAdapter();
    const invoice = await local.createInvoice({
      bookingId: 'booking-uuid-1',
      learnerUserId: 'u-learner',
      amount: 50,
      description: 'Simulasi',
    });
    await expect(local.refund(invoice.invoiceId)).rejects.toThrow(/PAID/);
  });
});

describe('payment service — webhook → domain transaction', () => {
  it('verified PAID webhook creates one completed domain transaction + ledger effect', async () => {
    const { payload, signature } = signedEvent();
    const result = await handlePaymentWebhook(payload, signature);

    expect(result.duplicate).toBe(false);
    expect(result.payment.status).toBe('PAID');
    expect(result.payment.provider).toBe('SIMULATED_INTERNAL');
    expect(result.transaction).not.toBeNull();
    expect(result.transaction.status).toBe('COMPLETED');
    expect(mocks.ledgers).toHaveLength(1);
    expect(mocks.ledgers[0].amount).toBe(50);
    expect(mocks.auditLogs.some((a) => a.actionType === 'PAYMENT_PAID')).toBe(true);
  });

  it('duplicate webhook produces exactly one economic effect', async () => {
    const { payload, signature } = signedEvent();
    await handlePaymentWebhook(payload, signature);
    const second = await handlePaymentWebhook(payload, signature);
    expect(second.duplicate).toBe(true);
    expect(mocks.payments).toHaveLength(1);
    expect(mocks.transactions).toHaveLength(1);
    expect(mocks.ledgers).toHaveLength(1);
  });

  it('non-PAID events are recorded but create no domain transaction', async () => {
    const { payload, signature } = signedEvent({ status: 'FAILED' });
    const result = await handlePaymentWebhook(payload, signature);
    expect(result.payment.status).toBe('FAILED');
    expect(result.transaction).toBeNull();
    expect(mocks.ledgers).toHaveLength(0);
  });

  it('rejects a webhook whose booking does not exist', async () => {
    const { payload, signature } = signedEvent({ bookingId: 'booking-does-not-exist' });
    await expect(handlePaymentWebhook(payload, signature)).rejects.toThrow(/BOOKING_NOT_FOUND/);
    expect(mocks.payments).toHaveLength(0);
    expect(mocks.ledgers).toHaveLength(0);
  });

  it('invalid signature is rejected before any persistence', async () => {
    await expect(handlePaymentWebhook({ eventId: 'x', bookingId: 'booking-uuid-1', amount: 50, status: 'PAID' }, 'forged')).rejects.toThrow(/SIGNATURE/);
    expect(mocks.payments).toHaveLength(0);
    expect(mocks.transactions).toHaveLength(0);
    expect(mocks.ledgers).toHaveLength(0);
  });
});
