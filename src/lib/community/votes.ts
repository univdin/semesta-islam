import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';
import type { AuthIdentity } from '@/lib/auth/session';
import type { CommunityTargetType, VoteType } from '@prisma/client';
import { ServiceError } from './errors';
import { assertFeatureEnabled, gateWriteAccess, getCommunityFeatureFlags } from './config';
import { assertResolvableTarget, resolveCommunityTarget } from './target';

export type VoteCounts = Record<VoteType, number>;

const EMPTY_VOTE_COUNTS: VoteCounts = { HELPFUL: 0, AGREE: 0, ENDORSE: 0 };

export async function getVoteCounts(
  targetType: CommunityTargetType,
  targetId: string
): Promise<VoteCounts> {
  const groups = await prisma.communityVote.groupBy({
    by: ['voteType'],
    where: { targetType, targetId },
    _count: { _all: true },
  });
  const counts: VoteCounts = { ...EMPTY_VOTE_COUNTS };
  for (const g of groups) counts[g.voteType] = g._count._all;
  return counts;
}

export async function getViewerVotes(
  actor: AuthIdentity,
  targetType: CommunityTargetType,
  targetId: string
): Promise<VoteType[]> {
  const votes = await prisma.communityVote.findMany({
    where: { voterId: actor.userId, targetType, targetId },
    select: { voteType: true },
  });
  return votes.map((v) => v.voteType);
}

export interface VoteTarget {
  targetType: CommunityTargetType;
  targetId: string;
}

export interface CastVoteResult {
  voteId: string | null;
  duplicate: boolean;
  action: 'created' | 'duplicate';
}

export async function castVote(
  actor: AuthIdentity | null,
  target: VoteTarget,
  voteType: VoteType
): Promise<CastVoteResult> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.votingEnabled, 'voting');

  const resolved = await resolveCommunityTarget(target.targetType, target.targetId);
  assertResolvableTarget(resolved);
  if (!resolved.visible) {
    throw new ServiceError(409, 'COMMUNITY_TARGET_NOT_VISIBLE: Cannot vote on hidden content.');
  }
  if (resolved.locked) {
    throw new ServiceError(409, 'COMMUNITY_TARGET_LOCKED: Cannot vote on locked content.');
  }
  if (resolved.authorUserId === identity.userId) {
    throw new ServiceError(409, 'COMMUNITY_SELF_VOTE_FORBIDDEN: You cannot vote on your own content.');
  }

  const existing = await prisma.communityVote.findUnique({
    where: {
      voterId_targetType_targetId_voteType: {
        voterId: identity.userId,
        targetType: target.targetType,
        targetId: target.targetId,
        voteType,
      },
    },
  });

  if (existing) {
    return { voteId: existing.id, duplicate: true, action: 'duplicate' };
  }

  const vote = await prisma.communityVote.create({
    data: {
      voterId: identity.userId,
      targetType: target.targetType,
      targetId: target.targetId,
      voteType,
    },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_VOTE_CAST',
    entityAffected: 'community_votes',
    entityId: vote.id,
    metadata: { targetType: target.targetType, targetId: target.targetId, voteType },
  });

  return { voteId: vote.id, duplicate: false, action: 'created' };
}

export async function flipVote(
  actor: AuthIdentity | null,
  target: VoteTarget,
  fromType: VoteType,
  toType: VoteType
): Promise<CastVoteResult> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.votingEnabled, 'voting');

  const resolved = await resolveCommunityTarget(target.targetType, target.targetId);
  assertResolvableTarget(resolved);
  if (!resolved.visible) {
    throw new ServiceError(409, 'COMMUNITY_TARGET_NOT_VISIBLE: Cannot vote on hidden content.');
  }
  if (resolved.authorUserId === identity.userId) {
    throw new ServiceError(409, 'COMMUNITY_SELF_VOTE_FORBIDDEN: You cannot vote on your own content.');
  }

  const existing = await prisma.communityVote.findUnique({
    where: {
      voterId_targetType_targetId_voteType: {
        voterId: identity.userId,
        targetType: target.targetType,
        targetId: target.targetId,
        voteType: fromType,
      },
    },
  });

  if (existing) {
    const updated = await prisma.communityVote.update({
      where: { id: existing.id },
      data: { voteType: toType },
    });
    await persistAuditEvent({
      actorUserId: identity.userId,
      actionType: 'COMMUNITY_VOTE_FLIPPED',
      entityAffected: 'community_votes',
      entityId: existing.id,
      metadata: { targetType: target.targetType, targetId: target.targetId, fromType, toType },
    });
    return { voteId: updated.id, duplicate: false, action: 'created' };
  }

  return castVote(identity, target, toType);
}

export async function removeVote(
  actor: AuthIdentity | null,
  target: VoteTarget,
  voteType: VoteType
): Promise<{ removed: boolean }> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.votingEnabled, 'voting');

  const existing = await prisma.communityVote.findUnique({
    where: {
      voterId_targetType_targetId_voteType: {
        voterId: identity.userId,
        targetType: target.targetType,
        targetId: target.targetId,
        voteType,
      },
    },
  });

  if (!existing) {
    return { removed: false };
  }

  await prisma.communityVote.delete({ where: { id: existing.id } });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_VOTE_REMOVED',
    entityAffected: 'community_votes',
    entityId: existing.id,
    metadata: { targetType: target.targetType, targetId: target.targetId, voteType },
  });

  return { removed: true };
}
