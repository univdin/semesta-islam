/**
 * SEMESTA ISLAM — Supabase Auth Callback
 *
 * Single entry point for every Supabase auth link flow:
 *  - OAuth (Google / Microsoft): after the provider redirects back with a code.
 *  - Email confirmation (signup): Supabase sends the user here with a code.
 *  - Password recovery: Supabase appends `type=recovery`; we forward the user
 *    to the set-new-password page.
 *
 * On success the Supabase session cookies are persisted (via the ssr client's
 * setAll) and the user is provisioned locally so getServerIdentity() resolves.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { provisionUser } from '@/lib/auth/provision';

function safeNext(target: string | null): string {
  if (
    target &&
    target.startsWith('/') &&
    !target.startsWith('//') &&
    !target.includes(':') &&
    !target.includes('\\')
  ) {
    return target;
  }
  return '/member';
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next');

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(
      new URL('/login?error=auth_callback_failed', requestUrl.origin)
    );
  }

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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from a Server Component context
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL('/login?error=auth_callback_failed', requestUrl.origin)
    );
  }

  const { data } = await supabase.auth.getUser();
  if (data.user?.email) {
    const fullName =
      data.user.user_metadata?.full_name ??
      data.user.user_metadata?.name ??
      data.user.user_metadata?.fullName ??
      null;
    try {
      await provisionUser({ email: data.user.email, fullName, source: 'oauth' });
    } catch {
      return NextResponse.redirect(
        new URL('/login?error=provision_failed', requestUrl.origin)
      );
    }
  }

  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/auth/update-password', requestUrl.origin));
  }

  return NextResponse.redirect(new URL(safeNext(next), requestUrl.origin));
}
