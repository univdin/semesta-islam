import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isTrustedEducator } from '@/lib/auth/production';
import {
  getKnowledgeOverview,
  listClaimsForEducator,
} from '@/lib/knowledge/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(id)) {
      return NextResponse.json(
        { success: false, statusCode: 400, message: 'Invalid educator UUID' },
        { status: 400 }
      );
    }

    const educator = await prisma.educatorProfile.findUnique({
      where: { id },
      select: { id: true, user: { select: { email: true } } },
    });

    if (!educator) {
      return NextResponse.json(
        { success: false, statusCode: 404, message: 'Educator not found' },
        { status: 404 }
      );
    }

    // Public trust boundary: demo identities must not surface as real
    // knowledge entities in production.
    if (!isTrustedEducator(educator)) {
      return NextResponse.json(
        { success: false, statusCode: 404, message: 'Educator not found' },
        { status: 404 }
      );
    }

    const [overview, verifiedClaims] = await Promise.all([
      getKnowledgeOverview(id),
      listClaimsForEducator(id, { onlyVerified: true }),
    ]);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: 'Educator knowledge retrieved successfully',
      data: { educatorId: id, overview, claims: verifiedClaims },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error while retrieving educator knowledge',
      },
      { status: 500 }
    );
  }
}
