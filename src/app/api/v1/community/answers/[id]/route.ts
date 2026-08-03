import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import { updateAnswer, deleteAnswer } from '@/lib/community/qa';
import { ServiceError } from '@/lib/community/errors';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UpdateAnswerSchema = z.object({
  body: z.string().min(1).max(10000),
});

export async function PATCH(request: Request, { params }: RouteContext) {
  const identity = await getServerIdentity();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = UpdateAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const answer = await updateAnswer(identity, id, parsed.data.body);
    return NextResponse.json({ success: true, statusCode: 200, data: { answer } });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const identity = await getServerIdentity();
  const { id } = await params;

  try {
    const result = await deleteAnswer(identity, id);
    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}
