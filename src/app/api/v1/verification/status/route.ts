import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getVerificationStatus } from '@/lib/verification/service';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import type { AuthIdentity } from '@/lib/auth/session';

const QuerySchema = z.object({
  educatorId: z.string().uuid('Invalid Educator UUID'),
});

async function isOwnEducator(identity: AuthIdentity, educatorId: string): Promise<boolean> {
  const educator = await prisma.educatorProfile.findUnique({
    where: { id: educatorId },
    select: { userId: true },
  });
  if (!educator) return false;
  return educator.userId === identity.userId;
}

export async function GET(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = QuerySchema.safeParse({ educatorId: searchParams.get('educatorId') });

    if (!query.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for verification status query',
          details: query.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // SEC-01: No arbitrary user lookup. Only the owning educator (SELF) or an
    // authorized verifier (VERIFICATION_VIEW — Lajnah/Founder) may read the
    // full status, which contains sensitive document metadata.
    const ownsEducator = await isOwnEducator(identity, query.data.educatorId);
    if (!ownsEducator) {
      try {
        await requirePermission({
          actor: identity,
          capability: CAPABILITIES.VERIFICATION_VIEW,
        });
      } catch {
        return NextResponse.json(
          {
            success: false,
            statusCode: 403,
            message: 'Forbidden: you are not authorized to view this verification status.',
          },
          { status: 403 }
        );
      }
    }

    const status = await getVerificationStatus(query.data.educatorId);

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: 'No verification request found for this educator',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: 'Verification status retrieved successfully',
      data: status,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error while retrieving verification status',
      },
      { status: 500 }
    );
  }
}
