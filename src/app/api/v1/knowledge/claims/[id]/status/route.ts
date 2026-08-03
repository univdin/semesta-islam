import { NextResponse } from 'next/server';
import { KnowledgeClaimStatusSchema } from '@/lib/validations';
import { updateClaimStatus } from '@/lib/knowledge/service';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const validationResult = KnowledgeClaimStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for claim status payload',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const result = await updateClaimStatus(identity, {
      claimId: id,
      targetStatus: validationResult.data.status,
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
        claimId: result.data!.claimId,
        previousStatus: result.data!.previousStatus,
        newStatus: result.data!.newStatus,
        verifierUserId: identity.userId,
        auditLogged: true,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error while updating knowledge claim status',
      },
      { status: 500 }
    );
  }
}
