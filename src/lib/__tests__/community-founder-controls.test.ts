/**
 * SEMESTA ISLAM — Community Founder Controls Contract Tests
 * Covers: server-enforced feature flags (disabled features fail server-side),
 * content-visibility tiers (public/authenticated/restricted), and the
 * anonymous-participation fail-closed policy.
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
    questionFindUnique: vi.fn(),
    answerFindUnique: vi.fn(),
    voteFindUnique: vi.fn(),
    voteCreate: vi.fn(),
    reportFindUnique: vi.fn(),
    reportFindMany: vi.fn(),
    reportCreate: vi.fn(),
    reportUpdate: vi.fn(),
    reportCount: vi.fn(),
    auditCreate: vi.fn(),
    notificationCreate: vi.fn(),
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
    communityQuestion: { findUnique: fns.questionFindUnique },
    communityAnswer: { findUnique: fns.answerFindUnique },
    communityVote: { findUnique: fns.voteFindUnique, create: fns.voteCreate },
    communityReport: {
      findUnique: fns.reportFindUnique,
      findMany: fns.reportFindMany,
      create: fns.reportCreate,
      update: fns.reportUpdate,
      count: fns.reportCount,
    },
    auditLog: { create: fns.auditCreate },
    notification: { create: fns.notificationCreate },
  };
  return { prisma, fns };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

import { listComments, createComment } from '@/lib/community/comments';
import { createQuestion } from '@/lib/community/qa';
import { castVote } from '@/lib/community/votes';
import { createReport } from '@/lib/community/reports';
import { getCommunityFeatureFlags } from '@/lib/community/config';
import type { AuthIdentity } from '@/lib/auth/session';

function actor(userId: string, roles: AuthIdentity['roles']): AuthIdentity {
  return { userId, email: `${userId}@test.local`, roles, source: 'demo' };
}

const MEMBER = actor('u-member', ['LEARNER']);

function settings(values: Record<string, string>) {
  mocks.fns.platformSettingFindUnique.mockImplementation(async (input: { where: { key: string } }) =>
    Object.prototype.hasOwnProperty.call(values, input.where.key) ? { value: values[input.where.key] } : null
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  settings({});
  mocks.fns.educatorFindUnique.mockResolvedValue({ id: 'educator-1', userId: 'u-educator' });
});

describe('getCommunityFeatureFlags — founder-controlled defaults', () => {
  it('defaults: participation on, anonymous off, QA indexing off, visibility public, threshold 5', async () => {
    const flags = await getCommunityFeatureFlags();
    expect(flags.commentsEnabled).toBe(true);
    expect(flags.questionsEnabled).toBe(true);
    expect(flags.answersEnabled).toBe(true);
    expect(flags.votingEnabled).toBe(true);
    expect(flags.reportsEnabled).toBe(true);
    expect(flags.anonymousParticipationEnabled).toBe(false);
    expect(flags.qaIndexingEnabled).toBe(false);
    expect(flags.contentVisibility).toBe('public');
    expect(flags.reportThreshold).toBe(5);
  });

  it('reads persisted overrides', async () => {
    settings({
      community_comments_enabled: 'false',
      community_qa_indexing_enabled: 'true',
      community_content_visibility: 'authenticated',
      community_report_threshold: '3',
    });
    const flags = await getCommunityFeatureFlags();
    expect(flags.commentsEnabled).toBe(false);
    expect(flags.qaIndexingEnabled).toBe(true);
    expect(flags.contentVisibility).toBe('authenticated');
    expect(flags.reportThreshold).toBe(3);
  });
});

describe('disabled features fail server-side', () => {
  it('comments disabled -> createComment 403', async () => {
    settings({ community_comments_enabled: 'false' });
    await expect(createComment(MEMBER, { targetType: 'EDUCATOR_PROFILE', targetId: 'educator-1', body: 'halo dunia' })).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('FEATURE_DISABLED'),
    });
  });

  it('questions disabled -> createQuestion 403', async () => {
    settings({ community_questions_enabled: 'false' });
    await expect(createQuestion(MEMBER, { title: 'Pertanyaan yang valid?', body: 'Isi yang cukup panjang untuk lolos validasi.' })).rejects.toMatchObject({ statusCode: 403 });
  });

  it('voting disabled -> castVote 403', async () => {
    settings({ community_voting_enabled: 'false' });
    mocks.fns.answerFindUnique.mockResolvedValue({ id: 'a1', authorId: 'u-author', status: 'VISIBLE' });
    await expect(castVote(MEMBER, { targetType: 'ANSWER', targetId: 'a1' }, 'HELPFUL')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('reports disabled -> createReport 403', async () => {
    settings({ community_reports_enabled: 'false' });
    mocks.fns.commentFindUnique.mockResolvedValue({ id: 'c1', authorId: 'u-educator', status: 'VISIBLE' });
    await expect(createReport(MEMBER, { targetType: 'COMMENT', targetId: 'c1', reason: 'Konten tidak sesuai kebijakan.' })).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('content visibility tiers', () => {
  it('public: read is open to anonymous visitors', async () => {
    mocks.fns.commentFindMany.mockResolvedValue([]);
    await expect(listComments(null, 'EDUCATOR_PROFILE', 'educator-1')).resolves.toEqual([]);
  });

  it('authenticated: anonymous readers get 401', async () => {
    settings({ community_content_visibility: 'authenticated' });
    await expect(listComments(null, 'EDUCATOR_PROFILE', 'educator-1')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('authenticated: signed-in readers are allowed', async () => {
    settings({ community_content_visibility: 'authenticated' });
    mocks.fns.commentFindMany.mockResolvedValue([]);
    await expect(listComments(MEMBER, 'EDUCATOR_PROFILE', 'educator-1')).resolves.toEqual([]);
  });

  it('restricted: read is denied even for signed-in users', async () => {
    settings({ community_content_visibility: 'restricted' });
    await expect(listComments(MEMBER, 'EDUCATOR_PROFILE', 'educator-1')).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe('anonymous participation policy', () => {
  it('anonymous writes are rejected even when the flag is enabled (no anonymous identity model — fail closed)', async () => {
    settings({ community_anonymous_participation_enabled: 'true' });
    await expect(createComment(null, { targetType: 'EDUCATOR_PROFILE', targetId: 'educator-1', body: 'halo dunia' })).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining('AUTHENTICATION_REQUIRED'),
    });
  });
});
