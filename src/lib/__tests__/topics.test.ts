/**
 * SEMESTA ISLAM — Topic Taxonomy (EXP-03) Contract Tests
 * Verifies the indexability quality gate, slug/alias resolution, and the
 * trust rule (only VERIFIED claims produce authoritative public educators).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const topic = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    groupBy: vi.fn(),
  };
  const topicAlias = { findUnique: vi.fn(), findMany: vi.fn() };
  const knowledgeClaim = { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() };
  return { prisma: { topic, topicAlias, knowledgeClaim } };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

import { isTopicIndexable, listPublishedTopics, getTopicBySlug } from '@/lib/topics/service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('isTopicIndexable — thin-page quality gate', () => {
  it('is not indexable when DRAFT even with content', () => {
    expect(isTopicIndexable({ description: 'x'.repeat(30), verifiedEducatorCount: 3, status: 'DRAFT' })).toBe(false);
  });

  it('is not indexable when ARCHIVED', () => {
    expect(isTopicIndexable({ description: 'x'.repeat(30), verifiedEducatorCount: 3, status: 'ARCHIVED' })).toBe(false);
  });

  it('is not indexable when published, empty description and no verified educators', () => {
    expect(isTopicIndexable({ description: '', verifiedEducatorCount: 0, status: 'PUBLISHED' })).toBe(false);
  });

  it('is indexable with a meaningful description', () => {
    expect(isTopicIndexable({ description: 'Kajian fiqh muamalah dan ibadah.', verifiedEducatorCount: 0, status: 'PUBLISHED' })).toBe(true);
  });

  it('is indexable with at least one verified educator even without a description', () => {
    expect(isTopicIndexable({ description: '', verifiedEducatorCount: 1, status: 'PUBLISHED' })).toBe(true);
  });

  it('is not indexable with a too-short description', () => {
    expect(isTopicIndexable({ description: 'Kajian.', verifiedEducatorCount: 0, status: 'PUBLISHED' })).toBe(false);
  });
});

describe('listPublishedTopics — thin topics excluded from the public index', () => {
  const publishedRow = (id: string, name: string, slug: string) => ({
    id,
    name,
    slug,
    description: 'Deskripsi bermakna tentang topik ini dalam bahasa Indonesia.',
    parentId: null,
    status: 'PUBLISHED',
    sortOrder: 1,
  });

  it('includes only indexable topics by default', async () => {
    mocks.prisma.topic.findMany.mockResolvedValue([
      publishedRow('t1', 'Fiqh', 'fiqh'),
      { ...publishedRow('t2', 'Thin', 'thin'), description: '' },
    ]);
    mocks.prisma.knowledgeClaim.groupBy.mockResolvedValue([]);
    mocks.prisma.topic.groupBy.mockResolvedValue([]);

    const result = await listPublishedTopics();
    expect(result.map((t) => t.slug)).toEqual(['fiqh']);
    expect(result[0].indexable).toBe(true);
  });

  it('can include thin topics when requested', async () => {
    mocks.prisma.topic.findMany.mockResolvedValue([
      { ...publishedRow('t1', 'Thin', 'thin'), description: '' },
    ]);
    mocks.prisma.knowledgeClaim.groupBy.mockResolvedValue([]);
    mocks.prisma.topic.groupBy.mockResolvedValue([]);

    const result = await listPublishedTopics({ includeThin: true });
    expect(result).toHaveLength(1);
    expect(result[0].indexable).toBe(false);
  });
});

describe('getTopicBySlug — resolution and stats', () => {
  const topicRow = (id: string, slug: string, status: 'PUBLISHED' | 'DRAFT' = 'PUBLISHED') => ({
    id,
    name: 'Tahsin & Qira\'ah',
    slug,
    description: 'Perbaikan bacaan Al-Qur\u2019an (tahsin), ilmu tajwid, dan sanad qira\u2019ah.',
    parentId: null,
    status,
    sortOrder: 1,
  });

  it('returns null for an empty slug', async () => {
    expect(await getTopicBySlug('')).toBeNull();
  });

  it('returns a topic with stats when found', async () => {
    mocks.prisma.topic.findUnique.mockResolvedValue(topicRow('t1', 'tahsin-qiraah'));
    mocks.prisma.topic.findMany.mockResolvedValue([]);
    mocks.prisma.topicAlias.findMany.mockResolvedValue([]);
    mocks.prisma.knowledgeClaim.count.mockResolvedValue(2);
    mocks.prisma.topic.count.mockResolvedValue(0);

    const result = await getTopicBySlug('tahsin-qiraah', { includeStats: true });
    expect(result?.slug).toBe('tahsin-qiraah');
    expect(result?.verifiedEducatorCount).toBe(2);
    expect(result?.indexable).toBe(true);
  });

  it('returns null for an unknown slug', async () => {
    mocks.prisma.topic.findUnique.mockResolvedValue(null);
    expect(await getTopicBySlug('tidak-ada')).toBeNull();
  });

  it('marks DRAFT topics as not indexable', async () => {
    mocks.prisma.topic.findUnique.mockResolvedValue(topicRow('t1', 'draft-topic', 'DRAFT'));
    mocks.prisma.topic.findMany.mockResolvedValue([]);
    mocks.prisma.topicAlias.findMany.mockResolvedValue([]);
    mocks.prisma.knowledgeClaim.count.mockResolvedValue(5);
    mocks.prisma.topic.count.mockResolvedValue(0);

    const result = await getTopicBySlug('draft-topic', { includeStats: true });
    expect(result?.status).toBe('DRAFT');
    expect(result?.indexable).toBe(false);
  });
});
