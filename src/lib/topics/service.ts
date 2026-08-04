/**
 * SEMESTA ISLAM — Topic Taxonomy Service (EXP-03)
 *
 * Canonical, governed taxonomy entity. Topics are NOT arbitrary strings:
 * they are typed nodes with slugs, parent hierarchy, aliases and publish
 * state. Educator ↔ Topic edges are expressed through VERIFIED
 * SPECIALIZES_IN KnowledgeClaim rows referencing `KnowledgeClaim.topicId`.
 *
 * Trust rule (unchanged): only VERIFIED claims may become authoritative
 * public relationships. A topic's public page lists educators whose
 * SPECIALIZES_IN claim is VERIFIED and linked to that topic.
 */

import { prisma } from '@/lib/db';
import { slugify } from '@/lib/slugs';
import { requirePermission } from '@/lib/auth/authorization';
import type { AuthorizationResult } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import type { AuthIdentity } from '@/lib/auth/session';
import { productionTrustEducatorFilter } from '@/lib/auth/production';
import { TopicStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export interface TopicView {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  status: TopicStatus;
  sortOrder: number;
  verifiedEducatorCount: number;
  childCount: number;
  indexable: boolean;
}

export interface TopicDetail extends TopicView {
  children: TopicView[];
  aliases: string[];
}

export interface TopicEducator {
  id: string;
  slug: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  verified: boolean;
}

export interface RelatedTopic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sharedEducators: number;
}

const TOPIC_VIEW_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  parentId: true,
  status: true,
  sortOrder: true,
} satisfies Prisma.TopicSelect;

type TopicRow = Prisma.TopicGetPayload<{ select: typeof TOPIC_VIEW_SELECT }>;

/**
 * Indexability quality gate. A topic page is only indexable when it carries
 * meaningful entity value: a meaningful description OR at least one verified
 * educator relationship. This prevents hundreds of thin SEO pages.
 */
export function isTopicIndexable(topic: {
  description: string | null;
  verifiedEducatorCount: number;
  status: TopicStatus;
}): boolean {
  if (topic.status !== 'PUBLISHED') return false;
  const hasDescription = (topic.description ?? '').trim().length >= 20;
  return hasDescription || topic.verifiedEducatorCount > 0;
}

function toTopicView(row: TopicRow): TopicView {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    parentId: row.parentId,
    status: row.status,
    sortOrder: row.sortOrder,
    verifiedEducatorCount: 0,
    childCount: 0,
    indexable: false,
  };
}

function normalizeAlias(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Resolve a topic by slug. Optionally include child count and verified
 * educator count (bounded queries).
 */
export async function getTopicBySlug(
  slug: string,
  options: { includeStats?: boolean } = {}
): Promise<TopicDetail | null> {
  if (!slug) return null;
  const topic = await prisma.topic.findUnique({
    where: { slug },
    select: TOPIC_VIEW_SELECT,
  });
  if (!topic) return null;

  const [children, aliases, educatorCount, childCount] = await Promise.all([
    prisma.topic.findMany({
      where: { parentId: topic.id, status: 'PUBLISHED' },
      select: TOPIC_VIEW_SELECT,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    prisma.topicAlias.findMany({ where: { topicId: topic.id }, select: { alias: true } }),
    options.includeStats
      ? countVerifiedEducatorsForTopic(topic.id)
      : Promise.resolve(0),
    prisma.topic.count({ where: { parentId: topic.id } }),
  ]);

  const verifiedEducatorCount = educatorCount;
  const view = {
    id: topic.id,
    name: topic.name,
    slug: topic.slug,
    description: topic.description,
    parentId: topic.parentId,
    status: topic.status,
    sortOrder: topic.sortOrder,
    verifiedEducatorCount,
    childCount,
    indexable: isTopicIndexable({ description: topic.description, verifiedEducatorCount, status: topic.status }),
  };

  return {
    ...view,
    children: children.map((c) => ({
      ...toTopicView(c),
      verifiedEducatorCount: 0,
      childCount: 0,
      indexable: false,
    })),
    aliases: aliases.map((a) => a.alias),
  };
}

/** Count educators with a VERIFIED SPECIALIZES_IN claim linked to this topic.
 *  Only counts educators whose own verification is currently VERIFIED and who
 *  are trusted production identities (non-demo) — a revoked educator must not
 *  keep contributing verified topic edges. */
export async function countVerifiedEducatorsForTopic(topicId: string): Promise<number> {
  return prisma.knowledgeClaim.count({
    where: {
      topicId,
      predicate: 'SPECIALIZES_IN',
      status: 'VERIFIED',
      educator: { ...productionTrustEducatorFilter(), verifiedStatus: 'VERIFIED' },
    },
  });
}

/**
 * Verified educators for a topic. Only educators with a VERIFIED
 * SPECIALIZES_IN claim linked to the topic are included. Bounded.
 */
export async function listVerifiedEducatorsForTopic(
  topicId: string,
  take = 24
): Promise<TopicEducator[]> {
  const claims = await prisma.knowledgeClaim.findMany({
    where: {
      topicId,
      predicate: 'SPECIALIZES_IN',
      status: 'VERIFIED',
      educator: { ...productionTrustEducatorFilter(), verifiedStatus: 'VERIFIED' },
    },
    orderBy: { verifiedAt: 'desc' },
    take,
    include: {
      educator: {
        include: { user: { include: { profile: true } } },
      },
    },
  });

  return claims
    .map((c) => c.educator)
    .map((e) => ({
      id: e.id,
      slug: e.slug ?? '',
      name: e.user.profile?.fullName ?? e.user.email,
      title: e.titleSuffix ?? '',
      location: e.user.profile?.locationCity ?? '',
      avatar: e.user.profile?.avatarUrl ?? '',
      verified: e.verifiedStatus === 'VERIFIED',
    }));
}

/**
 * Deterministic related topics: topics sharing at least one verified
 * educator, ranked by number of shared educators. Bounded indexed query.
 */
export async function listRelatedTopics(topicId: string, limit = 6): Promise<RelatedTopic[]> {
  const trustedVerified = { ...productionTrustEducatorFilter(), verifiedStatus: 'VERIFIED' as const };
  const sharedEducatorIds = await prisma.knowledgeClaim.findMany({
    where: { topicId, predicate: 'SPECIALIZES_IN', status: 'VERIFIED', educator: trustedVerified },
    select: { educatorId: true },
  });
  if (sharedEducatorIds.length === 0) return [];

  const educatorIds = sharedEducatorIds.map((r) => r.educatorId);

  const siblings = await prisma.knowledgeClaim.groupBy({
    by: ['topicId'],
    where: {
      topicId: { not: topicId },
      educatorId: { in: educatorIds },
      predicate: 'SPECIALIZES_IN',
      status: 'VERIFIED',
      educator: trustedVerified,
    },
    _count: { _all: true },
  });

  const candidates = siblings
    .filter((s) => s.topicId)
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, limit);

  const topics = await prisma.topic.findMany({
    where: { id: { in: candidates.map((c) => c.topicId!) } },
    select: { id: true, name: true, slug: true, description: true },
  });
  const topicMap = new Map(topics.map((t) => [t.id, t]));
  const countMap = new Map(candidates.map((c) => [c.topicId, c._count._all]));

  return candidates
    .map((c) => {
      const t = topicMap.get(c.topicId!);
      return t
        ? {
            id: t.id,
            name: t.name,
            slug: t.slug,
            description: t.description,
            sharedEducators: countMap.get(t.id) ?? 0,
          }
        : null;
    })
    .filter((x): x is RelatedTopic => x !== null);
}

/**
 * Public topic index (published topics, deterministic order). Only topics
 * with meaningful value are included; thin topics are excluded from the
 * public index but still exist in the taxonomy.
 */
export async function listPublishedTopics(options: { includeThin?: boolean } = {}): Promise<TopicView[]> {
  const topics = await prisma.topic.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, name: true, slug: true, description: true, parentId: true, status: true, sortOrder: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  const counts = await prisma.knowledgeClaim.groupBy({
    by: ['topicId'],
    where: {
      topicId: { in: topics.map((t) => t.id) },
      predicate: 'SPECIALIZES_IN',
      status: 'VERIFIED',
    },
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.topicId, c._count._all]));

  const childCounts = await prisma.topic.groupBy({
    by: ['parentId'],
    where: { parentId: { in: topics.map((t) => t.id) } },
    _count: { _all: true },
  });
  const childMap = new Map(childCounts.map((c) => [c.parentId, c._count._all]));

  return topics.map((t) => {
    const verifiedEducatorCount = countMap.get(t.id) ?? 0;
    const childCount = childMap.get(t.id) ?? 0;
    const indexable = isTopicIndexable({ description: t.description, verifiedEducatorCount, status: t.status });
    if (!options.includeThin && !indexable) return null;
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      parentId: t.parentId,
      status: t.status,
      sortOrder: t.sortOrder,
      verifiedEducatorCount,
      childCount,
      indexable,
    };
  }).filter((x): x is TopicView => x !== null);
}

// ---------------------------------------------------------------------------
// Governance — topic mutation is management-controlled.
// ---------------------------------------------------------------------------

export interface CreateTopicInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  aliases?: string[];
  sortOrder?: number;
}

export interface TopicMutationResult {
  topic: { id: string; name: string; slug: string; status: TopicStatus };
}

function assertCanManageTopics(actor: AuthIdentity): Promise<AuthorizationResult> {
  return requirePermission({ actor, capability: CAPABILITIES.CONTENT_MANAGE });
}

function assertCanPublishTopics(actor: AuthIdentity): Promise<AuthorizationResult> {
  return requirePermission({ actor, capability: CAPABILITIES.CONTENT_PUBLISH });
}

/** Create a topic (DRAFT unless explicitly published). Management-only. */
export async function createTopic(
  actor: AuthIdentity,
  input: CreateTopicInput
): Promise<TopicMutationResult> {
  await assertCanManageTopics(actor);

  const name = input.name.trim();
  if (!name) throw new Error('TOPIC_NAME_REQUIRED');

  const baseSlug = input.slug?.trim() || slugify(name);
  if (!baseSlug) throw new Error('TOPIC_SLUG_INVALID');

  const taken = await prisma.topic.findUnique({ where: { slug: baseSlug }, select: { id: true } });
  const slug = taken ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

  const topic = await prisma.topic.create({
    data: {
      name,
      slug,
      description: input.description?.trim() || null,
      parentId: input.parentId ?? null,
      status: 'DRAFT',
      sortOrder: input.sortOrder ?? 0,
      aliases: input.aliases?.length
        ? { create: input.aliases.map((a) => ({ alias: a.trim() })).filter((a) => a.alias) }
        : undefined,
    },
    select: { id: true, name: true, slug: true, status: true },
  });

  return { topic };
}

/** Publish a topic (and optionally its children). Management-only. */
export async function publishTopic(
  actor: AuthIdentity,
  topicId: string,
  options: { recursive?: boolean } = {}
): Promise<TopicMutationResult> {
  await assertCanPublishTopics(actor);
  const topic = await prisma.topic.update({
    where: { id: topicId },
    data: { status: 'PUBLISHED' },
    select: { id: true, name: true, slug: true, status: true },
  });
  if (options.recursive) {
    await prisma.topic.updateMany({
      where: { parentId: topicId },
      data: { status: 'PUBLISHED' },
    });
  }
  return { topic };
}

/** Archive a topic. Management-only. */
export async function archiveTopic(
  actor: AuthIdentity,
  topicId: string
): Promise<TopicMutationResult> {
  await assertCanManageTopics(actor);
  const topic = await prisma.topic.update({
    where: { id: topicId },
    data: { status: 'ARCHIVED' },
    select: { id: true, name: true, slug: true, status: true },
  });
  return { topic };
}

/**
 * Link a verified claim to a topic. Only a verifier with VERIFICATION_MANAGE
 * may set topic edges (the claim must already be VERIFIED — we never publish
 * unverified relationships).
 */
export async function linkClaimToTopic(
  actor: AuthIdentity,
  claimId: string,
  topicId: string
): Promise<void> {
  await requirePermission({ actor, capability: CAPABILITIES.VERIFICATION_MANAGE });

  const claim = await prisma.knowledgeClaim.findUnique({
    where: { id: claimId },
    select: { id: true, status: true, predicate: true },
  });
  if (!claim) throw new Error('CLAIM_NOT_FOUND');
  if (claim.status !== 'VERIFIED') {
    throw new Error('CLAIM_NOT_VERIFIED: only verified claims may become authoritative topic edges');
  }

  await prisma.knowledgeClaim.update({
    where: { id: claimId },
    data: { topicId },
  });
}

/**
 * Resolve topic by canonical slug OR alias (for internal taxonomy lookups and
 * alias-aware discovery). Public pages use canonical slugs.
 */
export async function resolveTopicBySlugOrAlias(value: string): Promise<TopicView | null> {
  const raw = value.trim().toLowerCase();
  if (!raw) return null;

  const canonical = slugify(raw);
  if (!canonical) return null;

  const topic = await prisma.topic.findUnique({ where: { slug: canonical } });
  if (topic) return toTopicView(topic);

  const alias = await prisma.topicAlias.findUnique({
    where: { alias: normalizeAlias(canonical) },
    include: { topic: true },
  });
  if (alias) return toTopicView(alias.topic);
  return null;
}
