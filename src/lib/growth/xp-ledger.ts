/**
 * SEMESTA ISLAM — Append-Only XP Ledger Service
 * Governed by docs/plan/GROWTH_CONSTITUTION.md & docs/plan/MASTER_GROWTH_PLAN.md
 *
 * MANDATORY CONSTITUTIONAL INVARIANTS:
 * 1. XP is a recognition score signal, NOT reputation itself.
 * 2. XP MUST be stored in an append-only ledger (No raw scalar mutations like user.totalXp += N).
 * 3. Idempotency Guarantee: 1 qualified event -> Max 1 reward log.
 * 4. Raw activity (clicks, pageviews, raw shares) MUST NOT yield XP.
 */

import { prisma } from '@/lib/db';
import { XpActionType } from '@prisma/client';

export interface RecordXpInput {
  userId: string;
  eventId: string;
  idempotencyKey: string;
  amount: number;
  actionType: XpActionType;
  source: string;
  reference?: string;
}

export interface UserXpBalance {
  userId: string;
  totalXp: number;
  entriesCount: number;
}

/**
 * Records a qualified XP recognition entry into the append-only ledger.
 * Returns existing record if idempotencyKey has already been processed.
 */
export async function recordXpLedgerEntry(input: RecordXpInput) {
  if (input.amount <= 0 && input.actionType !== 'REVERSAL_FRAUD') {
    throw new Error('CONSTITUTION_VIOLATION: Non-reversal XP amount must be positive.');
  }

  // Idempotency check: Ensure 1 qualified event generates at most 1 ledger entry
  const existing = await prisma.xpLedger.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });

  if (existing) {
    return {
      success: true,
      duplicate: true,
      entry: existing,
    };
  }

  // Transactionally insert append-only entry
  const entry = await prisma.xpLedger.create({
    data: {
      userId: input.userId,
      eventId: input.eventId,
      idempotencyKey: input.idempotencyKey,
      amount: input.amount,
      actionType: input.actionType,
      source: input.source,
      reference: input.reference,
    },
  });

  return {
    success: true,
    duplicate: false,
    entry,
  };
}

/**
 * Calculates deterministic net total XP by summing append-only ledger logs.
 */
export async function calculateUserNetXp(userId: string): Promise<UserXpBalance> {
  const aggregate = await prisma.xpLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
    _count: { id: true },
  });

  return {
    userId,
    totalXp: aggregate._sum.amount ?? 0,
    entriesCount: aggregate._count.id,
  };
}
