import { NextResponse } from 'next/server';
import { VerificationSubmitSchema } from '@/lib/validations';
import { isValidSha256 } from '@/lib/security/documents';
import { prisma } from '@/lib/db';
import { submitVerificationRequest } from '@/lib/verification/service';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import type { AuthIdentity } from '@/lib/auth/session';

async function ownsEducator(identity: AuthIdentity, educatorId: string): Promise<boolean> {
  const educator = await prisma.educatorProfile.findUnique({
    where: { id: educatorId },
    select: { userId: true },
  });
  if (!educator) return false;
  return educator.userId === identity.userId;
}

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    const body = await request.json();
    const validationResult = VerificationSubmitSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for verification submission payload',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Security check: Validate SHA-256 hash format
    if (!isValidSha256(data.ijazahSha256Hash)) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Invalid SHA-256 document fingerprint format',
        },
        { status: 400 }
      );
    }

    // SEC-02: No submitting verification for an arbitrary educator. Only the
    // owning educator (SELF) or an authorized verifier (VERIFICATION_MANAGE)
    // may create a verification request.
    const canSubmit = await ownsEducator(identity, data.educatorId);
    if (!canSubmit) {
      try {
        await requirePermission({
          actor: identity,
          capability: CAPABILITIES.VERIFICATION_MANAGE,
        });
      } catch {
        return NextResponse.json(
          {
            success: false,
            statusCode: 403,
            message: 'Forbidden: you cannot submit a verification request for this educator.',
          },
          { status: 403 }
        );
      }
    }

    const result = await submitVerificationRequest(data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, statusCode: result.statusCode, message: result.message },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        statusCode: 201,
        message: result.message,
        data: {
          verificationRequestId: result.data!.verificationRequestId,
          educatorId: data.educatorId,
          status: result.data!.status,
          ijazahSha256Hash: data.ijazahSha256Hash,
          recommenderEmail: data.recommenderEmail,
          auditLogged: true,
          submittedAt: result.data!.submittedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error during verification submission',
      },
      { status: 500 }
    );
  }
}
