/**
 * SEMESTA ISLAM — Knowledge Domain (Slice A) Contract Tests
 * Covers: claim lifecycle state machine, verifier authorization,
 * deterministic profile completeness, claim creation ownership, and
 * verifier-only status transitions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const educatorFindUnique = vi.fn();
  const claimFindMany = vi.fn();
  const claimFindUnique = vi.fn();
  const claimGroupBy = vi.fn();
  const claimCreate = vi.fn();
  const claimUpdate = vi.fn();
  const auditCreate = vi.fn();

  const prisma = {
    educatorProfile: { findUnique: educatorFindUnique },
    knowledgeClaim: {
      findMany: claimFindMany,
      findUnique: claimFindUnique,
      groupBy: claimGroupBy,
      create: claimCreate,
      update: claimUpdate,
    },
    auditLog: { create: auditCreate },
    delegation: { findMany: vi.fn(async () => []) },
    $transaction: vi.fn(async (fn: unknown) => {
      return (fn as (tx: typeof prisma) => unknown)(prisma);
    }),
  };

  return {
    educatorFindUnique,
    claimFindMany,
    claimFindUnique,
    claimGroupBy,
    claimCreate,
    claimUpdate,
    auditCreate,
    prisma,
  };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

import {
  isValidClaimTransition,
  isVerifier,
  getProfileCompleteness,
  createClaim,
  updateClaimStatus,
} from '@/lib/knowledge/service';
import type { AuthIdentity } from '@/lib/auth/session';

function actor(userId: string, roles: AuthIdentity['roles']): AuthIdentity {
  return { userId, email: `${userId}@test.local`, roles, source: 'demo' };
}

const EDU_OWNER = actor('u-owner', ['EDUCATOR']);
const LAJNAH = actor('u-lajnah', ['LAJNAH_VERIFIER']);
const FOUNDER = actor('u-founder', ['FOUNDER_ADMIN']);
const LEARNER = actor('u-learner', ['LEARNER']);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Knowledge Claim State Machine', () => {
  it('allows UNVERIFIED -> VERIFIED', () => {
    expect(isValidClaimTransition('UNVERIFIED', 'VERIFIED')).toBe(true);
  });

  it('allows VERIFIED -> REJECTED and VERIFIED -> UNVERIFIED', () => {
    expect(isValidClaimTransition('VERIFIED', 'REJECTED')).toBe(true);
    expect(isValidClaimTransition('VERIFIED', 'UNVERIFIED')).toBe(true);
  });

  it('allows resubmission REJECTED -> UNVERIFIED', () => {
    expect(isValidClaimTransition('REJECTED', 'UNVERIFIED')).toBe(true);
  });

  it('rejects direct UNVERIFIED -> REJECTED', () => {
    expect(isValidClaimTransition('UNVERIFIED', 'REJECTED')).toBe(false);
  });

  it('rejects a no-op VERIFIED -> VERIFIED', () => {
    expect(isValidClaimTransition('VERIFIED', 'VERIFIED')).toBe(false);
  });
});

describe('Claim Verifier Authorization', () => {
  it('authorizes LAJNAH_VERIFIER', () => {
    expect(isVerifier(LAJNAH)).toBe(true);
  });

  it('authorizes FOUNDER_ADMIN', () => {
    expect(isVerifier(FOUNDER)).toBe(true);
  });

  it('rejects EDUCATOR and LEARNER', () => {
    expect(isVerifier(EDU_OWNER)).toBe(false);
    expect(isVerifier(LEARNER)).toBe(false);
  });
});

describe('Profile Completeness (deterministic)', () => {
  function educatorRow(overrides: Record<string, unknown> = {}) {
    return {
      id: 'educator-1',
      titleSuffix: null,
      verifiedStatus: 'DRAFT',
      user: { profile: { fullName: null, avatarUrl: null, bio: null, locationCity: null } },
      _count: { courses: 0, sanadRecords: 0, badges: 0, knowledgeClaims: 0 },
      verifications: [],
      ...overrides,
    };
  }

  it('returns null for unknown educator', async () => {
    mocks.educatorFindUnique.mockResolvedValue(null);
    const result = await getProfileCompleteness('missing');
    expect(result).toBeNull();
  });

  it('scores 0 when no profile fields are present', async () => {
    mocks.educatorFindUnique.mockResolvedValue(educatorRow());
    const result = await getProfileCompleteness('educator-1');
    expect(result?.score).toBe(0);
  });

  it('scores 100 for a fully completed educator', async () => {
    mocks.educatorFindUnique.mockResolvedValue(
      educatorRow({
        titleSuffix: 'Pakar Fiqh',
        user: {
          profile: {
            fullName: 'Ustadz Ahmad',
            avatarUrl: 'https://img/avatar.png',
            bio: 'Biografi lengkap',
            locationCity: 'Jakarta',
          },
        },
        _count: { courses: 2, sanadRecords: 1, badges: 1, knowledgeClaims: 1 },
        verifications: [{ status: 'VERIFIED' }],
      })
    );
    const result = await getProfileCompleteness('educator-1');
    expect(result?.score).toBe(100);
  });

  it('is deterministic for identical input', async () => {
    const row = educatorRow({
      titleSuffix: 'Pengajar Tajwid',
      user: { profile: { fullName: 'Ustadzah Siti', avatarUrl: null, bio: null, locationCity: 'Bandung' } },
      _count: { courses: 1, sanadRecords: 0, badges: 0, knowledgeClaims: 0 },
      verifications: [],
    });
    mocks.educatorFindUnique.mockResolvedValue(row);
    const first = await getProfileCompleteness('educator-1');
    const second = await getProfileCompleteness('educator-1');
    expect(first?.score).toBe(second?.score);
  });
});

describe('createClaim — ownership & authorization', () => {
  it('rejects an unrelated actor with 403', async () => {
    mocks.educatorFindUnique.mockResolvedValue({ id: 'educator-1', userId: 'u-owner' });
    const result = await createClaim(LEARNER, {
      educatorId: 'educator-1',
      predicate: 'SPECIALIZES_IN',
      objectText: 'Tajwid dasar',
    });
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(403);
  });

  it('allows the owning educator to self-declare as UNVERIFIED', async () => {
    mocks.educatorFindUnique.mockResolvedValue({ id: 'educator-1', userId: 'u-owner' });
    mocks.claimCreate.mockResolvedValue({ id: 'cl-1', status: 'UNVERIFIED' });
    const result = await createClaim(EDU_OWNER, {
      educatorId: 'educator-1',
      predicate: 'SPECIALIZES_IN',
      objectText: 'Tajwid dasar',
    });
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(201);
    expect(result.data?.status).toBe('UNVERIFIED');
    expect(mocks.claimCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'UNVERIFIED', verifiedById: null, verifiedAt: null }),
      })
    );
  });

  it('allows a verifier to create a claim as VERIFIED with provenance', async () => {
    mocks.educatorFindUnique.mockResolvedValue({ id: 'educator-1', userId: 'u-owner' });
    mocks.claimCreate.mockResolvedValue({ id: 'cl-2', status: 'VERIFIED' });
    const result = await createClaim(LAJNAH, {
      educatorId: 'educator-1',
      predicate: 'SPECIALIZES_IN',
      objectText: 'Tajwid dasar',
      status: 'VERIFIED',
    });
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('VERIFIED');
    expect(mocks.claimCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ verifiedById: 'u-lajnah' }),
      })
    );
  });

  it('returns 404 for a missing educator', async () => {
    mocks.educatorFindUnique.mockResolvedValue(null);
    const result = await createClaim(FOUNDER, {
      educatorId: 'educator-missing',
      predicate: 'SPECIALIZES_IN',
      objectText: 'x',
    });
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
  });
});

describe('updateClaimStatus — verifier-only transitions', () => {
  it('rejects a non-verifier with 403', async () => {
    const result = await updateClaimStatus(EDU_OWNER, {
      claimId: 'cl-1',
      targetStatus: 'VERIFIED',
    });
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(403);
  });

  it('returns 404 for an unknown claim', async () => {
    mocks.claimFindUnique.mockResolvedValue(null);
    const result = await updateClaimStatus(LAJNAH, {
      claimId: 'cl-missing',
      targetStatus: 'VERIFIED',
    });
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
  });

  it('returns 409 for an invalid transition', async () => {
    mocks.claimFindUnique.mockResolvedValue({ id: 'cl-1', status: 'VERIFIED' });
    const result = await updateClaimStatus(LAJNAH, {
      claimId: 'cl-1',
      targetStatus: 'VERIFIED',
    });
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(409);
  });

  it('records verifier provenance on VERIFIED', async () => {
    mocks.claimFindUnique.mockResolvedValue({ id: 'cl-1', status: 'UNVERIFIED' });
    mocks.claimUpdate.mockResolvedValue({ id: 'cl-1', status: 'VERIFIED' });
    const result = await updateClaimStatus(FOUNDER, {
      claimId: 'cl-1',
      targetStatus: 'VERIFIED',
    });
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(mocks.claimUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'VERIFIED',
          verifiedById: 'u-founder',
          verifiedAt: expect.any(Date),
        }),
      })
    );
    expect(mocks.auditCreate).toHaveBeenCalled();
  });

  it('clears verifier provenance on REJECTED', async () => {
    mocks.claimFindUnique.mockResolvedValue({ id: 'cl-1', status: 'VERIFIED' });
    mocks.claimUpdate.mockResolvedValue({ id: 'cl-1', status: 'REJECTED' });
    const result = await updateClaimStatus(LAJNAH, {
      claimId: 'cl-1',
      targetStatus: 'REJECTED',
    });
    expect(result.success).toBe(true);
    expect(mocks.claimUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ verifiedById: null, verifiedAt: null }),
      })
    );
  });
});
