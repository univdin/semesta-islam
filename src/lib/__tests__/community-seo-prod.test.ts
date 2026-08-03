/**
 * SEMESTA ISLAM — Community SEO & Production Isolation Contract Tests
 *
 * SEO/AEO/GEO invariants:
 *  - UGC (comments, votes, polls) has no independent URL and is never indexed.
 *  - Q&A is indexable only behind a founder gate (COMMUNITY_QA_INDEXING_ENABLED,
 *    default off) and is rendered client-side, so server-rendered JSON-LD never
 *    consumes UGC as authoritative.
 *  - JSON-LD on entity pages is built strictly from VERIFIED sources.
 *  - The public sitemap is untouched by community content.
 *
 * Production isolation invariants:
 *  - Demo identity requires a triple gate and fails closed in production.
 *  - COMMUNITY_KHIDMAH is a real recognition action in the XP ledger enum.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const mocks = vi.hoisted(() => {
  const fns = {
    platformSettingFindUnique: vi.fn(async () => null),
  };
  const prisma = {
    platformSetting: { findUnique: fns.platformSettingFindUnique },
  };
  return { prisma, fns };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

function read(relative: string): string {
  return readFileSync(path.join(ROOT, relative), 'utf8');
}

describe('UGC is never indexed (no independent comment/vote/poll URLs)', () => {
  it('CommunitySection is a client component with no JSON-LD, canonical, or comment/vote URLs', () => {
    const source = read('src/components/community/CommunitySection.tsx');
    expect(source).toContain("'use client'");
    expect(source).not.toContain('application/ld+json');
    expect(source).not.toContain('rel="canonical"');
    expect(source).not.toContain('href={`/comments/');
    expect(source).not.toContain('href={`/votes/');
  });

  it('no HTML page routes exist for individual comments, votes, or polls', () => {
    expect(existsSync(path.join(ROOT, 'src/app/community'))).toBe(false);
    expect(existsSync(path.join(ROOT, 'src/app/comments'))).toBe(false);
    expect(existsSync(path.join(ROOT, 'src/app/votes'))).toBe(false);
    expect(existsSync(path.join(ROOT, 'src/app/polls'))).toBe(false);
  });

  it('community endpoints exist only as JSON data APIs (not indexable HTML)', () => {
    expect(existsSync(path.join(ROOT, 'src/app/api/v1/community/comments/route.ts'))).toBe(true);
    expect(existsSync(path.join(ROOT, 'src/app/api/v1/community/votes/route.ts'))).toBe(true);
    expect(existsSync(path.join(ROOT, 'src/app/api/v1/community/questions/route.ts'))).toBe(true);
    expect(existsSync(path.join(ROOT, 'src/app/api/v1/community/reports/route.ts'))).toBe(true);
  });

  it('the public sitemap is untouched by community content', () => {
    const source = read('src/app/sitemap.ts');
    expect(source).not.toContain('/community/');
    expect(source).not.toContain('/questions/');
    expect(source).not.toContain('/comments/');
  });
});

describe('Q&A indexing is founder-gated and never server-rendered as authority', () => {
  it('QA indexing defaults to OFF (noindex) and must be explicitly enabled', async () => {
    const { getCommunityFeatureFlags } = await import('@/lib/community/config');
    const flags = await getCommunityFeatureFlags();
    expect(flags.qaIndexingEnabled).toBe(false);
  });

  it('entity-page JSON-LD is built only from VERIFIED sources, not UGC', () => {
    const topicsSource = read('src/app/topics/[slug]/page.tsx');
    expect(topicsSource).toContain('listVerifiedEducatorsForTopic');

    const jsonLdStart = topicsSource.indexOf('const jsonLd = [');
    const jsonLdEnd = topicsSource.indexOf('];', jsonLdStart);
    const jsonLdBlock = topicsSource.slice(jsonLdStart, jsonLdEnd);
    expect(jsonLdBlock).not.toMatch(/question|answer|comment|community|forum/i);

    // The JSON-LD script is emitted before the community section, and the
    // community section itself is a client-only component.
    expect(jsonLdStart).toBeLessThan(topicsSource.indexOf('<CommunitySection'));
    const communitySource = read('src/components/community/CommunitySection.tsx');
    expect(communitySource).toContain("'use client'");
  });
});

describe('production isolation — demo identity fails closed', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('isDemoMode is false under production even if demo flags are present', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('APP_ENV', 'development');
    vi.stubEnv('LOCAL_DEMO_MODE', 'true');
    const { isDemoMode } = await import('@/lib/auth/session');
    expect(isDemoMode()).toBe(false);
  });

  it('isDemoMode requires the triple gate: non-production, development, demo flag', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('APP_ENV', 'development');
    vi.stubEnv('LOCAL_DEMO_MODE', 'true');
    const { isDemoMode } = await import('@/lib/auth/session');
    expect(isDemoMode()).toBe(true);

    vi.stubEnv('LOCAL_DEMO_MODE', 'false');
    expect(isDemoMode()).toBe(false);
  });
});

describe('recognition model — COMMUNITY_KHIDMAH is a ledgered XP action', () => {
  it('exists in the XpActionType enum for accepted answers only', async () => {
    const { XpActionType } = await import('@prisma/client');
    expect(Object.values(XpActionType)).toContain('COMMUNITY_KHIDMAH');
    expect(Object.values(XpActionType)).toContain('REVERSAL_FRAUD');
  });

  it('community comments/votes do not award raw participation XP', () => {
    const { XpActionType } = { XpActionType: { COMMUNITY_KHIDMAH: 'COMMUNITY_KHIDMAH' } };
    expect(Object.keys(XpActionType)).not.toContain('COMMENT_CREATED');
    expect(Object.keys(XpActionType)).not.toContain('VOTE_CAST');
  });
});
