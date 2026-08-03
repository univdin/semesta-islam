/**
 * SEMESTA ISLAM — Organization & Membership Service
 * Governed by MASTER_EXECUTION_PROMPT §8-10, §18-19.
 *
 * Organization is a security boundary. All organization-scoped operations
 * must be authorized server-side via the authorization service.
 */

import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';
import { CAPABILITIES } from '@/lib/auth/permissions';
import {
  authorize,
  requireOrganizationAccess,
  type AuthorizationActor,
} from '@/lib/auth/authorization';
import { OrganizationType } from '@prisma/client';

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  type?: OrganizationType;
  metadata?: Record<string, unknown>;
}

export async function createOrganization(
  actor: AuthorizationActor,
  input: CreateOrganizationInput
) {
  const result = await authorize({
    actor,
    capability: CAPABILITIES.ORGANIZATION_UPDATE,
  });
  if (!result.allowed) {
    const err = new Error(result.reason ?? 'Forbidden.') as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }

  const org = await prisma.organization.create({
    data: {
      name: input.name,
      slug: input.slug,
      type: input.type ?? OrganizationType.INSTITUTION,
      ownerUserId: actor.userId,
      metadata: (input.metadata ?? {}) as object,
    },
  });

  // The owner automatically becomes ORG_OWNER.
  await prisma.organizationMembership.create({
    data: {
      userId: actor.userId,
      organizationId: org.id,
      role: 'ORG_OWNER',
      status: 'ACTIVE',
    },
  });

  await persistAuditEvent({
    actorUserId: actor.userId,
    actionType: 'ORGANIZATION_CREATED',
    entityAffected: 'organizations',
    entityId: org.id,
    metadata: { name: org.name, slug: org.slug },
  });

  return org;
}

export async function listOrganizationsForActor(actor: AuthorizationActor) {
  const memberships = await prisma.organizationMembership.findMany({
    where: { userId: actor.userId },
    select: { organizationId: true, role: true, status: true },
  });

  const active = memberships.filter((m) => m.status === 'ACTIVE');
  const orgs = await prisma.organization.findMany({
    where: { id: { in: active.map((m) => m.organizationId) } },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      status: true,
      updatedAt: true,
    },
  });

  return orgs.map((o) => {
    const m = active.find((x) => x.organizationId === o.id)!;
    return { ...o, membershipRole: m.role };
  });
}

export async function getOrganizationDetail(
  actor: AuthorizationActor,
  organizationId: string
) {
  await requireOrganizationAccess(actor, organizationId);

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      memberships: {
        select: {
          id: true,
          userId: true,
          role: true,
          status: true,
          joinedAt: true,
          expiresAt: true,
          user: { select: { email: true, profile: { select: { fullName: true } } } },
        },
      },
    },
  });
  if (!org) {
    const err = new Error('Organization not found.') as Error & { statusCode: number };
    err.statusCode = 404;
    throw err;
  }
  return org;
}

export interface InviteMemberInput {
  email: string;
  role: 'ORG_OWNER' | 'ORG_ADMIN' | 'ORG_MANAGER' | 'ORG_STAFF' | 'ORG_MEMBER';
}

export async function inviteMember(
  actor: AuthorizationActor,
  organizationId: string,
  input: InviteMemberInput
) {
  await requireOrganizationAccess(actor, organizationId);
  const result = await authorize({
    actor,
    capability: CAPABILITIES.MEMBERS_INVITE,
    organizationId,
  });
  if (!result.allowed) {
    const err = new Error(result.reason ?? 'Forbidden.') as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }

  let user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    user = await prisma.user.create({ data: { email: input.email } });
  }

  const membership = await prisma.organizationMembership.upsert({
    where: {
      userId_organizationId: { userId: user.id, organizationId },
    },
    update: { role: input.role, status: 'INVITED' },
    create: {
      userId: user.id,
      organizationId,
      role: input.role,
      status: 'INVITED',
    },
  });

  await persistAuditEvent({
    actorUserId: actor.userId,
    actionType: 'ORGANIZATION_MEMBER_INVITED',
    entityAffected: 'organization_memberships',
    entityId: membership.id,
    metadata: { organizationId, invitedEmail: input.email, role: input.role },
  });

  return membership;
}

export async function updateMembershipStatus(
  actor: AuthorizationActor,
  organizationId: string,
  membershipId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED'
) {
  await requireOrganizationAccess(actor, organizationId);
  const result = await authorize({
    actor,
    capability: CAPABILITIES.MEMBERS_UPDATE,
    organizationId,
  });
  if (!result.allowed) {
    const err = new Error(result.reason ?? 'Forbidden.') as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }

  const membership = await prisma.organizationMembership.update({
    where: { id: membershipId },
    data: { status },
  });

  await persistAuditEvent({
    actorUserId: actor.userId,
    actionType: `ORGANIZATION_MEMBER_${status}`,
    entityAffected: 'organization_memberships',
    entityId: membershipId,
    metadata: { organizationId, targetUserId: membership.userId },
  });

  return membership;
}
