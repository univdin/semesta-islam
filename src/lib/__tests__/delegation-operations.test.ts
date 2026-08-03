/**
 * SEMESTA ISLAM — Delegation & Operations (Backup) Service Tests
 * Governed by MASTER_EXECUTION_PROMPT §21-22, §30-31.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CAPABILITIES } from '@/lib/auth/permissions';
import type { AuthorizationActor } from '@/lib/auth/authorization';
import { createDelegation, revokeDelegation, isDelegationActive } from '@/lib/delegations/service';
import { createBackup, requestRestore, LocalBackupProvider } from '@/lib/operations/backup';

const mocks = vi.hoisted(() => ({
  delegationCreate: vi.fn(),
  delegationFindUnique: vi.fn(),
  delegationUpdate: vi.fn(),
  delegationFindMany: vi.fn(),
  backupCreate: vi.fn(),
  backupFindUnique: vi.fn(),
  backupFindMany: vi.fn(),
  backupUpdate: vi.fn(),
  auditCreate: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    delegation: {
      create: mocks.delegationCreate,
      findUnique: mocks.delegationFindUnique,
      update: mocks.delegationUpdate,
      findMany: mocks.delegationFindMany,
    },
    backupRecord: {
      create: mocks.backupCreate,
      findUnique: mocks.backupFindUnique,
      findMany: mocks.backupFindMany,
      update: mocks.backupUpdate,
    },
    auditLog: { create: mocks.auditCreate },
  },
}));

vi.mock('@/lib/env', () => ({
  env: { NODE_ENV: 'test', APP_ENV: 'test', STORAGE_MODE: 'local' },
}));

vi.mock('@/lib/auth/authorization', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/auth/authorization')>();
  return {
    ...original,
    authorize: vi.fn(
      async ({ actor }: { actor: AuthorizationActor; capability: string }) => ({
        allowed: actor.roles.includes('FOUNDER_ADMIN'),
      })
    ),
  };
});

const founder: AuthorizationActor = { userId: 'u-founder', roles: ['FOUNDER_ADMIN'] };
const staff: AuthorizationActor = { userId: 'u-staff', roles: ['INSTITUTION_ADMIN'] };

describe('createDelegation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('allows founder to delegate explicit capabilities', async () => {
    mocks.delegationCreate.mockResolvedValue({ id: 'd1', status: 'ACTIVE' });
    mocks.auditCreate.mockResolvedValue({ id: 'a1', createdAt: new Date() });
    const d = await createDelegation(founder, {
      delegateUserId: 'u-staff',
      organizationId: 'org-1',
      capabilities: [CAPABILITIES.MEMBERS_INVITE, CAPABILITIES.BOOKINGS_MANAGE],
      reason: 'test',
    });
    expect(d.id).toBe('d1');
  });

  it('denies non-founder delegation', async () => {
    await expect(
      createDelegation(staff, {
        delegateUserId: 'u-other',
        capabilities: [CAPABILITIES.MEMBERS_INVITE],
      })
    ).rejects.toThrow(/founders|role-managers/i);
  });

  it('rejects founder-only capability in delegation', async () => {
    await expect(
      createDelegation(founder, {
        delegateUserId: 'u-staff',
        capabilities: [CAPABILITIES.SECRET_MANAGE],
      })
    ).rejects.toThrow(/founder-only/);
  });

  it('rejects ownership transfer delegation', async () => {
    await expect(
      createDelegation(founder, {
        delegateUserId: 'u-staff',
        capabilities: [CAPABILITIES.OWNERSHIP_TRANSFER],
      })
    ).rejects.toThrow(/founder-only/);
  });
});

describe('revokeDelegation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('allows the grantor to revoke', async () => {
    mocks.delegationFindUnique.mockResolvedValue({
      id: 'd1',
      grantorUserId: 'u-founder',
      status: 'ACTIVE',
    });
    mocks.delegationUpdate.mockResolvedValue({ id: 'd1', status: 'REVOKED' });
    mocks.auditCreate.mockResolvedValue({ id: 'a1', createdAt: new Date() });
    const d = await revokeDelegation(founder, 'd1');
    expect(d.status).toBe('REVOKED');
  });

  it('denies non-grantor, non-founder revocation', async () => {
    mocks.delegationFindUnique.mockResolvedValue({
      id: 'd1',
      grantorUserId: 'someone-else',
      status: 'ACTIVE',
    });
    await expect(revokeDelegation(staff, 'd1')).rejects.toThrow(/grantor|founder/);
  });
});

describe('isDelegationActive', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true for active unexpired delegation', async () => {
    mocks.delegationFindUnique.mockResolvedValue({
      id: 'd1',
      status: 'ACTIVE',
      startsAt: new Date(Date.now() - 1000),
      expiresAt: new Date(Date.now() + 1000),
    });
    expect(await isDelegationActive('d1')).toBe(true);
  });

  it('returns false for expired delegation', async () => {
    mocks.delegationFindUnique.mockResolvedValue({
      id: 'd1',
      status: 'ACTIVE',
      startsAt: new Date(Date.now() - 100000),
      expiresAt: new Date(Date.now() - 1000),
    });
    expect(await isDelegationActive('d1')).toBe(false);
  });

  it('returns false for revoked delegation', async () => {
    mocks.delegationFindUnique.mockResolvedValue({
      id: 'd1',
      status: 'REVOKED',
      startsAt: new Date(),
      expiresAt: null,
    });
    expect(await isDelegationActive('d1')).toBe(false);
  });
});

describe('backup operations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('local provider simulates upload without secrets', async () => {
    const provider = new LocalBackupProvider();
    const r = await provider.uploadSnapshot({} as never);
    expect(r.ok).toBe(true);
    expect(r.ref).toMatch(/^local:\/\//);
  });

  it('allows founder to create a backup', async () => {
    mocks.backupCreate.mockResolvedValue({ id: 'b1', status: 'UPLOADED' });
    mocks.auditCreate.mockResolvedValue({ id: 'a1', createdAt: new Date() });
    const res = await createBackup(founder);
    expect(res.record.status).toBe('UPLOADED');
    expect(res.manifest.provider).toBe('local');
    expect(res.manifest.checksum).toMatch(/^[0-9a-f]{64}$/);
  });

  it('denies staff backup creation', async () => {
    await expect(createBackup(staff)).rejects.toThrow(/forbidden/i);
  });

  it('requires founder for restore request (dry-run only)', async () => {
    mocks.backupFindUnique.mockResolvedValue({ id: 'b1', status: 'UPLOADED' });
    mocks.auditCreate.mockResolvedValue({ id: 'a1', createdAt: new Date() });
    const res = await requestRestore(founder, 'b1');
    expect(res.dryRun).toBe(true);
    expect(res.message).toMatch(/DRY-RUN/);
  });

  it('denies non-founder restore request', async () => {
    await expect(requestRestore(staff, 'b1')).rejects.toThrow(/founder/);
  });
});
