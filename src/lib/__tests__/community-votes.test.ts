/**
 * SEMESTA ISLAM — Community Voting Contract Tests
 * Covers: unique vote constraint handling (duplicate -> idempotent), flip,
 * removal, self-vote rejection, feature-flag gating, and fail-closed authn.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const fns = {
    platformSettingFindUnique: vi.fn(),
    educatorFindUnique: vi.fn(),
    topicFindUnique: vi.fn(),
    commentFindUnique: vi.fn(),
    questionFindUnique: vi.fn(),
    answerFindUnique: vi.fn(),
    voteFindUnique: vi.fn(),
    voteCreate: vi.fn(),
    voteUpdate: vi.fn(),
    voteDelete: vi.fn(),
    auditCreate: vi.fn(),
  };
  const prisma = {
    platformSetting: { findUnique: fns.platformSettingFindUnique },
    educatorProfile: { findUnique: fns.educatorFindUnique },
    topic: { findUnique: fns.topicFindUnique },
    communityComment: { findUnique: fns.commentFindUnique },
    communityQuestion: { findUnique: fns.questionFindUnique },
    communityAnswer: { findUnique: fns.answerFindUnique },
    communityVote: {
      findUnique: fns.voteFindUnique,
      create: fns.voteCreate,
      update: fns.voteUpdate,
      delete: fns.voteDelete,
    },
    auditLog: { create: fns.auditCreate },
  };
  return { prisma, fns };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

import { castVote, removeVote, flipVote } from '@/lib/community/votes';
import type { AuthIdentity } from '@/lib/auth/session';

function actor(userId: string, roles: AuthIdentity['roles']): AuthIdentity {
  return { userId, email: `${userId}@test.local`, roles, source: 'demo' };
}

const VOTER = actor('u-voter', ['LEARNER']);
const AUTHOR = actor('u-author', ['EDUCATOR']);

const TARGET = { targetType: 'ANSWER' as const, targetId: 'a1' };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fns.platformSettingFindUnique.mockImplementation(async () => null);
  mocks.fns.answerFindUnique.mockResolvedValue({ id: 'a1', authorId: 'u-author', status: 'VISIBLE' });
  mocks.fns.voteFindUnique.mockResolvedValue(null);
  mocks.fns.auditCreate.mockResolvedValue({ id: 'audit-1', createdAt: new Date() });
});

describe('castVote', () => {
  it('creates a vote and persists an audit event', async () => {
    mocks.fns.voteCreate.mockResolvedValue({ id: 'v1', voterId: 'u-voter', targetType: 'ANSWER', targetId: 'a1', voteType: 'HELPFUL' });

    const result = await castVote(VOTER, TARGET, 'HELPFUL');
    expect(result.action).toBe('created');
    expect(mocks.fns.voteCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ voteType: 'HELPFUL' }) })
    );
    expect(mocks.fns.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ actionType: 'COMMUNITY_VOTE_CAST' }) })
    );
  });

  it('is idempotent: duplicate vote returns duplicate without creating a second row', async () => {
    mocks.fns.voteFindUnique.mockResolvedValue({ id: 'v1', voterId: 'u-voter', voteType: 'HELPFUL' });
    const result = await castVote(VOTER, TARGET, 'HELPFUL');
    expect(result.duplicate).toBe(true);
    expect(mocks.fns.voteCreate).not.toHaveBeenCalled();
  });

  it('rejects self-votes', async () => {
    mocks.fns.answerFindUnique.mockResolvedValue({ id: 'a1', authorId: 'u-author', status: 'VISIBLE' });
    const selfTarget = { targetType: 'ANSWER' as const, targetId: 'a1' };
    await expect(castVote({ ...AUTHOR, userId: 'u-author' }, selfTarget, 'HELPFUL')).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('COMMUNITY_SELF_VOTE_FORBIDDEN'),
    });
  });

  it('fails closed for anonymous voters (anonymous participation disabled by default)', async () => {
    await expect(castVote(null, TARGET, 'HELPFUL')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('403 when voting is disabled by founder policy', async () => {
    mocks.fns.platformSettingFindUnique.mockImplementation(async (input: { where: { key: string } }) =>
      input.where.key === 'community_voting_enabled' ? { value: 'false' } : null
    );
    await expect(castVote(VOTER, TARGET, 'HELPFUL')).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('FEATURE_DISABLED'),
    });
  });

  it('rejects voting on hidden content', async () => {
    mocks.fns.answerFindUnique.mockResolvedValue({ id: 'a1', authorId: 'u-author', status: 'HIDDEN' });
    await expect(castVote(VOTER, TARGET, 'HELPFUL')).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('flipVote', () => {
  it('flips an existing HELPFUL vote to AGREE in place', async () => {
    mocks.fns.voteFindUnique.mockResolvedValue({ id: 'v1', voterId: 'u-voter', voteType: 'HELPFUL' });
    mocks.fns.voteUpdate.mockResolvedValue({ id: 'v1', voteType: 'AGREE' });

    const result = await flipVote(VOTER, TARGET, 'HELPFUL', 'AGREE');
    expect(result.voteId).toBe('v1');
    expect(mocks.fns.voteUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ voteType: 'AGREE' }) })
    );
    expect(mocks.fns.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ actionType: 'COMMUNITY_VOTE_FLIPPED' }) })
    );
  });

  it('delegates to castVote when the fromType vote does not exist', async () => {
    mocks.fns.voteFindUnique.mockResolvedValue(null);
    mocks.fns.voteCreate.mockResolvedValue({ id: 'v2', voteType: 'AGREE' });

    const result = await flipVote(VOTER, TARGET, 'HELPFUL', 'AGREE');
    expect(result.action).toBe('created');
    expect(mocks.fns.voteCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ voteType: 'AGREE' }) })
    );
  });
});

describe('removeVote', () => {
  it('removes an existing vote', async () => {
    mocks.fns.voteFindUnique.mockResolvedValue({ id: 'v1', voterId: 'u-voter', voteType: 'HELPFUL' });
    const result = await removeVote(VOTER, TARGET, 'HELPFUL');
    expect(result.removed).toBe(true);
    expect(mocks.fns.voteDelete).toHaveBeenCalledWith({ where: { id: 'v1' } });
  });

  it('is a no-op when no vote exists', async () => {
    const result = await removeVote(VOTER, TARGET, 'HELPFUL');
    expect(result.removed).toBe(false);
    expect(mocks.fns.voteDelete).not.toHaveBeenCalled();
  });
});
