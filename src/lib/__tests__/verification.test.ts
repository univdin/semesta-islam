/**
 * SEMESTA ISLAM — Offline Verification, Audit & Ledger Contract Test Suite
 * Governed by Phase 4/5 Hardening Gate & docs/10_ACCEPTANCE_CRITERIA.md
 */

import { describe, it, expect } from 'vitest';
import { isValidSha256, calculateSha256 } from '@/lib/security/documents';
import { isValidVerificationTransition, isAuthorizedVerifierRole } from '@/lib/verification/stateMachine';
import { VerificationSubmitSchema } from '@/lib/validations';
import { createAuditEvent } from '@/lib/audit/service';
import { getPlatformCommissionPercentage, reconcileLedgerEntries } from '@/lib/ledger/service';

const validHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const invalidHash = 'not-a-valid-sha256-hash';

describe('SHA-256 Document Fingerprint', () => {
  it('accepts a valid SHA-256 hex string', () => {
    expect(isValidSha256(validHash)).toBe(true);
  });

  it('rejects an invalid SHA-256 string', () => {
    expect(isValidSha256(invalidHash)).toBe(false);
  });

  it('produces identical fingerprints for identical bytes', async () => {
    const buffer = new TextEncoder().encode('SEMESTA_ISLAM_TEST_DOCUMENT').buffer;
    const hash1 = await calculateSha256(buffer);
    const hash2 = await calculateSha256(buffer);
    expect(hash1).toBe(hash2);
  });

  it('produces a hash that matches the valid hex format', async () => {
    const buffer = new TextEncoder().encode('SEMESTA_ISLAM_TEST_DOCUMENT').buffer;
    const hash = await calculateSha256(buffer);
    expect(isValidSha256(hash)).toBe(true);
  });
});

describe('Lajnah Verification State Machine', () => {
  it('allows SUBMITTED -> UNDER_REVIEW_LAJNAH', () => {
    expect(isValidVerificationTransition('SUBMITTED', 'UNDER_REVIEW_LAJNAH')).toBe(true);
  });

  it('allows UNDER_REVIEW_LAJNAH -> VERIFIED', () => {
    expect(isValidVerificationTransition('UNDER_REVIEW_LAJNAH', 'VERIFIED')).toBe(true);
  });

  it('allows UNDER_REVIEW_LAJNAH -> REJECTED', () => {
    expect(isValidVerificationTransition('UNDER_REVIEW_LAJNAH', 'REJECTED')).toBe(true);
  });

  it('allows resubmission REJECTED -> SUBMITTED', () => {
    expect(isValidVerificationTransition('REJECTED', 'SUBMITTED')).toBe(true);
  });

  it('rejects direct transition SUBMITTED -> VERIFIED', () => {
    expect(isValidVerificationTransition('SUBMITTED', 'VERIFIED')).toBe(false);
  });
});

describe('Lajnah Verifier Role Authorization', () => {
  it('authorizes LAJNAH_VERIFIER', () => {
    expect(isAuthorizedVerifierRole(['LAJNAH_VERIFIER'])).toBe(true);
  });

  it('authorizes FOUNDER_ADMIN', () => {
    expect(isAuthorizedVerifierRole(['FOUNDER_ADMIN'])).toBe(true);
  });

  it('rejects LEARNER from verification review', () => {
    expect(isAuthorizedVerifierRole(['LEARNER'])).toBe(false);
  });
});

describe('Zod Verification Submission Schema', () => {
  it('parses a valid submission payload', () => {
    const result = VerificationSubmitSchema.safeParse({
      educatorId: '00000000-0000-0000-0000-000000000001',
      ktpNumber: '3171012345678901',
      ktpDocumentUrl: 'https://storage.supabase.co/ktp.pdf',
      ijazahDocumentUrl: 'https://storage.supabase.co/ijazah.pdf',
      ijazahSha256Hash: validHash,
      recommenderEmail: 'dekan@iiq.ac.id',
      recommenderInstitution: "Institut Ilmu Al-Qur'an Jakarta",
    });
    expect(result.success).toBe(true);
  });
});

describe('Audit Event Immutability & Structure', () => {
  const event = createAuditEvent({
    actorUserId: 'user-123',
    actionType: 'LAJNAH_REVIEW_APPROVED',
    entityAffected: 'verification_requests',
    entityId: 'VR-1001',
    previousState: { status: 'UNDER_REVIEW_LAJNAH' },
    newState: { status: 'VERIFIED' },
  });

  it('has an id prefixed with AUDIT-', () => {
    expect(event.id.startsWith('AUDIT-')).toBe(true);
  });

  it('preserves the actorUserId', () => {
    expect(event.actorUserId).toBe('user-123');
  });

  it('preserves the actionType', () => {
    expect(event.actionType).toBe('LAJNAH_REVIEW_APPROVED');
  });
});

describe('Ledger & Commission (DECISION-01)', () => {
  it('defaults platform commission to 0%', () => {
    expect(getPlatformCommissionPercentage()).toBe(0);
  });

  it('reconciles total points accurately (50 + 50 = 100)', () => {
    const mockEntries = [
      { accountOwnerId: 'user-123', entryType: 'LEARNER_POINT' as const, amount: 50, description: 'Booking reward' },
      { accountOwnerId: 'user-123', entryType: 'LEARNER_POINT' as const, amount: 50, description: 'Referral bonus' },
      { accountOwnerId: 'user-[#999]', entryType: 'LEARNER_POINT' as const, amount: 100, description: 'Other user' },
    ];
    const reconciled = reconcileLedgerEntries('user-123', mockEntries);
    expect(reconciled.totalPoints).toBe(100);
  });
});
