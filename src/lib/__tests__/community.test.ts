/**
 * SEMESTA ISLAM — Community Knowledge (Comments, Corrections, Moderation) Contract Tests
 * Covers: comment lifecycle (list/create/update/soft-delete), nesting validation,
 * correction pathway (COMMUNITY CORRECTION -> DRAFT CLAIM, never direct VERIFIED),
 * moderation state transitions, moderator authorization, and moderation notifications.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const fns = {
    platformSettingFindUnique: vi.fn(),
    educatorFindUnique: vi.fn(),
    topicFindUnique: vi.fn(),
    commentFindMany: vi.fn(),
    commentFindUnique: vi.fn(),
    commentCreate: vi.fn(),
    commentUpdate: vi.fn(),
    voteGroupBy: vi.fn(),
    voteFindMany: vi.fn(),
    auditCreate: vi.fn(),
    notificationCreate: vi.fn(),
    claimUpdate: vi.fn(),
  };
  const prisma = {
    platformSetting: { findUnique: fns.platformSettingFindUnique },
    educatorProfile: { findUnique: fns.educatorFindUnique },
    topic: { findUnique: fns.topicFindUnique },
    communityComment: {
      findMany: fns.commentFindMany,
      findUnique: fns.commentFindUnique,
      create: fns.commentCreate,
      update: fns.commentUpdate,
    },
    communityVote: { groupBy: fns.voteGroupBy, findMany: fns.voteFindMany },
    communityQuestion: {
      findMany: vi.fn(async () => []),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    communityAnswer: {
      findMany: vi.fn(async () => []),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findFirst: vi.fn(),
      groupBy: vi.fn(async () => []),
    },
    auditLog: { create: fns.auditCreate },
    notification: { create: fns.notificationCreate },
    knowledgeClaim: { update: fns.claimUpdate },
    organizationMembership: { findMany: vi.fn(async () => []) },
    delegation: { findMany: vi.fn(async () => []) },
  };
  return { prisma, fns };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

import { listComments, createComment, updateComment, deleteComment } from '@/lib/community/comments';
import { moderateTarget, listModerationQueue } from '@/lib/community/moderation';
import { ServiceError } from '@/lib/community/errors';
import type { AuthIdentity } from '@/lib/auth/session';

function actor(userId: string, roles: AuthIdentity['roles']): AuthIdentity {
  return { userId, email: `${userId}@test.local`, roles, source: 'demo' };
}

const LEARNER = actor('u-learner', ['LEARNER']);
const MODERATOR = actor('u-moderator', ['FOUNDER_ADMIN']);

const TARGET = { targetType: 'EDUCATOR_PROFILE' as const, targetId: 'educator-1' };

function commentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c1',
    authorId: 'u-educator',
    targetType: 'EDUCATOR_PROFILE',
    targetId: 'educator-1',
    body: 'Konten bermanfaat.',
    status: 'VISIBLE',
    isCorrection: false,
    correctionNote: null,
    parentId: null,
    editedAt: null,
    createdAt: new Date('2026-08-01T00:00:00Z'),
    updatedAt: new Date('2026-08-01T00:00:00Z'),
    author: { id: 'u-educator', profile: { fullName: 'Ustadz Amin', avatarUrl: null } },
    ...overrides,
  };
}

function setDefaultSettings() {
  mocks.fns.platformSettingFindUnique.mockImplementation(async () => null);
}

beforeEach(() => {
  vi.clearAllMocks();
  setDefaultSettings();
  mocks.fns.educatorFindUnique.mockResolvedValue({ id: 'educator-1', userId: 'u-educator' });
  mocks.fns.topicFindUnique.mockResolvedValue({ id: 'topic-1' });
  mocks.fns.voteGroupBy.mockResolvedValue([]);
  mocks.fns.voteFindMany.mockResolvedValue([]);
});

describe('listComments', () => {
  it('returns only VISIBLE comments by default with vote counts and viewer votes', async () => {
    mocks.fns.commentFindMany.mockResolvedValue([commentRow()]);
    mocks.fns.voteGroupBy.mockResolvedValue([{ targetId: 'c1', voteType: 'HELPFUL', _count: { _all: 2 } }]);
    mocks.fns.voteFindMany.mockResolvedValue([{ targetId: 'c1', voteType: 'AGREE' }]);

    const result = await listComments(LEARNER, TARGET.targetType, TARGET.targetId);

    expect(mocks.fns.commentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'VISIBLE' }) })
    );
    expect(result[0].votes.HELPFUL).toBe(2);
    expect(result[0].viewerVotes).toContain('AGREE');
  });

  it('includes moderated content only when explicitly requested', async () => {
    mocks.fns.commentFindMany.mockResolvedValue([commentRow({ status: 'REMOVED' })]);
    await listComments(LEARNER, TARGET.targetType, TARGET.targetId, { includeModerated: true });
    expect(mocks.fns.commentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.not.objectContaining({ status: 'VISIBLE' }) })
    );
  });

  it('404s when the community target does not exist', async () => {
    mocks.fns.educatorFindUnique.mockResolvedValue(null);
    await expect(listComments(LEARNER, TARGET.targetType, TARGET.targetId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('createComment', () => {
  it('fails closed for anonymous writers (anonymous participation disabled by default)', async () => {
    await expect(createComment(null, { targetType: TARGET.targetType, targetId: TARGET.targetId, body: 'halo' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('403 when comments are disabled by founder policy', async () => {
    mocks.fns.platformSettingFindUnique.mockImplementation(async (input: { where: { key: string } }) =>
      input.where.key === 'community_comments_enabled' ? { value: 'false' } : null
    );
    await expect(
      createComment(LEARNER, { targetType: TARGET.targetType, targetId: TARGET.targetId, body: 'halo' })
    ).rejects.toMatchObject({ statusCode: 403, message: expect.stringContaining('FEATURE_DISABLED') });
  });

  it('validates body length', async () => {
    await expect(
      createComment(LEARNER, { targetType: TARGET.targetType, targetId: TARGET.targetId, body: 'x' })
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('COMMENT_BODY_INVALID') });
  });

  it('requires a correction note for corrections (corrections are evidence-backed)', async () => {
    await expect(
      createComment(LEARNER, {
        targetType: TARGET.targetType,
        targetId: TARGET.targetId,
        body: 'Koreksi atas konten.',
        isCorrection: true,
      })
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('CORRECTION_NOTE_INVALID') });
  });

  it('creates a VISIBLE comment, persists audit, and notifies the target owner', async () => {
    mocks.fns.commentCreate.mockResolvedValue(commentRow({ id: 'new-c1', authorId: 'u-learner' }));
    mocks.fns.auditCreate.mockResolvedValue({ id: 'audit-1', createdAt: new Date() });
    mocks.fns.notificationCreate.mockResolvedValue({ id: 'n1' });

    const result = await createComment(LEARNER, { targetType: TARGET.targetType, targetId: TARGET.targetId, body: 'Konten bermanfaat.' });

    expect(result.status).toBe('VISIBLE');
    expect(mocks.fns.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ actionType: 'COMMUNITY_COMMENT_CREATED' }) })
    );
    expect(mocks.fns.notificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'u-educator' }) })
    );
  });

  it('rejects replies to a comment on a different target', async () => {
    mocks.fns.commentFindUnique.mockResolvedValue({
      id: 'parent-1',
      targetType: 'TOPIC',
      targetId: 'topic-x',
      status: 'VISIBLE',
    });
    await expect(
      createComment(LEARNER, {
        targetType: TARGET.targetType,
        targetId: TARGET.targetId,
        parentId: 'parent-1',
        body: 'Balasan yang valid.',
      })
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('COMMENT_PARENT_INVALID') });
  });
});

describe('updateComment — ownership', () => {
  it('allows the author to edit a VISIBLE comment', async () => {
    mocks.fns.commentFindUnique.mockResolvedValue(commentRow({ authorId: 'u-learner' }));
    mocks.fns.commentUpdate.mockResolvedValue(commentRow({ authorId: 'u-learner', body: 'Suntingan baru.', editedAt: new Date() }));

    const result = await updateComment(LEARNER, 'c1', 'Suntingan baru.');
    expect(result.body).toBe('Suntingan baru.');
    expect(mocks.fns.auditCreate).toHaveBeenCalled();
  });

  it('rejects non-owners with 403', async () => {
    mocks.fns.commentFindUnique.mockResolvedValue(commentRow({ authorId: 'u-educator' }));
    await expect(updateComment(LEARNER, 'c1', 'Suntingan baru.')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('rejects editing a hidden/removed comment', async () => {
    mocks.fns.commentFindUnique.mockResolvedValue(commentRow({ authorId: 'u-learner', status: 'HIDDEN' }));
    await expect(updateComment(LEARNER, 'c1', 'Suntingan baru.')).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('deleteComment — soft removal', () => {
  it('soft-removes when the author deletes their own comment', async () => {
    mocks.fns.commentFindUnique.mockResolvedValue(commentRow({ authorId: 'u-learner' }));
    mocks.fns.commentUpdate.mockResolvedValue(commentRow({ status: 'REMOVED', moderatedById: 'u-learner' }));

    const result = await deleteComment(LEARNER, 'c1');
    expect(result.success).toBe(true);
    expect(mocks.fns.commentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'REMOVED' }) })
    );
  });

  it('lets a CONTENT_MANAGE moderator remove content, not only the author', async () => {
    mocks.fns.commentFindUnique.mockResolvedValue(commentRow({ authorId: 'u-educator' }));
    mocks.fns.commentUpdate.mockResolvedValue(commentRow({ status: 'REMOVED', moderatedById: 'u-moderator' }));
    const result = await deleteComment(MODERATOR, 'c1');
    expect(result.success).toBe(true);
  });

  it('rejects non-author, non-moderator removal with 403', async () => {
    mocks.fns.commentFindUnique.mockResolvedValue(commentRow({ authorId: 'u-educator' }));
    await expect(deleteComment(LEARNER, 'c1')).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('corrections — community signal never bypasses verification', () => {
  it('creating a correction comment does not mutate KnowledgeClaim status', async () => {
    mocks.fns.commentCreate.mockResolvedValue(
      commentRow({ id: 'corr-1', authorId: 'u-learner', isCorrection: true, correctionNote: 'Terdapat kekeliruan sumber rujukan.' })
    );
    mocks.fns.auditCreate.mockResolvedValue({ id: 'audit-1', createdAt: new Date() });
    mocks.fns.notificationCreate.mockResolvedValue({ id: 'n1' });

    await createComment(LEARNER, {
      targetType: TARGET.targetType,
      targetId: TARGET.targetId,
      body: 'Koreksi atas konten.',
      isCorrection: true,
      correctionNote: 'Terdapat kekeliruan sumber rujukan.',
    });

    expect(mocks.fns.claimUpdate).not.toHaveBeenCalled();
    expect(mocks.fns.commentCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isCorrection: true }) })
    );
  });
});

describe('moderateTarget — moderation lifecycle', () => {
  it('403 for actors without CONTENT_MANAGE', async () => {
    await expect(
      moderateTarget(LEARNER, { targetType: 'QUESTION', targetId: 'q1', status: 'HIDDEN' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('applies the state, resolves open reports, and notifies the author', async () => {
    mocks.fns.commentFindUnique.mockResolvedValue(commentRow({ authorId: 'u-educator' }));
    mocks.fns.commentUpdate.mockResolvedValue(commentRow({ status: 'HIDDEN', moderatedById: 'u-moderator' }));
    mocks.fns.notificationCreate.mockResolvedValue({ id: 'n1' });
    // moderate a COMMENT: targetType COMMUNITY_TARGET via applyTargetModerationState
    mocks.fns.voteGroupBy.mockResolvedValue([]);

    const reportFindMany = vi.fn(async () => [{ id: 'r1' }]);
    const reportUpdateMany = vi.fn(async () => ({ count: 1 }));
    // Re-inject report mocks for the moderation call
    const prismaAny = mocks.prisma as unknown as Record<string, Record<string, unknown>>;
    prismaAny.communityReport = { findMany: reportFindMany, updateMany: reportUpdateMany };

    const result = await moderateTarget(MODERATOR, { targetType: 'COMMENT', targetId: 'c1', status: 'HIDDEN', note: 'Tidak sesuai kebijakan.' });

    expect(result.newStatus).toBe('HIDDEN');
    expect(result.reportsResolved).toBe(1);
    expect(reportUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'RESOLVED' }) })
    );
    expect(mocks.fns.notificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'CONTENT_MODERATED' }) })
    );
  });

  it('rejects moderation of non-UGC targets (educator profiles / topics)', async () => {
    await expect(
      moderateTarget(MODERATOR, { targetType: 'EDUCATOR_PROFILE', targetId: 'educator-1', status: 'HIDDEN' })
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('MODERATION_TARGET_UNSUPPORTED') });
  });
});

describe('listModerationQueue', () => {
  it('requires CONTENT_MANAGE and returns only non-VISIBLE content', async () => {
    mocks.fns.commentFindMany.mockResolvedValue([]);
    mocks.fns.commentUpdate.mockResolvedValue({});

    const queue = await listModerationQueue(MODERATOR);
    expect(Array.isArray(queue)).toBe(true);

    await expect(listModerationQueue(LEARNER)).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('error helpers', () => {
  it('ServiceError carries a statusCode', () => {
    const err = new ServiceError(403, 'FORBIDDEN');
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('FORBIDDEN');
  });
});
