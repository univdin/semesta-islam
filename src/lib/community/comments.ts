import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';
import { createNotification } from '@/lib/notifications/service';
import { requireOwnership } from '@/lib/auth/authorization';
import type { AuthIdentity } from '@/lib/auth/session';
import type { CommunityTargetType, ModerationStatus, VoteType } from '@prisma/client';
import { ServiceError, type ServiceResult } from './errors';
import { assertFeatureEnabled, gateReadAccess, gateWriteAccess, getCommunityFeatureFlags } from './config';
import { assertResolvableTarget, resolveCommunityTarget } from './target';

const BODY_MAX_LENGTH = 2000;
const BODY_MIN_LENGTH = 2;

export interface CommentAuthorSummary {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface CommentSummary {
  id: string;
  author: CommentAuthorSummary;
  body: string;
  status: ModerationStatus;
  isCorrection: boolean;
  correctionNote: string | null;
  parentId: string | null;
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  votes: Record<VoteType, number>;
  viewerVotes: VoteType[];
}

interface CommentRow {
  id: string;
  body: string;
  status: ModerationStatus;
  isCorrection: boolean;
  correctionNote: string | null;
  parentId: string | null;
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: CommentAuthorSummary;
}

async function toCommentSummary(
  row: CommentRow,
  voteCounts: Map<string, Record<VoteType, number>>,
  viewerVotes: Map<string, VoteType[]>,
  actor: AuthIdentity | null
): Promise<CommentSummary> {
  void actor;
  return {
    id: row.id,
    author: row.author,
    body: row.body,
    status: row.status,
    isCorrection: row.isCorrection,
    correctionNote: row.correctionNote,
    parentId: row.parentId,
    editedAt: row.editedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    votes: voteCounts.get(row.id) ?? { HELPFUL: 0, AGREE: 0, ENDORSE: 0 },
    viewerVotes: viewerVotes.get(row.id) ?? [],
  };
}

export interface ListCommentsOptions {
  includeModerated?: boolean;
}

export async function listComments(
  actor: AuthIdentity | null,
  targetType: CommunityTargetType,
  targetId: string,
  options: ListCommentsOptions = {}
): Promise<CommentSummary[]> {
  await gateReadAccess(actor);
  const target = await resolveCommunityTarget(targetType, targetId);
  if (!target.exists) {
    throw new ServiceError(404, 'COMMUNITY_TARGET_NOT_FOUND: The community target does not exist.');
  }

  const rows = await prisma.communityComment.findMany({
    where: {
      targetType,
      targetId,
      ...(options.includeModerated ? {} : { status: 'VISIBLE' as ModerationStatus }),
    },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: {
          id: true,
          profile: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
  });

  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const voteGroups = await prisma.communityVote.groupBy({
    by: ['targetId', 'voteType'],
    where: { targetType: 'COMMENT', targetId: { in: ids } },
    _count: { _all: true },
  });

  const voteCounts = new Map<string, Record<VoteType, number>>();
  for (const row of rows) {
    voteCounts.set(row.id, { HELPFUL: 0, AGREE: 0, ENDORSE: 0 });
  }
  for (const g of voteGroups) {
    const map = voteCounts.get(g.targetId);
    if (map) map[g.voteType] = g._count._all;
  }

  const viewerVotes = new Map<string, VoteType[]>();
  if (actor) {
    const mine = await prisma.communityVote.findMany({
      where: { voterId: actor.userId, targetType: 'COMMENT', targetId: { in: ids } },
      select: { targetId: true, voteType: true },
    });
    for (const v of mine) {
      const list = viewerVotes.get(v.targetId) ?? [];
      list.push(v.voteType);
      viewerVotes.set(v.targetId, list);
    }
  }

  const authorMap = new Map(rows.map((r) => [r.id, r.author]));
  const summaryRows: CommentRow[] = rows.map((r) => {
    const author = authorMap.get(r.id);
    return {
      id: r.id,
      body: r.body,
      status: r.status,
      isCorrection: r.isCorrection,
      correctionNote: r.correctionNote,
      parentId: r.parentId,
      editedAt: r.editedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      author: author
        ? { id: author.id, fullName: author.profile?.fullName ?? null, avatarUrl: author.profile?.avatarUrl ?? null }
        : { id: r.authorId, fullName: null, avatarUrl: null },
    };
  });

  return Promise.all(summaryRows.map((r) => toCommentSummary(r, voteCounts, viewerVotes, actor)));
}

export interface CreateCommentInput {
  targetType: CommunityTargetType;
  targetId: string;
  parentId?: string;
  body: string;
  isCorrection?: boolean;
  correctionNote?: string;
}

export async function createComment(
  actor: AuthIdentity | null,
  input: CreateCommentInput
): Promise<CommentSummary> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.commentsEnabled, 'comments');

  const body = input.body.trim();
  if (body.length < BODY_MIN_LENGTH || body.length > BODY_MAX_LENGTH) {
    throw new ServiceError(
      400,
      `COMMENT_BODY_INVALID: Comment must be between ${BODY_MIN_LENGTH} and ${BODY_MAX_LENGTH} characters.`
    );
  }
  if (input.isCorrection) {
    const note = input.correctionNote?.trim();
    if (!note || note.length < 10 || note.length > 1000) {
      throw new ServiceError(
        400,
        'CORRECTION_NOTE_INVALID: A correction must include a note between 10 and 1000 characters explaining the correction.'
      );
    }
  }

  const target = await resolveCommunityTarget(input.targetType, input.targetId);
  assertResolvableTarget(target);
  if (!target.visible) {
    throw new ServiceError(409, 'COMMUNITY_TARGET_NOT_VISIBLE: Cannot comment on hidden content.');
  }

  let parentId: string | null = null;
  if (input.parentId) {
    const parent = await prisma.communityComment.findUnique({
      where: { id: input.parentId },
      select: { id: true, targetType: true, targetId: true, status: true },
    });
    if (!parent || parent.targetType !== input.targetType || parent.targetId !== input.targetId) {
      throw new ServiceError(400, 'COMMENT_PARENT_INVALID: The parent comment does not belong to this target.');
    }
    if (parent.status !== 'VISIBLE') {
      throw new ServiceError(409, 'COMMENT_PARENT_NOT_VISIBLE: Cannot reply to a hidden comment.');
    }
    parentId = parent.id;
  }

  const comment = await prisma.communityComment.create({
    data: {
      authorId: identity.userId,
      targetType: input.targetType,
      targetId: input.targetId,
      parentId,
      body,
      status: 'VISIBLE',
      isCorrection: input.isCorrection ?? false,
      correctionNote: input.correctionNote?.trim() ?? null,
    },
    include: {
      author: {
        select: {
          id: true,
          profile: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_COMMENT_CREATED',
    entityAffected: 'community_comments',
    entityId: comment.id,
    metadata: {
      targetType: input.targetType,
      targetId: input.targetId,
      parentId,
      isCorrection: input.isCorrection ?? false,
    },
  });

  await notifyCommentRecipients({
    actorUserId: identity.userId,
    targetType: input.targetType,
    targetId: input.targetId,
    parentId,
    commentId: comment.id,
    preview: body.slice(0, 120),
  });

  return toCommentSummary(
    {
      id: comment.id,
      body: comment.body,
      status: comment.status,
      isCorrection: comment.isCorrection,
      correctionNote: comment.correctionNote,
      parentId: comment.parentId,
      editedAt: comment.editedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.author.id,
        fullName: comment.author.profile?.fullName ?? null,
        avatarUrl: comment.author.profile?.avatarUrl ?? null,
      },
    },
    new Map([[comment.id, { HELPFUL: 0, AGREE: 0, ENDORSE: 0 }]]),
    new Map<string, VoteType[]>(),
    identity
  );
}

export async function updateComment(
  actor: AuthIdentity | null,
  commentId: string,
  body: string
): Promise<CommentSummary> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.commentsEnabled, 'comments');

  const trimmed = body.trim();
  if (trimmed.length < BODY_MIN_LENGTH || trimmed.length > BODY_MAX_LENGTH) {
    throw new ServiceError(400, `COMMENT_BODY_INVALID: Comment must be between ${BODY_MIN_LENGTH} and ${BODY_MAX_LENGTH} characters.`);
  }

  const existing = await prisma.communityComment.findUnique({
    where: { id: commentId },
    include: {
      author: {
        select: {
          id: true,
          profile: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
  });
  if (!existing) {
    throw new ServiceError(404, 'COMMENT_NOT_FOUND: Comment does not exist.');
  }
  requireOwnership(identity, existing.authorId);
  if (existing.status !== 'VISIBLE') {
    throw new ServiceError(409, 'COMMENT_NOT_EDITABLE: Only visible comments can be edited.');
  }

  const updated = await prisma.communityComment.update({
    where: { id: commentId },
    data: { body: trimmed, editedAt: new Date() },
    include: {
      author: {
        select: {
          id: true,
          profile: { select: { fullName: true, avatarUrl: true } },
        },
      },
    },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_COMMENT_UPDATED',
    entityAffected: 'community_comments',
    entityId: commentId,
    metadata: { previousPreview: existing.body.slice(0, 120) },
  });

  return toCommentSummary(
    {
      id: updated.id,
      body: updated.body,
      status: updated.status,
      isCorrection: updated.isCorrection,
      correctionNote: updated.correctionNote,
      parentId: updated.parentId,
      editedAt: updated.editedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      author: {
        id: updated.author.id,
        fullName: updated.author.profile?.fullName ?? null,
        avatarUrl: updated.author.profile?.avatarUrl ?? null,
      },
    },
    new Map([[updated.id, { HELPFUL: 0, AGREE: 0, ENDORSE: 0 }]]),
    new Map<string, VoteType[]>(),
    identity
  );
}

export async function deleteComment(
  actor: AuthIdentity | null,
  commentId: string
): Promise<ServiceResult> {
  const identity = await gateWriteAccess(actor);
  const existing = await prisma.communityComment.findUnique({
    where: { id: commentId },
    select: { id: true, authorId: true, status: true },
  });
  if (!existing) {
    throw new ServiceError(404, 'COMMENT_NOT_FOUND: Comment does not exist.');
  }

  const isFounder = identity.roles.includes('FOUNDER_ADMIN');
  const canModerate = isFounder || (await hasContentManage(identity));
  if (existing.authorId !== identity.userId && !canModerate) {
    throw new ServiceError(
      403,
      'FORBIDDEN: Only the author, FOUNDER_ADMIN, or content.manage holders can remove this comment.'
    );
  }

  const removed = await prisma.communityComment.update({
    where: { id: commentId },
    data: { status: 'REMOVED', moderatedById: identity.userId, moderatedAt: new Date() },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_COMMENT_REMOVED',
    entityAffected: 'community_comments',
    entityId: commentId,
    metadata: { previousStatus: existing.status },
  });

  return { success: true, statusCode: 200, message: 'Comment removed.', data: { commentId: removed.id } };
}

async function hasContentManage(identity: AuthIdentity): Promise<boolean> {
  const { can } = await import('@/lib/auth/authorization');
  const { CAPABILITIES } = await import('@/lib/auth/permissions');
  return can({ actor: identity, capability: CAPABILITIES.CONTENT_MANAGE });
}

async function notifyCommentRecipients(input: {
  actorUserId: string;
  targetType: CommunityTargetType;
  targetId: string;
  parentId: string | null;
  commentId: string;
  preview: string;
}): Promise<void> {
  const recipients = new Set<string>();

  if (input.parentId) {
    const parent = await prisma.communityComment.findUnique({
      where: { id: input.parentId },
      select: { authorId: true },
    });
    if (parent && parent.authorId !== input.actorUserId) recipients.add(parent.authorId);
  } else {
    const target = await resolveCommunityTarget(input.targetType, input.targetId);
    if (target.authorUserId && target.authorUserId !== input.actorUserId) {
      recipients.add(target.authorUserId);
    }
  }

  const type = input.parentId ? 'COMMENT_REPLY' : 'COMMENT_ADDED';
  for (const userId of recipients) {
    await createNotification({
      userId,
      type,
      title: input.parentId ? 'Balasan baru pada komentar Anda' : 'Komentar baru',
      body: input.preview,
      metadata: { commentId: input.commentId, targetType: input.targetType, targetId: input.targetId },
    });
  }
}
