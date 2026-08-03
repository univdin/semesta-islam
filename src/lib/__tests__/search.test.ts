/**
 * SEMESTA ISLAM — Discovery / Search (EXP-07) Contract Tests
 * Verifies server-side search filter construction, ranking, pagination math,
 * and the wired DirectoryFilterSchema (query-string coercion).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const findMany = vi.fn();
  const count = vi.fn();
  return {
    findMany,
    count,
    prisma: {
      educatorProfile: { findMany, count },
    },
  };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

import { searchEducators } from '@/lib/educators/service';
import { DirectoryFilterSchema } from '@/lib/validations';

function row(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    slug: `${id}-slug`,
    titleSuffix: 'Pakar Fiqh',
    ratingAverage: 4.9,
    reviewsCount: 10,
    verifiedStatus: 'VERIFIED',
    institutionName: 'Al-Azhar',
    teachingMethod: 'ONLINE_ZOOM',
    user: {
      profile: {
        fullName: 'Ustadz Ahmad',
        locationCity: 'Jakarta',
        avatarUrl: 'https://img/a.png',
        bio: 'Fiqh dan tahsin',
      },
    },
    courses: [{ title: 'Kajian Fiqh', category: 'Fiqh' }],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('searchEducators — filter construction', () => {
  it('returns an empty result set for an empty dataset', async () => {
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);
    const result = await searchEducators();
    expect(result.total).toBe(0);
    expect(result.educators).toEqual([]);
    expect(result.hasMore).toBe(false);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, take: 9, skip: 0 })
    );
  });

  it('builds insensitive OR conditions for the q query', async () => {
    mocks.findMany.mockResolvedValue([row('e1')]);
    mocks.count.mockResolvedValue(1);
    await searchEducators({ q: 'tahsin' });
    const arg = mocks.findMany.mock.calls[0][0];
    expect(arg.where.OR).toEqual([
      { user: { profile: { fullName: { contains: 'tahsin', mode: 'insensitive' } } } },
      { titleSuffix: { contains: 'tahsin', mode: 'insensitive' } },
      { institutionName: { contains: 'tahsin', mode: 'insensitive' } },
      { user: { profile: { bio: { contains: 'tahsin', mode: 'insensitive' } } } },
      { courses: { some: { title: { contains: 'tahsin', mode: 'insensitive' } } } },
      { courses: { some: { category: { contains: 'tahsin', mode: 'insensitive' } } } },
    ]);
  });

  it('applies expertise, location and method filters', async () => {
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);
    await searchEducators({
      expertise: 'Fiqh',
      location: 'Bandung',
      method: 'PRIVATE_HOME',
    });
    const arg = mocks.findMany.mock.calls[0][0];
    expect(arg.where.courses.some.category).toEqual({ contains: 'Fiqh', mode: 'insensitive' });
    expect(arg.where.user.profile.locationCity).toEqual({ contains: 'Bandung', mode: 'insensitive' });
    expect(arg.where.teachingMethod).toBe('PRIVATE_HOME');
  });

  it('sorts by reviews when requested', async () => {
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);
    await searchEducators({ sort: 'reviews' });
    const arg = mocks.findMany.mock.calls[0][0];
    expect(arg.orderBy).toEqual([{ reviewsCount: 'desc' }, { ratingAverage: 'desc' }]);
  });
});

describe('searchEducators — pagination math', () => {
  it('computes take/skip and hasMore correctly', async () => {
    mocks.findMany.mockResolvedValue([row('e1'), row('e2'), row('e3')]);
    mocks.count.mockResolvedValue(10);
    const result = await searchEducators({ page: 2, limit: 3 });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(3);
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 3, skip: 3 }));
    expect(result.hasMore).toBe(true); // 2*3=6 < 10
  });

  it('clamps page/limit to safe bounds', async () => {
    mocks.findMany.mockResolvedValue([]);
    mocks.count.mockResolvedValue(0);
    await searchEducators({ page: 0, limit: 999 });
    const arg = mocks.findMany.mock.calls[0][0];
    expect(arg.take).toBe(50);
    expect(arg.skip).toBe(0);
  });
});

describe('DirectoryFilterSchema (wired, query-string coercion)', () => {
  it('parses string query params with defaults', () => {
    const parsed = DirectoryFilterSchema.parse({
      q: 'tahsin',
      method: 'all',
      sort: 'rating',
      page: '2',
      limit: '12',
    });
    expect(parsed.q).toBe('tahsin');
    expect(parsed.method).toBe('all');
    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(12);
  });

  it('rejects an over-limit page size', () => {
    const parsed = DirectoryFilterSchema.safeParse({ limit: '999' });
    expect(parsed.success).toBe(false);
  });
});
