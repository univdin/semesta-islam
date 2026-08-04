/**
 * SEMESTA ISLAM — Session Refresh Middleware
 * Governed by docs/08_SECURITY_COMPLIANCE.md & DECISION-07.
 * Keeps Supabase session cookies fresh on every request and lets API routes /
 * server components resolve the session without re-validating the JWT.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // SEC-07: baseline security headers applied to every response. Deliberately
  // no speculative CSP in this slice (would risk breaking demo-mode inline
  // styles); HSTS is deployment-termed, not middleware-set.
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith('/educator/workspace') ||
    pathname.startsWith('/management') ||
    pathname.startsWith('/learner/activity') ||
    pathname.startsWith('/member') ||
    pathname.startsWith('/organization');

  if (isProtectedRoute) {
    let isAuthenticated = false;

    if (isSupabaseConfigured()) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              response = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) isAuthenticated = true;
      } catch {
        // Fall through
      }
    }

    if (!isAuthenticated) {
      // Demo identity is ONLY accepted outside production AND when demo mode is
      // explicitly enabled (mirrors isDemoMode() in src/lib/auth/session.ts,
      // duplicated here because middleware runs on the Edge runtime and cannot
      // import the server-only session module). SEC-07 guardrail.
      const demoModeEnabled =
        process.env.NODE_ENV !== 'production' &&
        process.env.APP_ENV === 'development' &&
        process.env.LOCAL_DEMO_MODE === 'true';
      if (demoModeEnabled) {
        const demoCookie = request.cookies.get('semesta_demo_identity')?.value;
        if (demoCookie && demoCookie.endsWith('@localhost.test')) {
          isAuthenticated = true;
        }
      }
    }

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)'],
};
