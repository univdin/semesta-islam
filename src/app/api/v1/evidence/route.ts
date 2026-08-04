import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createEvidence } from '@/lib/knowledge/service';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const EvidenceCreateSchema = z.object({
  sourceId: z.string().uuid().optional().nullable(),
  url: z.string().url('Invalid evidence URL').max(1000),
  sha256: z.string().regex(/^[0-9a-f]{64}$/i, 'sha256 must be a 64-char hex digest').optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
});

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    const body = await request.json();
    const parsed = EvidenceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for evidence creation',
          details: parsed.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const result = await createEvidence(identity, {
      sourceId: parsed.data.sourceId ?? undefined,
      url: parsed.data.url,
      sha256: parsed.data.sha256 || undefined,
      description: parsed.data.description || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, statusCode: result.statusCode, message: result.message },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      { success: true, statusCode: 201, message: result.message, data: { evidenceId: result.data!.evidenceId } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error while creating evidence',
      },
      { status: 500 }
    );
  }
}
