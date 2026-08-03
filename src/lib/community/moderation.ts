import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';
import { createNotification } from '@/lib/notifications/service';
import { requirePermission } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import type { AuthIdentity } from '@/lib/auth/session';
import type { CommunityTargetType, ModerationStatus } from '@prisma/client';
import { ServiceError } from './errors';
import { applyTargetModerationState } from './state';
import { reverseAcceptedAnswerXp } from './qa';

const XP_REVOCATION_STATUSES: ModerationStatus[] = ['REMOVED', 'LOCKED', 'HIDDEN'];

export interface ModerateTargetInput {
  targetType: CommunityTargetType;
  targetId: string;
  status: ModerationStatus;
  note?: string;
}

export interface ModerateTargetResult {
  targetType: CommunityTargetType;
  targetId: string;
  previousStatus: ModerationStatus | null;
  newStatus: ModerationStatus;
  reportsResolved: number;
  xpRevoked: boolean;
  notifiedAuthor: boolean;
}

export async function moderateTarget(
  actor: AuthIdentity,
  input: ModerateTargetInput
): Promise<ModerateTargetResult> {
  await requirePermission({ actor, capability: CAPABILITIES.CONTENT_MANAGE });

  if (input.targetType === 'EDUCATOR_PROFILE' || input.targetType === 'TOPIC') {
    throw new ServiceError(
      400,
      'MODERATION_TARGET_UNSUPPORTED: Educator profiles and topics are not moderated through the community moderation queue.'
    );
  }

  let xpRevoked = false;
  if (input.targetType === 'ANSWER' && XP_REVOCATION_STATUSES.includes(input.status)) {
    const answer = await prisma.communityAnswer.findUnique({
      where: { id: input.targetId },
      select: { id: true, authorId: true, questionId: true, acceptedAt: true, status: true },
    });
    if (answer?.acceptedAt && answer.status !== 'REMOVED') {
      xpRevoked = await reverseAcceptedAnswerXp(answer.id, answer.authorId, answer.questionId);
    }
  }

  const transition = await applyTargetModerationState(
    input.targetType,
    input.targetId,
    input.status,
    actor.userId
  );

  const openReports = await prisma.communityReport.findMany({
    where: { targetType: input.targetType, targetId: input.targetId, status: { in: ['OPEN', 'UNDER_REVIEW'] } },
    select: { id: true },
  });
  let reportsResolved = 0;
  if (openReports.length > 0) {
    const updated = await prisma.communityReport.updateMany({
      where: { targetType: input.targetType, targetId: input.targetId, status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      data: {
        status: 'RESOLVED',
        resolution: input.note?.trim() || `Content ${input.status.toLowerCase()} by moderator.`,
        resolvedById: actor.userId,
        resolvedAt: new Date(),
      },
    });
    reportsResolved = updated.count;
  }

  await persistAuditEvent({
    actorUserId: actor.userId,
    actionType: 'COMMUNITY_CONTENT_MODERATED',
    entityAffected: `community_${input.targetType.toLowerCase()}s`,
    entityId: input.targetId,
    previousState: { status: transition.previousStatus },
    newState: { status: input.status },
    metadata: { note: input.note, reportsResolved, xpRevoked },
  });

  let notifiedAuthor = false;
  if (transition.authorUserId && transition.authorUserId !== actor.userId) {
    await createNotification({
      userId: transition.authorUserId,
      type: 'CONTENT_MODERATED',
      title: 'Konten Anda ditinjau',
      body:
        input.status === 'VISIBLE'
          ? 'Konten Anda telah dipulihkan oleh moderator.'
          : `Konten Anda berstatus "${input.status}" setelah peninjauan.`,
      metadata: { targetType: input.targetType, targetId: input.targetId, status: input.status },
    });
    notifiedAuthor = true;
  }

  return {
    targetType: input.targetType,
    targetId: input.targetId,
    previousStatus: transition.previousStatus,
    newStatus: input.status,
    reportsResolved,
    xpRevoked,
    notifiedAuthor,
  };
}

export interface ModerationQueueItem {
  id: string;
  kind: 'QUESTION' | 'ANSWER' | 'COMMENT';
  status: ModerationStatus;
  excerpt: string;
  authorUserId: string;
  authorName: string | null;
  moderatedById: string | null;
  moderatedAt: Date | null;
  createdAt: Date;
  openReportCount: number;
  accepted: boolean;
}

export async function listModerationQueue(
  actor: AuthIdentity,
  options: { status?: ModerationStatus } = {}
): Promise<ModerationQueueItem[]> {
  await requirePermission({ actor, capability: CAPABILITIES.CONTENT_MANAGE });

  const statusFilter: ModerationStatus[] = options.status
    ? [options.status]
    : ['REPORTED', 'UNDER_REVIEW', 'HIDDEN', 'LOCKED', 'REMOVED'];

  const [questions, answers, comments] = await Promise.all([
    prisma.communityQuestion.findMany({
      where: { status: { in: statusFilter } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: { author: { select: { profile: { select: { fullName: true } } } } },
    }),
    prisma.communityAnswer.findMany({
      where: { status: { in: statusFilter } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: { author: { select: { profile: { select: { fullName: true } } } } },
    }),
    prisma.communityComment.findMany({
      where: { status: { in: statusFilter } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: { author: { select: { profile: { select: { fullName: true } } } } },
    }),
  ]);

  const itemGroups: Array<[CommunityTargetType, string[]]> = [
    ['QUESTION', questions.map((q) => q.id)],
    ['ANSWER', answers.map((a) => a.id)],
    ['COMMENT', comments.map((c) => c.id)],
  ];

  const reportCounts = new Map<string, number>();
  await Promise.all(
    itemGroups.map(async ([targetType, ids]) => {
      if (ids.length === 0) return;
      const groups = await prisma.communityReport.groupBy({
        by: ['targetId'],
        where: { targetType, targetId: { in: ids }, status: { in: ['OPEN', 'UNDER_REVIEW'] } },
        _count: { _all: true },
      });
      for (const g of groups) reportCounts.set(`${targetType}:${g.targetId}`, g._count._all);
    })
  );

  const items: ModerationQueueItem[] = [];

  for (const q of questions) {
    items.push({
      id: q.id,
      kind: 'QUESTION',
      status: q.status,
      excerpt: q.title,
      authorUserId: q.authorId,
      authorName: q.author.profile?.fullName ?? null,
      moderatedById: q.moderatedById,
      moderatedAt: q.moderatedAt,
      createdAt: q.createdAt,
      openReportCount: reportCounts.get(`QUESTION:${q.id}`) ?? 0,
      accepted: false,
    });
  }
  for (const a of answers) {
    items.push({
      id: a.id,
      kind: 'ANSWER',
      status: a.status,
      excerpt: a.body.slice(0, 120),
      authorUserId: a.authorId,
      authorName: a.author.profile?.fullName ?? null,
      moderatedById: a.moderatedById,
      moderatedAt: a.moderatedAt,
      createdAt: a.createdAt,
      openReportCount: reportCounts.get(`ANSWER:${a.id}`) ?? 0,
      accepted: Boolean(a.acceptedAt),
    });
  }
  for (const c of comments) {
    items.push({
      id: c.id,
      kind: 'COMMENT',
      status: c.status,
      excerpt: c.body.slice(0, 120),
      authorUserId: c.authorId,
      authorName: c.author.profile?.fullName ?? null,
      moderatedById: c.moderatedById,
      moderatedAt: c.moderatedAt,
      createdAt: c.createdAt,
      openReportCount: reportCounts.get(`COMMENT:${c.id}`) ?? 0,
      accepted: false,
    });
  }

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
