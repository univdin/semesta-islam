import { prisma } from '@/lib/db';
import type { CommunityTargetType, ModerationStatus } from '@prisma/client';
import { ServiceError } from './errors';

export interface ModerationTransitionResult {
  targetType: CommunityTargetType;
  targetId: string;
  authorUserId: string | null;
  previousStatus: ModerationStatus | null;
  newStatus: ModerationStatus;
}

export async function applyTargetModerationState(
  targetType: CommunityTargetType,
  targetId: string,
  status: ModerationStatus,
  actorUserId: string
): Promise<ModerationTransitionResult> {
  const now = new Date();
  switch (targetType) {
    case 'QUESTION': {
      const row = await prisma.communityQuestion.findUnique({
        where: { id: targetId },
        select: { id: true, status: true, authorId: true },
      });
      if (!row) throw new ServiceError(404, 'COMMUNITY_TARGET_NOT_FOUND');
      await prisma.communityQuestion.update({
        where: { id: targetId },
        data: { status, moderatedById: actorUserId, moderatedAt: now },
      });
      return { targetType, targetId, authorUserId: row.authorId, previousStatus: row.status, newStatus: status };
    }
    case 'ANSWER': {
      const row = await prisma.communityAnswer.findUnique({
        where: { id: targetId },
        select: { id: true, status: true, authorId: true },
      });
      if (!row) throw new ServiceError(404, 'COMMUNITY_TARGET_NOT_FOUND');
      await prisma.communityAnswer.update({
        where: { id: targetId },
        data: { status, moderatedById: actorUserId, moderatedAt: now },
      });
      return { targetType, targetId, authorUserId: row.authorId, previousStatus: row.status, newStatus: status };
    }
    case 'COMMENT': {
      const row = await prisma.communityComment.findUnique({
        where: { id: targetId },
        select: { id: true, status: true, authorId: true },
      });
      if (!row) throw new ServiceError(404, 'COMMUNITY_TARGET_NOT_FOUND');
      await prisma.communityComment.update({
        where: { id: targetId },
        data: { status, moderatedById: actorUserId, moderatedAt: now },
      });
      return { targetType, targetId, authorUserId: row.authorId, previousStatus: row.status, newStatus: status };
    }
    default:
      throw new ServiceError(400, `MODERATION_TARGET_UNSUPPORTED: ${targetType}`);
  }
}
