import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CommunityTargetType } from '@prisma/client';
import { getServerIdentity } from '@/lib/auth/session';
import { listComments, createComment } from '@/lib/community/comments';
import { ServiceError } from '@/lib/community/errors';

export const dynamic = 'force-dynamic';

const TARGET_TYPES = z.enum([
  CommunityTargetType.EDUCATOR_PROFILE,
  CommunityTargetType.TOPIC,
  CommunityTargetType.QUESTION,
  CommunityTargetType.ANSWER,
  CommunityTargetType.COMMENT,
]);

const CreateCommentSchema = z.object({
  targetType: TARGET_TYPES,
  targetId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  body: z.string().min(1).max(5000),
  isCorrection: z.boolean().optional(),
  correctionNote: z.string().max(2000).optional(),
});

export async function GET(request: Request) {
  const identity = await getServerIdentity();
  const url = new URL(request.url);
  const targetType = url.searchParams.get('targetType');
  const targetId = url.searchParams.get('targetId');
  const includeModerated = url.searchParams.get('includeModerated') === 'true';

  const parsed = z
    .object({ targetType: TARGET_TYPES, targetId: z.string().uuid() })
    .safeParse({ targetType, targetId });
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid targetType or targetId.' }, { status: 400 });
  }

  try {
    const comments = await listComments(identity, parsed.data.targetType, parsed.data.targetId, { includeModerated });
    return NextResponse.json({ success: true, statusCode: 200, data: { comments } });
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

  const parsed = CreateCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const comment = await createComment(identity, parsed.data);
    return NextResponse.json({ success: true, statusCode: 200, data: { comment } });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}
