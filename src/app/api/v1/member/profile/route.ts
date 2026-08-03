import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';

const ProfileSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  bio: z.string().max(1000).optional(),
  locationCity: z.string().max(120).optional(),
});

export async function PUT(request: Request) {
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

  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  const data = parsed.data;
  await prisma.userProfile.upsert({
    where: { userId: identity.userId },
    update: {
      ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.locationCity !== undefined ? { locationCity: data.locationCity } : {}),
    },
    create: {
      userId: identity.userId,
      fullName: data.fullName ?? '',
      bio: data.bio ?? null,
      locationCity: data.locationCity ?? null,
    },
  });

  await persistAuditEvent({
    actorUserId: identity.userId,
    actionType: 'PROFILE_UPDATED',
    entityAffected: 'user_profiles',
    entityId: identity.userId,
  });

  return NextResponse.json({ success: true, statusCode: 200, message: 'Profile updated.' });
}
