/**
 * SEMESTA ISLAM — Knowledge Domain Service (Slice A)
 * Claim / Source / Evidence provenance + deterministic profile completeness.
 * Governed by docs/audit/SEMESTA_ISLAM_HELICOPTER_VIEW.md §17 (Slice A).
 *
 * Rules
 * 1. Identity is always resolved server-side (DECISION-07).
 * 2. Claims are NOT authoritative until VERIFIED by Lajnah / founder.
 * 3. Only VERIFIED claims are exposed on public surfaces.
 * 4. Profile completeness is a deterministic projection of existing rows —
 *    never a stored value and never gamified arbitrarily.
 */

import { prisma } from '@/lib/db';
import { can, authorize } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import type { AuthIdentity } from '@/lib/auth/session';
import type { ClaimPredicate, ClaimStatus } from '@prisma/client';

export interface ServiceResult<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

// ---------------------------------------------------------------------------
// Claim lifecycle (pure, exported for tests)
// ---------------------------------------------------------------------------

export const VALID_CLAIM_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  DRAFT: ['UNVERIFIED'],
  UNVERIFIED: ['VERIFIED'],
  VERIFIED: ['REJECTED', 'UNVERIFIED'], // REJECTED on re-review; UNVERIFIED on un-verify
  REJECTED: ['UNVERIFIED', 'VERIFIED'], // resubmit after revision
};

export function isValidClaimTransition(
  currentStatus: ClaimStatus,
  targetStatus: ClaimStatus
): boolean {
  const allowed = VALID_CLAIM_TRANSITIONS[currentStatus] ?? [];
  return allowed.includes(targetStatus);
}

export function isVerifier(identity: AuthIdentity): boolean {
  return (
    identity.roles.includes('LAJNAH_VERIFIER') || identity.roles.includes('FOUNDER_ADMIN')
  );
}

// ---------------------------------------------------------------------------
// Profile completeness (deterministic 0-100)
// ---------------------------------------------------------------------------

export interface CompletenessItem {
  key: string;
  label: string;
  met: boolean;
  weight: number;
}

export interface ProfileCompleteness {
  score: number;
  items: CompletenessItem[];
}

const COMPLETENESS_CHECKLIST: Array<{ key: string; label: string; weight: number }> = [
  { key: 'identity', label: 'Identitas (nama lengkap)', weight: 10 },
  { key: 'photo', label: 'Foto profil', weight: 10 },
  { key: 'biography', label: 'Biografi', weight: 10 },
  { key: 'location', label: 'Lokasi', weight: 5 },
  { key: 'title', label: 'Gelar / sandang', weight: 5 },
  { key: 'expertise', label: 'Keahlian / bidang', weight: 10 },
  { key: 'teachingProgram', label: 'Program belajar', weight: 10 },
  { key: 'verificationSubmitted', label: 'Pengajuan verifikasi Lajnah', weight: 15 },
  { key: 'verificationVerified', label: 'Verifikasi Lajnah disetujui', weight: 5 },
  { key: 'sanad', label: 'Sanad keilmuan', weight: 10 },
  { key: 'credentials', label: 'Kredensial', weight: 10 },
];

export async function getProfileCompleteness(educatorId: string): Promise<ProfileCompleteness | null> {
  const educator = await prisma.educatorProfile.findUnique({
    where: { id: educatorId },
    select: {
      id: true,
      titleSuffix: true,
      verifiedStatus: true,
      user: {
        select: {
          profile: { select: { fullName: true, avatarUrl: true, bio: true, locationCity: true } },
        },
      },
      _count: {
        select: {
          courses: true,
          sanadRecords: true,
          badges: true,
          knowledgeClaims: { where: { predicate: 'SPECIALIZES_IN' } },
        },
      },
      verifications: { select: { status: true }, orderBy: { updatedAt: 'desc' }, take: 1 },
    },
  });

  if (!educator) return null;

  const profile = educator.user.profile;
  const hasVerificationSubmitted =
    educator.verifications[0]?.status === 'SUBMITTED' ||
    educator.verifications[0]?.status === 'UNDER_REVIEW_LAJNAH';
  const hasVerificationVerified = educator.verifications[0]?.status === 'VERIFIED';

  const metMap: Record<string, boolean> = {
    identity: Boolean(profile?.fullName),
    photo: Boolean(profile?.avatarUrl),
    biography: Boolean(profile?.bio),
    location: Boolean(profile?.locationCity),
    title: Boolean(educator.titleSuffix),
    expertise:
      educator._count.courses > 0 || educator._count.knowledgeClaims > 0,
    teachingProgram: educator._count.courses > 0,
    verificationSubmitted: hasVerificationSubmitted || hasVerificationVerified,
    verificationVerified: hasVerificationVerified,
    sanad: educator._count.sanadRecords > 0,
    credentials: educator._count.badges > 0,
  };

  const items: CompletenessItem[] = COMPLETENESS_CHECKLIST.map(({ key, label, weight }) => ({
    key,
    label,
    met: metMap[key] ?? false,
    weight,
  }));

  const score = items.reduce((sum, item) => sum + (item.met ? item.weight : 0), 0);

  return { score, items };
}

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

export interface KnowledgeClaimSummary {
  id: string;
  predicate: ClaimPredicate;
  objectText: string;
  objectType: string | null;
  status: ClaimStatus;
  confidence: number | null;
  source: { id: string; title: string; url: string | null; publisher: string | null } | null;
  evidenceUrl: string | null;
  verifiedByName: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
}

export interface KnowledgeOverview {
  totalClaims: number;
  verifiedClaims: number;
  evidenceCount: number;
}

async function toClaimSummary(claim: {
  id: string;
  predicate: ClaimPredicate;
  objectText: string;
  objectType: string | null;
  status: ClaimStatus;
  confidence: number | null;
  source: { id: string; title: string; url: string | null; publisher: string | null } | null;
  evidence: { url: string } | null;
  verifiedBy: { profile: { fullName: string | null } | null; email: string } | null;
  verifiedAt: Date | null;
  createdAt: Date;
}): Promise<KnowledgeClaimSummary> {
  return {
    id: claim.id,
    predicate: claim.predicate,
    objectText: claim.objectText,
    objectType: claim.objectType,
    status: claim.status,
    confidence: claim.confidence,
    source: claim.source,
    evidenceUrl: claim.evidence?.url ?? null,
    verifiedByName: claim.verifiedBy?.profile?.fullName ?? claim.verifiedBy?.email ?? null,
    verifiedAt: claim.verifiedAt,
    createdAt: claim.createdAt,
  };
}

/** Public-safe claim listing. Only VERIFIED claims are exposed on public surfaces. */
export async function listClaimsForEducator(
  educatorId: string,
  options: { onlyVerified?: boolean } = {}
): Promise<KnowledgeClaimSummary[]> {
  const claims = await prisma.knowledgeClaim.findMany({
    where: {
      educatorId,
      ...(options.onlyVerified ? { status: 'VERIFIED' } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      source: { select: { id: true, title: true, url: true, publisher: true } },
      evidence: { select: { url: true } },
      verifiedBy: { select: { email: true, profile: { select: { fullName: true } } } },
    },
  });

  return Promise.all(claims.map(toClaimSummary));
}

export async function getKnowledgeOverview(educatorId: string): Promise<KnowledgeOverview> {
  const counts = await prisma.knowledgeClaim.groupBy({
    by: ['status'],
    where: { educatorId },
    _count: { _all: true },
  });

  const byStatus: Partial<Record<ClaimStatus, number>> = {};
  for (const row of counts) {
    byStatus[row.status] = row._count._all;
  }

  const verifiedClaims = byStatus.VERIFIED ?? 0;

  return {
    totalClaims: counts.reduce((sum, row) => sum + row._count._all, 0),
    verifiedClaims,
    evidenceCount: verifiedClaims,
  };
}

export interface CreateClaimInput {
  educatorId: string;
  predicate: ClaimPredicate;
  objectText: string;
  objectType?: string;
  status?: ClaimStatus;
  sourceId?: string;
  evidenceId?: string;
  confidence?: number;
}

/**
 * Create a knowledge claim. The owning educator may self-declare (status stays
 * UNVERIFIED). Lajnah / founder (VERIFICATION_MANAGE) may set status directly.
 */
export interface CreateSourceInput {
  title: string;
  url?: string;
  publisher?: string;
  publishedAt?: string;
}

/**
 * Source provenance creation. VERIFICATION_MANAGE (Lajnah/Founder) only:
 * sources are attestations, not user-generated content. Audit logged.
 */
export async function createSource(
  actor: AuthIdentity,
  input: CreateSourceInput
): Promise<ServiceResult<{ sourceId: string }>> {
  const allowed = await can({ actor, capability: CAPABILITIES.VERIFICATION_MANAGE });
  if (!allowed) {
    return {
      success: false,
      statusCode: 403,
      message: 'Forbidden: only holders of verification.manage can create knowledge sources.',
    };
  }

  const source = await prisma.$transaction(async (tx) => {
    const created = await tx.source.create({
      data: {
        title: input.title,
        url: input.url ?? null,
        publisher: input.publisher ?? null,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actor.userId,
        actionType: 'SOURCE_CREATED',
        entityAffected: 'sources',
        metadata: { entityId: created.id, title: created.title },
      },
    });

    return created;
  });

  return {
    success: true,
    statusCode: 201,
    message: 'Knowledge source created',
    data: { sourceId: source.id },
  };
}

export interface CreateEvidenceInput {
  sourceId?: string;
  url: string;
  sha256?: string;
  description?: string;
}

/**
 * Evidence provenance creation. VERIFICATION_MANAGE only: evidence backs
 * verified claims and must be governed. Audit logged.
 */
export async function createEvidence(
  actor: AuthIdentity,
  input: CreateEvidenceInput
): Promise<ServiceResult<{ evidenceId: string }>> {
  const allowed = await can({ actor, capability: CAPABILITIES.VERIFICATION_MANAGE });
  if (!allowed) {
    return {
      success: false,
      statusCode: 403,
      message: 'Forbidden: only holders of verification.manage can create evidence.',
    };
  }

  const evidence = await prisma.$transaction(async (tx) => {
    const created = await tx.evidence.create({
      data: {
        sourceId: input.sourceId ?? null,
        url: input.url,
        sha256: input.sha256 ?? null,
        description: input.description ?? null,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actor.userId,
        actionType: 'EVIDENCE_CREATED',
        entityAffected: 'evidences',
        metadata: { entityId: created.id, url: created.url },
      },
    });

    return created;
  });

  return {
    success: true,
    statusCode: 201,
    message: 'Knowledge evidence created',
    data: { evidenceId: evidence.id },
  };
}

export async function createClaim(
  actor: AuthIdentity,
  input: CreateClaimInput
): Promise<ServiceResult<{ claimId: string; status: ClaimStatus }>> {
  const educator = await prisma.educatorProfile.findUnique({
    where: { id: input.educatorId },
    select: { id: true, userId: true },
  });

  if (!educator) {
    return { success: false, statusCode: 404, message: 'Educator not found' };
  }

  const isOwner = educator.userId === actor.userId;
  const manageAuth = await can({ actor, capability: CAPABILITIES.VERIFICATION_MANAGE });

  if (!isOwner && !manageAuth) {
    return {
      success: false,
      statusCode: 403,
      message: 'Forbidden: you must own the educator profile or hold verification.manage.',
    };
  }

  let status: ClaimStatus = 'UNVERIFIED';
  if (manageAuth) {
    status = input.status ?? 'UNVERIFIED';
    if (!['DRAFT', 'UNVERIFIED', 'VERIFIED'].includes(status)) {
      status = 'UNVERIFIED';
    }
  }

  const claim = await prisma.$transaction(async (tx) => {
    const created = await tx.knowledgeClaim.create({
      data: {
        educatorId: input.educatorId,
        predicate: input.predicate,
        objectText: input.objectText,
        objectType: input.objectType ?? null,
        status,
        confidence: input.confidence ?? null,
        sourceId: input.sourceId ?? null,
        evidenceId: input.evidenceId ?? null,
        verifiedById: status === 'VERIFIED' ? actor.userId : null,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actor.userId,
        actionType: 'KNOWLEDGE_CLAIM_CREATED',
        entityAffected: 'knowledge_claims',
        metadata: {
          entityId: created.id,
          educatorId: input.educatorId,
          predicate: input.predicate,
          status,
          objectText: input.objectText,
        },
      },
    });

    return created;
  });

  return {
    success: true,
    statusCode: 201,
    message: 'Knowledge claim created',
    data: { claimId: claim.id, status: claim.status },
  };
}

export interface UpdateClaimStatusInput {
  claimId: string;
  targetStatus: ClaimStatus;
}

/**
 * Verifier-only claim status transition. VERIFIED sets verifier provenance;
 * any other terminal-ish state clears it.
 */
export async function updateClaimStatus(
  actor: AuthIdentity,
  input: UpdateClaimStatusInput
): Promise<ServiceResult<{ claimId: string; previousStatus: ClaimStatus; newStatus: ClaimStatus }>> {
  if (!isVerifier(actor)) {
    return {
      success: false,
      statusCode: 403,
      message: 'Forbidden: only LAJNAH_VERIFIER or FOUNDER_ADMIN can change claim status.',
    };
  }

  const claim = await prisma.knowledgeClaim.findUnique({
    where: { id: input.claimId },
  });

  if (!claim) {
    return { success: false, statusCode: 404, message: 'Knowledge claim not found' };
  }

  if (!isValidClaimTransition(claim.status, input.targetStatus)) {
    return {
      success: false,
      statusCode: 409,
      message: `Conflict: invalid claim status transition from ${claim.status} to ${input.targetStatus}.`,
    };
  }

  const now = new Date();
  const isVerified = input.targetStatus === 'VERIFIED';

  await prisma.$transaction(async (tx) => {
    await tx.knowledgeClaim.update({
      where: { id: input.claimId },
      data: {
        status: input.targetStatus,
        verifiedById: isVerified ? actor.userId : null,
        verifiedAt: isVerified ? now : null,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: actor.userId,
        actionType: 'KNOWLEDGE_CLAIM_STATUS_CHANGED',
        entityAffected: 'knowledge_claims',
        metadata: {
          entityId: input.claimId,
          previousStatus: claim.status,
          newStatus: input.targetStatus,
        },
      },
    });
  });

  return {
    success: true,
    statusCode: 200,
    message: `Knowledge claim ${input.claimId} transitioned from ${claim.status} to ${input.targetStatus}`,
    data: { claimId: input.claimId, previousStatus: claim.status, newStatus: input.targetStatus },
  };
}

// Re-export authorize for parity with other service layers (unused directly).
export { authorize };
