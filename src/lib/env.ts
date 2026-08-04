/**
 * SEMESTA ISLAM — Validated Environment Configuration
 * Governed by MASTER_PARALLEL_EXECUTION_DIRECTIVE v3.0 §11 (foundation).
 *
 * Single source of truth for process.env reads. Fails fast with a descriptive
 * error when a REQUIRED variable is missing or invalid, so misconfiguration is
 * caught at startup instead of surfacing as obscure runtime failures.
 *
 * Cloud-gated secrets (Supabase / Upstash / Resend) are OPTIONAL by design:
 * production adapters are activated per policy, never implicitly.
 */

import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  // Runtime flags (not inlined; read server-side only)
  LOCAL_DEMO_MODE: z.enum(['true', 'false']).default('false'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  // Public client config
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // Server-only secrets (cloud-gated; optional until activated)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_EMAIL_DOMAIN: z.string().min(3).optional(),

  // Google Cloud & Integration Credentials (Server-only)
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_PATH: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional(),

  // Business fallback (DECISION-01): integer percent 0..100
  PLATFORM_COMMISSION_PERCENTAGE: z.coerce.number().int().min(0).max(100).default(0),

  // Production bootstrap
  BOOTSTRAP_FOUNDER_EMAIL: z.string().optional(),
  BOOTSTRAP_FOUNDER_NAME: z.string().optional(),

  // Adapter selection (see docs/plan/EXECUTION_REGISTRY.md section A/B)
  MAGIC_LINK_PROVIDER: z.enum(['supabase', 'resend', 'mock']).default('resend'),
  STORAGE_MODE: z.enum(['local', 'supabase', 'mock']).default('mock'),
  OCR_MODE: z.enum(['tesseract', 'mock']).default('mock'),
  PAYMENT_PROVIDER: z.enum(['mock', 'midtrans', 'xendit']).default('mock'),
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration — ${issues}`);
}

export const env: Env = parsed.data;

export function isProductionEnvironment(): boolean {
  return env.NODE_ENV === 'production' && env.APP_ENV === 'production';
}
