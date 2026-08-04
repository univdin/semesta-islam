import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import type { AuthIdentity } from '@/lib/auth/session';
import { linkClaimToTopic } from '@/lib/topics/service';

export const dynamic = 'force-dynamic';

const LinkClaimSchema = z.object({
  claimId: z.string().uuid(),
  topicId: z.string().uuid(),
});

export async function POST(request: Request) {
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

  const parsed = LinkClaimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, statusCode: 400, message: 'Validation failed for claim-topic link', details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const { claimId, topicId } = parsed.data;
    await linkClaimToTopic(identity as AuthIdentity, claimId, topicId);
    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: 'Verifikasi claim berhasil ditautkan ke topik.',
      data: { claimId, topicId },
    });
  } catch (error) {
    const status = (error as Error & { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json(
      { success: false, statusCode: status, message: (error as Error).message },
      { status }
    );
  }
}