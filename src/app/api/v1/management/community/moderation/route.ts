import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CommunityTargetType, ModerationStatus } from '@prisma/client';
import { getServerIdentity } from '@/lib/auth/session';
import { listModerationQueue, moderateTarget } from '@/lib/community/moderation';
import { ServiceError } from '@/lib/community/errors';

export const dynamic = 'force-dynamic';

const ModerateSchema = z.object({
  targetType: z.enum([
    CommunityTargetType.QUESTION,
    CommunityTargetType.ANSWER,
    CommunityTargetType.COMMENT,
  ]),
  targetId: z.string().uuid(),
  status: z.enum([
    ModerationStatus.VISIBLE,
    ModerationStatus.HIDDEN,
    ModerationStatus.REPORTED,
    ModerationStatus.UNDER_REVIEW,
    ModerationStatus.REMOVED,
    ModerationStatus.LOCKED,
  ]),
  note: z.string().max(1000).optional(),
});

export async function GET() {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json({ success: false, statusCode: 401, message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const queue = await listModerationQueue(identity);
    return NextResponse.json({ success: true, statusCode: 200, data: { queue } });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}

export async function PATCH(request: Request) {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json({ success: false, statusCode: 401, message: 'Authentication required.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = ModerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const result = await moderateTarget(identity, parsed.data);
    return NextResponse.json({ success: true, statusCode: 200, data: result });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}
