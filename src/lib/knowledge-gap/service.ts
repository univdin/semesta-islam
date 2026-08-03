/**
 * SEMESTA ISLAM — Knowledge Gap Engine (Phase K)
 *
 * Distinguishes:
 *   SEARCH DEMAND ≠ KNOWN FACT ≠ VERIFIED KNOWLEDGE
 *
 * A knowledge gap is a CANDIDATE opportunity where demand exists but verified
 * entity coverage is weak. This module NEVER fabricates claims, facts, or
 * verification. It produces gap signals for human/management review only.
 */

export interface DemandQuery {
  query: string;
  impressions: number;
  clicks: number;
}

export interface EntityCoverage {
  /** Canonical entity URL that would answer a query, if any. */
  entityUrl: string | null;
  /** Whether the entity has verified knowledge relationships. */
  hasVerifiedKnowledge: boolean;
  /** Whether a canonical entity page exists. */
  hasPage: boolean;
}

export interface KnowledgeGap {
  query: string;
  impressions: number;
  clicks: number;
  /** True when demand exists but no canonical entity page covers the query. */
  missingEntity: boolean;
  /** True when an entity page exists but lacks verified knowledge. */
  missingVerifiedKnowledge: boolean;
  /** NEVER set to true by this engine — factual claims require verification. */
  isFactualClaim: false;
}

export interface KnowledgeGapReport {
  gaps: KnowledgeGap[];
  generatedAt: string;
  note: string;
}

export interface GapInput {
  queries: DemandQuery[];
  coverageForQuery: (query: string) => EntityCoverage;
  /** Threshold: minimum impressions to be considered "demand exists". */
  minImpressions?: number;
  /** Threshold: minimum CTR to consider the demand "explored". */
  minClicks?: number;
}

/**
 * Identify knowledge-gap candidates from search demand + entity coverage.
 * Deterministic and purely advisory. Factual claims are never implied.
 */
export function identifyKnowledgeGaps(input: GapInput): KnowledgeGapReport {
  const minImpressions = input.minImpressions ?? 0;
  const gaps: KnowledgeGap[] = [];

  for (const query of input.queries) {
    if (query.impressions < minImpressions) continue;
    const coverage = input.coverageForQuery(query.query);

    const missingEntity = !coverage.hasPage;
    const missingVerifiedKnowledge = coverage.hasPage && !coverage.hasVerifiedKnowledge;

    if (!missingEntity && !missingVerifiedKnowledge) continue;

    gaps.push({
      query: query.query,
      impressions: query.impressions,
      clicks: query.clicks,
      missingEntity,
      missingVerifiedKnowledge,
      isFactualClaim: false,
    });
  }

  gaps.sort((a, b) => b.impressions - a.impressions);

  return {
    gaps,
    generatedAt: new Date().toISOString(),
    note: 'Advisory demand signals only. No factual claims are implied or created.',
  };
}
