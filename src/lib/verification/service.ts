/**
 * SEMESTA ISLAM — Verification Service (DB-backed)
 * Governed by docs/03_ERD.md §3.3 & docs/05_MASTER_CONTEXT.md §35-§40
 * Reuses the pure state machine from ./stateMachine.ts.
 */

import { prisma } from '@/lib/db';
import {
  isValidVerificationTransition,
  isAuthorizedVerifierRole,
} from '@/lib/verification/stateMachine';
import { VerificationStatus, UserRole } from '@/types';
import { createNotification } from '@/lib/notifications/service';

export interface ServiceResult<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

export interface SubmitVerificationInput {
  educatorId: string;
  ktpNumber: string;
  ktpDocumentUrl: string;
  ijazahDocumentUrl: string;
  ijazahSha256Hash: string;
  recommenderEmail: string;
  recommenderInstitution: string;
  qiraahSanadName?: string;
}

export async function submitVerificationRequest(
  input: SubmitVerificationInput
): Promise<ServiceResult<{ verificationRequestId: string; status: VerificationStatus; submittedAt: string }>> {
  const educator = await prisma.educatorProfile.findUnique({
    where: { id: input.educatorId },
    select: { id: true, userId: true },
  });

  if (!educator) {
    return { success: false, statusCode: 404, message: 'Educator not found' };
  }

  const activeRequest = await prisma.verificationRequest.findFirst({
    where: {
      educatorId: input.educatorId,
      status: { in: ['SUBMITTED', 'UNDER_REVIEW_LAJNAH'] },
    },
    select: { id: true },
  });

  if (activeRequest) {
    return {
      success: false,
      statusCode: 409,
      message: 'Conflict: An active verification request already exists for this educator',
    };
  }

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.verificationRequest.create({
      data: {
        educatorId: input.educatorId,
        status: 'SUBMITTED',
        layer1KtpUrl: input.ktpDocumentUrl,
        layer2IjazahUrl: input.ijazahDocumentUrl,
        layer2Sha256Hash: input.ijazahSha256Hash,
        layer3RecommenderEmail: input.recommenderEmail,
        reviewNotes: null,
      },
    });

    await tx.educatorProfile.update({
      where: { id: input.educatorId },
      data: { verifiedStatus: 'SUBMITTED' },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: educator.userId,
        actionType: 'VERIFICATION_SUBMITTED',
        entityAffected: 'verification_requests',
        metadata: {
          entityId: created.id,
          newStatus: 'SUBMITTED',
          ktpNumber: input.ktpNumber,
          recommenderInstitution: input.recommenderInstitution,
          qiraahSanadName: input.qiraahSanadName ?? null,
          layer2Sha256Hash: input.ijazahSha256Hash,
        },
      },
    });

    return created;
  });

  return {
    success: true,
    statusCode: 201,
    message: 'Verification request submitted successfully to Lajnah review queue',
    data: { verificationRequestId: request.id, status: request.status, submittedAt: request.createdAt.toISOString() },
  };
}

export interface ReviewVerificationInput {
  verificationRequestId: string;
  verifierUserId: string;
  verifierRoles: UserRole[];
  currentStatus: VerificationStatus;
  targetStatus: VerificationStatus;
  reviewNotes: string;
  ethicsScore: number;
}

export async function reviewVerificationRequest(
  input: ReviewVerificationInput
): Promise<ServiceResult<{ verificationRequestId: string; previousStatus: VerificationStatus; newStatus: VerificationStatus }>> {
  if (!isAuthorizedVerifierRole(input.verifierRoles)) {
    return {
      success: false,
      statusCode: 403,
      message: 'Forbidden: Insufficient privileges. Only LAJNAH_VERIFIER or FOUNDER_ADMIN can evaluate verification requests.',
    };
  }

  if (!isValidVerificationTransition(input.currentStatus, input.targetStatus)) {
    return {
      success: false,
      statusCode: 409,
      message: `Conflict: Invalid verification status transition from ${input.currentStatus} to ${input.targetStatus}.`,
    };
  }

  const request = await prisma.verificationRequest.findUnique({
    where: { id: input.verificationRequestId },
    include: { educator: { select: { userId: true } } },
  });

  if (!request) {
    return { success: false, statusCode: 404, message: 'Verification request not found' };
  }

  if (request.status !== input.currentStatus) {
    return {
      success: false,
      statusCode: 409,
      message: `Conflict: Verification request is in status ${request.status}, not ${input.currentStatus}`,
    };
  }

  await prisma.$transaction(async (tx) => {
    const isVerified = input.targetStatus === 'VERIFIED';
    await tx.verificationRequest.update({
      where: { id: input.verificationRequestId },
      data: {
        status: input.targetStatus,
        reviewNotes: input.reviewNotes,
        layer4EthicsScore: input.ethicsScore,
        verifiedById: isVerified ? input.verifierUserId : null,
        verifiedAt: isVerified ? new Date() : null,
      },
    });

    await tx.educatorProfile.update({
      where: { id: request.educatorId },
      data: { verifiedStatus: input.targetStatus },
    });

    // Issued badges (only on VERIFIED): Lajnah + Sanad verification.
    if (isVerified) {
      await tx.credentialBadge.createMany({
        data: [
          { educatorId: request.educatorId, badgeType: 'LAJNAH_VERIFIED' },
          { educatorId: request.educatorId, badgeType: 'SANAD_VERIFIED' },
        ],
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: input.verifierUserId,
        actionType: 'VERIFICATION_REVIEWED',
        entityAffected: 'verification_requests',
        metadata: {
          entityId: input.verificationRequestId,
          previousStatus: input.currentStatus,
          newStatus: input.targetStatus,
          reviewNotes: input.reviewNotes,
          ethicsScore: input.ethicsScore,
          verifierRoles: input.verifierRoles,
        },
      },
    });

    // Persistent in-app notification to the owning educator.
    const isRejected = input.targetStatus === 'REJECTED';
    await createNotification(
      {
        userId: request.educator.userId,
        type: isRejected ? 'VERIFICATION_REJECTED' : 'VERIFICATION_REVIEWED',
        title: isVerified
          ? 'Verifikasi Disetujui'
          : isRejected
            ? 'Verifikasi Ditolak'
            : 'Status Verifikasi Diperbarui',
        body: isVerified
          ? 'Selamat, profil Anda telah diverifikasi Lajnah dan kini tampil di direktori publik.'
          : isRejected
            ? 'Verifikasi Anda ditolak. Tinjau catatan Lajnah dan ajukan ulang saat siap.'
            : `Status verifikasi Anda kini ${input.targetStatus}.`,
        metadata: {
          verificationRequestId: input.verificationRequestId,
          newStatus: input.targetStatus,
          reviewNotes: input.reviewNotes ?? null,
        },
      },
      tx
    );
  });

  return {
    success: true,
    statusCode: 200,
    message: `Verification request ${input.verificationRequestId} successfully transitioned from ${input.currentStatus} to ${input.targetStatus}`,
    data: {
      verificationRequestId: input.verificationRequestId,
      previousStatus: input.currentStatus,
      newStatus: input.targetStatus,
    },
  };
}

export interface ResubmitVerificationInput {
  verificationRequestId: string;
  currentStatus: VerificationStatus;
  actorUserId: string;
  submit: SubmitVerificationInput;
}

export async function resubmitVerificationRequest(
  input: ResubmitVerificationInput
): Promise<ServiceResult<{ verificationRequestId: string; status: VerificationStatus }>> {
  const request = await prisma.verificationRequest.findUnique({
    where: { id: input.verificationRequestId },
    include: { educator: { select: { id: true, userId: true } } },
  });

  if (!request) {
    return { success: false, statusCode: 404, message: 'Verification request not found' };
  }

  if (request.educator.userId !== input.actorUserId) {
    return {
      success: false,
      statusCode: 403,
      message: 'Forbidden: Only the owning educator can resubmit this verification request',
    };
  }

  if (request.status !== input.currentStatus) {
    return {
      success: false,
      statusCode: 409,
      message: `Conflict: Verification request is in status ${request.status}, not ${input.currentStatus}`,
    };
  }

  if (!isValidVerificationTransition(input.currentStatus, 'SUBMITTED')) {
    return {
      success: false,
      statusCode: 409,
      message: `Conflict: Cannot resubmit verification from status ${input.currentStatus}`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationRequest.update({
      where: { id: input.verificationRequestId },
      data: {
        status: 'SUBMITTED',
        layer1KtpUrl: input.submit.ktpDocumentUrl,
        layer2IjazahUrl: input.submit.ijazahDocumentUrl,
        layer2Sha256Hash: input.submit.ijazahSha256Hash,
        layer3RecommenderEmail: input.submit.recommenderEmail,
        reviewNotes: null,
      },
    });

    await tx.educatorProfile.update({
      where: { id: request.educatorId },
      data: { verifiedStatus: 'SUBMITTED' },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: request.educator.userId,
        actionType: 'VERIFICATION_RESUBMITTED',
        entityAffected: 'verification_requests',
        metadata: {
          entityId: input.verificationRequestId,
          previousStatus: input.currentStatus,
          newStatus: 'SUBMITTED',
          layer2Sha256Hash: input.submit.ijazahSha256Hash,
        },
      },
    });
  });

  return {
    success: true,
    statusCode: 200,
    message: 'Verification request resubmitted successfully to Lajnah queue',
    data: { verificationRequestId: input.verificationRequestId, status: 'SUBMITTED' },
  };
}

export interface VerificationQueueItem {
  id: string;
  educatorId: string;
  educatorName: string;
  institution: string;
  status: VerificationStatus;
  layer2Sha256Hash: string | null;
  recommenderEmail: string | null;
  ethicsScore: number;
  reviewNotes: string | null;
  createdAt: string;
}

export async function listVerificationQueue(): Promise<VerificationQueueItem[]> {
  const requests = await prisma.verificationRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      educator: {
        select: {
          id: true,
          institutionName: true,
          user: { select: { profile: { select: { fullName: true } } } },
        },
      },
    },
  });

  return requests.map((r) => ({
    id: r.id,
    educatorId: r.educatorId,
    educatorName: r.educator.user.profile?.fullName ?? r.educatorId,
    institution: r.educator.institutionName ?? '',
    status: r.status,
    layer2Sha256Hash: r.layer2Sha256Hash,
    recommenderEmail: r.layer3RecommenderEmail,
    ethicsScore: r.layer4EthicsScore,
    reviewNotes: r.reviewNotes,
    createdAt: r.createdAt.toISOString(),
  }));
}

export interface VerificationStatusInfo {
  requestId: string;
  educatorId: string;
  status: VerificationStatus;
  layer1KtpUrl: string | null;
  layer2IjazahUrl: string | null;
  layer2Sha256Hash: string | null;
  recommenderEmail: string | null;
  reviewNotes: string | null;
  ethicsScore: number;
  verifiedByName: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getVerificationStatus(
  educatorId: string
): Promise<VerificationStatusInfo | null> {
  const request = await prisma.verificationRequest.findFirst({
    where: { educatorId },
    orderBy: { updatedAt: 'desc' },
    include: {
      verifiedBy: { select: { email: true, profile: { select: { fullName: true } } } },
    },
  });

  if (!request) return null;

  return {
    requestId: request.id,
    educatorId: request.educatorId,
    status: request.status,
    layer1KtpUrl: request.layer1KtpUrl,
    layer2IjazahUrl: request.layer2IjazahUrl,
    layer2Sha256Hash: request.layer2Sha256Hash,
    recommenderEmail: request.layer3RecommenderEmail,
    reviewNotes: request.reviewNotes,
    ethicsScore: request.layer4EthicsScore,
    verifiedByName: request.verifiedBy?.profile?.fullName ?? request.verifiedBy?.email ?? null,
    verifiedAt: request.verifiedAt ? request.verifiedAt.toISOString() : null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}
