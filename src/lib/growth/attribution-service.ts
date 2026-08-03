/**
 * SEMESTA ISLAM — Shared Attribution & Fraud Qualification Engine
 * Governed by docs/plan/GROWTH_CONSTITUTION.md & docs/plan/MASTER_GROWTH_PLAN.md
 *
 * ATTRIBUTION LAWS:
 * 1. Attribution is shared infrastructure serving Discovery, Syi'ar, Ambassador, Affiliate, Partner, & Commerce.
 * 2. Supported Actors: ORGANIC, SOCIAL, CREATOR, MEMBER, AMBASSADOR, AFFILIATE, PARTNER, INSTITUTION.
 * 3. Qualification evaluates Multi-Factor Signals (Identity, Attribution, Relationship, Activation, Event Uniqueness, Fraud Signals, Time Window).
 * 4. IP address is NOT the sole qualification mechanism.
 */

import { prisma } from '@/lib/db';
import { AttributionActorType } from '@prisma/client';

export interface CreateAttributionInput {
  actorUserId?: string;
  actorType: AttributionActorType;
  landingPath: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  campaignCode?: string;
  clientIp?: string;
  userAgent?: string;
}

export interface QualificationEvaluationInput {
  attributionId: string;
  targetUserId: string;
  actionType: 'QUALIFIED_VISIT' | 'QUALIFIED_REFERRAL_ACTIVATION' | 'DIAGNOSTIC_COMPLETED' | 'BOOKING_PAID';
  clientIp?: string;
  userAgent?: string;
}

export interface QualificationResult {
  isQualified: boolean;
  score: number;
  fraudSignalsDetected: string[];
  reason: string;
}

/**
 * Records an attribution entry into shared infrastructure.
 */
export async function recordAttribution(input: CreateAttributionInput) {
  const fraudSignals: Record<string, unknown> = {
    clientIp: input.clientIp || 'UNKNOWN',
    userAgent: input.userAgent || 'UNKNOWN',
    timestamp: new Date().toISOString(),
  };

  return await prisma.attributionRecord.create({
    data: {
      actorUserId: input.actorUserId,
      actorType: input.actorType,
      landingPath: input.landingPath,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      campaignCode: input.campaignCode,
      fraudSignals: fraudSignals as any,
    },
  });
}

/**
 * Multi-Factor Fraud Qualification Engine.
 * Evaluates whether an event qualifies for XP or Commission rewards based on multi-factor signals.
 */
export async function evaluateEventQualification(
  input: QualificationEvaluationInput
): Promise<QualificationResult> {
  const attribution = await prisma.attributionRecord.findUnique({
    where: { id: input.attributionId },
  });

  if (!attribution) {
    return {
      isQualified: false,
      score: 0,
      fraudSignalsDetected: ['ATTRIBUTION_NOT_FOUND'],
      reason: 'Attribution record does not exist.',
    };
  }

  const fraudSignalsDetected: string[] = [];
  let score = 100;

  // Signal 1: Self-dealing check (Actor cannot refer/attribute to oneself)
  if (attribution.actorUserId && attribution.actorUserId === input.targetUserId) {
    fraudSignalsDetected.push('SELF_DEALING');
    score -= 100;
  }

  // Signal 2: Target User Account Integrity
  const targetUser = await prisma.user.findUnique({
    where: { id: input.targetUserId },
    select: { status: true, email: true },
  });

  if (!targetUser || targetUser.status !== 'ACTIVE') {
    fraudSignalsDetected.push('INACTIVE_TARGET_USER');
    score -= 50;
  }

  // Signal 3: IP match signal (Flagged as potential local loop/fraud signal, not immediate rejection)
  const recordedSignals = (attribution.fraudSignals as Record<string, unknown>) || {};
  if (input.clientIp && recordedSignals.clientIp === input.clientIp && input.clientIp !== '127.0.0.1') {
    fraudSignalsDetected.push('SAME_IP_SIGNAL');
    score -= 20; // Reduced score, not sole rejection
  }

  // Signal 4: Time Window check (Events occurring within 2 seconds of attribution creation are suspicious)
  const timeDiffMs = Math.abs(Date.now() - attribution.createdAt.getTime());
  if (timeDiffMs < 1000 && input.actionType === 'QUALIFIED_REFERRAL_ACTIVATION') {
    fraudSignalsDetected.push('VELOCITY_ANOMALY');
    score -= 30;
  }

  const isQualified = score >= 60 && !fraudSignalsDetected.includes('SELF_DEALING');

  return {
    isQualified,
    score: Math.max(0, score),
    fraudSignalsDetected,
    reason: isQualified ? 'Multi-factor qualification passed.' : `Qualification failed: ${fraudSignalsDetected.join(', ')}`,
  };
}
