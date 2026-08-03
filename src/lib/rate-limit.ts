/**
 * SEMESTA ISLAM — Upstash Redis Rate Limiter
 * Governed by docs/08_SECURITY_COMPLIANCE.md & DECISION-01 (defense in depth).
 *
 * Wraps @upstash/ratelimit over the Vercel KV / Upstash REST endpoint.
 * Public endpoints (e.g. /api/health, demo-login) get a lightweight fixed-window
 * guard so an anonymous caller cannot hammer the origin. Server-internal routes
 * are NOT rate-limited here — they already enforce auth/role boundaries.
 *
 * Env (Vercel KV integration, all set): KV_REST_API_URL, KV_REST_API_TOKEN.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL ?? '';
const token = process.env.KV_REST_API_TOKEN ?? '';

export function isRedisConfigured(): boolean {
  return url.includes('upstash') && url !== '' && token !== '';
}

const anonymousLimiter = isRedisConfigured()
  ? new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.fixedWindow(30, '60 s'),
      prefix: 'semesta:rl:anon',
    })
  : null;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimitAnonymous(
  identifier: string
): Promise<RateLimitResult | null> {
  if (!anonymousLimiter) return null;
  const res = await anonymousLimiter.limit(identifier);
  return {
    success: res.success,
    limit: res.limit,
    remaining: res.remaining,
    reset: res.reset,
  };
}
