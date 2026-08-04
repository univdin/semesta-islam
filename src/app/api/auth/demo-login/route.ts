/**
 * ILMIFY — Demo Identity Session (Development Only)
 * Decisions: DECISION-08 (demo identity retention for dev/testing only).
 * Sets a server-read, httpOnly demo identity cookie. Enabled ONLY when
 * isDemoMode() is true (NODE_ENV !== production && APP_ENV === development &&
 * LOCAL_DEMO_MODE === true). Never a production authorization path.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { DEMO_IDENTITY_COOKIE, isDemoEmail, isDemoMode } from '@/lib/auth/session';

export async function GET() {
  if (!isDemoMode()) {
    return NextResponse.json(
      { success: false, statusCode: 403, message: 'Demo authentication is disabled outside development.' },
      { status: 403 }
    );
  }

  const cookieStore = await cookies();
  const email = cookieStore.get(DEMO_IDENTITY_COOKIE)?.value ?? null;

  return NextResponse.json({ success: true, statusCode: 200, data: { email } });
}

export async function POST(request: Request) {
  if (!isDemoMode()) {
    return NextResponse.json(
      { success: false, statusCode: 403, message: 'Demo authentication is disabled outside development.' },
      { status: 403 }
    );
  }

  let email: string;
  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    email = '';
  }

  if (!email || !isDemoEmail(email)) {
    return NextResponse.json(
      { success: false, statusCode: 400, message: 'A valid demo identity email (@localhost.test) is required.' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    return NextResponse.json(
      { success: false, statusCode: 404, message: 'Demo identity email is not seeded in the database.' },
      { status: 404 }
    );
  }

  const response = NextResponse.json({
    success: true,
    statusCode: 200,
    message: 'Demo identity session set.',
    data: { email, userId: user.id },
  });
  response.cookies.set(DEMO_IDENTITY_COOKIE, email, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return response;
}

export async function DELETE() {
  if (!isDemoMode()) {
    return NextResponse.json(
      { success: false, statusCode: 403, message: 'Demo authentication is disabled outside development.' },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ success: true, statusCode: 200, message: 'Demo identity session cleared.' });
  response.cookies.set(DEMO_IDENTITY_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
