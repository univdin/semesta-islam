/**
 * SEMESTA ISLAM — Commercial Commission Lifecycle Engine
 * Governed by docs/plan/GROWTH_CONSTITUTION.md & docs/plan/MASTER_GROWTH_PLAN.md
 *
 * COMMERCIAL LAWS:
 * 1. Lifecycle: Conversion -> Commission Accrual -> Approval -> Settlement -> Payout.
 * 2. Booking Paid != Commission Paid.
 * 3. Commission data MUST remain strictly separate from XP.
 * 4. Payouts require explicit approval and settlement steps.
 */

import { prisma } from '@/lib/db';
import { CommissionStatus } from '@prisma/client';

export interface AccrueCommissionInput {
  affiliateId: string;
  bookingId: string;
  accruedAmount: number;
}

/**
 * Stage 1: Accrues a pending commission when a qualified commercial conversion occurs.
 */
export async function accrueCommission(input: AccrueCommissionInput) {
  if (input.accruedAmount <= 0) {
    throw new Error('CONSTITUTION_VIOLATION: Commission accrued amount must be positive.');
  }

  // Check if booking exists
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: input.bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found for commission accrual.');
  }

  if (booking.status !== 'CONFIRMED') {
    throw new Error('CONSTITUTION_VIOLATION: Commission may only accrue on a CONFIRMED booking (closed-loop commerce).');
  }

  return await prisma.commissionLedger.create({
    data: {
      affiliateId: input.affiliateId,
      bookingId: input.bookingId,
      accruedAmount: input.accruedAmount,
      status: CommissionStatus.ACCRUED,
    },
  });
}

/**
 * Stage 2: Governance approval of accrued commission after refund window.
 */
export async function approveCommission(commissionId: string, approvedAmount?: number) {
  const ledger = await prisma.commissionLedger.findUnique({
    where: { id: commissionId },
  });

  if (!ledger || ledger.status !== CommissionStatus.ACCRUED) {
    throw new Error('Commission must be in ACCRUED status to be approved.');
  }

  return await prisma.commissionLedger.update({
    where: { id: commissionId },
    data: {
      status: CommissionStatus.APPROVED,
      approvedAmount: approvedAmount ?? ledger.accruedAmount,
    },
  });
}

/**
 * Stage 3 & 4: Settlement batch assignment & Payout disbursement.
 */
export async function settleAndDisburseCommission(commissionId: string, payoutId: string) {
  const ledger = await prisma.commissionLedger.findUnique({
    where: { id: commissionId },
  });

  if (!ledger || ledger.status !== CommissionStatus.APPROVED) {
    throw new Error('Commission must be APPROVED before settlement and payout.');
  }

  return await prisma.commissionLedger.update({
    where: { id: commissionId },
    data: {
      status: CommissionStatus.PAID,
      payoutId,
    },
  });
}
