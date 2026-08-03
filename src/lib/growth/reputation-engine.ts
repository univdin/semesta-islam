/**
 * SEMESTA ISLAM — Reputation Engine
 * Governed by docs/plan/GROWTH_CONSTITUTION.md & docs/plan/MASTER_GROWTH_PLAN.md
 *
 * MANDATORY CONSTITUTIONAL INVARIANTS:
 * 1. XP != Reputation. XP is a recognition score signal.
 * 2. Reputation is a derived trust/community standing constructed from multiple qualified signals:
 *    Consistency + Contribution + Integrity + Peer Feedback + Lajnah Verification.
 * 3. High XP MUST NOT be presented as Scholarly Verification or Sanad Credentials.
 */

import { prisma } from '@/lib/db';
import { calculateUserNetXp } from './xp-ledger';

export interface ReputationEvaluationInput {
  userId: string;
  consistencyScore?: number;
  contributionScore?: number;
  integrityScore?: number;
}

export interface DerivedReputationState {
  userId: string;
  totalXpSignal: number;
  consistencyScore: number;
  contributionScore: number;
  integrityScore: number;
  derivedStanding: string;
  isScholarlyVerified: boolean; // Governed strictly by Lajnah, NEVER by XP
}

/**
 * Derives user reputation state from multi-factor signals.
 */
export async function evaluateUserReputation(
  userId: string,
  input: ReputationEvaluationInput = { userId }
): Promise<DerivedReputationState> {
  const netXp = await calculateUserNetXp(userId);

  // Check scholarly verification status from Lajnah (Educator profile)
  const educator = await prisma.educatorProfile.findUnique({
    where: { userId },
    select: { verifiedStatus: true },
  });

  const isScholarlyVerified = educator?.verifiedStatus === 'VERIFIED';

  // Retrieve or initialize reputation profile
  let profile = await prisma.reputationProfile.findUnique({
    where: { userId },
  });

  const newConsistency = input.consistencyScore ?? profile?.consistencyScore ?? 100.0;
  const newContribution = input.contributionScore ?? Math.min(100.0, netXp.totalXp / 10);
  const newIntegrity = input.integrityScore ?? profile?.integrityScore ?? 100.0;

  // Derive standing tier string (Community Standing, NOT Scholarly Credential!)
  let standing = 'CONTRIBUTOR_INITIATE';
  if (newIntegrity >= 90 && newContribution >= 50 && newConsistency >= 80) {
    standing = 'COMMUNITY_KHIDMAH_AMBASSADOR';
  } else if (newIntegrity >= 85 && newContribution >= 20) {
    standing = 'ACTIVE_COMMUNITY_CONTRIBUTOR';
  }

  // Update persistent state
  profile = await prisma.reputationProfile.upsert({
    where: { userId },
    update: {
      consistencyScore: newConsistency,
      contributionScore: newContribution,
      integrityScore: newIntegrity,
      derivedStanding: standing,
    },
    create: {
      userId,
      consistencyScore: newConsistency,
      contributionScore: newContribution,
      integrityScore: newIntegrity,
      derivedStanding: standing,
    },
  });

  return {
    userId,
    totalXpSignal: netXp.totalXp,
    consistencyScore: profile.consistencyScore,
    contributionScore: profile.contributionScore,
    integrityScore: profile.integrityScore,
    derivedStanding: profile.derivedStanding,
    isScholarlyVerified,
  };
}
