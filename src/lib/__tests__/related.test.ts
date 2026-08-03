/**
 * SEMESTA ISLAM — Related Educator Scoring (EXP-02) Contract Tests
 * Verifies the deterministic relatedness formula:
 *   +2 / shared course category, +3 / shared institution, +4 / shared topic.
 * Pure function; no DB access.
 */

import { describe, it, expect } from 'vitest';
import { computeRelatedEducators, type RelatednessCandidate } from '@/lib/educators/related';

const TARGET = {
  id: 'edu-target',
  expertise: ['Fiqh', 'Tahsin'],
  institution: 'UIN Sumatera Utara',
  topics: ['Tajwid'],
};

function cand(id: string, overrides: Partial<RelatednessCandidate> = {}): RelatednessCandidate {
  return {
    id,
    slug: `${id}-slug`,
    name: `Pendidik ${id}`,
    title: 'Pengajar',
    location: 'Jakarta',
    avatar: '',
    verified: true,
    expertise: [],
    institution: '',
    topics: [],
    ...overrides,
  };
}

describe('computeRelatedEducators', () => {
  it('returns no related educators when there are no shared signals', () => {
    const result = computeRelatedEducators(TARGET, [cand('a', { expertise: ['Akhlak'] })]);
    expect(result).toEqual([]);
  });

  it('scores +2 per shared course category and explains the reason', () => {
    const result = computeRelatedEducators(TARGET, [
      cand('a', { expertise: ['Fiqh'] }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].score).toBe(2);
    expect(result[0].reason).toContain('Berbagi bidang: Fiqh');
  });

  it('scores +4 per shared verified topic (higher than category)', () => {
    const result = computeRelatedEducators(TARGET, [
      cand('a', { topics: ['Tajwid'] }),
    ]);
    expect(result[0].score).toBe(4);
    expect(result[0].reason).toContain('Berbagi topik: Tajwid');
  });

  it('scores +3 for a shared institution', () => {
    const result = computeRelatedEducators(TARGET, [
      cand('a', { institution: 'uin sumatera utara' }),
    ]);
    expect(result[0].score).toBe(3);
    expect(result[0].reason).toContain('Berbagi institusi');
  });

  it('combines signals and sorts by score descending', () => {
    const result = computeRelatedEducators(TARGET, [
      cand('weak', { expertise: ['Fiqh'] }), // 2
      cand('strong', { expertise: ['Tahsin'], topics: ['Tajwid'] }), // 2+4=6
      cand('med', { institution: 'UIN Sumatera Utara', expertise: ['Fiqh'] }), // 3+2=5
    ]);
    expect(result.map((r) => r.id)).toEqual(['strong', 'med', 'weak']);
    expect(result[0].score).toBe(6);
  });

  it('excludes the target educator itself', () => {
    const result = computeRelatedEducators(TARGET, [
      cand('edu-target', { expertise: ['Fiqh'], topics: ['Tajwid'] }),
    ]);
    expect(result).toEqual([]);
  });

  it('respects the result limit', () => {
    const result = computeRelatedEducators(
      TARGET,
      [
        cand('a', { expertise: ['Fiqh'] }),
        cand('b', { expertise: ['Tahsin'] }),
        cand('c', { topics: ['Tajwid'] }),
      ],
      2
    );
    expect(result).toHaveLength(2);
  });

  it('matches case-insensitively', () => {
    const result = computeRelatedEducators(TARGET, [
      cand('a', { topics: ['TAJWID'] }),
    ]);
    expect(result[0].score).toBe(4);
  });

  it('caps the reason at two signals', () => {
    const result = computeRelatedEducators(TARGET, [
      cand('a', { expertise: ['Fiqh', 'Tahsin'], institution: 'UIN Sumatera Utara' }),
    ]);
    const parts = result[0].reason.split(' · ');
    expect(parts.length).toBeLessThanOrEqual(2);
  });
});
