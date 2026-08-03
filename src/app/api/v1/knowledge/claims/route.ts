import { NextResponse } from 'next/server';
import { KnowledgeClaimCreateSchema } from '@/lib/validations';
import { createClaim } from '@/lib/knowledge/service';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    const body = await request.json();
    const validationResult = KnowledgeClaimCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for knowledge claim payload',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const result = await createClaim(identity, {
      educatorId: data.educatorId,
      predicate: data.predicate,
      objectText: data.objectText,
      objectType: data.objectType,
      status: data.status,
      sourceId: data.sourceId,
      evidenceId: data.evidenceId,
      confidence: data.confidence,
    });

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
        data: { claimId: result.data!.claimId, status: result.data!.status },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error while creating knowledge claim',
      },
      { status: 500 }
    );
  }
}
