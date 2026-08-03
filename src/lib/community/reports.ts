import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';
import { requirePermission } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import type { AuthIdentity } from '@/lib/auth/session';
import type { CommunityTargetType, ReportStatus } from '@prisma/client';
import { ServiceError } from './errors';
import { assertFeatureEnabled, gateWriteAccess, getCommunityFeatureFlags } from './config';
import { assertResolvableTarget, resolveCommunityTarget } from './target';
import { applyTargetModerationState } from './state';

const REASON_MIN_LENGTH = 3;
const REASON_MAX_LENGTH = 500;

export interface ReportSummary {
  id: string;
  reporterId: string;
  targetType: CommunityTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  resolution: string | null;
  resolvedById: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportInput {
  targetType: CommunityTargetType;
  targetId: string;
  reason: string;
}

export interface CreateReportResult {
  reportId: string;
  duplicate: boolean;
  autoFlagged: boolean;
}

export async function createReport(
  actor: AuthIdentity | null,
  input: CreateReportInput
): Promise<CreateReportResult> {
  const identity = await gateWriteAccess(actor);
  const flags = await getCommunityFeatureFlags();
  assertFeatureEnabled(flags.reportsEnabled, 'reports');

  const reason = input.reason.trim();
  if (reason.length < REASON_MIN_LENGTH || reason.length > REASON_MAX_LENGTH) {
    throw new ServiceError(
      400,
      `REPORT_REASON_INVALID: Reason must be between ${REASON_MIN_LENGTH} and ${REASON_MAX_LENGTH} characters.`
    );
  }

  const target = await resolveCommunityTarget(input.targetType, input.targetId);
  assertResolvableTarget(target);
  if (target.removed) {
    throw new ServiceError(409, 'COMMUNITY_TARGET_REMOVED: Cannot report removed content.');
  }

  const existing = await prisma.communityReport.findUnique({
    where: {
      reporterId_targetType_targetId: {
        reporterId: identity.userId,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    },
  });

  let reportId: string;
  const duplicate = false;

  if (existing) {
    if (existing.status === 'OPEN' || existing.status === 'UNDER_REVIEW') {
      return { reportId: existing.id, duplicate: true, autoFlagged: false };
    }
    await prisma.communityReport.update({
      where: { id: existing.id },
      data: {
        reason,
        status: 'OPEN',
        resolution: null,
        resolvedById: null,
        resolvedAt: null,
      },
    });
    reportId = existing.id;
  } else {
    const created = await prisma.communityReport.create({
      data: {
        reporterId: identity.userId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason,
        status: 'OPEN',
      },
    });
    reportId = created.id;
  }

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'COMMUNITY_CONTENT_REPORTED',
    entityAffected: 'community_reports',
    entityId: reportId,
    metadata: { targetType: input.targetType, targetId: input.targetId, reason },
  });

  const openCount = await prisma.communityReport.count({
    where: { targetType: input.targetType, targetId: input.targetId, status: 'OPEN' },
  });

  let autoFlagged = false;
  if (target.visible && openCount >= flags.reportThreshold) {
    await applyTargetModerationState(
      input.targetType,
      input.targetId,
      'REPORTED',
      identity.userId
    );
    autoFlagged = true;
  }

  return { reportId, duplicate, autoFlagged };
}

export interface ListReportsOptions {
  status?: ReportStatus;
}

export async function listReports(
  actor: AuthIdentity,
  options: ListReportsOptions = {}
): Promise<ReportSummary[]> {
  await requirePermission({ actor, capability: CAPABILITIES.CONTENT_MANAGE });
  const rows = await prisma.communityReport.findMany({
    where: options.status ? { status: options.status } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return rows.map((r) => ({
    id: r.id,
    reporterId: r.reporterId,
    targetType: r.targetType,
    targetId: r.targetId,
    reason: r.reason,
    status: r.status,
    resolution: r.resolution,
    resolvedById: r.resolvedById,
    resolvedAt: r.resolvedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export interface ResolveReportInput {
  reportId: string;
  status: Extract<ReportStatus, 'RESOLVED' | 'REJECTED'>;
  resolution: string;
}

export async function resolveReport(
  actor: AuthIdentity,
  input: ResolveReportInput
): Promise<ReportSummary> {
  await requirePermission({ actor, capability: CAPABILITIES.CONTENT_MANAGE });

  const report = await prisma.communityReport.findUnique({ where: { id: input.reportId } });
  if (!report) {
    throw new ServiceError(404, 'REPORT_NOT_FOUND: Report does not exist.');
  }
  if (report.status === 'RESOLVED' || report.status === 'REJECTED') {
    throw new ServiceError(409, 'REPORT_ALREADY_CLOSED: Report is already resolved or rejected.');
  }

  const resolution = input.resolution.trim();
  if (resolution.length < 3 || resolution.length > 1000) {
    throw new ServiceError(400, 'REPORT_RESOLUTION_INVALID: Resolution must be between 3 and 1000 characters.');
  }

  const updated = await prisma.communityReport.update({
    where: { id: input.reportId },
    data: {
      status: input.status,
      resolution,
      resolvedById: actor.userId,
      resolvedAt: new Date(),
    },
  });

  await persistAuditEvent({
    actorUserId: actor.userId,
    actionType: `COMMUNITY_REPORT_${input.status}`,
    entityAffected: 'community_reports',
    entityId: report.id,
    metadata: { previousStatus: report.status, resolution },
  });

  return {
    id: updated.id,
    reporterId: updated.reporterId,
    targetType: updated.targetType,
    targetId: updated.targetId,
    reason: updated.reason,
    status: updated.status,
    resolution: updated.resolution,
    resolvedById: updated.resolvedById,
    resolvedAt: updated.resolvedAt,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}
