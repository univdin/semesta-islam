import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import { listQuestions, createQuestion } from '@/lib/community/qa';
import { ServiceError } from '@/lib/community/errors';

export const dynamic = 'force-dynamic';

const CreateQuestionSchema = z.object({
  topicId: z.string().uuid().optional(),
  educatorId: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
});

export async function GET(request: Request) {
  const identity = await getServerIdentity();
  const url = new URL(request.url);
  const topicId = url.searchParams.get('topicId');
  const educatorId = url.searchParams.get('educatorId');
  const authorId = url.searchParams.get('authorId');

  try {
    const questions = await listQuestions(identity, {
      ...(topicId ? { topicId } : {}),
      ...(educatorId ? { educatorId } : {}),
      ...(authorId ? { authorId } : {}),
    });
    return NextResponse.json({ success: true, statusCode: 200, data: { questions } });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}

export async function POST(request: Request) {
  const identity = await getServerIdentity();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = CreateQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const question = await createQuestion(identity, parsed.data);
    return NextResponse.json({ success: true, statusCode: 200, data: { question } });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}
