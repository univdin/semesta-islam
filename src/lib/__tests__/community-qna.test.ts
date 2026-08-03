/**
 * SEMESTA ISLAM — Community Q&A Contract Tests
 * Covers: question/answer lifecycle, locking, accept/unaccept semantics,
 * idempotent COMMUNITY_KHIDMAH XP on accepted answers, XP reversal, and the
 * invariant that "accepted" is a community signal, never a VERIFIED status.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const fns = {
    platformSettingFindUnique: vi.fn(),
    topicFindUnique: vi.fn(),
    educatorFindUnique: vi.fn(),
    questionFindMany: vi.fn(),
    questionFindUnique: vi.fn(),
    questionCreate: vi.fn(),
    questionUpdate: vi.fn(),
    answerFindMany: vi.fn(),
    answerFindUnique: vi.fn(),
    answerFindFirst: vi.fn(),
    answerCreate: vi.fn(),
    answerUpdate: vi.fn(),
    answerUpdateMany: vi.fn(),
    answerGroupBy: vi.fn(),
    voteGroupBy: vi.fn(),
    voteFindMany: vi.fn(),
    xpFindUnique: vi.fn(),
    xpCreate: vi.fn(),
    auditCreate: vi.fn(),
    notificationCreate: vi.fn(),
    claimUpdate: vi.fn(),
  };
  const prisma = {
    platformSetting: { findUnique: fns.platformSettingFindUnique },
    topic: { findUnique: fns.topicFindUnique },
    educatorProfile: { findUnique: fns.educatorFindUnique },
    communityQuestion: {
      findMany: fns.questionFindMany,
      findUnique: fns.questionFindUnique,
      create: fns.questionCreate,
      update: fns.questionUpdate,
    },
    communityAnswer: {
      findMany: fns.answerFindMany,
      findUnique: fns.answerFindUnique,
      findFirst: fns.answerFindFirst,
      create: fns.answerCreate,
      update: fns.answerUpdate,
      updateMany: fns.answerUpdateMany,
      groupBy: fns.answerGroupBy,
    },
    communityVote: { groupBy: fns.voteGroupBy, findMany: fns.voteFindMany },
    xpLedger: { findUnique: fns.xpFindUnique, create: fns.xpCreate },
    auditLog: { create: fns.auditCreate },
    notification: { create: fns.notificationCreate },
    knowledgeClaim: { update: fns.claimUpdate },
    organizationMembership: { findMany: vi.fn(async () => []) },
    delegation: { findMany: vi.fn(async () => []) },
    $transaction: vi.fn(async (fn: unknown) => {
      return (fn as (tx: typeof prisma) => unknown)(prisma);
    }),
  };
  return { prisma, fns };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

import { createQuestion, listQuestions, getQuestion, createAnswer, acceptAnswer, unacceptAnswer, deleteAnswer } from '@/lib/community/qa';
import type { AuthIdentity } from '@/lib/auth/session';

function actor(userId: string, roles: AuthIdentity['roles']): AuthIdentity {
  return { userId, email: `${userId}@test.local`, roles, source: 'demo' };
}

const ASKER = actor('u-asker', ['LEARNER']);
const ANSWERER = actor('u-answerer', ['LEARNER']);

function questionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'q1',
    authorId: 'u-asker',
    topicId: null,
    educatorId: null,
    title: 'Bagaimana cara memilih guru sanad?',
    body: 'Saya ingin belajar sanad Al-Qur\u2019an namun bingung memilih guru.',
    status: 'VISIBLE',
    editedAt: null,
    createdAt: new Date('2026-08-01T00:00:00Z'),
    updatedAt: new Date('2026-08-01T00:00:00Z'),
    author: { id: 'u-asker', profile: { fullName: 'Asker', avatarUrl: null } },
    ...overrides,
  };
}

function answerRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1',
    questionId: 'q1',
    authorId: 'u-answerer',
    body: 'Pilihlah guru yang memiliki sanad bersambung dan riwayat bimbingan.',
    status: 'VISIBLE',
    acceptedAt: null,
    acceptedById: null,
    editedAt: null,
    createdAt: new Date('2026-08-02T00:00:00Z'),
    updatedAt: new Date('2026-08-02T00:00:00Z'),
    author: { id: 'u-answerer', profile: { fullName: 'Answerer', avatarUrl: null } },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fns.platformSettingFindUnique.mockImplementation(async () => null);
  mocks.fns.topicFindUnique.mockResolvedValue({ id: 'topic-1' });
  mocks.fns.educatorFindUnique.mockResolvedValue({ id: 'educator-1' });
  mocks.fns.xpFindUnique.mockResolvedValue(null);
  mocks.fns.auditCreate.mockResolvedValue({ id: 'audit-1', createdAt: new Date() });
  mocks.fns.notificationCreate.mockResolvedValue({ id: 'n1' });
  mocks.fns.voteGroupBy.mockResolvedValue([]);
  mocks.fns.voteFindMany.mockResolvedValue([]);
  mocks.fns.answerGroupBy.mockResolvedValue([]);
});

describe('createQuestion', () => {
  it('validates title and body length', async () => {
    await expect(createQuestion(ASKER, { title: 'x', body: 'y' })).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('QUESTION_TITLE_INVALID'),
    });
  });

  it('rejects unknown topic and educator references', async () => {
    mocks.fns.topicFindUnique.mockResolvedValue(null);
    await expect(
      createQuestion(ASKER, { topicId: 'topic-x', title: 'Pertanyaan yang valid?', body: 'Isi yang cukup panjang untuk lolos validasi.' })
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('QUESTION_TOPIC_INVALID') });
  });

  it('creates a VISIBLE question and audits it', async () => {
    mocks.fns.questionCreate.mockResolvedValue(questionRow());
    const result = await createQuestion(ASKER, { title: 'Bagaimana cara memilih guru sanad?', body: 'Saya ingin belajar sanad Al-Qur\u2019an.' });
    expect(result.status).toBe('VISIBLE');
    expect(mocks.fns.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ actionType: 'COMMUNITY_QUESTION_CREATED' }) })
    );
  });

  it('fails closed for anonymous askers', async () => {
    await expect(createQuestion(null, { title: 'Pertanyaan yang valid?', body: 'Isi yang cukup panjang untuk lolos validasi.' })).rejects.toMatchObject({ statusCode: 401 });
  });

  it('403 when questions are disabled by founder policy', async () => {
    mocks.fns.platformSettingFindUnique.mockImplementation(async (input: { where: { key: string } }) =>
      input.where.key === 'community_questions_enabled' ? { value: 'false' } : null
    );
    await expect(createQuestion(ASKER, { title: 'Pertanyaan yang valid?', body: 'Isi yang cukup panjang untuk lolos validasi.' })).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('listQuestions', () => {
  it('returns only VISIBLE questions with answer counts and votes', async () => {
    mocks.fns.questionFindMany.mockResolvedValue([questionRow()]);
    mocks.fns.answerGroupBy
      .mockResolvedValueOnce([{ questionId: 'q1', _count: { _all: 2 } }])
      .mockResolvedValueOnce([]);
    mocks.fns.voteGroupBy.mockResolvedValue([{ targetId: 'q1', voteType: 'HELPFUL', _count: { _all: 1 } }]);

    const result = await listQuestions(ASKER, {});
    expect(mocks.fns.questionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'VISIBLE' }) })
    );
    expect(result[0].answerCount).toBe(2);
    expect(result[0].hasAcceptedAnswer).toBe(false);
  });

  it('filters by topic and educator', async () => {
    mocks.fns.questionFindMany.mockResolvedValue([]);
    await listQuestions(ASKER, { topicId: 'topic-1', educatorId: 'educator-1' });
    expect(mocks.fns.questionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ topicId: 'topic-1', educatorId: 'educator-1' }) })
    );
  });
});

describe('getQuestion', () => {
  it('404s for non-visible questions', async () => {
    mocks.fns.questionFindUnique.mockResolvedValue(questionRow({ status: 'REMOVED' }));
    await expect(getQuestion(ASKER, 'q1')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('returns the question with visible answers', async () => {
    mocks.fns.questionFindUnique.mockResolvedValue(questionRow());
    mocks.fns.answerFindMany.mockResolvedValue([answerRow()]);
    mocks.fns.answerFindFirst.mockResolvedValue(null);

    const detail = await getQuestion(ASKER, 'q1');
    expect(detail.question.id).toBe('q1');
    expect(detail.answers.length).toBe(1);
  });
});

describe('createAnswer', () => {
  it('rejects answers on LOCKED questions', async () => {
    mocks.fns.questionFindUnique.mockResolvedValue(questionRow({ status: 'LOCKED' }));
    await expect(createAnswer(ANSWERER, { questionId: 'q1', body: 'Jawaban yang cukup panjang untuk lolos validasi.' })).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('QUESTION_LOCKED'),
    });
  });

  it('creates a VISIBLE answer and notifies the question author', async () => {
    mocks.fns.questionFindUnique.mockResolvedValue(questionRow());
    mocks.fns.answerCreate.mockResolvedValue(answerRow());
    const result = await createAnswer(ANSWERER, { questionId: 'q1', body: 'Jawaban yang cukup panjang untuk lolos validasi.' });
    expect(result.status).toBe('VISIBLE');
    expect(mocks.fns.notificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'u-asker', type: 'QUESTION_ANSWERED' }) })
    );
  });
});

describe('acceptAnswer — recognition on accepted answers only', () => {
  it('only the question author (or founder) may accept an answer', async () => {
    mocks.fns.answerFindUnique.mockResolvedValue(answerRow({ question: { id: 'q1', authorId: 'u-asker', status: 'VISIBLE' } }));
    await expect(acceptAnswer(ANSWERER, 'a1')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('awards COMMUNITY_KHIDMAH XP exactly once (idempotent)', async () => {
    mocks.fns.answerFindUnique.mockResolvedValue(answerRow({ question: { id: 'q1', authorId: 'u-asker', status: 'VISIBLE' } }));
    mocks.fns.answerFindFirst.mockResolvedValue(null);
    mocks.fns.xpFindUnique.mockResolvedValue(null);
    mocks.fns.xpCreate.mockResolvedValue({ id: 'xp1' });

    const first = await acceptAnswer(ASKER, 'a1');
    expect(first.xpAwarded).toBe(true);
    expect(mocks.fns.xpCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ actionType: 'COMMUNITY_KHIDMAH', amount: 50 }) })
    );

    mocks.fns.xpFindUnique.mockResolvedValue({ id: 'xp1' });
    mocks.fns.answerFindFirst.mockResolvedValue({ id: 'a1' });
    const second = await acceptAnswer(ASKER, 'a1');
    expect(second.xpAwarded).toBe(false);
    expect(mocks.fns.xpCreate).toHaveBeenCalledTimes(1);
  });

  it('accepting an answer never touches KnowledgeClaim status (accepted != VERIFIED)', async () => {
    mocks.fns.answerFindUnique.mockResolvedValue(answerRow({ question: { id: 'q1', authorId: 'u-asker', status: 'VISIBLE' } }));
    mocks.fns.answerFindFirst.mockResolvedValue(null);
    mocks.fns.xpCreate.mockResolvedValue({ id: 'xp1' });

    await acceptAnswer(ASKER, 'a1');
    expect(mocks.fns.claimUpdate).not.toHaveBeenCalled();
  });

  it('replaces the previous accepted answer atomically', async () => {
    mocks.fns.answerFindUnique.mockResolvedValue(answerRow({ id: 'a2', question: { id: 'q1', authorId: 'u-asker', status: 'VISIBLE' } }));
    mocks.fns.answerFindFirst.mockResolvedValue({ id: 'a1' });
    mocks.fns.xpCreate.mockResolvedValue({ id: 'xp1' });

    const result = await acceptAnswer(ASKER, 'a2');
    expect(result.previousAcceptedAnswerId).toBe('a1');
    expect(mocks.fns.answerUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ acceptedAt: null }) })
    );
  });
});

describe('unacceptAnswer / deleteAnswer — XP reversal', () => {
  it('reverses XP with a negative REVERSAL_FRAUD entry when unaccepted', async () => {
    mocks.fns.answerFindUnique.mockResolvedValue(
      answerRow({ acceptedAt: new Date('2026-08-03T00:00:00Z'), acceptedById: 'u-asker', question: { id: 'q1', authorId: 'u-asker' } })
    );
    mocks.fns.xpCreate.mockResolvedValue({ id: 'rev1' });

    const result = await unacceptAnswer(ASKER, 'a1');
    expect(result.xpRevoked).toBe(true);
    expect(mocks.fns.xpCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ actionType: 'REVERSAL_FRAUD', amount: -50 }) })
    );
  });

  it('does not allow a third party to unaccept', async () => {
    mocks.fns.answerFindUnique.mockResolvedValue(
      answerRow({ acceptedAt: new Date(), question: { id: 'q1', authorId: 'u-asker' } })
    );
    await expect(unacceptAnswer(ANSWERER, 'a1')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('revokes XP when an accepted answer is removed', async () => {
    mocks.fns.answerFindUnique.mockResolvedValue(
      answerRow({ acceptedAt: new Date('2026-08-03T00:00:00Z'), questionId: 'q1' })
    );
    mocks.fns.answerUpdate.mockResolvedValue(answerRow({ status: 'REMOVED' }));
    mocks.fns.xpCreate.mockResolvedValue({ id: 'rev1' });

    const result = await deleteAnswer(ANSWERER, 'a1');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(expect.objectContaining({ xpRevoked: true }));
    expect(mocks.fns.xpCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ actionType: 'REVERSAL_FRAUD' }) })
    );
  });
});
