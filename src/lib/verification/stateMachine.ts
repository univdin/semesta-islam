/**
 * SEMESTA ISLAM — Lajnah Verification State Machine & Authorization Guards
 * Governed by docs/01_BSD.md, docs/08_SECURITY_COMPLIANCE.md & docs/10_ACCEPTANCE_CRITERIA.md
 */

import { VerificationStatus, UserRole } from '@/types';

export const VALID_VERIFICATION_TRANSITIONS: Record<VerificationStatus, VerificationStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW_LAJNAH', 'REJECTED'],
  UNDER_REVIEW_LAJNAH: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['REVOKED'],
  REJECTED: ['SUBMITTED'], // Can resubmit after revision
  REVOKED: ['SUBMITTED']
};

/**
 * Validates whether a state transition from currentStatus to targetStatus is valid
 */
export function isValidVerificationTransition(
  currentStatus: VerificationStatus,
  targetStatus: VerificationStatus
): boolean {
  const allowed = VALID_VERIFICATION_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

/**
 * Security Rule: Validates whether user role has verifier authority (LAJNAH_VERIFIER or FOUNDER_ADMIN)
 */
export function isAuthorizedVerifierRole(roles: UserRole[]): boolean {
  return roles.includes('LAJNAH_VERIFIER') || roles.includes('FOUNDER_ADMIN');
}
