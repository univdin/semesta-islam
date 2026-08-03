import { NextResponse } from 'next/server';
import { getServerIdentity } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json({ success: false, statusCode: 401, message: 'Not signed in.' }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    statusCode: 200,
    data: { userId: identity.userId, email: identity.email, roles: identity.roles },
  });
}
