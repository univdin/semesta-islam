/**
 * SEMESTA ISLAM — Server-Derived Identity & Authorization Boundary
 * Decisions: DECISION-06 (hybrid trust boundary), DECISION-07 (server-derived
 * identity), DECISION-08 (demo identity retention), DECISION-09 (auth scope).
 *
 * RULES
 * 1. Identity is always resolved SERVER-SIDE. Client-supplied userId/roles are
 *    never trusted (DECISION-07).
 * 2. Roles come from the `role_assignments` table, never from the client.
 * 3. Demo identity is ONLY resolvable when NODE_ENV !== production AND
 *    APP_ENV === 'development' AND LOCAL_DEMO_MODE === 'true'. The demo email
 *    cookie is read by the server; its owner must exist in the users table.
 * 4. Supabase session takes precedence over demo identity.
 */

import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { UserRole } from '@/types';

export const DEMO_EMAIL_SUFFIX = '@localhost.test';
export const DEMO_IDENTITY_COOKIE = 'semesta_demo_identity';

export interface AuthIdentity {
  userId: string;
  email: string;
  roles: UserRole[];
  source: 'supabase' | 'demo';
}

export function isDemoMode(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.APP_ENV === 'development' &&
    process.env.LOCAL_DEMO_MODE === 'true'
  );
}

export function isDemoEmail(email: string): boolean {
  return email.toLowerCase().endsWith(DEMO_EMAIL_SUFFIX);
}

async function resolveIdentityByEmail(
  email: string,
  source: AuthIdentity['source']
): Promise<AuthIdentity | null> {
  if (!email) return null;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      roles: { select: { role: true } },
    },
  });
  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    roles: user.roles.map((r) => r.role as UserRole),
    source,
  };
}

export async function getServerIdentity(): Promise<AuthIdentity | null> {
  const cookieStore = await cookies();

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient(cookieStore);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user?.email) {
        const identity = await resolveIdentityByEmail(data.user.email, 'supabase');
        if (identity) return identity;
      }
    } catch {
      // Supabase unreachable or malformed session; fall through to demo mode in dev
    }
  }

  if (isDemoMode()) {
    const demoEmail = cookieStore.get(DEMO_IDENTITY_COOKIE)?.value;
    if (demoEmail && isDemoEmail(demoEmail)) {
      const identity = await resolveIdentityByEmail(demoEmail, 'demo');
      if (identity) return identity;
    }
  }

  return null;
}

export function hasRole(identity: AuthIdentity, ...roles: UserRole[]): boolean {
  return roles.some((role) => identity.roles.includes(role));
}

export function isFounder(identity: AuthIdentity): boolean {
  return identity.roles.includes('FOUNDER_ADMIN');
}

export function ownsResource(identity: AuthIdentity, resourceUserId: string): boolean {
  return identity.userId === resourceUserId;
}

export function unauthorizedIdentity(): { success: false; statusCode: 401; message: string } {
  return {
    success: false,
    statusCode: 401,
    message: 'Authentication required. Please sign in or select a demo identity.',
  };
}

export function forbiddenIdentity(): { success: false; statusCode: 403; message: string } {
  return {
    success: false,
    statusCode: 403,
    message: 'Forbidden: you do not have the required role or ownership for this operation.',
  };
}
