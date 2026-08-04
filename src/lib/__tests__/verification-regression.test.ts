/**
 * ILMIFY — Verification Badge-Semantics Regression Tests
 *
 * Guards the P0 reconciliation in docs/audit/PRODUCTION_ACTIVATION_REALITY.md:
 *   - VERIFIED issues ONLY the canonical LAJNAH_VERIFIED badge (delete-then-create,
 *     never a duplicate stack). SANAD_VERIFIED must NOT be auto-issued here.
 *   - REVOKED removes every verification badge AND demotes the educator's
 *     verified knowledge claims so revoked educators stop emitting verified
 *     public projections.
 *   - SANAD_VERIFIED is only ever issued via verifySanadRecord and only while
 *     the educator holds at least one Lajnah-verified sanad record.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VerificationStatus, UserRole } from '@/types';

const mocks = vi.hoisted(() => {
  const deletedBadges: any[] = [];
  const createdBadges: any[] = [];
  const demotedClaims: any[] = [];
  const tx = {
    verificationRequest: { update: vi.fn(async (a: any) => ({ id: a.where.id })) },
    educatorProfile: { update: vi.fn(async () => ({})) },
    sanadRecord: {
      update: vi.fn(async (a: any) => ({ id: a.where.id, ...a.data })),
      count: vi.fn(async () => 0),
    },
    credentialBadge: {
      deleteMany: vi.fn(async ({ where }: any) => {
        deletedBadges.push(where);
        return { count: 0 };
      }),
      create: vi.fn(async ({ data }: any) => {
        createdBadges.push(data);
        return { id: 'badge-1', ...data };
      }),
    },
    knowledgeClaim: {
      updateMany: vi.fn(async ({ where, data }: any) => {
        demotedClaims.push({ where, data });
        return { count: 0 };
      }),
    },
    auditLog: { create: vi.fn(async () => ({ id: 'aud-1' })) },
  };
  const transaction = vi.fn(async (cb: (t: any) => Promise<any>) => cb(tx));

  return {
    tx,
    deletedBadges,
    createdBadges,
    demotedClaims,
    transaction,
    prisma: {
      verificationRequest: {
        findUnique: vi.fn(),
      },
      sanadRecord: {
        findUnique: vi.fn(),
      },
      $transaction: transaction,
    },
  };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));
vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn(async () => ({ id: 'notif-1' })),
}));

import { reviewVerificationRequest, verifySanadRecord } from '@/lib/verification/service';

const VERIFIER: UserRole[] = ['LAJNAH_VERIFIER'];

function baseRequest(overrides: Partial<{ status: VerificationStatus }> = {}) {
  mocks.prisma.verificationRequest.findUnique.mockResolvedValue({
    id: 'vr-1',
    educatorId: 'edu-1',
    status: overrides.status ?? 'UNDER_REVIEW_LAJNAH',
    educator: { userId: 'user-edu' },
  });
}

describe('VERIFIED review issues ONLY the canonical Lajnah badge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deletedBadges.length = 0;
    mocks.createdBadges.length = 0;
    mocks.demotedClaims.length = 0;
  });

  it('replaces all prior badges with a single LAJNAH_VERIFIED badge (delete-then-create)', async () => {
    baseRequest();

    const res = await reviewVerificationRequest({
      verificationRequestId: 'vr-1',
      verifierUserId: 'user-lajnah',
      verifierRoles: VERIFIER,
      currentStatus: 'UNDER_REVIEW_LAJNAH',
      targetStatus: 'VERIFIED',
      reviewNotes: 'OK',
      ethicsScore: 90,
    });

    expect(res.success).toBe(true);
    // Exactly one badge created, and it is the canonical Lajnah badge.
    expect(mocks.createdBadges).toHaveLength(1);
    expect(mocks.createdBadges[0].badgeType).toBe('LAJNAH_VERIFIED');
    // No SANAD_VERIFIED badge may be auto-issued by Lajnah application review.
    expect(mocks.createdBadges.some((b) => b.badgeType === 'SANAD_VERIFIED')).toBe(false);
  });

  it('REJECTED review issues no badge', async () => {
    baseRequest({ status: 'UNDER_REVIEW_LAJNAH' });

    const res = await reviewVerificationRequest({
      verificationRequestId: 'vr-1',
      verifierUserId: 'user-lajnah',
      verifierRoles: VERIFIER,
      currentStatus: 'UNDER_REVIEW_LAJNAH',
      targetStatus: 'REJECTED',
      reviewNotes: 'ditolak',
      ethicsScore: 0,
    });

    expect(res.success).toBe(true);
    expect(mocks.createdBadges).toHaveLength(0);
    expect(mocks.demotedClaims).toHaveLength(0);
  });
});

describe('REVOKED review removes badges and demotes verified claims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deletedBadges.length = 0;
    mocks.createdBadges.length = 0;
    mocks.demotedClaims.length = 0;
  });

  it('deletes all badges and demotes VERIFIED claims to UNVERIFIED', async () => {
    baseRequest({ status: 'VERIFIED' });

    const res = await reviewVerificationRequest({
      verificationRequestId: 'vr-1',
      verifierUserId: 'user-lajnah',
      verifierRoles: VERIFIER,
      currentStatus: 'VERIFIED',
      targetStatus: 'REVOKED',
      reviewNotes: 'revoked',
      ethicsScore: 0,
    });

    expect(res.success).toBe(true);
    // Every badge for the educator is removed on revocation.
    expect(mocks.deletedBadges.length).toBeGreaterThan(0);
    expect(mocks.deletedBadges[0]).toEqual({ educatorId: 'edu-1' });
    // No new badge is created on revocation.
    expect(mocks.createdBadges).toHaveLength(0);
    // Verified claims are demoted so no verified public projection leaks.
    expect(mocks.demotedClaims).toHaveLength(1);
    expect(mocks.demotedClaims[0].where).toEqual({ educatorId: 'edu-1', status: 'VERIFIED' });
    expect(mocks.demotedClaims[0].data).toMatchObject({
      status: 'UNVERIFIED',
      verifiedById: null,
      verifiedAt: null,
    });
  });
});

describe('SANAD_VERIFIED badge is evidence-conditional via verifySanadRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deletedBadges.length = 0;
    mocks.createdBadges.length = 0;
  });

  it('does not issue SANAD_VERIFIED when no Lajnah-verified sanad record exists', async () => {
    mocks.prisma.sanadRecord.findUnique.mockResolvedValue({
      id: 'sanad-1',
      educatorId: 'edu-1',
      educator: { userId: 'user-edu' },
    });
    mocks.tx.sanadRecord.count.mockResolvedValue(0);

    const res = await verifySanadRecord({
      sanadRecordId: 'sanad-1',
      verifierUserId: 'user-lajnah',
      verifierRoles: VERIFIER,
      verified: true,
    });

    expect(res.success).toBe(true);
    expect(res.data?.sanadVerifiedBadge).toBe(false);
    expect(mocks.createdBadges).toHaveLength(0);
  });

  it('issues SANAD_VERIFIED while the educator holds at least one Lajnah-verified sanad record', async () => {
    mocks.prisma.sanadRecord.findUnique.mockResolvedValue({
      id: 'sanad-1',
      educatorId: 'edu-1',
      educator: { userId: 'user-edu' },
    });
    mocks.tx.sanadRecord.count.mockResolvedValue(1);

    const res = await verifySanadRecord({
      sanadRecordId: 'sanad-1',
      verifierUserId: 'user-lajnah',
      verifierRoles: VERIFIER,
      verified: true,
    });

    expect(res.success).toBe(true);
    expect(res.data?.sanadVerifiedBadge).toBe(true);
    expect(mocks.createdBadges).toHaveLength(1);
    expect(mocks.createdBadges[0].badgeType).toBe('SANAD_VERIFIED');
  });

  it('removes SANAD_VERIFIED when no Lajnah-verified sanad record remains', async () => {
    mocks.prisma.sanadRecord.findUnique.mockResolvedValue({
      id: 'sanad-1',
      educatorId: 'edu-1',
      educator: { userId: 'user-edu' },
    });
    mocks.tx.sanadRecord.count.mockResolvedValue(0);

    const res = await verifySanadRecord({
      sanadRecordId: 'sanad-1',
      verifierUserId: 'user-lajnah',
      verifierRoles: VERIFIER,
      verified: false,
    });

    expect(res.success).toBe(true);
    expect(res.data?.sanadVerifiedBadge).toBe(false);
    expect(mocks.createdBadges).toHaveLength(0);
  });
});
