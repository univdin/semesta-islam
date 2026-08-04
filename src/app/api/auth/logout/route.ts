/**
 * ILMIFY — Sign Out (Supabase + Demo)
 * Clears the Supabase session cookies (via signOut()) and, in development demo
 * mode, the local demo identity cookie. Always returns success so the client
 * can redirect to /login regardless of provider state.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { DEMO_IDENTITY_COOKIE, isDemoMode } from '@/lib/auth/session';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    statusCode: 200,
    message: 'Signed out.',
  });

  if (isDemoMode()) {
    response.cookies.set(DEMO_IDENTITY_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }

  if (isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    await supabase.auth.signOut();
  }

  return response;
}
