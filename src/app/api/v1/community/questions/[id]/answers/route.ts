import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import { createAnswer } from '@/lib/community/qa';
import { ServiceError } from '@/lib/community/errors';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const CreateAnswerSchema = z.object({
  body: z.string().min(1).max(10000),
});

export async function POST(request: Request, { params }: RouteContext) {
  const identity = await getServerIdentity();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = CreateAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const answer = await createAnswer(identity, { questionId: id, body: parsed.data.body });
    return NextResponse.json({ success: true, statusCode: 200, data: { answer } });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}
