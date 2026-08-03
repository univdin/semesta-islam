'use server';

/**
 * SEMESTA ISLAM — Growth & Governance Server Actions
 * Governed by docs/plan/GROWTH_CONSTITUTION.md & docs/plan/MASTER_GROWTH_PLAN.md
 *
 * MANDATORY SERVER-SIDE SECURITY & CONSTITUTIONAL RULES:
 * 1. All XP, Reputation, Attribution, Commission, & Governance mutations MUST be validated server-side.
 * 2. Never trust client-provided XP, commission amounts, or governance severity decisions.
 * 3. Enforce append-only XP ledger idempotency & role-authorized governance execution.
 */

import { recordXpLedgerEntry, calculateUserNetXp } from '@/lib/growth/xp-ledger';
import { evaluateUserReputation } from '@/lib/growth/reputation-engine';
import { recordAttribution } from '@/lib/growth/attribution-service';
import { accrueCommission, approveCommission } from '@/lib/growth/commission-service';
import {
  auditGrowthSystemHealth,
  evaluateComplianceState,
  executeGovernanceDecision,
  GovernanceDecisionState,
} from '@/lib/growth/intelligence-service';
import { getServerIdentity, hasRole } from '@/lib/auth/session';
import { getPlatformCommissionPercentage } from '@/lib/ledger/service';
import { AttributionActorType, XpActionType } from '@prisma/client';

export async function recordQualifiedXpAction(formData: FormData) {
  const identity = await getServerIdentity();
  if (!identity) {
    return { success: false, error: 'AUTH_REQUIRED: XP accrual requires an authenticated actor.' };
  }
  const eventId = formData.get('eventId') as string;
  const actionType = formData.get('actionType') as XpActionType;
  const source = (formData.get('source') as string) || 'SERVER_ACTION';

  if (!eventId || !actionType) {
    return { success: false, error: 'Missing required parameters.' };
  }

  // Pre-defined constitutional XP amounts per action (Server-side enforced!)
  const xpAmounts: Record<XpActionType, number> = {
    QUALIFIED_VISIT: 2,
    QUALIFIED_REFERRAL_ACTIVATION: 10,
    DIAGNOSTIC_COMPLETED: 30,
    LEARNING_MODULE_COMPLETED: 50,
    COMMUNITY_KHIDMAH: 50,
    REVERSAL_FRAUD: -20,
  };

  const amount = xpAmounts[actionType] ?? 5;
  const idempotencyKey = `xp-${identity.userId}-${eventId}-${actionType}`;

  try {
    const result = await recordXpLedgerEntry({
      userId: identity.userId,
      eventId,
      idempotencyKey,
      amount,
      actionType,
      source,
    });
    return { success: true, result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getUserReputationAction(userId: string) {
  if (!userId) return { success: false, error: 'User ID is required.' };
  const identity = await getServerIdentity();
  if (!identity) {
    return { success: false, error: 'AUTH_REQUIRED: Reputation lookup requires an authenticated actor.' };
  }
  // SEC-03: never trust arbitrary client userId. Self-only unless explicitly
  // authorized as a governance verifier (FOUNDER_ADMIN / LAJNAH_VERIFIER).
  if (identity.userId !== userId && !hasRole(identity, 'FOUNDER_ADMIN', 'LAJNAH_VERIFIER')) {
    return { success: false, error: 'FORBIDDEN: You may only view your own reputation.' };
  }
  try {
    const reputation = await evaluateUserReputation(userId);
    const xpBalance = await calculateUserNetXp(userId);
    return { success: true, reputation, xpBalance };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function recordAttributionAction(input: {
  actorUserId?: string;
  actorType: AttributionActorType;
  landingPath: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  campaignCode?: string;
  clientIp?: string;
  userAgent?: string;
}) {
  const identity = await getServerIdentity();
  // SEC-06: never trust a client-supplied actorUserId. Authenticated actors
  // resolve to the server identity; anonymous visitors record null attribution
  // (which the qualification engine treats as a non-referral signal).
  const actorUserId = identity ? identity.userId : undefined;
  try {
    const record = await recordAttribution({ ...input, actorUserId });
    return { success: true, attributionId: record.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function accrueCommissionAction(input: {
  affiliateId: string;
  bookingId: string;
  accruedAmount: number;
}) {
  const identity = await getServerIdentity();
  if (!identity) {
    return { success: false, error: 'AUTH_REQUIRED: Commission accrual requires an authenticated actor.' };
  }
  if (!hasRole(identity, 'FOUNDER_ADMIN')) {
    return { success: false, error: 'FORBIDDEN: Only FOUNDER_ADMIN can accrue internal commissions.' };
  }
  const configuredPercentage = getPlatformCommissionPercentage();
  if (configuredPercentage <= 0) {
    return {
      success: false,
      error: 'COMMISSION_DISABLED: Platform commission percentage is 0; internal commission accrual is disabled by configuration.',
    };
  }
  try {
    const commission = await accrueCommission(input);
    return { success: true, commission };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function approveCommissionAction(commissionId: string, approvedAmount?: number) {
  const identity = await getServerIdentity();
  if (!identity) {
    return { success: false, error: 'AUTH_REQUIRED: Authentication required.' };
  }
  if (!hasRole(identity, 'FOUNDER_ADMIN')) {
    return { success: false, error: 'FORBIDDEN: Only FOUNDER_ADMIN can approve commission accruals.' };
  }
  try {
    const updated = await approveCommission(commissionId, approvedAmount);
    return { success: true, commission: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getGrowthIntelligenceAuditAction() {
  const identity = await getServerIdentity();
  if (!identity) {
    return { success: false, error: 'AUTH_REQUIRED: Intelligence audit requires an authenticated actor.' };
  }
  // SEC-05: platform-wide growth intelligence audit is governance-scoped
  // (FOUNDER_ADMIN / LAJNAH_VERIFIER only).
  if (!hasRole(identity, 'FOUNDER_ADMIN', 'LAJNAH_VERIFIER')) {
    return { success: false, error: 'FORBIDDEN: Only governance roles can view the platform intelligence audit.' };
  }
  try {
    const audit = await auditGrowthSystemHealth();
    return { success: true, audit };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function evaluateComplianceStateAction(userId: string) {
  if (!userId) return { success: false, error: 'User ID is required.' };
  const identity = await getServerIdentity();
  if (!identity) {
    return { success: false, error: 'AUTH_REQUIRED: Compliance evaluation requires an authenticated actor.' };
  }
  // SEC-04: never trust arbitrary client userId. Self-only unless explicitly
  // authorized as a governance verifier (FOUNDER_ADMIN / LAJNAH_VERIFIER).
  if (identity.userId !== userId && !hasRole(identity, 'FOUNDER_ADMIN', 'LAJNAH_VERIFIER')) {
    return { success: false, error: 'FORBIDDEN: You may only evaluate your own compliance state.' };
  }
  try {
    const compliance = await evaluateComplianceState(userId);
    return { success: true, compliance };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function executeGovernanceDecisionAction(input: {
  targetUserId: string;
  decision: GovernanceDecisionState;
  reason: string;
  reverseXpAmount?: number;
  freezeCommissions?: Boolean;
}) {
  const identity = await getServerIdentity();
  if (!identity) {
    return { success: false, error: 'AUTH_REQUIRED: Authentication required.' };
  }
  if (!hasRole(identity, 'FOUNDER_ADMIN', 'LAJNAH_VERIFIER')) {
    return { success: false, error: 'FORBIDDEN: Only FOUNDER_ADMIN or LAJNAH_VERIFIER can execute governance decisions.' };
  }
  try {
    const result = await executeGovernanceDecision({
      targetUserId: input.targetUserId,
      actorUserId: identity.userId,
      decision: input.decision,
      reason: input.reason,
      reverseXpAmount: input.reverseXpAmount,
      freezeCommissions: Boolean(input.freezeCommissions),
    });
    return { success: true, result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
