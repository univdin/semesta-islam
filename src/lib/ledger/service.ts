/**
 * SEMESTA ISLAM — Internal Economic Ledger & Reconciliation Engine
 * Governed by docs/01_BSD.md, docs/03_ERD.md & DECISION-01
 */

import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { LedgerEntryType } from '@/types';

export interface LedgerEntryInput {
  accountOwnerId: string;
  entryType: LedgerEntryType;
  amount: number;
  description: string;
}

export interface LedgerAccountBalance {
  accountOwnerId: string;
  totalPoints: number;
  totalVoucherCredits: number;
  totalFeeCollections: number;
  totalCommissionAccruals: number;
}

/**
 * Calculates current commission percentage based on validated environment
 * configuration. DECISION-01: Default fallback is 0% (MVP Simulation) until
 * Founder approval. Reads through the central validated `env` object so the
 * value is coerced and bounded once, not re-parsed per call.
 */
export function getPlatformCommissionPercentage(): number {
  return env.PLATFORM_COMMISSION_PERCENTAGE;
}

/**
 * Reconciles array of ledger entries into deterministic account balances
 */
export function reconcileLedgerEntries(
  accountOwnerId: string,
  entries: LedgerEntryInput[]
): LedgerAccountBalance {
  const userEntries = entries.filter((e) => e.accountOwnerId === accountOwnerId);

  let totalPoints = 0;
  let totalVoucherCredits = 0;
  let totalFeeCollections = 0;
  let totalCommissionAccruals = 0;

  for (const entry of userEntries) {
    switch (entry.entryType) {
      case 'LEARNER_POINT':
        totalPoints += entry.amount;
        break;
      case 'VOUCHER_CREDIT':
        totalVoucherCredits += entry.amount;
        break;
      case 'FEE_COLLECTION':
        totalFeeCollections += entry.amount;
        break;
      case 'COMMISSION_ACCRUAL':
        totalCommissionAccruals += entry.amount;
        break;
      default:
        break;
    }
  }

  return {
    accountOwnerId,
    totalPoints,
    totalVoucherCredits,
    totalFeeCollections,
    totalCommissionAccruals,
  };
}

export interface AccountLedgerEntry {
  id: string;
  entryType: LedgerEntryType;
  amount: number;
  description: string;
  createdAt: Date;
}

export interface AccountLedger {
  accountOwnerId: string;
  balance: LedgerAccountBalance;
  entries: AccountLedgerEntry[];
}

/**
 * Fetches an account's ledger entries (newest first) and reconciles a live
 * balance using the existing reconciliation engine.
 */
export async function getAccountLedger(accountOwnerId: string): Promise<AccountLedger> {
  const rows = await prisma.economicLedger.findMany({
    where: { accountOwnerId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, entryType: true, amount: true, description: true, createdAt: true },
  });

  const entries = rows.map((row) => ({
    id: row.id,
    entryType: row.entryType as LedgerEntryType,
    amount: row.amount,
    description: row.description,
    createdAt: row.createdAt,
  }));

  const balance = reconcileLedgerEntries(
    accountOwnerId,
    entries.map((e) => ({
      accountOwnerId,
      entryType: e.entryType,
      amount: e.amount,
      description: e.description,
    }))
  );

  return { accountOwnerId, balance, entries };
}
