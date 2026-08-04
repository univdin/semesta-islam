/**
 * ILMIFY — Production Trust Boundary
 *
 * Explicit, testable boundary separating synthetic/demo identities
 * (@localhost.test) from real production trust data.
 *
 * Public trust projections (directory, homepage, sitemap, educator profiles,
 * topics, counts, public APIs) MUST exclude demo identities whenever the
 * process is NOT in demo mode. This guarantees the invariant:
 *
 *   PUBLIC VERIFIED EDUCATORS === GENUINE VERIFIED EDUCATORS
 *   PUBLIC DEMO EDUCATORS     === 0
 *
 * Prefer this explicit filter over a global Prisma middleware: it is scoped to
 * public trust surfaces and leaves management/internal queries untouched.
 */

import type { Prisma } from '@prisma/client';
import { isDemoMode } from '@/lib/auth/session';

export const DEMO_EMAIL_SUFFIX = '@localhost.test';

export function isProductionTrustMode(): boolean {
  return !isDemoMode();
}

/** Where-filter for EducatorProfile queries that hides demo identities in production. */
export function productionTrustEducatorFilter(): Prisma.EducatorProfileWhereInput {
  if (isDemoMode()) return {};
  return { user: { email: { not: { endsWith: DEMO_EMAIL_SUFFIX } } } };
}

/** Where-filter for UserProfile queries (counts / filter options) in production. */
export function productionTrustUserFilter(): Prisma.UserWhereInput | null {
  if (isDemoMode()) return null;
  return { email: { not: { endsWith: DEMO_EMAIL_SUFFIX } } };
}

/**
 * Post-query guard for single-record public lookups (findUnique paths).
 * Fail-closed: a missing/unverifiable email is never projected in trust mode.
 */
export function isTrustedEducatorEmail(email: string | null | undefined): boolean {
  if (isDemoMode()) return true;
  if (!email) return false;
  return !email.endsWith(DEMO_EMAIL_SUFFIX);
}

/** Struct-typed guard for educator rows loaded in public surfaces. */
export function isTrustedEducator(educator: { user?: { email?: string | null } | null }): boolean {
  return isTrustedEducatorEmail(educator?.user?.email);
}
