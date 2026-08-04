import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifySanadRecord } from '@/lib/verification/service';
import { forbiddenIdentity, getServerIdentity, hasRole, unauthorizedIdentity } from '@/lib/auth/session';

const SanadVerifySchema = z.object({
  verified: z.boolean(),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }
    if (!hasRole(identity, 'LAJNAH_VERIFIER', 'FOUNDER_ADMIN')) {
      return NextResponse.json(forbiddenIdentity(), { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = SanadVerifySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for sanad verification payload',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const result = await verifySanadRecord({
      sanadRecordId: id,
      verifierUserId: identity.userId,
      verifierRoles: identity.roles,
      verified: data.verified,
      note: data.note,
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
        sanadRecordId: result.data!.sanadRecordId,
        verifiedByLajnah: result.data!.verifiedByLajnah,
        sanadVerifiedBadge: result.data!.sanadVerifiedBadge,
        verifiedByUserId: identity.userId,
        auditLogged: true,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error during sanad verification',
      },
      { status: 500 }
    );
  }
}
