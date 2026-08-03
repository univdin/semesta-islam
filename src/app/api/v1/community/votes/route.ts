import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CommunityTargetType, VoteType } from '@prisma/client';
import { getServerIdentity } from '@/lib/auth/session';
import { castVote, flipVote, removeVote } from '@/lib/community/votes';
import { ServiceError } from '@/lib/community/errors';

export const dynamic = 'force-dynamic';

const VoteSchema = z.object({
  targetType: z.enum([
    CommunityTargetType.EDUCATOR_PROFILE,
    CommunityTargetType.TOPIC,
    CommunityTargetType.QUESTION,
    CommunityTargetType.ANSWER,
    CommunityTargetType.COMMENT,
  ]),
  targetId: z.string().uuid(),
  voteType: z.enum([VoteType.HELPFUL, VoteType.AGREE, VoteType.ENDORSE]),
  fromType: z.enum([VoteType.HELPFUL, VoteType.AGREE, VoteType.ENDORSE]).optional(),
});

export async function POST(request: Request) {
  const identity = await getServerIdentity();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = VoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const target = { targetType: parsed.data.targetType, targetId: parsed.data.targetId };
    const result =
      parsed.data.fromType && parsed.data.fromType !== parsed.data.voteType
        ? await flipVote(identity, target, parsed.data.fromType, parsed.data.voteType)
        : await castVote(identity, target, parsed.data.voteType);
    return NextResponse.json({ success: true, statusCode: 200, data: result });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}

export async function DELETE(request: Request) {
  const identity = await getServerIdentity();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = VoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const result = await removeVote(identity, {
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
    }, parsed.data.voteType);
    return NextResponse.json({ success: true, statusCode: 200, data: result });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}
