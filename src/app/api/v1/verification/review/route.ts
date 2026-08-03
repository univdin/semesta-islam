import { NextResponse } from 'next/server';
import { z } from 'zod';
import { VerificationStatus } from '@/types';
import { reviewVerificationRequest } from '@/lib/verification/service';
import { forbiddenIdentity, getServerIdentity, hasRole, unauthorizedIdentity } from '@/lib/auth/session';

const LajnahReviewSchema = z.object({
  verificationRequestId: z.string().min(1, "Verification Request ID required"),
  currentStatus: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW_LAJNAH', 'VERIFIED', 'REJECTED', 'REVOKED']),
  targetStatus: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW_LAJNAH', 'VERIFIED', 'REJECTED', 'REVOKED']),
  reviewNotes: z.string().min(5, "Review notes must be at least 5 characters"),
  ethicsScore: z.number().min(0).max(100).optional().default(100)
});

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }
    if (!hasRole(identity, 'LAJNAH_VERIFIER', 'FOUNDER_ADMIN')) {
      return NextResponse.json(forbiddenIdentity(), { status: 403 });
    }

    const body = await request.json();
    const validationResult = LajnahReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for Lajnah review payload',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const result = await reviewVerificationRequest({
      verificationRequestId: data.verificationRequestId,
      verifierUserId: identity.userId,
      verifierRoles: identity.roles,
      currentStatus: data.currentStatus as VerificationStatus,
      targetStatus: data.targetStatus as VerificationStatus,
      reviewNotes: data.reviewNotes,
      ethicsScore: data.ethicsScore ?? 100,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, statusCode: result.statusCode, message: result.message },
        { status: result.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: result.message,
      data: {
        verificationRequestId: result.data!.verificationRequestId,
        verifierUserId: identity.userId,
        previousStatus: result.data!.previousStatus,
        newStatus: result.data!.newStatus,
        reviewNotes: data.reviewNotes,
        ethicsScore: data.ethicsScore,
        auditLogged: true,
        reviewedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error during Lajnah verification review',
      },
      { status: 500 }
    );
  }
}
