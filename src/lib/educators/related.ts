/**
 * SEMESTA ISLAM — Deterministic Related Educator Scoring (EXP-02)
 * Pure module: no DB access; fully testable.
 *
 * Relatedness formula (documented, deterministic):
 *   +2 per shared course category (expertise)
 *   +3 if same institution (non-empty, case-insensitive)
 *   +4 per shared verified topic (SPECIALIZES_IN claim object)
 *
 * This measures *relatedness by shared knowledge signals* — it NEVER implies
 * an actual affiliation. "Related because both teach X" ≠ "affiliated with Y".
 */

export interface RelatednessTarget {
  id: string;
  expertise: string[];
  institution: string;
  topics: string[];
}

export interface RelatednessCandidate {
  id: string;
  slug: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  verified: boolean;
  expertise: string[];
  institution: string;
  topics: string[];
}

export interface RelatedEducator {
  id: string;
  slug: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  verified: boolean;
  expertise: string[];
  score: number;
  reason: string;
}

const norm = (value: string | null | undefined): string =>
  (value ?? '').trim().toLowerCase();

function sharedValues(a: string[], b: string[]): string[] {
  const bSet = new Set(b.map(norm).filter(Boolean));
  // Keep the original casing of `a` values for display; match case-insensitively.
  return Array.from(new Set(a.filter((x) => norm(x) !== '' && bSet.has(norm(x)))));
}

export function computeRelatedEducators(
  target: RelatednessTarget,
  candidates: RelatednessCandidate[],
  limit = 6
): RelatedEducator[] {
  const results: RelatedEducator[] = [];

  for (const c of candidates) {
    if (c.id === target.id) continue;

    const categoryOverlap = sharedValues(target.expertise, c.expertise);
    const topicOverlap = sharedValues(target.topics, c.topics);
    const institutionMatch =
      norm(target.institution) !== '' && norm(target.institution) === norm(c.institution);

    let score = 0;
    const reasons: string[] = [];

    if (categoryOverlap.length > 0) {
      score += categoryOverlap.length * 2;
      reasons.push(`Berbagi bidang: ${categoryOverlap[0]}`);
    }
    if (topicOverlap.length > 0) {
      score += topicOverlap.length * 4;
      reasons.push(`Berbagi topik: ${topicOverlap[0]}`);
    }
    if (institutionMatch) {
      score += 3;
      reasons.push(`Berbagi institusi: ${c.institution}`);
    }

    if (score > 0) {
      results.push({
        id: c.id,
        slug: c.slug,
        name: c.name,
        title: c.title,
        location: c.location,
        avatar: c.avatar,
        verified: c.verified,
        expertise: c.expertise,
        score,
        reason: reasons.slice(0, 2).join(' · '),
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
