import { NextResponse } from 'next/server';
import { getServerIdentity } from '@/lib/auth/session';
import { markAllNotificationsRead } from '@/lib/notifications/service';

export async function POST(request: Request) {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json({ success: false, statusCode: 401, message: 'Authentication required.' }, { status: 401 });
  }

  // The body's userId is ignored; the actor is resolved server-side.
  void request;
  await markAllNotificationsRead(identity.userId);

  return NextResponse.json({ success: true, statusCode: 200, message: 'All notifications marked read.' });
}
