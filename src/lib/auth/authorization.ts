/**
 * SEMESTA ISLAM — Centralized Server-Side Authorization Service
 * Governed by MASTER_EXECUTION_PROMPT §14-15, §19, §32.
 *
 * RULES
 * 1. Identity is ALWAYS resolved server-side (DECISION-07). The client never
 *    supplies actorUserId/actorRoles/organizationId as security values.
 * 2. Authorization = Identity + Membership + Role + Capability + Scope +
 *    Resource ownership + Policy.
 * 3. Fail closed: any unresolved authorization is DENY.
 * 4. UI hiding is presentation, never authorization.
 */

import { prisma } from '@/lib/db';
import type { UserRole } from '@/types';
import type { OrganizationRole, PermissionScope } from '@prisma/client';
import {
  CAPABILITIES,
  ORGANIZATION_ROLE_CAPABILITIES,
  PLATFORM_ROLE_CAPABILITIES,
  type Capability,
} from './permissions';

export interface AuthorizationActor {
  userId: string;
  roles: UserRole[];
  email?: string;
}

export interface OrganizationContext {
  organizationId?: string;
}

export interface PermissionGrant {
  capability: Capability;
  scope: PermissionScope;
  organizationId?: string;
  resourceId?: string;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
}

function deny(reason: string): AuthorizationResult {
  return { allowed: false, reason };
}

function allow(): AuthorizationResult {
  return { allowed: true };
}

/** Collect organization memberships for the actor. */
async function getMemberships(
  userId: string
): Promise<{ organizationId: string; role: OrganizationRole; status: string }[]> {
  const memberships = await prisma.organizationMembership.findMany({
    where: { userId },
    select: { organizationId: true, role: true, status: true },
  });
  return memberships;
}

/** Collect active delegations granted to the actor. */
async function getDelegationCapabilities(userId: string): Promise<PermissionGrant[]> {
  const now = new Date();
  const delegations = await prisma.delegation.findMany({
    where: {
      delegateUserId: userId,
      status: 'ACTIVE',
      startsAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { capabilities: true, organizationId: true },
  });

  const grants: PermissionGrant[] = [];
  for (const d of delegations ?? []) {
    const caps = Array.isArray(d.capabilities) ? (d.capabilities as unknown[]) : [];
    for (const c of caps) {
      if (typeof c === 'string' && isCapability(c)) {
        grants.push({
          capability: c,
          scope: d.organizationId ? 'ORGANIZATION' : 'PLATFORM',
          organizationId: d.organizationId ?? undefined,
        });
      }
    }
  }
  return grants;
}

function isCapability(value: string): value is Capability {
  return Object.values(CAPABILITIES).includes(value as Capability);
}

export interface AuthorizeInput {
  actor: AuthorizationActor;
  capability: Capability;
  organizationId?: string;
  resourceOwnerUserId?: string;
  /** For RESOURCE-scoped checks: true if the actor owns the resource. */
  ownsResource?: boolean;
}

/**
 * Resolve whether an actor may perform `capability` against the given context.
 * Order of evaluation:
 *  1. Founder platform capability grants
 *  2. Platform role capability grants (SELF scope for ownership-sensitive caps)
 *  3. Organization membership role grants (scoped to organizationId)
 *  4. Explicit delegation grants
 *  5. Fail closed → DENY
 */
export async function authorize(input: AuthorizeInput): Promise<AuthorizationResult> {
  const { actor, capability, organizationId, resourceOwnerUserId, ownsResource } = input;
  if (!actor) return deny('No actor.');

  const founderGrants = PLATFORM_ROLE_CAPABILITIES.FOUNDER_ADMIN ?? [];
  if (actor.roles.includes('FOUNDER_ADMIN') && founderGrants.includes(capability)) {
    return allow();
  }

  // Platform role grants
  for (const role of actor.roles) {
    const grants = PLATFORM_ROLE_CAPABILITIES[role] ?? [];
    if (grants.includes(capability)) {
      return allow();
    }
  }

  // Organization membership grants
  if (organizationId) {
    const memberships = await getMemberships(actor.userId);
    const membership = memberships.find(
      (m) => m.organizationId === organizationId && m.status === 'ACTIVE'
    );
    if (membership) {
      const roleCaps = ORGANIZATION_ROLE_CAPABILITIES[membership.role] ?? [];
      if (roleCaps.includes(capability)) return allow();
    }
  }

  // Delegation grants
  const delegations = await getDelegationCapabilities(actor.userId);
  for (const grant of delegations) {
    if (grant.capability !== capability) continue;
    if (grant.organizationId && grant.organizationId !== organizationId) continue;
    return allow();
  }

  // Ownership grant (SELF scope)
  if (ownsResource && resourceOwnerUserId && actor.userId === resourceOwnerUserId) {
    if (
      capability === CAPABILITIES.BOOKINGS_VIEW ||
      capability === CAPABILITIES.COURSES_VIEW ||
      capability === CAPABILITIES.VERIFICATION_VIEW ||
      capability === CAPABILITIES.ECONOMY_TRANSACTION_VIEW
    ) {
      return allow();
    }
  }

  return deny(`Missing capability: ${capability}`);
}

/** Convenience boolean wrapper. */
export async function can(input: AuthorizeInput): Promise<boolean> {
  const result = await authorize(input);
  return result.allowed;
}

/**
 * Server-side guard for sensitive operations. Throws with an error carrying a
 * statusCode so route handlers / server actions can respond 401/403.
 */
export async function requirePermission(
  input: AuthorizeInput
): Promise<AuthorizationResult> {
  const result = await authorize(input);
  if (!result.allowed) {
    const err = new Error(
      result.reason ?? 'Forbidden: you do not have the required capability.'
    ) as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }
  return result;
}

/** Verify the actor is an active member of the organization. */
export async function requireOrganizationAccess(
  actor: AuthorizationActor,
  organizationId: string
): Promise<{ organizationId: string; role: OrganizationRole }> {
  const memberships = await getMemberships(actor.userId);
  const membership = memberships.find(
    (m) => m.organizationId === organizationId && m.status === 'ACTIVE'
  );
  if (!membership) {
    const err = new Error('Forbidden: you are not an active member of this organization.') as Error & {
      statusCode: number;
    };
    err.statusCode = 403;
    throw err;
  }
  return { organizationId: membership.organizationId, role: membership.role };
}

/** Verify actor owns the resource (SELF scope) or is founder. */
export function requireOwnership(
  actor: AuthorizationActor,
  resourceOwnerUserId: string
): void {
  if (actor.roles.includes('FOUNDER_ADMIN')) return;
  if (actor.userId !== resourceOwnerUserId) {
    const err = new Error('Forbidden: you do not own this resource.') as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }
}
