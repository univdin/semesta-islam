/**
 * SEMESTA ISLAM — Growth Engine & Governance Invariants Unit Tests
 * Tests append-only XP ledger idempotency, reputation separation, attribution, commission lifecycle, and Lajnah verification rules.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Seed confirmed bookings for closed-loop commission tests
const mockBookings: any[] = [
  { id: 'booking-uuid-10', status: 'CONFIRMED' },
  { id: 'booking-uuid-11', status: 'CONFIRMED' },
];

// Mock DB
vi.mock('@/lib/db', () => {
  const mockXpLedgerEntries: any[] = [];
  const mockReputationProfiles: any[] = [];
  const mockAttributionRecords: any[] = [];
  const mockCommissionLedgers: any[] = [];
  const mockEducatorProfiles: any[] = [];
  const mockUsers: any[] = [];

  return {
    prisma: {
      xpLedger: {
        findUnique: vi.fn(async ({ where }) => {
          if (where.idempotencyKey) {
            return mockXpLedgerEntries.find((e) => e.idempotencyKey === where.idempotencyKey) || null;
          }
          return null;
        }),
        create: vi.fn(async ({ data }) => {
          const entry = { id: `xp-${Date.now()}-${Math.random()}`, ...data, createdAt: new Date() };
          mockXpLedgerEntries.push(entry);
          return entry;
        }),
        aggregate: vi.fn(async ({ where }) => {
          const userEntries = mockXpLedgerEntries.filter((e) => e.userId === where.userId);
          const sum = userEntries.reduce((acc, curr) => acc + curr.amount, 0);
          return {
            _sum: { amount: sum },
            _count: { id: userEntries.length },
          };
        }),
        count: vi.fn(async ({ where }: any = {}) => {
          if (where?.userId && where?.actionType) {
            return mockXpLedgerEntries.filter(
              (e) => e.userId === where.userId && e.actionType === where.actionType
            ).length;
          }
          return mockXpLedgerEntries.length;
        }),
      },
      reputationProfile: {
        findUnique: vi.fn(async ({ where }) => {
          return mockReputationProfiles.find((p) => p.userId === where.userId) || null;
        }),
        upsert: vi.fn(async ({ where, create, update }) => {
          let profile = mockReputationProfiles.find((p) => p.userId === where.userId);
          if (profile) {
            Object.assign(profile, update);
          } else {
            profile = { id: `rep-${Date.now()}`, ...create };
            mockReputationProfiles.push(profile);
          }
          return profile;
        }),
      },
      educatorProfile: {
        findUnique: vi.fn(async ({ where }) => {
          return mockEducatorProfiles.find((e) => e.userId === where.userId) || null;
        }),
      },
      user: {
        findUnique: vi.fn(async ({ where }) => {
          if (where.id === 'admin-user-id') {
            return { id: 'admin-user-id', status: 'ACTIVE', email: 'admin@example.com', roles: [{ role: 'FOUNDER_ADMIN' }] };
          }
          return mockUsers.find((u) => u.id === where.id) || { id: where.id, status: 'ACTIVE', email: 'test@example.com', roles: [{ role: 'LEARNER' }] };
        }),
      },
      attributionRecord: {
        create: vi.fn(async ({ data }) => {
          const rec = { id: `attr-${Date.now()}`, ...data, createdAt: new Date() };
          mockAttributionRecords.push(rec);
          return rec;
        }),
        findUnique: vi.fn(async ({ where }) => {
          return mockAttributionRecords.find((a) => a.id === where.id) || null;
        }),
        count: vi.fn(async () => mockAttributionRecords.length),
      },
      bookingRequest: {
        findUnique: vi.fn(async ({ where }) => {
          return mockBookings.find((b) => b.id === where.id) || null;
        }),
      },
      commissionLedger: {
        create: vi.fn(async ({ data }) => {
          const rec = { id: `comm-${Date.now()}`, ...data, createdAt: new Date() };
          mockCommissionLedgers.push(rec);
          return rec;
        }),
        findUnique: vi.fn(async ({ where }) => {
          return mockCommissionLedgers.find((c) => c.id === where.id) || null;
        }),
        update: vi.fn(async ({ where, data }) => {
          const comm = mockCommissionLedgers.find((c) => c.id === where.id);
          if (comm) Object.assign(comm, data);
          return comm;
        }),
        count: vi.fn(async () => mockCommissionLedgers.length),
      },
      auditLog: {
        create: vi.fn(async ({ data }: any) => {
          return { id: `audit-${Date.now()}`, ...data, createdAt: new Date() };
        }),
      },
    },
  };
});

import { recordXpLedgerEntry, calculateUserNetXp } from '../growth/xp-ledger';
import { evaluateUserReputation } from '../growth/reputation-engine';
import { recordAttribution, evaluateEventQualification } from '../growth/attribution-service';
import { accrueCommission, approveCommission, settleAndDisburseCommission } from '../growth/commission-service';
import { auditGrowthSystemHealth, evaluateComplianceState, executeGovernanceDecision } from '../growth/intelligence-service';

describe('Growth & Governance Invariants', () => {
  it('enforces XP ledger idempotency (1 qualified event -> max 1 XP log)', async () => {
    const input = {
      userId: 'user-uuid-1',
      eventId: 'evt-101',
      idempotencyKey: 'idem-key-101',
      amount: 50,
      actionType: 'QUALIFIED_REFERRAL_ACTIVATION' as const,
      source: 'REFERRAL_SERVICE',
    };

    const firstCall = await recordXpLedgerEntry(input);
    expect(firstCall.success).toBe(true);
    expect(firstCall.duplicate).toBe(false);

    // Second call with same idempotency key
    const secondCall = await recordXpLedgerEntry(input);
    expect(secondCall.success).toBe(true);
    expect(secondCall.duplicate).toBe(true);

    const balance = await calculateUserNetXp('user-uuid-1');
    expect(balance.totalXp).toBe(50);
  });

  it('maintains hard distinction: XP is NOT Reputation', async () => {
    const repState = await evaluateUserReputation('user-uuid-1');
    expect(repState.totalXpSignal).toBe(50); // XP is a signal
    expect(repState.derivedStanding).toBe('CONTRIBUTOR_INITIATE');
    expect(repState.isScholarlyVerified).toBe(false); // Scholarly verification is governed by Lajnah, NOT XP!
  });

  it('evaluates multi-actor attribution and multi-factor fraud signals', async () => {
    const attr = await recordAttribution({
      actorUserId: 'referrer-uuid-99',
      actorType: 'AMBASSADOR',
      landingPath: '/discovery',
      utmSource: 'whatsapp',
    });

    // Test self-dealing fraud detection
    const selfDealingEval = await evaluateEventQualification({
      attributionId: attr.id,
      targetUserId: 'referrer-uuid-99', // Same user
      actionType: 'QUALIFIED_REFERRAL_ACTIVATION',
    });

    expect(selfDealingEval.isQualified).toBe(false);
    expect(selfDealingEval.fraudSignalsDetected).toContain('SELF_DEALING');

    // Test legitimate referral qualification
    const legitEval = await evaluateEventQualification({
      attributionId: attr.id,
      targetUserId: 'new-user-uuid-88', // Different user
      actionType: 'QUALIFIED_REFERRAL_ACTIVATION',
    });

    expect(legitEval.isQualified).toBe(true);
  });

  it('enforces multi-stage commission lifecycle (Accrual -> Approval -> Settlement)', async () => {
    const accrued = await accrueCommission({
      affiliateId: 'affiliate-uuid-1',
      bookingId: 'booking-uuid-10',
      accruedAmount: 50000,
    });
    expect(accrued.status).toBe('ACCRUED');

    const approved = await approveCommission(accrued.id);
    expect(approved.status).toBe('APPROVED');

    const paid = await settleAndDisburseCommission(accrued.id, 'payout-batch-900');
    expect(paid.status).toBe('PAID');
  });

  it('audits capability 10 observability health', async () => {
    const health = await auditGrowthSystemHealth();
    expect(health.healthStatus).toBe('HEALTHY');
    expect(health.totalXpLedgerLogs).toBeGreaterThan(0);
  });

  it('rejects invalid commission state transition (ACCRUED -> PAID directly without APPROVAL)', async () => {
    const accrued = await accrueCommission({
      affiliateId: 'affiliate-uuid-2',
      bookingId: 'booking-uuid-11',
      accruedAmount: 75000,
    });
    expect(accrued.status).toBe('ACCRUED');

    // Attempting direct settlement/payout on ACCRUED status MUST throw error
    await expect(settleAndDisburseCommission(accrued.id, 'payout-invalid-batch')).rejects.toThrow(
      'Commission must be APPROVED before settlement and payout.'
    );
  });

  it('rejects negative XP amount for non-reversal action types', async () => {
    const invalidInput = {
      userId: 'user-uuid-99',
      eventId: 'evt-bad',
      idempotencyKey: 'idem-bad',
      amount: -100, // Invalid negative amount for non-reversal
      actionType: 'QUALIFIED_VISIT' as const,
      source: 'TEST',
    };

    await expect(recordXpLedgerEntry(invalidInput)).rejects.toThrow(
      'CONSTITUTION_VIOLATION: Non-reversal XP amount must be positive.'
    );
  });

  it('rejects qualification for non-existent attribution records', async () => {
    const result = await evaluateEventQualification({
      attributionId: 'non-existent-attr-id',
      targetUserId: 'user-uuid-1',
      actionType: 'QUALIFIED_VISIT',
    });

    expect(result.isQualified).toBe(false);
    expect(result.reason).toContain('Attribution record does not exist');
  });

  it('rejects commission accrual on a non-CONFIRMED booking (closed-loop commerce, D4)', async () => {
    const pendingBookingId = 'booking-pending-cc';
    mockBookings.push({ id: pendingBookingId, status: 'PENDING' });

    await expect(
      accrueCommission({
        affiliateId: 'affiliate-uuid-3',
        bookingId: pendingBookingId,
        accruedAmount: 25000,
      })
    ).rejects.toThrow(
      'CONSTITUTION_VIOLATION: Commission may only accrue on a CONFIRMED booking (closed-loop commerce).'
    );
  });

  it('evaluates compliance state and executes role-authorized governance actions (CAP-10)', async () => {
    const compliance = await evaluateComplianceState('user-uuid-1');
    expect(compliance.userId).toBe('user-uuid-1');
    expect(compliance.decisionState).toBe('NORMAL');

    const cleanCompliance = await evaluateComplianceState('clean-user-uuid-99');
    expect(cleanCompliance.decisionState).toBe('NORMAL');

    // Test unauthorized actor execution (should fail)
    await expect(
      executeGovernanceDecision({
        targetUserId: 'user-uuid-1',
        actorUserId: 'unauthorized-user-id', // Learner / non-admin
        decision: 'SUSPENDED',
        reason: 'Fraud suspected',
      })
    ).rejects.toThrow('AUTHORIZATION_ERROR');

    // Test authorized actor execution (should succeed, create reversal entry & audit log)
    const authorizedResult = await executeGovernanceDecision({
      targetUserId: 'user-uuid-1',
      actorUserId: 'admin-user-id', // Authorized FOUNDER_ADMIN
      decision: 'RESTRICTED',
      reason: 'Fraud signals detected',
      reverseXpAmount: 20,
    });

    expect(authorizedResult.success).toBe(true);
    expect(authorizedResult.decision).toBe('RESTRICTED');
    expect(authorizedResult.auditRecordId).toBeDefined();
    expect(authorizedResult.xpReversalEntry?.amount).toBe(-20);
  });
});
