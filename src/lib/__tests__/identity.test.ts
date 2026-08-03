/**
 * SEMESTA ISLAM — Digital Identity (Phase H) Contract Tests
 *
 * Verifies the identity integrity boundary:
 *   - only VERIFIED external profiles become authoritative sameAs URLs;
 *   - SELF_DECLARED / SUBMITTED / UNDER_REVIEW profiles are NOT authoritative;
 *   - management-only status mutation is server-enforced.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const requirePermission = vi.fn();
  return {
    prisma: {
      digitalProfile: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
      educatorProfile: { findUnique: vi.fn() },
    },
    requirePermission,
  };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));
vi.mock('@/lib/auth/authorization', () => ({
  requirePermission: (...args: unknown[]) => mocks.requirePermission(...args),
}));

import {
  listVerifiedProfileUrls,
  listVerifiedProfilesForEducator,
  submitDigitalProfile,
  updateDigitalProfileStatus,
} from '@/lib/identity/service';
import type { AuthIdentity } from '@/lib/auth/session';

const EDU_OWNER: AuthIdentity = {
  userId: 'edu-user-1',
  email: 'edu@ilmify.id',
  roles: ['EDUCATOR'],
  source: 'demo',
};
const VERIFIER: AuthIdentity = {
  userId: 'verifier-1',
  email: 'verifier@ilmify.id',
  roles: ['LAJNAH_VERIFIER'],
  source: 'demo',
};

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'dp-1',
  educatorId: 'edu-1',
  platform: 'YOUTUBE',
  url: 'https://youtube.com/@ustadz',
  handle: '@ustadz',
  status: 'VERIFIED',
  verifiedAt: new Date(),
  createdAt: new Date(),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listVerifiedProfileUrls — sameAs trust rule', () => {
  it('only includes VERIFIED profiles as sameAs', async () => {
    mocks.prisma.digitalProfile.findMany.mockResolvedValue([
      row({ url: 'https://youtube.com/@verified' }),
    ]);
    const urls = await listVerifiedProfileUrls('edu-1');
    expect(urls).toEqual(['https://youtube.com/@verified']);
    expect(mocks.prisma.digitalProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { educatorId: 'edu-1', status: 'VERIFIED' } })
    );
  });

  it('returns no sameAs when nothing is verified', async () => {
    mocks.prisma.digitalProfile.findMany.mockResolvedValue([]);
    expect(await listVerifiedProfileUrls('edu-1')).toEqual([]);
  });
});

describe('listVerifiedProfilesForEducator — public surface', () => {
  it('returns only verified profiles publicly', async () => {
    mocks.prisma.digitalProfile.findMany.mockResolvedValue([row()]);
    const profiles = await listVerifiedProfilesForEducator('edu-1');
    expect(profiles).toHaveLength(1);
    expect(profiles[0].status).toBe('VERIFIED');
  });
});

describe('submitDigitalProfile — SELF_DECLARED lifecycle start', () => {
  it('lets the owning educator declare a profile (starts as SUBMITTED)', async () => {
    mocks.prisma.educatorProfile.findUnique.mockResolvedValue({ userId: EDU_OWNER.userId });
    mocks.prisma.digitalProfile.create.mockResolvedValue(row({ status: 'SUBMITTED' }));

    const profile = await submitDigitalProfile(EDU_OWNER, {
      educatorId: 'edu-1',
      platform: 'WEBSITE',
      url: 'https://ustadz.example.com',
    });
    expect(profile.status).toBe('SUBMITTED');
    expect(mocks.requirePermission).not.toHaveBeenCalled();
  });

  it('denies a non-owner without VERIFICATION_MANAGE', async () => {
    mocks.prisma.educatorProfile.findUnique.mockResolvedValue({ userId: 'someone-else' });
    mocks.requirePermission.mockRejectedValue(Object.assign(new Error('Forbidden'), { statusCode: 403 }));

    await expect(
      submitDigitalProfile(EDU_OWNER, { educatorId: 'edu-1', platform: 'X', url: 'https://x.com/u' })
    ).rejects.toThrow('Forbidden');
  });
});

describe('updateDigitalProfileStatus — management-only verification', () => {
  it('requires VERIFICATION_MANAGE to verify a profile', async () => {
    mocks.requirePermission.mockRejectedValue(Object.assign(new Error('Forbidden'), { statusCode: 403 }));
    await expect(updateDigitalProfileStatus(EDU_OWNER, 'dp-1', 'VERIFIED')).rejects.toThrow(
      'Forbidden'
    );
    expect(mocks.requirePermission).toHaveBeenCalledWith(
      expect.objectContaining({ capability: 'verification.manage' })
    );
  });

  it('records verifier provenance when marking VERIFIED', async () => {
    mocks.requirePermission.mockResolvedValue({ allowed: true });
    mocks.prisma.digitalProfile.update.mockResolvedValue(row({ status: 'VERIFIED' }));

    await updateDigitalProfileStatus(VERIFIER, 'dp-1', 'VERIFIED');
    expect(mocks.prisma.digitalProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'VERIFIED',
          verifiedById: VERIFIER.userId,
          verifiedAt: expect.any(Date),
        }),
      })
    );
  });
});
