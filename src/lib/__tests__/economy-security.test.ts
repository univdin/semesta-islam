/**
 * SEMESTA ISLAM — Economy & Growth Security Closure Tests
 * Verifies SEC-03/04/05/06 authorization and the economy capability/scope
 * invariants: cross-org denial, founder-only mutations, delegation boundaries,
 * SELF-scope visibility, and attribution spoofing protection.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const findMemberships = vi.fn();
  const delegations: any[] = [];
  const findDelegations = vi.fn(async ({ where }: any) => {
    const now = new Date();
    return delegations.filter((d) => {
      if (where?.delegateUserId && d.delegateUserId !== where.delegateUserId) return false;
      if (where?.status && d.status !== where.status) return false;
      if (d.startsAt && new Date(d.startsAt) > now) return false;
      if (d.expiresAt && new Date(d.expiresAt) < now) return false;
      return true;
    });
  });
  const reputationFindUnique = vi.fn();
  const reputationUpsert = vi.fn(async ({ where }: any) => ({
    userId: where.userId,
    consistencyScore: 100,
    contributionScore: 0,
    integrityScore: 100,
    derivedStanding: 'CONTRIBUTOR_INITIATE',
  }));
  const educatorFindUnique = vi.fn(async () => null);
  const xpAggregate = vi.fn();
  const attributionCreate = vi.fn();
  const delegationCreate = vi.fn();
  const auditCreate = vi.fn(async ({ data }: any) => ({ id: 'aud-1', ...data, createdAt: new Date() }));
  const getServerIdentity = vi.fn();

  return {
    findMemberships,
    delegations,
    findDelegations,
    reputationFindUnique,
    reputationUpsert,
    educatorFindUnique,
    xpAggregate,
    attributionCreate,
    delegationCreate,
    auditCreate,
    getServerIdentity,
    prisma: {
      organizationMembership: { findMany: findMemberships },
      delegation: { findMany: findDelegations, create: delegationCreate },
      reputationProfile: { findUnique: reputationFindUnique, upsert: reputationUpsert },
      educatorProfile: { findUnique: educatorFindUnique },
      xpLedger: { aggregate: xpAggregate },
      attributionRecord: { create: attributionCreate },
      auditLog: { create: auditCreate },
    },
  };
});

vi.mock('@/lib/db', () => ({ prisma: mocks.prisma }));

vi.mock('@/lib/auth/session', () => ({
  getServerIdentity: mocks.getServerIdentity,
  hasRole: (identity: any, ...roles: string[]) => roles.some((r) => identity.roles.includes(r)),
}));

import { authorize } from '@/lib/auth/authorization';
import type { AuthorizationActor } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import { createDelegation } from '@/lib/delegations/service';
import {
  getUserReputationAction,
  evaluateComplianceStateAction,
  getGrowthIntelligenceAuditAction,
  recordAttributionAction,
} from '@/app/actions/growth';

function actor(userId: string, roles: AuthorizationActor['roles']): AuthorizationActor {
  return { userId, roles };
}

const FOUNDER = actor('u-founder', ['FOUNDER_ADMIN']);
const ORG_OWNER = actor('u-owner', ['INSTITUTION_ADMIN']);
const ORG_STAFF = actor('u-staff', ['INSTITUTION_ADMIN']);
const LEARNER = actor('u-learner', ['LEARNER']);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findMemberships.mockReset();
  mocks.delegations.length = 0;
  mocks.xpAggregate.mockReset();
});

describe('economy authorization — scope & founder-only', () => {
  it('founder holds all economy capabilities', async () => {
    for (const cap of [
      CAPABILITIES.ECONOMY_TRANSACTION_VIEW,
      CAPABILITIES.ECONOMY_TRANSACTION_CREATE,
      CAPABILITIES.ECONOMY_REFUND,
      CAPABILITIES.ECONOMY_ADJUST,
      CAPABILITIES.ECONOMY_REVERSAL,
      CAPABILITIES.ECONOMY_COMMISSION_VIEW,
      CAPABILITIES.ECONOMY_LEDGER_VIEW,
    ]) {
      const result = await authorize({ actor: FOUNDER, capability: cap });
      expect(result.allowed).toBe(true);
    }
  });

  it('staff cannot perform founder-only economy mutations', async () => {
    for (const cap of [
      CAPABILITIES.ECONOMY_ADJUST,
      CAPABILITIES.ECONOMY_REVERSAL,
      CAPABILITIES.ECONOMY_REFUND,
      CAPABILITIES.ECONOMY_TRANSACTION_CREATE,
    ]) {
      const result = await authorize({ actor: ORG_STAFF, capability: cap });
      expect(result.allowed).toBe(false);
    }
  });

  it('learner cannot access another user transactions (IDOR denied)', async () => {
    const result = await authorize({
      actor: LEARNER,
      capability: CAPABILITIES.ECONOMY_TRANSACTION_VIEW,
      resourceOwnerUserId: 'u-other-user',
      ownsResource: true,
    });
    expect(result.allowed).toBe(false);
  });

  it('learner can view own transactions via SELF ownership grant', async () => {
    const result = await authorize({
      actor: LEARNER,
      capability: CAPABILITIES.ECONOMY_TRANSACTION_VIEW,
      resourceOwnerUserId: 'u-learner',
      ownsResource: true,
    });
    expect(result.allowed).toBe(true);
  });

  it('cross-org economy access is denied', async () => {
    // Actor is an ORG_ADMIN in org-a only; requesting org-b ledger view.
    mocks.findMemberships.mockResolvedValue([
      { organizationId: 'org-a', role: 'ORG_ADMIN', status: 'ACTIVE' },
    ]);
    const result = await authorize({
      actor: ORG_OWNER,
      capability: CAPABILITIES.ECONOMY_LEDGER_VIEW,
      organizationId: 'org-b',
    });
    expect(result.allowed).toBe(false);
  });

  it('org admin has org-scoped economy ledger visibility within their org', async () => {
    mocks.findMemberships.mockResolvedValue([
      { organizationId: 'org-a', role: 'ORG_ADMIN', status: 'ACTIVE' },
    ]);
    const result = await authorize({
      actor: ORG_OWNER,
      capability: CAPABILITIES.ECONOMY_LEDGER_VIEW,
      organizationId: 'org-a',
    });
    expect(result.allowed).toBe(true);
  });
});

describe('economy delegation boundaries', () => {
  it('founder-only economy capabilities cannot be delegated', async () => {
    await expect(
      createDelegation(FOUNDER, {
        delegateUserId: 'u-staff',
        capabilities: [CAPABILITIES.ECONOMY_ADJUST, CAPABILITIES.ECONOMY_REVERSAL, CAPABILITIES.ECONOMY_REFUND],
      })
    ).rejects.toThrow(/founder-only/);
    expect(mocks.delegationCreate).not.toHaveBeenCalled();
  });

  it('view/commission/ledger economy capabilities are delegable', async () => {
    mocks.delegationCreate.mockResolvedValue({ id: 'd-1' });
    await createDelegation(FOUNDER, {
      delegateUserId: 'u-staff',
      capabilities: [CAPABILITIES.ECONOMY_TRANSACTION_VIEW, CAPABILITIES.ECONOMY_COMMISSION_VIEW],
    });
    expect(mocks.delegationCreate).toHaveBeenCalled();
  });

  it('expired delegation grants nothing', async () => {
    mocks.findMemberships.mockResolvedValue([]);
    const now = Date.now();
    mocks.delegations.push({
      delegateUserId: 'u-staff',
      status: 'ACTIVE',
      startsAt: new Date(now - 1000),
      expiresAt: new Date(now - 500),
      capabilities: ['economy.transaction.view'],
      organizationId: 'org-a',
    });
    const result = await authorize({
      actor: ORG_STAFF,
      capability: CAPABILITIES.ECONOMY_TRANSACTION_VIEW,
      organizationId: 'org-a',
    });
    expect(result.allowed).toBe(false);
  });

  it('revoked delegation grants nothing', async () => {
    mocks.findMemberships.mockResolvedValue([]);
    mocks.delegations.push({
      delegateUserId: 'u-staff',
      status: 'REVOKED',
      startsAt: new Date(),
      expiresAt: null,
      capabilities: ['economy.transaction.view'],
      organizationId: 'org-a',
    });
    const result = await authorize({
      actor: ORG_STAFF,
      capability: CAPABILITIES.ECONOMY_TRANSACTION_VIEW,
      organizationId: 'org-a',
    });
    expect(result.allowed).toBe(false);
  });

  it('scoped delegation respects the organization boundary', async () => {
    mocks.findMemberships.mockResolvedValue([]);
    mocks.delegations.push({
      delegateUserId: 'u-staff',
      status: 'ACTIVE',
      startsAt: new Date(),
      expiresAt: null,
      capabilities: ['economy.transaction.view'],
      organizationId: 'org-a',
    });
    const inOrg = await authorize({
      actor: ORG_STAFF,
      capability: CAPABILITIES.ECONOMY_TRANSACTION_VIEW,
      organizationId: 'org-a',
    });
    const crossOrg = await authorize({
      actor: ORG_STAFF,
      capability: CAPABILITIES.ECONOMY_TRANSACTION_VIEW,
      organizationId: 'org-b',
    });
    expect(inOrg.allowed).toBe(true);
    expect(crossOrg.allowed).toBe(false);
  });
});

describe('SEC-03/04/05/06 — server action authorization', () => {
  it('SEC-03: unauthenticated reputation lookup is denied', async () => {
    mocks.getServerIdentity.mockResolvedValue(null);
    const res = await getUserReputationAction('u-other');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/AUTH_REQUIRED/);
  });

  it('SEC-03: arbitrary reputation lookup by a non-governance member is denied', async () => {
    mocks.getServerIdentity.mockResolvedValue({ userId: 'u-learner', roles: ['LEARNER'] });
    const res = await getUserReputationAction('u-other');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/FORBIDDEN/);
  });

  it('SEC-03: founder may look up another user reputation', async () => {
    mocks.getServerIdentity.mockResolvedValue({ userId: 'u-founder', roles: ['FOUNDER_ADMIN'] });
    mocks.xpAggregate.mockResolvedValue({ _sum: { amount: 10 }, _count: { id: 1 } });
    const res = await getUserReputationAction('u-other');
    expect(res.success).toBe(true);
    expect(res.xpBalance?.totalXp).toBe(10);
  });

  it('SEC-04: unauthenticated compliance evaluation is denied', async () => {
    mocks.getServerIdentity.mockResolvedValue(null);
    const res = await evaluateComplianceStateAction('u-other');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/AUTH_REQUIRED/);
  });

  it('SEC-04: arbitrary compliance lookup by a member is denied', async () => {
    mocks.getServerIdentity.mockResolvedValue({ userId: 'u-learner', roles: ['LEARNER'] });
    const res = await evaluateComplianceStateAction('u-other');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/FORBIDDEN/);
  });

  it('SEC-05: unauthenticated intelligence audit is denied', async () => {
    mocks.getServerIdentity.mockResolvedValue(null);
    const res = await getGrowthIntelligenceAuditAction();
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/AUTH_REQUIRED/);
  });

  it('SEC-05: non-governance role cannot view the intelligence audit', async () => {
    mocks.getServerIdentity.mockResolvedValue({ userId: 'u-learner', roles: ['LEARNER'] });
    const res = await getGrowthIntelligenceAuditAction();
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/FORBIDDEN/);
  });

  it('SEC-06: attribution never trusts a client-supplied actorUserId', async () => {
    mocks.getServerIdentity.mockResolvedValue({ userId: 'u-server-identity', roles: ['LEARNER'] });
    mocks.attributionCreate.mockResolvedValue({ id: 'attr-1' });
    const res = await recordAttributionAction({
      actorUserId: 'u-spoofed-client',
      actorType: 'MEMBER',
      landingPath: '/educator/xyz',
    });
    expect(res.success).toBe(true);
    const { actorUserId, ...rest } = mocks.attributionCreate.mock.calls[0][0].data;
    expect(actorUserId).toBe('u-server-identity');
    expect(actorUserId).not.toBe('u-spoofed-client');
  });

  it('SEC-06: anonymous attribution records null actor', async () => {
    mocks.getServerIdentity.mockResolvedValue(null);
    mocks.attributionCreate.mockResolvedValue({ id: 'attr-2' });
    const res = await recordAttributionAction({
      actorUserId: 'u-spoofed-client',
      actorType: 'ORGANIC',
      landingPath: '/',
    });
    expect(res.success).toBe(true);
    expect(mocks.attributionCreate.mock.calls[0][0].data.actorUserId).toBeUndefined();
  });
});
