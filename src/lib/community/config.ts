import {
  getPlatformSetting,
  isPlatformSettingEnabled,
  PLATFORM_SETTING_KEYS,
} from '@/lib/settings/service';
import type { AuthIdentity } from '@/lib/auth/session';
import { ServiceError } from './errors';

export const COMMUNITY_KHIDMAH_XP_AMOUNT = 50;

export interface CommunityFeatureFlags {
  commentsEnabled: boolean;
  questionsEnabled: boolean;
  answersEnabled: boolean;
  votingEnabled: boolean;
  reportsEnabled: boolean;
  anonymousParticipationEnabled: boolean;
  moderationPolicy: string;
  reportThreshold: number;
  qaIndexingEnabled: boolean;
  contentVisibility: 'public' | 'authenticated' | 'restricted';
}

export async function getCommunityFeatureFlags(): Promise<CommunityFeatureFlags> {
  const [
    commentsEnabled,
    questionsEnabled,
    answersEnabled,
    votingEnabled,
    reportsEnabled,
    anonymousParticipationEnabled,
    moderationPolicy,
    reportThreshold,
    qaIndexingEnabled,
    contentVisibility,
  ] = await Promise.all([
    isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.COMMUNITY_COMMENTS_ENABLED),
    isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.COMMUNITY_QUESTIONS_ENABLED),
    isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.COMMUNITY_ANSWERS_ENABLED),
    isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.COMMUNITY_VOTING_ENABLED),
    isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.COMMUNITY_REPORTS_ENABLED),
    isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.COMMUNITY_ANONYMOUS_PARTICIPATION_ENABLED),
    getPlatformSetting(PLATFORM_SETTING_KEYS.COMMUNITY_MODERATION_POLICY),
    getPlatformSetting(PLATFORM_SETTING_KEYS.COMMUNITY_REPORT_THRESHOLD),
    isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.COMMUNITY_QA_INDEXING_ENABLED),
    getPlatformSetting(PLATFORM_SETTING_KEYS.COMMUNITY_CONTENT_VISIBILITY),
  ]);

  const threshold = Number.parseInt(reportThreshold, 10);
  const visibility =
    contentVisibility === 'authenticated' || contentVisibility === 'restricted'
      ? contentVisibility
      : 'public';

  return {
    commentsEnabled,
    questionsEnabled,
    answersEnabled,
    votingEnabled,
    reportsEnabled,
    anonymousParticipationEnabled,
    moderationPolicy,
    reportThreshold: Number.isFinite(threshold) && threshold >= 1 ? threshold : 5,
    qaIndexingEnabled,
    contentVisibility: visibility,
  };
}

export function assertFeatureEnabled(enabled: boolean, feature: string): void {
  if (!enabled) {
    throw new ServiceError(
      403,
      `FEATURE_DISABLED: Community ${feature} is disabled by founder policy.`
    );
  }
}

export function requireCommunityActor(actor: AuthIdentity | null): AuthIdentity {
  if (!actor) {
    throw new ServiceError(401, 'AUTHENTICATION_REQUIRED: Sign in to participate in the community.');
  }
  return actor;
}

export async function gateWriteAccess(actor: AuthIdentity | null): Promise<AuthIdentity> {
  if (actor) return actor;
  const flags = await getCommunityFeatureFlags();
  if (!flags.anonymousParticipationEnabled) {
    throw new ServiceError(
      401,
      'COMMUNITY_ANONYMOUS_PARTICIPATION_DISABLED: Anonymous participation is disabled by founder policy.'
    );
  }
  throw new ServiceError(
    401,
    'COMMUNITY_AUTHENTICATION_REQUIRED: Community participation requires a signed-in identity (fail closed).'
  );
}

export async function gateReadAccess(actor: AuthIdentity | null): Promise<void> {
  const flags = await getCommunityFeatureFlags();
  if (flags.contentVisibility === 'public') return;
  if (flags.contentVisibility === 'restricted') {
    throw new ServiceError(403, 'COMMUNITY_RESTRICTED: Community content is restricted.');
  }
  if (!actor) {
    throw new ServiceError(401, 'AUTHENTICATION_REQUIRED: Sign in to view community content.');
  }
}
