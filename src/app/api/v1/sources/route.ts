import { NextResponse } from 'next/server';
import { KnowledgeSourceCreateSchema } from '@/lib/validations';
import { createSource } from '@/lib/knowledge/service';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    const body = await request.json();
    const parsed = KnowledgeSourceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for source creation',
          details: parsed.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const result = await createSource(identity, parsed.data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, statusCode: result.statusCode, message: result.message },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      { success: true, statusCode: 201, message: result.message, data: { sourceId: result.data!.sourceId } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error while creating source',
      },
      { status: 500 }
    );
  }
}
