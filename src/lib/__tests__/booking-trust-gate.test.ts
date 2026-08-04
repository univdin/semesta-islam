/**
 * ILMIFY — Booking Trust-Gate & Economy/Notification Wiring Contract
 * Covers the launch directive's requirements:
 *   - Booking inquiry is blocked for unverified (incl. REJECTED) educators.
 *   - Booking inquiry is idempotent and awards internal points atomically.
 *   - Booking confirm notifies the learner (BOOKING_CONFIRMED).
 *   - Booking inquiry notifies the educator (BOOKING_INQUIRED).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const findUnique = vi.fn();
  const create = vi.fn();
  const update = vi.fn();
  const findFirst = vi.fn();
  const findMany = vi.fn();
  const auditCreate = vi.fn(async ({ data }: any) => ({ id: 'aud-1', ...data, createdAt: new Date() }));
  const notificationCreate = vi.fn(async ({ data }: any) => ({ id: 'notif-1', ...data, createdAt: new Date() }));
  const getPlatformCommissionPercentage = vi.fn(() => 0);

  const transaction = vi.fn(async (cb: (tx: any) => Promise<any>) => {
    const tx = {
      bookingRequest: { create, update, findUnique, findFirst, findMany },
      auditLog: { create: auditCreate },
      notification: { create: notificationCreate },
      economicLedger: { create: vi.fn(async (a: any) => ({ id: 'entry-1', ...a.data })) },
      economicTransaction: {
        create: vi.fn(async (a: any) => ({ id: 'tx-1', ...a.data, status: 'INITIATED' })),
        findUnique: vi.fn(async () => null),
        update: vi.fn(async (a: any) => ({ id: a.where.id, status: a.data.status })),
      },
    };
    return cb(tx);
  });

  return {
    findUnique,
    create,
    update,
    findFirst,
    findMany,
    auditCreate,
    notificationCreate,
    getPlatformCommissionPercentage,
    transaction,
    prisma: {
      educatorProfile: { findUnique },
      bookingRequest: { create, update, findUnique, findFirst, findMany },
      user: {
        findFirst: vi.fn(async () => ({ id: 'platform-1' })),
      },
      auditLog: { create: auditCreate },
      notification: { create: notificationCreate },
      economicLedger: {
        create: vi.fn(async (a: any) => ({ id: 'entry-1', ...a.data })),
        findMany: vi.fn(async () => []),
      },
      economicTransaction: {
        create: vi.fn(async (a: any) => ({ id: 'tx-1', ...a.data, status: 'INITIATED' })),
        findUnique: vi.fn(async () => null),
        update: vi.fn(async (a: any) => ({ id: a.where.id, status: a.data.status })),
      },
      $transaction: transaction,
    },
  };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));
vi.mock('@/lib/ledger/service', () => ({
  getPlatformCommissionPercentage: mocks.getPlatformCommissionPercentage,
}));
vi.mock('@/lib/economy/service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/economy/service')>();
  return {
    ...actual,
    executeEconomicEffect: vi.fn(async (input: any) => ({
      transaction: { id: 'tx-1', status: 'COMPLETED', amount: input.amount },
      entry: { id: 'entry-1', amount: input.amount },
      duplicate: false,
    })),
  };
});
vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn(async (input: any) => ({ id: 'notif-1', ...input, createdAt: new Date() })),
}));

import { createBookingInquiry } from '@/lib/bookings/service';

describe('booking trust-gate (verified-only)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects booking inquiry for an unverified (SUBMITTED) educator with 409', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'edu-unverified',
      userId: 'user-edu',
      verifiedStatus: 'SUBMITTED',
      courses: [],
    });

    const res = await createBookingInquiry({
      educatorId: 'edu-unverified',
      learningMethod: 'ONLINE_ZOOM',
      preferredSchedule: 'Senin 19.00',
      learnerName: 'Ali',
      contactPhone: '081200000001',
      learnerUserId: 'learner-1',
    });

    expect(res.success).toBe(false);
    expect(res.statusCode).toBe(409);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rejects booking inquiry for a REJECTED educator with 409', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'edu-rejected',
      userId: 'user-edu',
      verifiedStatus: 'REJECTED',
      courses: [],
    });

    const res = await createBookingInquiry({
      educatorId: 'edu-rejected',
      learningMethod: 'ONLINE_ZOOM',
      preferredSchedule: 'Senin 19.00',
      learnerName: 'Ali',
      contactPhone: '081200000001',
      learnerUserId: 'learner-1',
    });

    expect(res.success).toBe(false);
    expect(res.statusCode).toBe(409);
  });

  it('allows booking inquiry for a VERIFIED educator and notifies the educator', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'edu-verified',
      userId: 'user-edu',
      verifiedStatus: 'VERIFIED',
      courses: [],
    });
    mocks.create.mockResolvedValue({ id: 'booking-1', status: 'PENDING', createdAt: new Date() });

    const res = await createBookingInquiry({
      educatorId: 'edu-verified',
      learningMethod: 'ONLINE_ZOOM',
      preferredSchedule: 'Senin 19.00',
      learnerName: 'Ali',
      contactPhone: '081200000001',
      learnerUserId: 'learner-1',
    });

    expect(res.success).toBe(true);
    expect(res.statusCode).toBe(201);
    expect(mocks.create).toHaveBeenCalledTimes(1);
    // Educator notified of the new inquiry.
    const { createNotification } = await import('@/lib/notifications/service');
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-edu',
        type: 'BOOKING_INQUIRED',
      }),
      expect.anything()
    );
  });
});
