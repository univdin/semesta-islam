import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CommunityTargetType } from '@prisma/client';
import { getServerIdentity } from '@/lib/auth/session';
import { createReport } from '@/lib/community/reports';
import { ServiceError } from '@/lib/community/errors';

export const dynamic = 'force-dynamic';

const CreateReportSchema = z.object({
  targetType: z.enum([
    CommunityTargetType.EDUCATOR_PROFILE,
    CommunityTargetType.TOPIC,
    CommunityTargetType.QUESTION,
    CommunityTargetType.ANSWER,
    CommunityTargetType.COMMENT,
  ]),
  targetId: z.string().uuid(),
  reason: z.string().min(3).max(500),
});

export async function POST(request: Request) {
  const identity = await getServerIdentity();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = CreateReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const result = await createReport(identity, parsed.data);
    return NextResponse.json({ success: true, statusCode: 200, data: result });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}
