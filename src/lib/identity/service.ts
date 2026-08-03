/**
 * SEMESTA ISLAM — Digital Identity Service (Phase H)
 *
 * External platform profiles (WEBSITE, YOUTUBE, INSTAGRAM, TIKTOK, X,
 * FACEBOOK, OTHER). Identity is NEVER inferred from name/avatar similarity.
 *
 * Lifecycle:
 *   SELF_DECLARED → SUBMITTED → UNDER_REVIEW → VERIFIED | REJECTED
 *
 * Trust rule: only a VERIFIED external profile may become an authoritative
 * `sameAs` reference in public structured data. Unverified profiles are
 * visible to the owning educator only and never become sameAs.
 */

import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import type { AuthIdentity } from '@/lib/auth/session';
import { DigitalPlatform, DigitalProfileStatus } from '@prisma/client';

export interface DigitalProfileView {
  id: string;
  educatorId: string;
  platform: DigitalPlatform;
  url: string;
  handle: string | null;
  status: DigitalProfileStatus;
  verifiedAt: Date | null;
  createdAt: Date;
}

const PUBLIC_SELECT = {
  id: true,
  educatorId: true,
  platform: true,
  url: true,
  handle: true,
  status: true,
  verifiedAt: true,
  createdAt: true,
} as const;

type DigitalProfileRow = {
  id: string;
  educatorId: string;
  platform: DigitalPlatform;
  url: string;
  handle: string | null;
  status: DigitalProfileStatus;
  verifiedAt: Date | null;
  createdAt: Date;
};

function toView(row: DigitalProfileRow): DigitalProfileView {
  return {
    id: row.id,
    educatorId: row.educatorId,
    platform: row.platform,
    url: row.url,
    handle: row.handle,
    status: row.status,
    verifiedAt: row.verifiedAt,
    createdAt: row.createdAt,
  };
}

/** Public-safe: only VERIFIED profiles are exposed publicly (potential sameAs). */
export async function listVerifiedProfilesForEducator(educatorId: string): Promise<DigitalProfileView[]> {
  const rows = await prisma.digitalProfile.findMany({
    where: { educatorId, status: 'VERIFIED' },
    orderBy: { platform: 'asc' },
    select: PUBLIC_SELECT,
  });
  return rows.map(toView);
}

/** Owning-educator / management view: full lifecycle for one educator. */
export async function listProfilesForEducator(
  actor: AuthIdentity,
  educatorId: string
): Promise<DigitalProfileView[]> {
  const owns = await ownsEducator(actor, educatorId);
  if (!owns) {
    await requirePermission({ actor, capability: CAPABILITIES.VERIFICATION_MANAGE });
  }
  const rows = await prisma.digitalProfile.findMany({
    where: { educatorId },
    orderBy: [{ status: 'asc' }, { platform: 'asc' }],
    select: PUBLIC_SELECT,
  });
  return rows.map(toView);
}

async function ownsEducator(actor: AuthIdentity, educatorId: string): Promise<boolean> {
  const educator = await prisma.educatorProfile.findUnique({
    where: { id: educatorId },
    select: { userId: true },
  });
  return educator?.userId === actor.userId;
}

export interface SubmitDigitalProfileInput {
  educatorId: string;
  platform: DigitalPlatform;
  url: string;
  handle?: string;
}

export async function submitDigitalProfile(
  actor: AuthIdentity,
  input: SubmitDigitalProfileInput
): Promise<DigitalProfileView> {
  const owns = await ownsEducator(actor, input.educatorId);
  if (!owns) {
    await requirePermission({ actor, capability: CAPABILITIES.VERIFICATION_MANAGE });
  }

  const row = await prisma.digitalProfile.create({
    data: {
      educatorId: input.educatorId,
      platform: input.platform,
      url: input.url,
      handle: input.handle?.trim() || null,
      status: 'SUBMITTED',
    },
    select: PUBLIC_SELECT,
  });
  return toView(row);
}

/**
 * Update a digital profile's verification status. Management-only
 * (VERIFICATION_MANAGE). Only VERIFIED profiles become authoritative sameAs.
 */
export async function updateDigitalProfileStatus(
  actor: AuthIdentity,
  profileId: string,
  status: DigitalProfileStatus
): Promise<DigitalProfileView> {
  await requirePermission({ actor, capability: CAPABILITIES.VERIFICATION_MANAGE });

  const row = await prisma.digitalProfile.update({
    where: { id: profileId },
    data: {
      status,
      verifiedById: status === 'VERIFIED' ? actor.userId : null,
      verifiedAt: status === 'VERIFIED' ? new Date() : null,
    },
    select: PUBLIC_SELECT,
  });
  return toView(row);
}

/**
 * Resolve the canonical external URLs for an educator's Person JSON-LD
 * `sameAs`. Only VERIFIED profiles are authoritative identity references.
 */
export async function listVerifiedProfileUrls(educatorId: string): Promise<string[]> {
  const rows = await prisma.digitalProfile.findMany({
    where: { educatorId, status: 'VERIFIED' },
    select: { url: true },
  });
  return rows.map((r) => r.url);
}

/** Management review surface: all profiles pending or verified, with educator names. */
export async function listAllDigitalProfiles(
  actor: AuthIdentity
): Promise<
  Array<DigitalProfileView & { educatorName: string; educatorSlug: string }>
> {
  await requirePermission({ actor, capability: CAPABILITIES.VERIFICATION_MANAGE });
  const rows = await prisma.digitalProfile.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      educator: { include: { user: { include: { profile: true } } } },
    },
  });
  return rows.map((row) => ({
    ...toView(row),
    educatorName: row.educator.user.profile?.fullName ?? row.educator.user.email,
    educatorSlug: row.educator.slug ?? '',
  }));
}
