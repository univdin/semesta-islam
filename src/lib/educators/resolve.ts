/**
 * SEMESTA ISLAM — Educator Route Resolver (EXP-11)
 *
 * Decides what to do with the dynamic segment under /educator/:
 *
 *   Case A — canonical slug  → resolve by slug, render.
 *   Case B — legacy UUID     → resolve by UUID, permanentRedirect(308) to slug.
 *   Case C — unknown          → notFound().
 *
 * The resolver itself is DB-aware but keeps the redirect/notFound decision
 * framework pure and testable. UUIDs remain valid internal identifiers; only
 * the *public canonical URL* uses the slug.
 */

import { isValidUuid } from '@/lib/educators/service';
import type { EducatorDetail } from '@/lib/educators/service';

export interface EducatorResolution {
  /** Which lookup branch matched. */
  matchedBy: 'slug' | 'uuid' | 'none';
  educator: EducatorDetail | null;
}

export type EducatorLookupSlug = (slug: string) => Promise<EducatorDetail | null>;
export type EducatorLookupId = (id: string) => Promise<EducatorDetail | null>;

export interface ResolveDeps {
  bySlug: EducatorLookupSlug;
  byId: EducatorLookupId;
}

/**
 * Resolve a dynamic /educator/ segment.
 *
 * - Valid UUID → by-id lookup (Case B).
 * - Otherwise  → by-slug lookup (Case A).
 *
 * A matched educator is returned with `matchedBy` so the caller can decide
 * whether to redirect (uuid) or render (slug). Unknown inputs resolve to
 * `matchedBy: 'none'` → caller maps to notFound().
 */
export async function resolveEducatorSegment(
  segment: string,
  deps: ResolveDeps
): Promise<EducatorResolution> {
  const value = (segment ?? '').trim();
  if (!value) return { matchedBy: 'none', educator: null };

  if (isValidUuid(value)) {
    const educator = await deps.byId(value);
    return educator ? { matchedBy: 'uuid', educator } : { matchedBy: 'none', educator: null };
  }

  const educator = await deps.bySlug(value);
  return educator ? { matchedBy: 'slug', educator } : { matchedBy: 'none', educator: null };
}
