/**
 * SEMESTA ISLAM — Platform Configuration Service (Phase B)
 *
 * Typed persistent key/value runtime configuration for PRODUCT settings
 * (feature flags, publishing/indexing policy, integration status). This
 * surface NEVER holds secrets — secrets stay in environment variables.
 *
 * Governance: mutations require PLATFORM_CONFIGURATION capability
 * (FOUNDER_ADMIN / delegated management). UI hiding is not the protection;
 * the server enforces authorization.
 */

import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import type { AuthIdentity } from '@/lib/auth/session';

export const PLATFORM_SETTING_KEYS = {
  PUBLIC_DIRECTORY_ENABLED: 'public_directory_enabled',
  PUBLIC_TOPICS_ENABLED: 'public_topics_enabled',
  MAINTENANCE_MODE: 'maintenance_mode',
  SEARCH_CONSOLE_ENABLED: 'search_console_enabled',
  ENTITY_PUBLISHING_POLICY: 'entity_publishing_policy',

  // Community Knowledge + Trust (founder-controlled feature flags)
  COMMUNITY_COMMENTS_ENABLED: 'community_comments_enabled',
  COMMUNITY_QUESTIONS_ENABLED: 'community_questions_enabled',
  COMMUNITY_ANSWERS_ENABLED: 'community_answers_enabled',
  COMMUNITY_VOTING_ENABLED: 'community_voting_enabled',
  COMMUNITY_REPORTS_ENABLED: 'community_reports_enabled',
  COMMUNITY_ANONYMOUS_PARTICIPATION_ENABLED: 'community_anonymous_participation_enabled',
  COMMUNITY_MODERATION_POLICY: 'community_moderation_policy',
  COMMUNITY_REPORT_THRESHOLD: 'community_report_threshold',
  COMMUNITY_QA_INDEXING_ENABLED: 'community_qa_indexing_enabled',
  COMMUNITY_CONTENT_VISIBILITY: 'community_content_visibility',
} as const;

export type PlatformSettingKey = (typeof PLATFORM_SETTING_KEYS)[keyof typeof PLATFORM_SETTING_KEYS];

const BOOLEAN_KEYS: ReadonlySet<PlatformSettingKey> = new Set([
  PLATFORM_SETTING_KEYS.PUBLIC_DIRECTORY_ENABLED,
  PLATFORM_SETTING_KEYS.PUBLIC_TOPICS_ENABLED,
  PLATFORM_SETTING_KEYS.MAINTENANCE_MODE,
  PLATFORM_SETTING_KEYS.SEARCH_CONSOLE_ENABLED,
  PLATFORM_SETTING_KEYS.COMMUNITY_COMMENTS_ENABLED,
  PLATFORM_SETTING_KEYS.COMMUNITY_QUESTIONS_ENABLED,
  PLATFORM_SETTING_KEYS.COMMUNITY_ANSWERS_ENABLED,
  PLATFORM_SETTING_KEYS.COMMUNITY_VOTING_ENABLED,
  PLATFORM_SETTING_KEYS.COMMUNITY_REPORTS_ENABLED,
  PLATFORM_SETTING_KEYS.COMMUNITY_ANONYMOUS_PARTICIPATION_ENABLED,
  PLATFORM_SETTING_KEYS.COMMUNITY_QA_INDEXING_ENABLED,
]);

const DEFAULTS: Record<PlatformSettingKey, string> = {
  [PLATFORM_SETTING_KEYS.PUBLIC_DIRECTORY_ENABLED]: 'true',
  [PLATFORM_SETTING_KEYS.PUBLIC_TOPICS_ENABLED]: 'true',
  [PLATFORM_SETTING_KEYS.MAINTENANCE_MODE]: 'false',
  [PLATFORM_SETTING_KEYS.SEARCH_CONSOLE_ENABLED]: 'false',
  [PLATFORM_SETTING_KEYS.ENTITY_PUBLISHING_POLICY]: 'verified-only',

  // Community defaults: participation on, anonymous off, QA indexing off
  [PLATFORM_SETTING_KEYS.COMMUNITY_COMMENTS_ENABLED]: 'true',
  [PLATFORM_SETTING_KEYS.COMMUNITY_QUESTIONS_ENABLED]: 'true',
  [PLATFORM_SETTING_KEYS.COMMUNITY_ANSWERS_ENABLED]: 'true',
  [PLATFORM_SETTING_KEYS.COMMUNITY_VOTING_ENABLED]: 'true',
  [PLATFORM_SETTING_KEYS.COMMUNITY_REPORTS_ENABLED]: 'true',
  [PLATFORM_SETTING_KEYS.COMMUNITY_ANONYMOUS_PARTICIPATION_ENABLED]: 'false',
  [PLATFORM_SETTING_KEYS.COMMUNITY_MODERATION_POLICY]: 'standard',
  [PLATFORM_SETTING_KEYS.COMMUNITY_REPORT_THRESHOLD]: '5',
  [PLATFORM_SETTING_KEYS.COMMUNITY_QA_INDEXING_ENABLED]: 'false',
  [PLATFORM_SETTING_KEYS.COMMUNITY_CONTENT_VISIBILITY]: 'public',
};

export interface PlatformSettingView {
  key: string;
  value: string;
  updatedAt: Date;
  updatedBy: string | null;
}

/**
 * Read a setting with a documented default. Never throws; missing keys fall
 * back to the default so a fresh deploy behaves identically.
 */
export async function getPlatformSetting(key: PlatformSettingKey): Promise<string> {
  const row = await prisma.platformSetting.findUnique({ where: { key }, select: { value: true } });
  return row?.value ?? DEFAULTS[key];
}

export async function isPlatformSettingEnabled(key: PlatformSettingKey): Promise<boolean> {
  if (!BOOLEAN_KEYS.has(key)) {
    throw new Error(`PLATFORM_SETTING_NOT_BOOLEAN: ${key}`);
  }
  const value = await getPlatformSetting(key);
  return value === 'true';
}

/** List all settings. Management-only. */
export async function listPlatformSettings(actor: AuthIdentity): Promise<PlatformSettingView[]> {
  await requirePermission({ actor, capability: CAPABILITIES.PLATFORM_CONFIGURATION });
  const rows = await prisma.platformSetting.findMany({
    orderBy: { key: 'asc' },
    include: { updatedBy: { select: { email: true } } },
  });
  const keys = new Set(rows.map((r) => r.key));
  const knownKeys = Object.values(PLATFORM_SETTING_KEYS);

  const present = rows.map((r) => ({
    key: r.key,
    value: r.value,
    updatedAt: r.updatedAt,
    updatedBy: r.updatedBy?.email ?? null,
  }));

  const missing = knownKeys.filter((k) => !keys.has(k)).map((k) => ({
    key: k,
    value: DEFAULTS[k],
    updatedAt: new Date(0),
    updatedBy: null,
  }));

  return [...present, ...missing].sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Set a runtime product configuration value. Management-only
 * (PLATFORM_CONFIGURATION). Records the updating user for provenance.
 */
export async function setPlatformSetting(
  actor: AuthIdentity,
  key: PlatformSettingKey,
  value: string
): Promise<PlatformSettingView> {
  await requirePermission({ actor, capability: CAPABILITIES.PLATFORM_CONFIGURATION });

  const known = (Object.values(PLATFORM_SETTING_KEYS) as string[]).includes(key);
  if (!known) {
    throw new Error('PLATFORM_SETTING_UNKNOWN');
  }

  const normalized = BOOLEAN_KEYS.has(key)
    ? value === 'true' || value === '1'
      ? 'true'
      : 'false'
    : value.trim();

  const row = await prisma.platformSetting.upsert({
    where: { key },
    create: { key, value: normalized, updatedById: actor.userId },
    update: { value: normalized, updatedById: actor.userId },
    include: { updatedBy: { select: { email: true } } },
  });

  return {
    key: row.key,
    value: row.value,
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy?.email ?? null,
  };
}
