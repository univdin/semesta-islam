/**
 * SEMESTA ISLAM — Search Console Seam + Knowledge Gap (Phase I/K) Tests
 * Verifies the integrity boundary: demand ≠ truth, and the engine never
 * creates factual claims.
 */

import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { projectEntityPerformance, requireSearchConsoleClient, buildServiceAccountJwt } from '@/lib/search-console/service';
import { identifyKnowledgeGaps } from '@/lib/knowledge-gap/service';

describe('projectEntityPerformance', () => {
  const row = (page: string, impressions: number, clicks: number, position: number) => ({
    keys: { page } as Record<string, string>,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position,
  });

  it('projects impressions/clicks/CTR per entity URL and flags weak CTR', () => {
    const pattern = /^https:\/\/ilmify\.id\/educator\/.+/;
    const rows = [
      row('https://ilmify.id/educator/ahmad', 200, 2, 5.5),
      row('https://ilmify.id/educator/ahmad', 100, 8, 3.0),
      row('https://ilmify.id/directory', 500, 50, 1.5),
    ];
    const projections = projectEntityPerformance(rows, [pattern]);
    expect(projections).toHaveLength(1);
    expect(projections[0].entityUrl).toBe('https://ilmify.id/educator/ahmad');
    expect(projections[0].impressions).toBe(300);
    expect(projections[0].clicks).toBe(10);
    expect(projections[0].ctr).toBeCloseTo(10 / 300, 5);
    expect(projections[0].weakCtr).toBe(false);
  });

  it('flags weak CTR when impressions are high but clicks are near zero', () => {
    const pattern = /^https:\/\/ilmify\.id\/educator\/.+/;
    const rows = [
      row('https://ilmify.id/educator/sulit-diklik', 400, 2, 8.0),
    ];
    const projections = projectEntityPerformance(rows, [pattern]);
    expect(projections[0].weakCtr).toBe(true);
  });

  it('ignores rows that do not match entity URL patterns', () => {
    expect(projectEntityPerformance([], [/^https:\/\/x\.com/])).toEqual([]);
  });
});

describe('requireSearchConsoleClient — fail closed', () => {
  it('throws when no live credentials are configured (never fabricates analytics)', () => {
    expect(() => requireSearchConsoleClient(null)).toThrow('SEARCH_CONSOLE_NOT_CONFIGURED');
  });

  it('throws when a site is configured but no server-side service-account credentials exist', () => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    expect(() => requireSearchConsoleClient({ siteUrl: 'sc-domain:ilmify.id' })).toThrow(
      'SEARCH_CONSOLE_NOT_CONFIGURED'
    );
  });
});

describe('buildServiceAccountJwt — signed assertion', () => {
  it('produces a verify-able RS256 JWT with the expected claims', () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    const jwt = buildServiceAccountJwt({
      email: 'ilmify@univdin.iam.gserviceaccount.com',
      privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
    });
    const [header, claims, signature] = jwt.split('.');
    const decodedHeader = JSON.parse(Buffer.from(header, 'base64url').toString());
    const decodedClaims = JSON.parse(Buffer.from(claims, 'base64url').toString());
    expect(decodedHeader).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(decodedClaims.iss).toBe('ilmify@univdin.iam.gserviceaccount.com');
    expect(decodedClaims.scope).toContain('webmasters.readonly');
    expect(decodedClaims.aud).toBe('https://oauth2.googleapis.com/token');
    expect(decodedClaims.exp - decodedClaims.iat).toBe(3600);
    const ok = crypto.verify('sha256', Buffer.from(`${header}.${claims}`), publicKey, Buffer.from(signature, 'base64url'));
    expect(ok).toBe(true);
  });
});

describe('identifyKnowledgeGaps — demand ≠ truth', () => {
  const educatorCoverage = (url: string | null, verified: boolean) => ({
    entityUrl: url,
    hasVerifiedKnowledge: verified,
    hasPage: url !== null,
  });

  it('flags missing canonical entities for high-demand queries', () => {
    const report = identifyKnowledgeGaps({
      queries: [
        { query: 'ustadz ahmad belajar di mana', impressions: 1200, clicks: 80 },
        { query: 'tahsin anak bandung', impressions: 50, clicks: 5 },
      ],
      coverageForQuery: (q) => educatorCoverage(null, false),
      minImpressions: 100,
    });
    expect(report.gaps).toHaveLength(1);
    expect(report.gaps[0].query).toBe('ustadz ahmad belajar di mana');
    expect(report.gaps[0].missingEntity).toBe(true);
  });

  it('flags existing entities that lack verified knowledge', () => {
    const report = identifyKnowledgeGaps({
      queries: [{ query: 'fiqh muamalah', impressions: 900, clicks: 30 }],
      coverageForQuery: () => educatorCoverage('/topics/fiqh-muamalah', false),
      minImpressions: 0,
    });
    expect(report.gaps[0].missingEntity).toBe(false);
    expect(report.gaps[0].missingVerifiedKnowledge).toBe(true);
  });

  it('never marks a gap as a factual claim', () => {
    const report = identifyKnowledgeGaps({
      queries: [{ query: 'x belajar di y', impressions: 1000, clicks: 10 }],
      coverageForQuery: () => educatorCoverage(null, false),
      minImpressions: 0,
    });
    expect(report.gaps.every((g) => g.isFactualClaim === false)).toBe(true);
  });

  it('does not report gaps when coverage is strong', () => {
    const report = identifyKnowledgeGaps({
      queries: [{ query: 'fiqh muamalah', impressions: 800, clicks: 40 }],
      coverageForQuery: () => educatorCoverage('/topics/fiqh-muamalah', true),
      minImpressions: 0,
    });
    expect(report.gaps).toEqual([]);
  });
});
