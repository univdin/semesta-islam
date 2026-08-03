import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';
import { createNotification } from '@/lib/notifications/service';
import { recordXpLedgerEntry } from '@/lib/growth/xp-ledger';
import type { AuthIdentity } from '@/lib/auth/session';
import type { ModerationStatus, VoteType } from '@prisma/client';
import { ServiceError, type ServiceResult } from './errors';
import {
  COMMUNITY_KHIDMAH_XP_AMOUNT,
  assertFeatureEnabled,
  gateReadAccess,
  gateWriteAccess,
  getCommunityFeatureFlags,
} from './config';
import { getVoteCounts, getViewerVotes, type VoteCounts } from './votes';

const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 300;
const BODY_MIN_LENGTH = 10;
const BODY_MAX_LENGTH = 5000;

export interface CommunityAuthorSummary {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface QuestionSummary {
  id: string;
  author: CommunityAuthorSummary;
  topicId: string | null;
  educatorId: string | null;
  title: string;
  body: string;
  status: ModerationStatus;
  answerCount: number;
  hasAcceptedAnswer: boolean;
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  votes: VoteCounts;
  viewerVotes: VoteType[];
}

export interface AnswerSummary {
  id: string;
  author: CommunityAuthorSummary;
  body: string;
  status: ModerationStatus;
  acceptedAt: Date | null;
  acceptedById: string | null;
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  votes: VoteCounts;
  viewerVotes: VoteType[];
}

interface QuestionRow {
  id: string;
  topicId: string | null;
  educatorId: string | null;
  title: string;
  body: string;
  status: ModerationStatus;
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string | null;
  authorAvatar: string | null;
}

async function toQuestionSummary(
  row: QuestionRow,
  answerCount: number,
  hasAcceptedAnswer: boolean,
  votes: VoteCounts,
  viewerVotes: VoteType[]
): Promise<QuestionSummary> {
  return {
    id: row.id,
    author: { id: row.authorId, fullName: row.authorName, avatarUrl: row.authorAvatar },
    topicId: row.topicId,
    educatorId: row.educatorId,
    title: row.title,
    body: row.body,
    status: row.status,
    answerCount,
    hasAcceptedAnswer,
    editedAt: row.editedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    votes,
    viewerVotes,
  };
}

export interface CreateQuestionInput {
  topicId?: string;
  educatorId?: string;
  title: string;
  body: string;
}

export async function createQuestion(
  actor: AuthIdentity | null,
  input: CreateQuestionInput
): Promise<QuestionSummary> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.questionsEnabled, 'questions');

  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
    throw new ServiceError(
      400,
      `QUESTION_TITLE_INVALID: Title must be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH} characters.`
    );
  }
  if (body.length < BODY_MIN_LENGTH || body.length > BODY_MAX_LENGTH) {
    throw new ServiceError(
      400,
      `QUESTION_BODY_INVALID: Body must be between ${BODY_MIN_LENGTH} and ${BODY_MAX_LENGTH} characters.`
    );
  }

  let topicId: string | null = null;
  if (input.topicId) {
    const topic = await prisma.topic.findUnique({ where: { id: input.topicId }, select: { id: true } });
    if (!topic) throw new ServiceError(400, 'QUESTION_TOPIC_INVALID: Topic does not exist.');
    topicId = topic.id;
  }

  let educatorId: string | null = null;
  if (input.educatorId) {
    const educator = await prisma.educatorProfile.findUnique({
      where: { id: input.educatorId },
      select: { id: true },
    });
    if (!educator) throw new ServiceError(400, 'QUESTION_EDUCATOR_INVALID: Educator does not exist.');
    educatorId = educator.id;
  }

  const question = await prisma.communityQuestion.create({
    data: {
      authorId: identity.userId,
      topicId,
      educatorId,
      title,
      body,
      status: 'VISIBLE',
    },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_QUESTION_CREATED',
    entityAffected: 'community_questions',
    entityId: question.id,
    metadata: { topicId, educatorId },
  });

  return toQuestionSummary(
    {
      id: question.id,
      topicId: question.topicId,
      educatorId: question.educatorId,
      title: question.title,
      body: question.body,
      status: question.status,
      editedAt: question.editedAt,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      authorId: identity.userId,
      authorName: null,
      authorAvatar: null,
    },
    0,
    false,
    { HELPFUL: 0, AGREE: 0, ENDORSE: 0 },
    []
  );
}

export interface ListQuestionsOptions {
  topicId?: string;
  educatorId?: string;
  authorId?: string;
}

export async function listQuestions(
  actor: AuthIdentity | null,
  options: ListQuestionsOptions = {}
): Promise<QuestionSummary[]> {
  await gateReadAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.questionsEnabled, 'questions');

  const where = {
    status: 'VISIBLE' as ModerationStatus,
    ...(options.topicId ? { topicId: options.topicId } : {}),
    ...(options.educatorId ? { educatorId: options.educatorId } : {}),
    ...(options.authorId ? { authorId: options.authorId } : {}),
  };

  const questions = await prisma.communityQuestion.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      author: {
        select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } },
      },
    },
  });

  if (questions.length === 0) return [];
  const ids = questions.map((q) => q.id);

  const [answerGroups, acceptedGroups, voteGroups, viewerGroups] = await Promise.all([
    prisma.communityAnswer.groupBy({
      by: ['questionId'],
      where: { questionId: { in: ids }, status: 'VISIBLE' },
      _count: { _all: true },
    }),
    prisma.communityAnswer.groupBy({
      by: ['questionId'],
      where: { questionId: { in: ids }, acceptedAt: { not: null } },
      _count: { _all: true },
    }),
    prisma.communityVote.groupBy({
      by: ['targetId', 'voteType'],
      where: { targetType: 'QUESTION', targetId: { in: ids } },
      _count: { _all: true },
    }),
    actor
      ? prisma.communityVote.findMany({
          where: { voterId: actor.userId, targetType: 'QUESTION', targetId: { in: ids } },
          select: { targetId: true, voteType: true },
        })
      : Promise.resolve([]),
  ]);

  const answerCounts = new Map(answerGroups.map((g) => [g.questionId, g._count._all]));
  const acceptedCounts = new Map(acceptedGroups.map((g) => [g.questionId, g._count._all]));
  const voteMap = new Map<string, VoteCounts>();
  const viewerMap = new Map<string, VoteType[]>();
  for (const id of ids) voteMap.set(id, { HELPFUL: 0, AGREE: 0, ENDORSE: 0 });
  for (const g of voteGroups) {
    const map = voteMap.get(g.targetId);
    if (map) map[g.voteType] = g._count._all;
  }
  for (const v of viewerGroups) {
    const list = viewerMap.get(v.targetId) ?? [];
    list.push(v.voteType);
    viewerMap.set(v.targetId, list);
  }

  return Promise.all(
    questions.map((q) =>
      toQuestionSummary(
        {
          id: q.id,
          topicId: q.topicId,
          educatorId: q.educatorId,
          title: q.title,
          body: q.body,
          status: q.status,
          editedAt: q.editedAt,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
          authorId: q.author.id,
          authorName: q.author.profile?.fullName ?? null,
          authorAvatar: q.author.profile?.avatarUrl ?? null,
        },
        answerCounts.get(q.id) ?? 0,
        (acceptedCounts.get(q.id) ?? 0) > 0,
        voteMap.get(q.id) ?? { HELPFUL: 0, AGREE: 0, ENDORSE: 0 },
        viewerMap.get(q.id) ?? []
      )
    )
  );
}

export interface QuestionDetail {
  question: QuestionSummary;
  answers: AnswerSummary[];
}

export async function getQuestion(
  actor: AuthIdentity | null,
  questionId: string
): Promise<QuestionDetail> {
  await gateReadAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.questionsEnabled, 'questions');

  const question = await prisma.communityQuestion.findUnique({
    where: { id: questionId },
    include: {
      author: {
        select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } },
      },
    },
  });
  if (!question || question.status !== 'VISIBLE') {
    throw new ServiceError(404, 'QUESTION_NOT_FOUND: Question does not exist or is not visible.');
  }

  const answers = await prisma.communityAnswer.findMany({
    where: { questionId, status: 'VISIBLE' },
    orderBy: [{ acceptedAt: 'asc' }, { createdAt: 'asc' }],
    include: {
      author: {
        select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } },
      },
    },
  });

  const answerIds = answers.map((a) => a.id);
  const [questionVotes, answerGroups, acceptedGroups] = await Promise.all([
    getVoteCounts('QUESTION', questionId),
    prisma.communityVote.groupBy({
      by: ['targetId', 'voteType'],
      where: { targetType: 'ANSWER', targetId: { in: answerIds } },
      _count: { _all: true },
    }),
    prisma.communityAnswer.findFirst({
      where: { questionId, acceptedAt: { not: null } },
      select: { id: true },
    }),
  ]);

  const answerVoteMap = new Map<string, VoteCounts>();
  for (const a of answers) answerVoteMap.set(a.id, { HELPFUL: 0, AGREE: 0, ENDORSE: 0 });
  for (const g of answerGroups) {
    const map = answerVoteMap.get(g.targetId);
    if (map) map[g.voteType] = g._count._all;
  }

  const viewerVoteMap = new Map<string, VoteType[]>();
  if (actor) {
    const mine = await prisma.communityVote.findMany({
      where: {
        voterId: actor.userId,
        targetType: 'ANSWER',
        targetId: { in: answerIds },
      },
      select: { targetId: true, voteType: true },
    });
    for (const v of mine) {
      const list = viewerVoteMap.get(v.targetId) ?? [];
      list.push(v.voteType);
      viewerVoteMap.set(v.targetId, list);
    }
  }

  const questionViewerVotes = actor ? await getViewerVotes(actor, 'QUESTION', questionId) : [];

  const summary = await toQuestionSummary(
    {
      id: question.id,
      topicId: question.topicId,
      educatorId: question.educatorId,
      title: question.title,
      body: question.body,
      status: question.status,
      editedAt: question.editedAt,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      authorId: question.author.id,
      authorName: question.author.profile?.fullName ?? null,
      authorAvatar: question.author.profile?.avatarUrl ?? null,
    },
    answers.length,
    Boolean(acceptedGroups),
    questionVotes,
    questionViewerVotes
  );

  const answerSummaries: AnswerSummary[] = answers.map((a) => ({
    id: a.id,
    author: {
      id: a.author.id,
      fullName: a.author.profile?.fullName ?? null,
      avatarUrl: a.author.profile?.avatarUrl ?? null,
    },
    body: a.body,
    status: a.status,
    acceptedAt: a.acceptedAt,
    acceptedById: a.acceptedById,
    editedAt: a.editedAt,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    votes: answerVoteMap.get(a.id) ?? { HELPFUL: 0, AGREE: 0, ENDORSE: 0 },
    viewerVotes: viewerVoteMap.get(a.id) ?? [],
  }));

  return { question: summary, answers: answerSummaries };
}

export interface CreateAnswerInput {
  questionId: string;
  body: string;
}

export async function createAnswer(
  actor: AuthIdentity | null,
  input: CreateAnswerInput
): Promise<AnswerSummary> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.answersEnabled, 'answers');

  const body = input.body.trim();
  if (body.length < BODY_MIN_LENGTH || body.length > BODY_MAX_LENGTH) {
    throw new ServiceError(
      400,
      `ANSWER_BODY_INVALID: Answer must be between ${BODY_MIN_LENGTH} and ${BODY_MAX_LENGTH} characters.`
    );
  }

  const question = await prisma.communityQuestion.findUnique({
    where: { id: input.questionId },
    select: { id: true, authorId: true, status: true },
  });
  if (!question) {
    throw new ServiceError(404, 'QUESTION_NOT_FOUND: Question does not exist.');
  }
  if (question.status === 'LOCKED') {
    throw new ServiceError(409, 'QUESTION_LOCKED: The question is locked and cannot receive answers.');
  }
  if (question.status !== 'VISIBLE') {
    throw new ServiceError(404, 'QUESTION_NOT_VISIBLE: Question is not visible.');
  }

  const answer = await prisma.communityAnswer.create({
    data: {
      questionId: input.questionId,
      authorId: identity.userId,
      body,
      status: 'VISIBLE',
    },
    include: {
      author: {
        select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } },
      },
    },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_ANSWER_CREATED',
    entityAffected: 'community_answers',
    entityId: answer.id,
    metadata: { questionId: input.questionId },
  });

  if (question.authorId !== identity.userId) {
    await createNotification({
      userId: question.authorId,
      type: 'QUESTION_ANSWERED',
      title: 'Pertanyaan Anda dijawab',
      body: body.slice(0, 120),
      metadata: { questionId: input.questionId, answerId: answer.id },
    });
  }

  return {
    id: answer.id,
    author: {
      id: answer.author.id,
      fullName: answer.author.profile?.fullName ?? null,
      avatarUrl: answer.author.profile?.avatarUrl ?? null,
    },
    body: answer.body,
    status: answer.status,
    acceptedAt: answer.acceptedAt,
    acceptedById: answer.acceptedById,
    editedAt: answer.editedAt,
    createdAt: answer.createdAt,
    updatedAt: answer.updatedAt,
    votes: { HELPFUL: 0, AGREE: 0, ENDORSE: 0 },
    viewerVotes: [],
  };
}

export interface AcceptAnswerResult {
  answerId: string;
  questionId: string;
  previousAcceptedAnswerId: string | null;
  xpAwarded: boolean;
}

export async function acceptAnswer(
  actor: AuthIdentity | null,
  answerId: string
): Promise<AcceptAnswerResult> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.answersEnabled, 'answers');

  const answer = await prisma.communityAnswer.findUnique({
    where: { id: answerId },
    include: {
      question: { select: { id: true, authorId: true, status: true } },
    },
  });
  if (!answer) {
    throw new ServiceError(404, 'ANSWER_NOT_FOUND: Answer does not exist.');
  }
  if (answer.question.status !== 'VISIBLE' || answer.status !== 'VISIBLE') {
    throw new ServiceError(409, 'ANSWER_NOT_ACCEPTABLE: Only visible content on visible questions can be accepted.');
  }

  const isFounder = identity.roles.includes('FOUNDER_ADMIN');
  if (!isFounder && answer.question.authorId !== identity.userId) {
    throw new ServiceError(
      403,
      'FORBIDDEN: Only the question author (or FOUNDER_ADMIN) can accept an answer.'
    );
  }

  const previousAccepted = await prisma.communityAnswer.findFirst({
    where: { questionId: answer.questionId, acceptedAt: { not: null } },
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.communityAnswer.updateMany({
      where: { questionId: answer.questionId, acceptedAt: { not: null } },
      data: { acceptedAt: null, acceptedById: null },
    });
    await tx.communityAnswer.update({
      where: { id: answerId },
      data: { acceptedAt: new Date(), acceptedById: identity.userId },
    });
    await tx.auditLog.create({
      data: {
        actorUserId: identity.userId,
        actionType: 'COMMUNITY_ANSWER_ACCEPTED',
        entityAffected: 'community_answers',
        metadata: {
          entityId: answerId,
          questionId: answer.questionId,
          previousAcceptedAnswerId: previousAccepted?.id ?? null,
        },
      },
    });
  });

  if (answer.authorId !== identity.userId) {
    await createNotification({
      userId: answer.authorId,
      type: 'ANSWER_ACCEPTED',
      title: 'Jawaban Anda diterima',
      body: 'Jawaban Anda telah dipilih sebagai jawaban terbaik.',
      metadata: { questionId: answer.questionId, answerId },
    });
  }

  const xpAwarded = await awardAcceptedAnswerXp(answerId, answer.authorId, answer.questionId);

  return {
    answerId,
    questionId: answer.questionId,
    previousAcceptedAnswerId: previousAccepted?.id ?? null,
    xpAwarded,
  };
}

export async function awardAcceptedAnswerXp(
  answerId: string,
  authorUserId: string,
  questionId: string
): Promise<boolean> {
  const eventId = `answer-accepted-${answerId}`;
  const idempotencyKey = `xp-${authorUserId}-${eventId}-COMMUNITY_KHIDMAH`;
  const result = await recordXpLedgerEntry({
    userId: authorUserId,
    eventId,
    idempotencyKey,
    amount: COMMUNITY_KHIDMAH_XP_AMOUNT,
    actionType: 'COMMUNITY_KHIDMAH',
    source: 'COMMUNITY_QA',
    reference: questionId,
  });
  return !result.duplicate;
}

export async function reverseAcceptedAnswerXp(
  answerId: string,
  authorUserId: string,
  questionId: string
): Promise<boolean> {
  const idempotencyKey = `xp-reversal-${authorUserId}-${answerId}-COMMUNITY_KHIDMAH`;
  const result = await recordXpLedgerEntry({
    userId: authorUserId,
    eventId: `answer-accept-reversal-${answerId}`,
    idempotencyKey,
    amount: -COMMUNITY_KHIDMAH_XP_AMOUNT,
    actionType: 'REVERSAL_FRAUD',
    source: 'COMMUNITY_MODERATION',
    reference: questionId,
  });
  return !result.duplicate;
}

export interface UpdateQuestionInput {
  title?: string;
  body?: string;
}

export async function updateQuestion(
  actor: AuthIdentity | null,
  questionId: string,
  input: UpdateQuestionInput
): Promise<QuestionSummary> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.questionsEnabled, 'questions');

  const existing = await prisma.communityQuestion.findUnique({ where: { id: questionId } });
  if (!existing) {
    throw new ServiceError(404, 'QUESTION_NOT_FOUND: Question does not exist.');
  }
  if (existing.authorId !== identity.userId && !identity.roles.includes('FOUNDER_ADMIN')) {
    throw new ServiceError(403, 'FORBIDDEN: Only the question author can edit this question.');
  }
  if (existing.status !== 'VISIBLE') {
    throw new ServiceError(409, 'QUESTION_NOT_EDITABLE: Only visible questions can be edited.');
  }

  const title = (input.title ?? existing.title).trim();
  const body = (input.body ?? existing.body).trim();
  if (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
    throw new ServiceError(400, `QUESTION_TITLE_INVALID: Title must be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH} characters.`);
  }
  if (body.length < BODY_MIN_LENGTH || body.length > BODY_MAX_LENGTH) {
    throw new ServiceError(400, `QUESTION_BODY_INVALID: Body must be between ${BODY_MIN_LENGTH} and ${BODY_MAX_LENGTH} characters.`);
  }

  const updated = await prisma.communityQuestion.update({
    where: { id: questionId },
    data: { title, body, editedAt: new Date() },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_QUESTION_UPDATED',
    entityAffected: 'community_questions',
    entityId: questionId,
    metadata: { previousTitle: existing.title.slice(0, 120) },
  });

  return toQuestionSummary(
    {
      id: updated.id,
      topicId: updated.topicId,
      educatorId: updated.educatorId,
      title: updated.title,
      body: updated.body,
      status: updated.status,
      editedAt: updated.editedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      authorId: existing.authorId,
      authorName: null,
      authorAvatar: null,
    },
    0,
    false,
    { HELPFUL: 0, AGREE: 0, ENDORSE: 0 },
    []
  );
}

export async function deleteQuestion(
  actor: AuthIdentity | null,
  questionId: string
): Promise<ServiceResult> {
  const identity = await gateWriteAccess(actor);
  const existing = await prisma.communityQuestion.findUnique({
    where: { id: questionId },
    select: { id: true, authorId: true, status: true },
  });
  if (!existing) {
    throw new ServiceError(404, 'QUESTION_NOT_FOUND: Question does not exist.');
  }

  const canModerate = identity.roles.includes('FOUNDER_ADMIN') || (await hasContentManageCapability(identity));
  if (existing.authorId !== identity.userId && !canModerate) {
    throw new ServiceError(403, 'FORBIDDEN: Only the author, FOUNDER_ADMIN, or content.manage holders can remove this question.');
  }

  await prisma.communityQuestion.update({
    where: { id: questionId },
    data: { status: 'REMOVED', moderatedById: identity.userId, moderatedAt: new Date() },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_QUESTION_REMOVED',
    entityAffected: 'community_questions',
    entityId: questionId,
    metadata: { previousStatus: existing.status },
  });

  return { success: true, statusCode: 200, message: 'Question removed.', data: { questionId } };
}

export async function updateAnswer(
  actor: AuthIdentity | null,
  answerId: string,
  body: string
): Promise<AnswerSummary> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.answersEnabled, 'answers');

  const trimmed = body.trim();
  if (trimmed.length < BODY_MIN_LENGTH || trimmed.length > BODY_MAX_LENGTH) {
    throw new ServiceError(400, `ANSWER_BODY_INVALID: Answer must be between ${BODY_MIN_LENGTH} and ${BODY_MAX_LENGTH} characters.`);
  }

  const existing = await prisma.communityAnswer.findUnique({
    where: { id: answerId },
    include: { author: { select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } } } },
  });
  if (!existing) {
    throw new ServiceError(404, 'ANSWER_NOT_FOUND: Answer does not exist.');
  }
  if (existing.authorId !== identity.userId && !identity.roles.includes('FOUNDER_ADMIN')) {
    throw new ServiceError(403, 'FORBIDDEN: Only the answer author can edit this answer.');
  }
  if (existing.status !== 'VISIBLE') {
    throw new ServiceError(409, 'ANSWER_NOT_EDITABLE: Only visible answers can be edited.');
  }

  const updated = await prisma.communityAnswer.update({
    where: { id: answerId },
    data: { body: trimmed, editedAt: new Date() },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_ANSWER_UPDATED',
    entityAffected: 'community_answers',
    entityId: answerId,
    metadata: { previousPreview: existing.body.slice(0, 120) },
  });

  return {
    id: updated.id,
    author: {
      id: existing.author.id,
      fullName: existing.author.profile?.fullName ?? null,
      avatarUrl: existing.author.profile?.avatarUrl ?? null,
    },
    body: updated.body,
    status: updated.status,
    acceptedAt: updated.acceptedAt,
    acceptedById: updated.acceptedById,
    editedAt: updated.editedAt,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    votes: { HELPFUL: 0, AGREE: 0, ENDORSE: 0 },
    viewerVotes: [],
  };
}

export async function deleteAnswer(
  actor: AuthIdentity | null,
  answerId: string
): Promise<ServiceResult> {
  const identity = await gateWriteAccess(actor);
  const existing = await prisma.communityAnswer.findUnique({
    where: { id: answerId },
    select: { id: true, authorId: true, status: true, acceptedAt: true, questionId: true },
  });
  if (!existing) {
    throw new ServiceError(404, 'ANSWER_NOT_FOUND: Answer does not exist.');
  }

  const canModerate = identity.roles.includes('FOUNDER_ADMIN') || (await hasContentManageCapability(identity));
  if (existing.authorId !== identity.userId && !canModerate) {
    throw new ServiceError(403, 'FORBIDDEN: Only the author, FOUNDER_ADMIN, or content.manage holders can remove this answer.');
  }

  let xpRevoked = false;
  if (existing.acceptedAt && existing.status !== 'REMOVED') {
    xpRevoked = await reverseAcceptedAnswerXp(existing.id, existing.authorId, existing.questionId);
  }

  await prisma.communityAnswer.update({
    where: { id: answerId },
    data: { status: 'REMOVED', moderatedById: identity.userId, moderatedAt: new Date() },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_ANSWER_REMOVED',
    entityAffected: 'community_answers',
    entityId: answerId,
    metadata: { previousStatus: existing.status, xpRevoked },
  });

  return { success: true, statusCode: 200, message: 'Answer removed.', data: { answerId, xpRevoked } };
}

export async function unacceptAnswer(
  actor: AuthIdentity | null,
  answerId: string
): Promise<{ answerId: string; questionId: string; xpRevoked: boolean }> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.answersEnabled, 'answers');

  const answer = await prisma.communityAnswer.findUnique({
    where: { id: answerId },
    include: { question: { select: { id: true, authorId: true } } },
  });
  if (!answer) {
    throw new ServiceError(404, 'ANSWER_NOT_FOUND: Answer does not exist.');
  }
  if (!answer.acceptedAt) {
    throw new ServiceError(409, 'ANSWER_NOT_ACCEPTED: This answer is not currently accepted.');
  }

  const isFounder = identity.roles.includes('FOUNDER_ADMIN');
  if (!isFounder && answer.question.authorId !== identity.userId) {
    throw new ServiceError(403, 'FORBIDDEN: Only the question author (or FOUNDER_ADMIN) can unaccept an answer.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.communityAnswer.update({
      where: { id: answerId },
      data: { acceptedAt: null, acceptedById: null },
    });
    await tx.auditLog.create({
      data: {
        actorUserId: identity.userId,
        actionType: 'COMMUNITY_ANSWER_UNACCEPTED',
        entityAffected: 'community_answers',
        metadata: { entityId: answerId, questionId: answer.questionId },
      },
    });
  });

  const xpRevoked = await reverseAcceptedAnswerXp(answerId, answer.authorId, answer.questionId);

  return { answerId, questionId: answer.questionId, xpRevoked };
}

async function hasContentManageCapability(identity: AuthIdentity): Promise<boolean> {
  const { can } = await import('@/lib/auth/authorization');
  const { CAPABILITIES } = await import('@/lib/auth/permissions');
  return can({ actor: identity, capability: CAPABILITIES.CONTENT_MANAGE });
}
