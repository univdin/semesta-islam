import { prisma } from '@/lib/db';
import type { CommunityTargetType } from '@prisma/client';
import { ServiceError } from './errors';

export interface ResolvedTarget {
  exists: boolean;
  visible: boolean;
  locked: boolean;
  removed: boolean;
  authorUserId: string | null;
  targetType: CommunityTargetType;
  targetId: string;
}

export async function resolveCommunityTarget(
  targetType: CommunityTargetType,
  targetId: string
): Promise<ResolvedTarget> {
  switch (targetType) {
    case 'EDUCATOR_PROFILE': {
      const row = await prisma.educatorProfile.findUnique({
        where: { id: targetId },
        select: { id: true, userId: true },
      });
      return {
        exists: Boolean(row),
        visible: Boolean(row),
        locked: false,
        removed: false,
        authorUserId: row?.userId ?? null,
        targetType,
        targetId,
      };
    }
    case 'TOPIC': {
      const row = await prisma.topic.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      return {
        exists: Boolean(row),
        visible: Boolean(row),
        locked: false,
        removed: false,
        authorUserId: null,
        targetType,
        targetId,
      };
    }
    case 'QUESTION': {
      const row = await prisma.communityQuestion.findUnique({
        where: { id: targetId },
        select: { id: true, authorId: true, status: true },
      });
      return {
        exists: Boolean(row),
        visible: row?.status === 'VISIBLE',
        locked: row?.status === 'LOCKED',
        removed: row?.status === 'REMOVED',
        authorUserId: row?.authorId ?? null,
        targetType,
        targetId,
      };
    }
    case 'ANSWER': {
      const row = await prisma.communityAnswer.findUnique({
        where: { id: targetId },
        select: { id: true, authorId: true, status: true },
      });
      return {
        exists: Boolean(row),
        visible: row?.status === 'VISIBLE',
        locked: false,
        removed: row?.status === 'REMOVED',
        authorUserId: row?.authorId ?? null,
        targetType,
        targetId,
      };
    }
    case 'COMMENT': {
      const row = await prisma.communityComment.findUnique({
        where: { id: targetId },
        select: { id: true, authorId: true, status: true },
      });
      return {
        exists: Boolean(row),
        visible: row?.status === 'VISIBLE',
        locked: row?.status === 'LOCKED',
        removed: row?.status === 'REMOVED',
        authorUserId: row?.authorId ?? null,
        targetType,
        targetId,
      };
    }
    default:
      return {
        exists: false,
        visible: false,
        locked: false,
        removed: false,
        authorUserId: null,
        targetType,
        targetId,
      };
  }
}

export function assertResolvableTarget(target: ResolvedTarget): void {
  if (!target.exists) {
    throw new ServiceError(404, 'COMMUNITY_TARGET_NOT_FOUND: The community target does not exist.');
  }
  if (target.removed) {
    throw new ServiceError(409, 'COMMUNITY_TARGET_REMOVED: The community target has been removed.');
  }
}
