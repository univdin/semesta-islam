/**
 * SEMESTA ISLAM — Integration Health & Job Service
 * Governed by Google Cloud & Workspace Integration Directive §24, §32, §34.
 *
 * External providers (Drive, Gmail, Calendar, Meet, Sheets, Docs) are tracked
 * via a health model + job queue with retry + exponential backoff. The
 * application never blocks critical user requests on external providers.
 */

import { prisma } from '@/lib/db';
import { CAPABILITIES } from '@/lib/auth/permissions';
import { authorize, type AuthorizationActor } from '@/lib/auth/authorization';

export type ProviderName =
  | 'google-drive'
  | 'gmail'
  | 'google-calendar'
  | 'google-meet'
  | 'google-sheets'
  | 'google-docs'
  | 'google-workspace'
  | 'local';

export const PROVIDERS: ProviderName[] = [
  'google-drive',
  'gmail',
  'google-calendar',
  'google-meet',
  'google-sheets',
  'google-docs',
  'google-workspace',
  'local',
];

export async function recordIntegrationStatus(
  provider: ProviderName,
  status: 'CONNECTED' | 'SYNCED' | 'FAILED' | 'DISCONNECTED',
  opts: { errorCode?: string; errorMessage?: string; latencyMs?: number; quotaStatus?: string } = {}
) {
  return prisma.integrationHealth.upsert({
    where: { provider },
    update: {
      status,
      ...(status === 'FAILED' ? { lastFailureAt: new Date() } : {}),
      ...(status === 'SYNCED' || status === 'CONNECTED' ? { lastSuccessAt: new Date() } : {}),
      errorCode: opts.errorCode ?? null,
      errorMessage: opts.errorMessage ?? null,
      latencyMs: opts.latencyMs ?? null,
      quotaStatus: opts.quotaStatus ?? null,
    },
    create: {
      provider,
      status,
      errorCode: opts.errorCode ?? null,
      errorMessage: opts.errorMessage ?? null,
    },
  });
}

export async function listIntegrationHealth() {
  return prisma.integrationHealth.findMany({ orderBy: { provider: 'asc' } });
}

export async function getIntegrationHealth(actor: AuthorizationActor, provider: ProviderName) {
  const result = await authorize({ actor, capability: CAPABILITIES.SETTINGS_VIEW });
  if (!result.allowed) {
    const err = new Error(result.reason ?? 'Forbidden.') as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }
  return prisma.integrationHealth.findUnique({ where: { provider } });
}

export async function createIntegrationJob(
  provider: ProviderName,
  operation: string,
  payload: Record<string, unknown> = {}
) {
  return prisma.integrationJob.create({
    data: { provider, operation, payload: payload as object, status: 'PENDING' },
  });
}

export async function failIntegrationJob(jobId: string, error: string) {
  return prisma.integrationJob.update({
    where: { id: jobId },
    data: { status: 'FAILED', lastError: error, completedAt: new Date() },
  });
}

export async function listIntegrationJobs(provider?: ProviderName) {
  return prisma.integrationJob.findMany({
    where: provider ? { provider } : {},
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
