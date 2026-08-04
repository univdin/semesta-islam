/**
 * SEMESTA ISLAM — Search Console Intelligence (Phase I)
 *
 * Server-side seam for Google Search Console. This module:
 *   - is server-only (imports nothing from client);
 *   - never exposes OAuth tokens to the client;
 *   - treats Search Console data as PERFORMANCE/DEMAND evidence, never as
 *     factual evidence about an entity.
 *
 * Live ingestion uses a Google service account (server-to-server, JWT OAuth2,
 * scope `webmasters.readonly`) loaded from server-only env
 * (`GOOGLE_SERVICE_ACCOUNT_JSON`, or `GOOGLE_SERVICE_ACCOUNT_EMAIL` +
 * `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`). The seam FAILS CLOSED: without env
 * credentials it throws `SEARCH_CONSOLE_NOT_CONFIGURED` and never fabricates
 * analytics.
 *
 * Search demand ≠ truth. This module may inform discovery priorities and
 * knowledge-gap candidates; it must NEVER create or verify claims.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const TOKEN_URI = 'https://oauth2.googleapis.com/token';
const GSC_API = 'https://www.googleapis.com/webmasters/v3';
const INSPECT_API = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

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
  /** Google Search Console site property URL (e.g. `sc-domain:ilmify.id`). */
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
  inspectUrl(url: string): Promise<{ verdict?: string; lastCrawlTime?: string }>;
}

function b64url(data: string | Buffer): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, '\n');
}

/** Build a signed RS256 JWT assertion for the service-account OAuth2 flow. */
export function buildServiceAccountJwt(opts: {
  email: string;
  privateKey: string;
  scope?: string;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: opts.email,
      scope: opts.scope ?? GSC_SCOPE,
      aud: TOKEN_URI,
      iat: now,
      exp: now + 3600,
    })
  );
  const input = `${header}.${claims}`;
  const signature = b64url(crypto.sign('sha256', Buffer.from(input), normalizePrivateKey(opts.privateKey)));
  return `${input}.${signature}`;
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

async function fetchAccessToken(email: string, privateKey: string): Promise<string> {
  const cached = tokenCache.get(email);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const res = await fetch(TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: buildServiceAccountJwt({ email, privateKey }),
    }),
  });
  if (!res.ok) {
    throw new Error(`SEARCH_CONSOLE_TOKEN_EXCHANGE_FAILED: ${res.status}`);
  }
  const body = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new Error('SEARCH_CONSOLE_TOKEN_EXCHANGE_FAILED: no access_token');
  tokenCache.set(email, { token: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000 });
  return body.access_token;
}
/** Load service-account credentials from server-only env. Returns null when absent. */
export function loadServiceAccountFromEnv(): { email: string; privateKey: string } | null {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_PATH;
  if (keyPath) {
    try {
      const fullPath = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);
      if (fs.existsSync(fullPath)) {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(fileContent) as { client_email?: string; private_key?: string };
        if (parsed.client_email && parsed.private_key) {
          return { email: parsed.client_email, privateKey: parsed.private_key };
        }
      }
    } catch {
      /* fall through */
    }
  }

  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const parsed = JSON.parse(json) as { client_email?: string; private_key?: string };
      if (parsed.client_email && parsed.private_key) {
        return { email: parsed.client_email, privateKey: parsed.private_key };
      }
    } catch {
      /* malformed JSON: fall through to explicit env vars */
    }
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (email && privateKey) return { email, privateKey };
  return null;
}

/** Create a live Search Console client backed by service-account credentials. */
export function createServiceAccountSearchConsoleClient(
  creds: { email: string; privateKey: string },
  siteUrl: string
): SearchConsoleClient {
  async function authed(path: string, init?: RequestInit): Promise<Response> {
    const token = await fetchAccessToken(creds.email, creds.privateKey);
    return fetch(path, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
    });
  }

  return {
    async listProperties() {
      const res = await authed(`${GSC_API}/sites`);
      if (!res.ok) throw new Error(`SEARCH_CONSOLE_LIST_SITES_FAILED: ${res.status}`);
      const body = (await res.json()) as { siteEntry?: { siteUrl?: string }[] };
      return (body.siteEntry ?? [])
        .map((s) => s.siteUrl)
        .filter((s): s is string => typeof s === 'string')
        .map((siteUrl: string) => ({ siteUrl }));
    },

    async queryAnalytics(query: SearchAnalyticsQuery) {
      const res = await authed(`${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: query.startDate,
          endDate: query.endDate,
          dimensions: query.dimensions,
          rowLimit: query.rowLimit ?? 25,
        }),
      });
      if (!res.ok) throw new Error(`SEARCH_CONSOLE_QUERY_FAILED: ${res.status}`);
      const body = (await res.json()) as { rows?: { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }[] };
      return (body.rows ?? []).map((row) => {
        const keys = {} as Record<SearchAnalyticsDimension, string>;
        (query.dimensions as string[]).forEach((dim, i) => {
          keys[dim as SearchAnalyticsDimension] = row.keys?.[i] ?? '';
        });
        return {
          keys,
          clicks: row.clicks ?? 0,
          impressions: row.impressions ?? 0,
          ctr: row.ctr ?? 0,
          position: row.position ?? 0,
        };
      });
    },

    async inspectUrl(url: string) {
      const res = await authed(INSPECT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: url, siteUrl }),
      });
      if (!res.ok) throw new Error(`SEARCH_CONSOLE_URL_INSPECT_FAILED: ${res.status}`);
      const body = (await res.json()) as {
        inspectionResult?: {
          indexStatusResult?: { verdict?: string; lastCrawlTime?: string };
        };
      };
      const r = body.inspectionResult?.indexStatusResult;
      return { verdict: r?.verdict, lastCrawlTime: r?.lastCrawlTime };
    },
  };
}

/**
 * Seam: returns a live client when server-side service-account credentials are
 * configured, otherwise throws (fail closed). Callers must gate ingestion
 * behind the `search_console_enabled` platform setting and catch this error
 * gracefully. This guarantees the seam never silently fabricates analytics.
 */
export function requireSearchConsoleClient(
  config: SearchConsoleConfig | null
): SearchConsoleClient {
  if (!config) {
    throw new Error(
      'SEARCH_CONSOLE_NOT_CONFIGURED: live Search Console integration requires a site property and server-side service-account credentials (GOOGLE_SERVICE_ACCOUNT_JSON).'
    );
  }
  const creds = loadServiceAccountFromEnv();
  if (!creds) {
    throw new Error(
      'SEARCH_CONSOLE_NOT_CONFIGURED: live Search Console integration requires server-side service-account credentials (GOOGLE_SERVICE_ACCOUNT_JSON, or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY).'
    );
  }
  return createServiceAccountSearchConsoleClient(creds, config.siteUrl);
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
