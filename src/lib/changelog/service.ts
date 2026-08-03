/**
 * SEMESTA ISLAM — Changelog (Product Release Notes) Service
 * Governed by MASTER_EXECUTION_PROMPT §27.
 *
 * User-facing product changelog, distinct from git commit history.
 * Founder/content manager publishes; members see "Perubahan Terbaru".
 */

import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';
import { CAPABILITIES } from '@/lib/auth/permissions';
import { authorize, type AuthorizationActor } from '@/lib/auth/authorization';

export interface CreateChangelogInput {
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  version?: string;
  audience?: 'public' | 'internal';
}

export async function createChangelogEntry(
  actor: AuthorizationActor,
  input: CreateChangelogInput
) {
  const result = await authorize({ actor, capability: CAPABILITIES.CONTENT_MANAGE });
  if (!result.allowed) {
    const err = new Error(result.reason ?? 'Forbidden.') as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }

  const entry = await prisma.changelogEntry.create({
    data: {
      title: input.title,
      slug: input.slug,
      summary: input.summary ?? null,
      body: input.body ?? null,
      version: input.version ?? null,
      audience: input.audience ?? 'public',
      status: 'DRAFT',
      authorUserId: actor.userId,
    },
  });

  await persistAuditEvent({
    actorUserId: actor.userId,
    actionType: 'CHANGELOG_CREATED',
    entityAffected: 'changelog_entries',
    entityId: entry.id,
    metadata: { slug: entry.slug },
  });

  return entry;
}

export async function publishChangelogEntry(actor: AuthorizationActor, id: string) {
  const result = await authorize({ actor, capability: CAPABILITIES.CONTENT_PUBLISH });
  if (!result.allowed) {
    const err = new Error(result.reason ?? 'Forbidden.') as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }

  const entry = await prisma.changelogEntry.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });

  await persistAuditEvent({
    actorUserId: actor.userId,
    actionType: 'CHANGELOG_PUBLISHED',
    entityAffected: 'changelog_entries',
    entityId: id,
    metadata: { slug: entry.slug },
  });

  return entry;
}

export async function listPublishedChangelog(limit = 20) {
  return prisma.changelogEntry.findMany({
    where: { status: 'PUBLISHED', audience: 'public' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

export async function listAllChangelog() {
  return prisma.changelogEntry.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 100,
  });
}
