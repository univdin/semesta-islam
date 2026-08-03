/**
 * SEMESTA ISLAM — Search Console Intelligence (Phase I)
 *
 * Server-side seam for Google Search Console. This module:
 *   - is server-only (imports nothing from client);
 *   - never exposes OAuth tokens to the client;
 *   - treats Search Console data as PERFORMANCE/DEMAND evidence, never as
 *     factual evidence about an entity.
 *
 * The live OAuth + Search Analytics ingestion requires an authorized Google
 * property and stored server-side credentials, which are not present in this
 * repository. The seam below defines the typed boundaries so ingestion can be
 * wired without re-architecting.
 *
 * Search demand ≠ truth. This module may inform discovery priorities and
 * knowledge-gap candidates; it must NEVER create or verify claims.
 */

export type SearchAnalyticsDimension =
  | 'date'
  | 'page'
  | 'query'
  | 'country'
  | 'device'
  | 'searchAppearance';

export type SearchAnalyticsMetric = 'clicks' | 'impressions' | 'ctr' | 'position';

export interface SearchAnalyticsRow {
  keys: Record<SearchAnalyticsDimension, string>;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleConfig {
  /** OAuth client identifier. Server-side only. */
  clientId: string;
  /** OAuth client secret. Server-side only. Never serialized to the client. */
  clientSecret: string;
  /** Google Search Console site property URL. */
  siteUrl: string;
}

export interface SearchAnalyticsQuery {
  startDate: string;
  endDate: string;
  dimensions: SearchAnalyticsDimension[];
  rowLimit?: number;
}

export interface SearchConsoleClient {
  listProperties(): Promise<{ siteUrl: string }[]>;
  queryAnalytics(query: SearchAnalyticsQuery): Promise<SearchAnalyticsRow[]>;
}

/**
 * Placeholder seam: throws when no live client is configured. Callers must
 * gate ingestion behind `search_console_enabled` platform setting and catch
 * this error gracefully. This guarantees the seam never silently fabricates
 * analytics.
 */
export function requireSearchConsoleClient(
  _config: SearchConsoleConfig | null
): SearchConsoleClient {
  if (!_config) {
    throw new Error(
      'SEARCH_CONSOLE_NOT_CONFIGURED: live Search Console integration requires server-side OAuth credentials.'
    );
  }
  throw new Error('SEARCH_CONSOLE_CLIENT_NOT_IMPLEMENTED: implement the Google Search Console API client server-side.');
}

/**
 * Classify Search Analytics rows into entity/topic performance projections.
 * Pure function — deterministic, no I/O.
 */
export interface EntityPerformanceProjection {
  entityUrl: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  /** High impressions but low CTR = discoverable but not compelling. */
  weakCtr: boolean;
}

export function projectEntityPerformance(
  rows: SearchAnalyticsRow[],
  entityUrlPatterns: RegExp[]
): EntityPerformanceProjection[] {
  const byUrl = new Map<string, SearchAnalyticsRow[]>();
  for (const row of rows) {
    const page = row.keys.page ?? '';
    const matching = entityUrlPatterns.some((pattern) => pattern.test(page));
    if (!matching) continue;
    const list = byUrl.get(page) ?? [];
    list.push(row);
    byUrl.set(page, list);
  }

  const projections: EntityPerformanceProjection[] = [];
  for (const [entityUrl, list] of byUrl) {
    const impressions = list.reduce((sum, r) => sum + r.impressions, 0);
    const clicks = list.reduce((sum, r) => sum + r.clicks, 0);
    const weightedPosition = list.reduce(
      (sum, r) => sum + r.position * r.impressions,
      0
    );
    const avgPosition = impressions > 0 ? weightedPosition / impressions : 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;
    projections.push({
      entityUrl,
      impressions,
      clicks,
      ctr,
      averagePosition: avgPosition,
      weakCtr: impressions >= 100 && ctr < 0.02,
    });
  }

  return projections.sort((a, b) => b.impressions - a.impressions);
}
