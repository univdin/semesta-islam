/**
 * SEMESTA ISLAM — Authorization Service Tests
 * Governed by MASTER_EXECUTION_PROMPT §36.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CAPABILITIES } from '@/lib/auth/permissions';
import { authorize } from '@/lib/auth/authorization';
import type { AuthorizationActor } from '@/lib/auth/authorization';
import {
  ORGANIZATION_ROLE_CAPABILITIES,
  PLATFORM_ROLE_CAPABILITIES,
} from '@/lib/auth/permissions';

const mocks = vi.hoisted(() => ({
  findMemberships: vi.fn(),
  findDelegations: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    organizationMembership: { findMany: mocks.findMemberships },
    delegation: { findMany: mocks.findDelegations },
  },
}));

function actor(userId: string, roles: AuthorizationActor['roles']): AuthorizationActor {
  return { userId, roles };
}

const FOUNDER = actor('u-founder', ['FOUNDER_ADMIN']);
const EDUCATOR = actor('u-educator', ['EDUCATOR']);
const ORG_MANAGER = actor('u-org-manager', ['INSTITUTION_ADMIN']);

describe('permissions catalog', () => {
  it('defines the canonical capability set', () => {
    expect(CAPABILITIES.MEMBERS_INVITE).toBe('members.invite');
    expect(CAPABILITIES.BACKUP_RESTORE_REQUEST).toBe('backup.restore.request');
  });

  it('maps organization roles to capabilities', () => {
    const owner = ORGANIZATION_ROLE_CAPABILITIES.ORG_OWNER;
    const member = ORGANIZATION_ROLE_CAPABILITIES.ORG_MEMBER;
    expect(owner).toContain(CAPABILITIES.MEMBERS_INVITE);
    expect(member).not.toContain(CAPABILITIES.MEMBERS_INVITE);
    expect(owner).toContain(CAPABILITIES.SETTINGS_MANAGE);
  });

  it('gives founder platform governance capabilities', () => {
    const founder = PLATFORM_ROLE_CAPABILITIES.FOUNDER_ADMIN!;
    expect(founder).toContain(CAPABILITIES.PLATFORM_CONFIGURATION);
    expect(founder).toContain(CAPABILITIES.BACKUP_CREATE);
    expect(founder).toContain(CAPABILITIES.AUDIT_VIEW);
  });
});

describe('authorize() — platform roles', () => {
  it('allows founder platform capabilities', async () => {
    const result = await authorize({ actor: FOUNDER, capability: CAPABILITIES.BACKUP_CREATE });
    expect(result.allowed).toBe(true);
  });

  it('allows founder to view audit', async () => {
    const result = await authorize({ actor: FOUNDER, capability: CAPABILITIES.AUDIT_VIEW });
    expect(result.allowed).toBe(true);
  });

  it('denies educator platform configuration', async () => {
    const result = await authorize({ actor: EDUCATOR, capability: CAPABILITIES.PLATFORM_CONFIGURATION });
    expect(result.allowed).toBe(false);
  });

  it('denies unknown capability for learner', async () => {
    const result = await authorize({
      actor: actor('u-learner', ['LEARNER']),
      capability: CAPABILITIES.SETTINGS_MANAGE,
    });
    expect(result.allowed).toBe(false);
  });
});

describe('authorize() — organization scoped', () => {
  beforeEach(() => {
    mocks.findMemberships.mockReset();
    mocks.findDelegations.mockReset();
    mocks.findDelegations.mockResolvedValue([]);
  });

  it('denies when actor has no membership in the organization', async () => {
    mocks.findMemberships.mockResolvedValue([]);
    const result = await authorize({
      actor: EDUCATOR,
      capability: CAPABILITIES.MEMBERS_VIEW,
      organizationId: 'org-1',
    });
    expect(result.allowed).toBe(false);
  });

  it('denies when membership is not ACTIVE (INVITED)', async () => {
    mocks.findMemberships.mockResolvedValue([
      { organizationId: 'org-1', role: 'ORG_ADMIN', status: 'INVITED' },
    ]);
    const result = await authorize({
      actor: ORG_MANAGER,
      capability: CAPABILITIES.MEMBERS_VIEW,
      organizationId: 'org-1',
    });
    expect(result.allowed).toBe(false);
  });

  it('denies when capability is outside the org role grant', async () => {
    mocks.findMemberships.mockResolvedValue([
      { organizationId: 'org-1', role: 'ORG_MEMBER', status: 'ACTIVE' },
    ]);
    const result = await authorize({
      actor: actor('u-member', ['INSTITUTION_ADMIN']),
      capability: CAPABILITIES.SETTINGS_MANAGE,
      organizationId: 'org-1',
    });
    expect(result.allowed).toBe(false);
  });

  it('allows ORG_OWNER to invite members', async () => {
    mocks.findMemberships.mockResolvedValue([
      { organizationId: 'org-1', role: 'ORG_OWNER', status: 'ACTIVE' },
    ]);
    const result = await authorize({
      actor: actor('u-owner', ['INSTITUTION_ADMIN']),
      capability: CAPABILITIES.MEMBERS_INVITE,
      organizationId: 'org-1',
    });
    expect(result.allowed).toBe(true);
  });

  it('allows ORG_ADMIN to view members', async () => {
    mocks.findMemberships.mockResolvedValue([
      { organizationId: 'org-1', role: 'ORG_ADMIN', status: 'ACTIVE' },
    ]);
    const result = await authorize({
      actor: ORG_MANAGER,
      capability: CAPABILITIES.MEMBERS_VIEW,
      organizationId: 'org-1',
    });
    expect(result.allowed).toBe(true);
  });

  it('gives ORG_OWNER org-scoped economy ledger visibility', async () => {
    mocks.findMemberships.mockResolvedValue([
      { organizationId: 'org-1', role: 'ORG_OWNER', status: 'ACTIVE' },
    ]);
    const result = await authorize({
      actor: actor('u-owner', ['INSTITUTION_ADMIN']),
      capability: CAPABILITIES.ECONOMY_LEDGER_VIEW,
      organizationId: 'org-1',
    });
    expect(result.allowed).toBe(true);
  });

  it('does NOT give ORG_OWNER founder-only economy mutation capability', async () => {
    mocks.findMemberships.mockResolvedValue([
      { organizationId: 'org-1', role: 'ORG_OWNER', status: 'ACTIVE' },
    ]);
    const result = await authorize({
      actor: actor('u-owner', ['INSTITUTION_ADMIN']),
      capability: CAPABILITIES.ECONOMY_ADJUST,
      organizationId: 'org-1',
    });
    expect(result.allowed).toBe(false);
  });
});

describe('authorize() — delegation', () => {
  beforeEach(() => {
    mocks.findMemberships.mockReset();
    mocks.findDelegations.mockReset();
    mocks.findMemberships.mockResolvedValue([]);
  });

  it('allows delegated capability within scope', async () => {
    mocks.findDelegations.mockResolvedValue([
      { capabilities: [CAPABILITIES.MEMBERS_INVITE], organizationId: 'org-1' },
    ]);
    const result = await authorize({
      actor: actor('u-delegate', []),
      capability: CAPABILITIES.MEMBERS_INVITE,
      organizationId: 'org-1',
    });
    expect(result.allowed).toBe(true);
  });

  it('denies delegated capability outside the scoped organization', async () => {
    mocks.findDelegations.mockResolvedValue([
      { capabilities: [CAPABILITIES.MEMBERS_INVITE], organizationId: 'org-1' },
    ]);
    const result = await authorize({
      actor: actor('u-delegate', []),
      capability: CAPABILITIES.MEMBERS_INVITE,
      organizationId: 'org-2',
    });
    expect(result.allowed).toBe(false);
  });

  it('denies when no delegation exists (fail closed)', async () => {
    mocks.findDelegations.mockResolvedValue([]);
    const result = await authorize({
      actor: actor('u-nobody', []),
      capability: CAPABILITIES.BOOKINGS_MANAGE,
    });
    expect(result.allowed).toBe(false);
  });
});

describe('authorize() — ownership (SELF)', () => {
  it('allows educator to view own bookings', async () => {
    const result = await authorize({
      actor: EDUCATOR,
      capability: CAPABILITIES.BOOKINGS_VIEW,
      ownsResource: true,
      resourceOwnerUserId: EDUCATOR.userId,
    });
    expect(result.allowed).toBe(true);
  });

  it('denies educator viewing another user’s resource', async () => {
    const result = await authorize({
      actor: EDUCATOR,
      capability: CAPABILITIES.BOOKINGS_VIEW,
      ownsResource: false,
      resourceOwnerUserId: 'someone-else',
    });
    expect(result.allowed).toBe(false);
  });
});
