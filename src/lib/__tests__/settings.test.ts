/**
 * SEMESTA ISLAM — Platform Configuration (Phase B) Contract Tests
 * Verifies the founder control plane: typed keys, boolean normalization,
 * defaults, and server-enforced authorization (UI hiding is not the only
 * protection).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const requirePermission = vi.fn();
  return {
    prisma: {
      platformSetting: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
    },
    requirePermission,
  };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));
vi.mock('@/lib/auth/authorization', () => ({
  requirePermission: (...args: unknown[]) => mocks.requirePermission(...args),
}));

import {
  getPlatformSetting,
  isPlatformSettingEnabled,
  setPlatformSetting,
  listPlatformSettings,
  PLATFORM_SETTING_KEYS,
} from '@/lib/settings/service';
import type { AuthIdentity } from '@/lib/auth/session';

const ACTOR: AuthIdentity = {
  userId: 'founder-1',
  email: 'founder@ilmify.id',
  roles: ['FOUNDER_ADMIN'],
  source: 'demo',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPlatformSetting — defaults', () => {
  it('returns the stored value when present', async () => {
    mocks.prisma.platformSetting.findUnique.mockResolvedValue({ value: 'false' });
    expect(await getPlatformSetting(PLATFORM_SETTING_KEYS.MAINTENANCE_MODE)).toBe('false');
  });

  it('falls back to the documented default when missing', async () => {
    mocks.prisma.platformSetting.findUnique.mockResolvedValue(null);
    expect(await getPlatformSetting(PLATFORM_SETTING_KEYS.PUBLIC_DIRECTORY_ENABLED)).toBe('true');
    expect(await getPlatformSetting(PLATFORM_SETTING_KEYS.SEARCH_CONSOLE_ENABLED)).toBe('false');
  });
});

describe('isPlatformSettingEnabled — boolean normalization', () => {
  it('enables only literal true', async () => {
    mocks.prisma.platformSetting.findUnique.mockResolvedValue({ value: 'true' });
    expect(await isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.MAINTENANCE_MODE)).toBe(true);
  });

  it('disables on false or missing', async () => {
    mocks.prisma.platformSetting.findUnique.mockResolvedValue({ value: 'false' });
    expect(await isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.MAINTENANCE_MODE)).toBe(false);
    mocks.prisma.platformSetting.findUnique.mockResolvedValue(null);
    expect(await isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.SEARCH_CONSOLE_ENABLED)).toBe(false);
  });

  it('throws for non-boolean keys', async () => {
    await expect(
      isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.ENTITY_PUBLISHING_POLICY)
    ).rejects.toThrow('PLATFORM_SETTING_NOT_BOOLEAN');
  });
});

describe('setPlatformSetting — governance', () => {
  it('requires PLATFORM_CONFIGURATION capability (server-enforced)', async () => {
    mocks.requirePermission.mockRejectedValue(Object.assign(new Error('Forbidden'), { statusCode: 403 }));
    mocks.prisma.platformSetting.upsert.mockResolvedValue({
      key: 'maintenance_mode',
      value: 'true',
      updatedAt: new Date(),
      updatedBy: { email: 'founder@ilmify.id' },
    });

    await expect(
      setPlatformSetting(ACTOR, PLATFORM_SETTING_KEYS.MAINTENANCE_MODE, 'true')
    ).rejects.toThrow('Forbidden');
    expect(mocks.requirePermission).toHaveBeenCalledWith(
      expect.objectContaining({ capability: 'platform.configuration' })
    );
  });

  it('normalizes boolean settings and upserts with the acting user', async () => {
    mocks.requirePermission.mockResolvedValue({ allowed: true });
    mocks.prisma.platformSetting.upsert.mockResolvedValue({
      key: 'public_topics_enabled',
      value: 'true',
      updatedAt: new Date(),
      updatedBy: { email: 'founder@ilmify.id' },
    });

    const result = await setPlatformSetting(ACTOR, PLATFORM_SETTING_KEYS.PUBLIC_TOPICS_ENABLED, '1');
    expect(result.value).toBe('true');
    expect(mocks.prisma.platformSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ updatedById: 'founder-1' }),
      })
    );
  });

  it('rejects unknown keys', async () => {
    mocks.requirePermission.mockResolvedValue({ allowed: true });
    await expect(
      setPlatformSetting(ACTOR, 'unknown_key' as never, 'x')
    ).rejects.toThrow('PLATFORM_SETTING_UNKNOWN');
  });
});

describe('listPlatformSettings — management only', () => {
  it('returns defaults for keys not yet persisted', async () => {
    mocks.requirePermission.mockResolvedValue({ allowed: true });
    mocks.prisma.platformSetting.findMany.mockResolvedValue([]);
    const result = await listPlatformSettings(ACTOR);
    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result.some((s) => s.key === 'maintenance_mode' && s.value === 'false')).toBe(true);
  });

  it('requires capability', async () => {
    mocks.requirePermission.mockRejectedValue(Object.assign(new Error('Forbidden'), { statusCode: 403 }));
    await expect(listPlatformSettings(ACTOR)).rejects.toThrow('Forbidden');
  });
});
