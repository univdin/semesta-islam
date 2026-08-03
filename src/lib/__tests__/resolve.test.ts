/**
 * SEMESTA ISLAM — Educator Route Resolver (EXP-11) Contract Tests
 * Verifies the Case A / Case B / Case C decision framework:
 *   slug → render, UUID → redirect signal, unknown → notFound signal.
 * The redirect/notFound behavior itself lives in the page and is exercised
 * via runtime smoke tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { resolveEducatorSegment } from '@/lib/educators/resolve';
import type { EducatorDetail } from '@/lib/educators/service';

const detail = (id: string, slug: string): EducatorDetail => ({
  id,
  slug,
  name: 'Ustadz Ahmad',
  title: '',
  location: '',
  rating: 5,
  reviewsCount: 0,
  expertise: [],
  avatar: '',
  verified: false,
  verifiedStatus: 'VERIFIED',
  institution: '',
  method: 'ONLINE',
  bio: '',
  sanad: [],
  credentials: [],
  verification: null,
  courses: [],
});

const NO_MATCH = () => Promise.resolve(null);

describe('resolveEducatorSegment — Case A: canonical slug', () => {
  it('resolves a canonical slug via bySlug', async () => {
    const bySlug = vi.fn().mockResolvedValue(detail('u1', 'ahmad-al-hafiz'));
    const result = await resolveEducatorSegment('ahmad-al-hafiz', { bySlug, byId: NO_MATCH });
    expect(result.matchedBy).toBe('slug');
    expect(result.educator?.id).toBe('u1');
    expect(bySlug).toHaveBeenCalledWith('ahmad-al-hafiz');
    expect(bySlug).toHaveBeenCalledTimes(1);
  });

  it('never hits byId for a slug input', async () => {
    const byId = vi.fn();
    await resolveEducatorSegment('ahmad-al-hafiz', {
      bySlug: () => Promise.resolve(detail('u1', 'ahmad-al-hafiz')),
      byId,
    });
    expect(byId).not.toHaveBeenCalled();
  });
});

describe('resolveEducatorSegment — Case B: legacy UUID', () => {
  it('resolves a UUID via byId and reports matchedBy uuid (redirect signal)', async () => {
    const byId = vi.fn().mockResolvedValue(detail('30000000-0000-0000-0000-000000000401', 'abdullah-hasibuan'));
    const result = await resolveEducatorSegment('30000000-0000-0000-0000-000000000401', {
      bySlug: NO_MATCH,
      byId,
    });
    expect(result.matchedBy).toBe('uuid');
    expect(result.educator?.slug).toBe('abdullah-hasibuan');
    expect(byId).toHaveBeenCalledTimes(1);
  });

  it('never hits bySlug for a UUID input', async () => {
    const bySlug = vi.fn();
    await resolveEducatorSegment('30000000-0000-0000-0000-000000000401', {
      bySlug,
      byId: () => Promise.resolve(detail('u4', 'abdullah-hasibuan')),
    });
    expect(bySlug).not.toHaveBeenCalled();
  });
});

describe('resolveEducatorSegment — Case C: unknown', () => {
  it('returns none for an unknown slug', async () => {
    const result = await resolveEducatorSegment('tidak-ada', { bySlug: NO_MATCH, byId: NO_MATCH });
    expect(result.matchedBy).toBe('none');
    expect(result.educator).toBeNull();
  });

  it('returns none for an unknown UUID', async () => {
    const result = await resolveEducatorSegment('30000000-0000-0000-0000-000000009999', {
      bySlug: NO_MATCH,
      byId: NO_MATCH,
    });
    expect(result.matchedBy).toBe('none');
    expect(result.educator).toBeNull();
  });

  it('returns none for an empty segment', async () => {
    const result = await resolveEducatorSegment('', { bySlug: NO_MATCH, byId: NO_MATCH });
    expect(result.matchedBy).toBe('none');
  });
});
