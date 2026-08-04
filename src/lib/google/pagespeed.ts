/**
 * SEMESTA ISLAM — Google PageSpeed Insights & Web Vitals Integration
 *
 * Server-only service consuming Google PageSpeed Insights API v5.
 * Fails gracefully when `GOOGLE_API_KEY` is absent or network is restricted.
 */

import { env } from '@/lib/env';

export interface PageSpeedAuditOptions {
  url: string;
  strategy?: 'mobile' | 'desktop';
  categories?: Array<'performance' | 'accessibility' | 'best-practices' | 'seo'>;
}

export interface PageSpeedScorecard {
  url: string;
  strategy: 'mobile' | 'desktop';
  fetchTimestamp: string;
  scores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  metrics: {
    firstContentfulPaintMs: number | null;
    largestContentfulPaintMs: number | null;
    totalBlockingTimeMs: number | null;
    cumulativeLayoutShift: number | null;
    speedIndexMs: number | null;
  };
}

const PSI_API_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export async function fetchPageSpeedAudit(
  options: PageSpeedAuditOptions
): Promise<PageSpeedScorecard> {
  const apiKey = env.GOOGLE_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('PAGESPEED_API_KEY_MISSING: GOOGLE_API_KEY environment variable is not configured.');
  }

  const strategy = options.strategy ?? 'mobile';
  const categories = options.categories ?? ['performance', 'accessibility', 'best-practices', 'seo'];

  const params = new URLSearchParams({
    url: options.url,
    key: apiKey,
    strategy,
  });

  categories.forEach((cat) => params.append('category', cat));

  const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilmify.id';

  const response = await fetch(`${PSI_API_ENDPOINT}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Referer: siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`,
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`PAGESPEED_API_FAILED: HTTP ${response.status} — ${errorText}`);
  }

  const data = await response.json();

  const lighthouse = data?.lighthouseResult;
  const cats = lighthouse?.categories ?? {};
  const audits = lighthouse?.audits ?? {};

  return {
    url: options.url,
    strategy,
    fetchTimestamp: new Date().toISOString(),
    scores: {
      performance: cats.performance?.score != null ? Math.round(cats.performance.score * 100) : null,
      accessibility: cats.accessibility?.score != null ? Math.round(cats.accessibility.score * 100) : null,
      bestPractices: cats['best-practices']?.score != null ? Math.round(cats['best-practices'].score * 100) : null,
      seo: cats.seo?.score != null ? Math.round(cats.seo.score * 100) : null,
    },
    metrics: {
      firstContentfulPaintMs: audits['first-contentful-paint']?.numericValue ?? null,
      largestContentfulPaintMs: audits['largest-contentful-paint']?.numericValue ?? null,
      totalBlockingTimeMs: audits['total-blocking-time']?.numericValue ?? null,
      cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue ?? null,
      speedIndexMs: audits['speed-index']?.numericValue ?? null,
    },
  };
}
