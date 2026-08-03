/**
 * SEMESTA ISLAM — Supabase Server Client Setup
 * Governed by docs/08_SECURITY_COMPLIANCE.md & docs/09_RESOURCE_REGISTRY.md
 * Decisions: DECISION-03 (Supabase Auth), DECISION-07 (server-derived identity)
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export function createServerSupabaseClient(cookieStore: ReadonlyRequestCookies) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; safe to ignore when middleware refreshes sessions
        }
      },
    },
  });
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return (
    url.includes('supabase.co') &&
    !url.includes('placeholder') &&
    anonKey !== '' &&
    !anonKey.includes('placeholder')
  );
}
