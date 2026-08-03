/**
 * SEMESTA ISLAM — Community Reports Contract Tests
 * Covers: per-reporter dedupe (unique constraint semantics), auto-flag at
 * threshold, moderation-only list/resolve, and closed-report idempotency.
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
    reportFindUnique: vi.fn(),
    reportFindMany: vi.fn(),
    reportCreate: vi.fn(),
    reportUpdate: vi.fn(),
    reportCount: vi.fn(),
    auditCreate: vi.fn(),
  };
  const prisma = {
    platformSetting: { findUnique: fns.platformSettingFindUnique },
    educatorProfile: { findUnique: fns.educatorFindUnique },
    topic: { findUnique: fns.topicFindUnique },
    communityComment: { findUnique: fns.commentFindUnique, update: vi.fn() },
    communityQuestion: { findUnique: fns.questionFindUnique },
    communityAnswer: { findUnique: fns.answerFindUnique },
    communityReport: {
      findUnique: fns.reportFindUnique,
      findMany: fns.reportFindMany,
      create: fns.reportCreate,
      update: fns.reportUpdate,
      updateMany: vi.fn(),
      count: fns.reportCount,
    },
    auditLog: { create: fns.auditCreate },
    organizationMembership: { findMany: vi.fn(async () => []) },
    delegation: { findMany: vi.fn(async () => []) },
  };
  return { prisma, fns };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

import { createReport, listReports, resolveReport } from '@/lib/community/reports';
import type { AuthIdentity } from '@/lib/auth/session';

function actor(userId: string, roles: AuthIdentity['roles']): AuthIdentity {
  return { userId, email: `${userId}@test.local`, roles, source: 'demo' };
}

const REPORTER = actor('u-reporter', ['LEARNER']);
const MODERATOR = actor('u-moderator', ['FOUNDER_ADMIN']);

function reportRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    reporterId: 'u-reporter',
    targetType: 'COMMENT',
    targetId: 'c1',
    reason: 'Konten tidak sesuai kebijakan.',
    status: 'OPEN',
    resolution: null,
    resolvedById: null,
    resolvedAt: null,
    createdAt: new Date('2026-08-01T00:00:00Z'),
    updatedAt: new Date('2026-08-01T00:00:00Z'),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fns.platformSettingFindUnique.mockImplementation(async () => null);
  mocks.fns.commentFindUnique.mockResolvedValue({ id: 'c1', authorId: 'u-educator', status: 'VISIBLE' });
  mocks.fns.reportFindUnique.mockResolvedValue(null);
  mocks.fns.auditCreate.mockResolvedValue({ id: 'audit-1', createdAt: new Date() });
});

describe('createReport', () => {
  it('creates an OPEN report and audits it', async () => {
    mocks.fns.reportCreate.mockResolvedValue(reportRow());
    mocks.fns.reportCount.mockResolvedValue(1);

    const result = await createReport(REPORTER, { targetType: 'COMMENT', targetId: 'c1', reason: 'Konten tidak sesuai kebijakan.' });

    expect(result.duplicate).toBe(false);
    expect(result.reportId).toBe('r1');
    expect(mocks.fns.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ actionType: 'COMMUNITY_CONTENT_REPORTED' }) })
    );
  });

  it('dedupes per reporter+target (unique constraint) and does not create a second report', async () => {
    mocks.fns.reportFindUnique.mockResolvedValue(reportRow());
    const result = await createReport(REPORTER, { targetType: 'COMMENT', targetId: 'c1', reason: 'Konten tidak sesuai kebijakan.' });
    expect(result.duplicate).toBe(true);
    expect(mocks.fns.reportCreate).not.toHaveBeenCalled();
  });

  it('reopens a previously resolved report from the same reporter', async () => {
    mocks.fns.reportFindUnique.mockResolvedValue(reportRow({ status: 'RESOLVED', resolution: 'sudah ditinjau' }));
    mocks.fns.reportUpdate.mockResolvedValue(reportRow({ status: 'OPEN', resolution: null }));
    mocks.fns.reportCount.mockResolvedValue(1);

    const result = await createReport(REPORTER, { targetType: 'COMMENT', targetId: 'c1', reason: 'Konten tidak sesuai kebijakan.' });
    expect(result.duplicate).toBe(false);
    expect(mocks.fns.reportUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'OPEN' }) })
    );
  });

  it('auto-flags content once the report threshold is reached', async () => {
    mocks.fns.reportCreate.mockResolvedValue(reportRow());
    mocks.fns.reportCount.mockResolvedValue(5);

    const result = await createReport(REPORTER, { targetType: 'COMMENT', targetId: 'c1', reason: 'Konten tidak sesuai kebijakan.' });
    expect(result.autoFlagged).toBe(true);
    expect(mocks.fns.commentFindUnique).toHaveBeenCalled();
  });

  it('does not auto-flag below the threshold', async () => {
    mocks.fns.reportCreate.mockResolvedValue(reportRow());
    mocks.fns.reportCount.mockResolvedValue(2);
    const result = await createReport(REPORTER, { targetType: 'COMMENT', targetId: 'c1', reason: 'Konten tidak sesuai kebijakan.' });
    expect(result.autoFlagged).toBe(false);
  });

  it('fails closed for anonymous reporters', async () => {
    await expect(createReport(null, { targetType: 'COMMENT', targetId: 'c1', reason: 'alasan panjang' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('rejects reporting removed content', async () => {
    mocks.fns.commentFindUnique.mockResolvedValue({ id: 'c1', authorId: 'u-educator', status: 'REMOVED' });
    await expect(createReport(REPORTER, { targetType: 'COMMENT', targetId: 'c1', reason: 'alasan panjang' })).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});

describe('listReports / resolveReport — moderation only', () => {
  it('listReports requires CONTENT_MANAGE', async () => {
    await expect(listReports(REPORTER)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('resolveReport requires CONTENT_MANAGE', async () => {
    await expect(
      resolveReport(REPORTER, { reportId: 'r1', status: 'RESOLVED', resolution: 'Konten ditinjau.' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('moderator resolves an OPEN report', async () => {
    mocks.fns.reportFindUnique.mockResolvedValue(reportRow());
    mocks.fns.reportUpdate.mockResolvedValue(reportRow({ status: 'RESOLVED', resolution: 'Konten ditinjau.', resolvedById: 'u-moderator', resolvedAt: new Date() }));

    const result = await resolveReport(MODERATOR, { reportId: 'r1', status: 'RESOLVED', resolution: 'Konten ditinjau.' });
    expect(result.status).toBe('RESOLVED');
    expect(result.resolvedById).toBe('u-moderator');
  });

  it('rejects resolving an already closed report', async () => {
    mocks.fns.reportFindUnique.mockResolvedValue(reportRow({ status: 'REJECTED' }));
    await expect(resolveReport(MODERATOR, { reportId: 'r1', status: 'RESOLVED', resolution: 'Konten ditinjau.' })).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('REPORT_ALREADY_CLOSED'),
    });
  });
});
