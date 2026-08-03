import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import { getQuestion, updateQuestion, deleteQuestion } from '@/lib/community/qa';
import { ServiceError } from '@/lib/community/errors';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UpdateQuestionSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  body: z.string().min(1).max(10000).optional(),
});

export async function GET(_request: Request, { params }: RouteContext) {
  const identity = await getServerIdentity();
  const { id } = await params;

  try {
    const detail = await getQuestion(identity, id);
    return NextResponse.json({ success: true, statusCode: 200, data: detail });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const identity = await getServerIdentity();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = UpdateQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const question = await updateQuestion(identity, id, parsed.data);
    return NextResponse.json({ success: true, statusCode: 200, data: { question } });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const identity = await getServerIdentity();
  const { id } = await params;

  try {
    const result = await deleteQuestion(identity, id);
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
