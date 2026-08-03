/**
 * SEMESTA ISLAM — Delegation Service (Core Feature)
 * Governed by MASTER_EXECUTION_PROMPT §21-22.
 *
 * Founder delegates explicit capabilities (with optional scope + expiry) to
 * staff/co-founders. Delegates never receive founder authority implicitly.
 * Every grant/revoke creates an audit event. Default is DENY.
 */

import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';
import { CAPABILITIES, type Capability } from '@/lib/auth/permissions';
import { type AuthorizationActor } from '@/lib/auth/authorization';

export interface CreateDelegationInput {
  delegateUserId: string;
  organizationId?: string;
  capabilities: Capability[];
  reason?: string;
  expiresAt?: Date;
}

export async function createDelegation(
  actor: AuthorizationActor,
  input: CreateDelegationInput
) {
  // Founder-only (or a delegate who already holds role.system.manage).
  const founderAllowed =
    actor.roles.includes('FOUNDER_ADMIN') ||
    actor.roles.includes('ROLE_SYSTEM_MANAGE' as never);

  if (!founderAllowed) {
    const err = new Error(
      'Forbidden: only founders or role-managers may delegate capabilities.'
    ) as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }

  // Sensitive capabilities must never be delegated.
  const founderOnly: Capability[] = [
    CAPABILITIES.PLATFORM_CONFIGURATION,
    CAPABILITIES.SECURITY_CONFIGURATION,
    CAPABILITIES.FOUNDER_MANAGE,
    CAPABILITIES.SECRET_MANAGE,
    CAPABILITIES.OWNERSHIP_TRANSFER,
    // Economy governance mutations are founder-only (observability may be
    // delegated via the view/create/commission/ledger capabilities).
    CAPABILITIES.ECONOMY_REFUND,
    CAPABILITIES.ECONOMY_ADJUST,
    CAPABILITIES.ECONOMY_REVERSAL,
  ];
  for (const c of input.capabilities) {
    if (founderOnly.includes(c)) {
      const err = new Error(
        `Capability ${c} is founder-only and cannot be delegated.`
      ) as Error & { statusCode: number };
      err.statusCode = 403;
      throw err;
    }
  }

  const delegation = await prisma.delegation.create({
    data: {
      grantorUserId: actor.userId,
      delegateUserId: input.delegateUserId,
      organizationId: input.organizationId ?? null,
      capabilities: input.capabilities as unknown as object,
      reason: input.reason ?? null,
      expiresAt: input.expiresAt ?? null,
      status: 'ACTIVE',
    },
  });

  await persistAuditEvent({
    actorUserId: actor.userId,
    actionType: 'DELEGATION_GRANTED',
    entityAffected: 'delegations',
    entityId: delegation.id,
    metadata: {
      delegateUserId: input.delegateUserId,
      organizationId: input.organizationId ?? null,
      capabilities: input.capabilities,
      expiresAt: input.expiresAt?.toISOString() ?? null,
    },
  });

  return delegation;
}

export async function revokeDelegation(
  actor: AuthorizationActor,
  delegationId: string,
  reason?: string
) {
  const delegation = await prisma.delegation.findUnique({ where: { id: delegationId } });
  if (!delegation) {
    const err = new Error('Delegation not found.') as Error & { statusCode: number };
    err.statusCode = 404;
    throw err;
  }

  // Only the grantor (or a founder) may revoke.
  const allowed =
    actor.roles.includes('FOUNDER_ADMIN') || delegation.grantorUserId === actor.userId;
  if (!allowed) {
    const err = new Error(
      'Forbidden: only the grantor or a founder may revoke this delegation.'
    ) as Error & { statusCode: number };
    err.statusCode = 403;
    throw err;
  }

  const updated = await prisma.delegation.update({
    where: { id: delegationId },
    data: { status: 'REVOKED', revokedAt: new Date(), revokedBy: actor.userId },
  });

  await persistAuditEvent({
    actorUserId: actor.userId,
    actionType: 'DELEGATION_REVOKED',
    entityAffected: 'delegations',
    entityId: delegationId,
    metadata: { reason: reason ?? null },
  });

  return updated;
}

export async function listDelegationsForActor(actor: AuthorizationActor) {
  const where =
    actor.roles.includes('FOUNDER_ADMIN') && actor.roles.length > 1
      ? {} // not used; keep explicit below
      : {};
  void where;

  // Founders see all; others see what they granted or received.
  if (actor.roles.includes('FOUNDER_ADMIN')) {
    return prisma.delegation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        grantor: { select: { email: true } },
        delegate: { select: { email: true } },
      },
    });
  }

  return prisma.delegation.findMany({
    where: { OR: [{ grantorUserId: actor.userId }, { delegateUserId: actor.userId }] },
    orderBy: { createdAt: 'desc' },
    include: {
      grantor: { select: { email: true } },
      delegate: { select: { email: true } },
    },
  });
}

export async function isDelegationActive(delegationId: string): Promise<boolean> {
  const now = new Date();
  const d = await prisma.delegation.findUnique({ where: { id: delegationId } });
  if (!d || d.status !== 'ACTIVE') return false;
  if (d.startsAt > now) return false;
  if (d.expiresAt && d.expiresAt < now) return false;
  return true;
}
