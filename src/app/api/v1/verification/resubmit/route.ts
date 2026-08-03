import { NextResponse } from 'next/server';
import { VerificationSubmitSchema } from '@/lib/validations';
import { resubmitVerificationRequest } from '@/lib/verification/service';
import { VerificationStatus } from '@/types';
import { forbiddenIdentity, getServerIdentity, hasRole, unauthorizedIdentity } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }
    if (!hasRole(identity, 'EDUCATOR')) {
      return NextResponse.json(forbiddenIdentity(), { status: 403 });
    }

    const body = await request.json();
    const { verificationRequestId, currentStatus, ...submitData } = body;

    if (!verificationRequestId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for resubmission payload',
          details: [{ field: 'verificationRequestId', issue: 'Verification Request ID required' }],
        },
        { status: 400 }
      );
    }

    const validationResult = VerificationSubmitSchema.safeParse(submitData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for resubmission payload',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const result = await resubmitVerificationRequest({
      verificationRequestId,
      currentStatus: (currentStatus || 'REJECTED') as VerificationStatus,
      actorUserId: identity.userId,
      submit: data,
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
        status: result.data!.status,
        ijazahSha256Hash: data.ijazahSha256Hash,
        resubmittedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error during verification resubmission',
      },
      { status: 500 }
    );
  }
}
