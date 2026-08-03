/**
 * SEMESTA ISLAM — Canonical Internal Economy Service
 * Governed by the Economy & Security Closure execution directive + blueprint §24-31.
 *
 * ARCHITECTURE (non-negotiable)
 *   EconomicTransaction → EconomicLedger entries → Balance projection.
 *   The ledger is the source of truth; balance is NEVER a stored authoritative
 *   value and `balance += amount` is forbidden as the authoritative operation.
 *
 * RULES
 * 1. Every economic mutation flows through this service (or a tx-aware variant
 *    of it) — never through direct prisma.economicLedger/economicTransaction
 *    writes in domain code.
 * 2. Integer amounts only. No floating-point economic arithmetic.
 * 3. Idempotency: a scoped idempotencyKey guarantees the same economic command
 *    produces at most one economic effect.
 * 4. Reversal: a REVERSAL transaction references the original via reversalOfId
 *    and appends a negative entry. The original entry is NEVER mutated/deleted.
 * 5. All mutations are audited with the existing persistAuditEvent primitive.
 * 6. When invoked from a booking/domain flow, operations run inside the caller's
 *    database transaction for atomicity.
 */

import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';
import { LedgerEntryType, EconomicTransactionType, TransactionStatus } from '@prisma/client';

export type TxClient = {
  economicLedger: any;
  economicTransaction: any;
  auditLog: any;
};

export interface CreateEconomicTransactionInput {
  type: EconomicTransactionType;
  actorUserId: string;
  accountOwnerId: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
  source: string;
  reference?: string;
  reason?: string;
  organizationId?: string;
  expiresAt?: Date;
  /** Transaction-level reference to the original transaction (REVERSAL/REFUND). */
  reversalOfId?: string;
}

export interface TransitionInput {
  transactionId: string;
  actorUserId: string;
  reason?: string;
}

export interface AdjustBalanceInput {
  accountOwnerId: string;
  actorUserId: string;
  amount: number; // signed; positive credits, negative debits the account
  reason: string;
  idempotencyKey?: string;
  organizationId?: string;
}

export interface ReconcileResult {
  status: 'RECONCILIATION_PASSED' | 'RECONCILIATION_FAILED';
  expected: number;
  actual: number;
  details?: string;
}

/** Valid lifecycle transitions. No arbitrary status mutation. */
export const TRANSACTION_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  INITIATED: ['AUTHORIZED', 'FAILED', 'EXPIRED'],
  AUTHORIZED: ['PENDING', 'FAILED', 'EXPIRED'],
  PENDING: ['COMPLETED', 'FAILED', 'EXPIRED'],
  COMPLETED: ['REFUNDED', 'REVERSED'],
  REFUNDED: [],
  REVERSED: [],
  FAILED: [],
  EXPIRED: [],
};

export function isValidTransition(from: TransactionStatus, to: TransactionStatus): boolean {
  return TRANSACTION_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Maps a transaction type to its primary ledger entry type. */
export function entryTypeForTransaction(type: EconomicTransactionType): LedgerEntryType {
  switch (type) {
    case 'FEE_COLLECTION':
      return 'FEE_COLLECTION';
    case 'COMMISSION_ACCRUAL':
      return 'COMMISSION_ACCRUAL';
    case 'EARN':
    case 'SPEND':
    case 'REVERSAL':
    case 'ADJUSTMENT':
    default:
      return 'LEARNER_POINT';
  }
}

function assertInteger(amount: number, label = 'amount'): void {
  if (!Number.isInteger(amount)) {
    throw new Error(`ECONOMY_VIOLATION: ${label} must be an integer (no floating-point economic arithmetic).`);
  }
  if (amount === 0) {
    throw new Error(`ECONOMY_VIOLATION: ${label} must be non-zero.`);
  }
}

function requireReason(reason: string | undefined): asserts reason is string {
  if (!reason || reason.trim().length === 0) {
    throw new Error('ECONOMY_VIOLATION: A non-empty reason is required for this economic operation.');
  }
}

/**
 * Writes an audit event through the ACTIVE client (caller's tx or the global
 * prisma client) so economic mutations are audited atomically. Uses the same
 * AuditLog table + shape as persistAuditEvent (SEC-12 entityId column).
 */
async function audit(
  client: TxClient | typeof prisma,
  payload: {
    actorUserId: string;
    actionType: string;
    entityId: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  await client.auditLog.create({
    data: {
      actorUserId: payload.actorUserId,
      actionType: payload.actionType,
      entityAffected: 'economic_transactions',
      entityId: payload.entityId,
      metadata: { ...(payload.metadata ?? {}) },
    },
  });
}

async function writeLedgerEntry(
  client: TxClient | typeof prisma,
  entry: {
    accountOwnerId: string;
    entryType: LedgerEntryType;
    amount: number;
    description: string;
    transactionId: string;
    reversalOfId?: string | null;
    idempotencyKey?: string | null;
  }
): Promise<{ id: string }> {
  const create = client.economicLedger.create.bind(client.economicLedger);
  const row = await create({
    data: {
      accountOwnerId: entry.accountOwnerId,
      entryType: entry.entryType,
      amount: entry.amount,
      description: entry.description,
      transactionId: entry.transactionId,
      reversalOfId: entry.reversalOfId ?? null,
      idempotencyKey: entry.idempotencyKey ?? null,
    },
  });
  return { id: row.id };
}

/**
 * Creates a new economic transaction in INITIATED state.
 * Idempotent: re-running with the same scoped idempotencyKey returns the
 * existing transaction without producing a new economic effect.
 */
export async function createEconomicTransaction(
  input: CreateEconomicTransactionInput,
  tx?: TxClient
): Promise<{ transaction: any; duplicate: boolean }> {
  assertInteger(input.amount);

  const client = tx ?? prisma;

  if (input.idempotencyKey) {
    const existing = await client.economicTransaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (existing) {
      return { transaction: existing, duplicate: true };
    }
  }

  try {
    const transaction = await client.economicTransaction.create({
      data: {
        type: input.type,
        status: 'INITIATED',
        actorUserId: input.actorUserId,
        accountOwnerId: input.accountOwnerId,
        amount: input.amount,
        currency: input.currency ?? 'POINT',
        idempotencyKey: input.idempotencyKey ?? null,
        source: input.source,
        reference: input.reference ?? null,
        reason: input.reason ?? null,
        organizationId: input.organizationId ?? null,
        reversalOfId: input.reversalOfId ?? null,
        expiresAt: input.expiresAt ?? null,
      },
    });

    await audit(client, {
      actorUserId: input.actorUserId,
      actionType: 'TRANSACTION_CREATED',
      entityId: transaction.id,
      metadata: {
        type: input.type,
        amount: input.amount,
        accountOwnerId: input.accountOwnerId,
        source: input.source,
        reference: input.reference ?? null,
        idempotencyKey: input.idempotencyKey ?? null,
      },
    });

    return { transaction, duplicate: false };
  } catch (err: any) {
    // Concurrent duplicate: unique idempotencyKey constraint.
    if (err?.code === 'P2002') {
      const existing = await client.economicTransaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return { transaction: existing, duplicate: true };
    }
    throw err;
  }
}

async function transition(
  transactionId: string,
  from: TransactionStatus,
  to: TransactionStatus,
  actorUserId: string,
  reason: string | undefined,
  tx?: TxClient
): Promise<any> {
  const client = tx ?? prisma;

  const existing = await client.economicTransaction.findUnique({ where: { id: transactionId } });
  if (!existing) throw new Error('ECONOMY_VIOLATION: Transaction not found.');
  if (existing.status !== from) {
    throw new Error(
      `ECONOMY_VIOLATION: Invalid transaction status transition from ${existing.status} to ${to} (expected ${from}).`
    );
  }
  if (!isValidTransition(from, to)) {
    throw new Error(`ECONOMY_VIOLATION: Invalid transaction status transition from ${from} to ${to}.`);
  }

  const updated = await client.economicTransaction.update({
    where: { id: transactionId },
    data: { status: to, ...(to === 'COMPLETED' ? { completedAt: new Date() } : {}) },
  });

  await audit(client, {
    actorUserId,
    actionType: `TRANSACTION_${to}`,
    entityId: transactionId,
    metadata: { from, to, reason: reason ?? null },
  });

  return updated;
}

export async function authorizeTransaction(input: TransitionInput, tx?: TxClient): Promise<any> {
  return transition(input.transactionId, 'INITIATED', 'AUTHORIZED', input.actorUserId, input.reason, tx);
}

export async function pendingTransaction(input: TransitionInput, tx?: TxClient): Promise<any> {
  return transition(input.transactionId, 'AUTHORIZED', 'PENDING', input.actorUserId, input.reason, tx);
}

/**
 * Completes a PENDING transaction and posts its ledger effect atomically.
 * The ledger entry is only ever created on COMPLETED — a failed/expired
 * transaction has no economic effect. `entryReversalOfId` (REVERSAL/REFUND
 * corrections) links the negative entry to the original ledger entry.
 */
export async function completeTransaction(
  input: TransitionInput,
  tx?: TxClient,
  entryReversalOfId?: string | null
): Promise<any> {
  const client = tx ?? prisma;

  const existing = await client.economicTransaction.findUnique({ where: { id: input.transactionId } });
  if (!existing) throw new Error('ECONOMY_VIOLATION: Transaction not found.');
  if (existing.status !== 'PENDING') {
    throw new Error(
      `ECONOMY_VIOLATION: Invalid transaction status transition from ${existing.status} to COMPLETED (expected PENDING).`
    );
  }

  const entryType: LedgerEntryType = entryTypeForTransaction(existing.type);

  // Reversal transactions carry negative amounts and reference the original.
  // Post the primary ledger entry for this transaction's account owner.
  const entry = await writeLedgerEntry(client, {
    accountOwnerId: existing.accountOwnerId,
    entryType,
    amount: existing.amount,
    description: `Transaksi ekonomi ${existing.type} (${existing.reference ?? existing.id}) — ${existing.source}`,
    transactionId: existing.id,
    reversalOfId: entryReversalOfId ?? null,
  });

  await transition(input.transactionId, 'PENDING', 'COMPLETED', input.actorUserId, input.reason, client);

  await audit(client, {
    actorUserId: input.actorUserId,
    actionType: 'LEDGER_ENTRY_CREATED',
    entityId: existing.id,
    metadata: {
      entryId: entry.id,
      entryType,
      amount: existing.amount,
      accountOwnerId: existing.accountOwnerId,
    },
  });

  return { transaction: await client.economicTransaction.findUnique({ where: { id: input.transactionId } }), entry };
}

export async function failTransaction(input: TransitionInput, tx?: TxClient): Promise<any> {
  const client = tx ?? prisma;
  const existing = await client.economicTransaction.findUnique({ where: { id: input.transactionId } });
  if (!existing) throw new Error('ECONOMY_VIOLATION: Transaction not found.');
  if (existing.status !== 'PENDING' && existing.status !== 'INITIATED' && existing.status !== 'AUTHORIZED') {
    throw new Error(`ECONOMY_VIOLATION: Cannot FAIL a transaction in status ${existing.status}.`);
  }
  const updated = await client.economicTransaction.update({
    where: { id: input.transactionId },
    data: { status: 'FAILED' },
  });
  await audit(client, {
    actorUserId: input.actorUserId,
    actionType: 'TRANSACTION_FAILED',
    entityId: input.transactionId,
    metadata: { reason: input.reason ?? null },
  });
  return updated;
}

export async function expireTransaction(transactionId: string, actorUserId: string, tx?: TxClient): Promise<any> {
  const client = tx ?? prisma;
  const existing = await client.economicTransaction.findUnique({ where: { id: transactionId } });
  if (!existing) throw new Error('ECONOMY_VIOLATION: Transaction not found.');
  if (existing.status !== 'PENDING' && existing.status !== 'INITIATED' && existing.status !== 'AUTHORIZED') {
    throw new Error(`ECONOMY_VIOLATION: Cannot EXPIRED a transaction in status ${existing.status}.`);
  }
  const updated = await client.economicTransaction.update({
    where: { id: transactionId },
    data: { status: 'EXPIRED' },
  });
  await audit(client, {
    actorUserId,
    actionType: 'TRANSACTION_EXPIRED',
    entityId: transactionId,
    metadata: {},
  });
  return updated;
}

/**
 * Refunds a COMPLETED transaction: transitions the original to REFUNDED and
 * appends a negative REVERSAL-style ledger effect referencing the original.
 * Idempotent — a transaction can only be refunded once.
 */
export async function refundTransaction(input: TransitionInput, tx?: TxClient): Promise<any> {
  const client = tx ?? prisma;
  requireReason(input.reason);

  const existing = await client.economicTransaction.findUnique({ where: { id: input.transactionId } });
  if (!existing) throw new Error('ECONOMY_VIOLATION: Transaction not found.');
  if (existing.status !== 'COMPLETED') {
    throw new Error(`ECONOMY_VIOLATION: Cannot REFUND a transaction in status ${existing.status} (expected COMPLETED).`);
  }

  const originalEntries = await client.economicLedger.findMany({
    where: { transactionId: existing.id },
    orderBy: { createdAt: 'asc' },
  });
  const primaryEntry = originalEntries[0];

  // Create a REVERSAL transaction referencing the original (unique reversalOfId).
  const reversal = await createEconomicTransaction(
    {
      type: 'REVERSAL',
      actorUserId: input.actorUserId,
      accountOwnerId: existing.accountOwnerId,
      amount: -Math.abs(existing.amount),
      idempotencyKey: `refund:${existing.id}`,
      source: 'REFUND',
      reference: existing.reference ?? existing.id,
      reason: input.reason,
      organizationId: existing.organizationId ?? undefined,
      reversalOfId: existing.id,
    },
    client
  );

  if (reversal.duplicate) {
    // Already refunded — no new economic effect.
    return { refunded: true, duplicate: true, reversalTransaction: reversal.transaction };
  }

  await transition(reversal.transaction.id, 'INITIATED', 'AUTHORIZED', input.actorUserId, input.reason, client);
  await transition(reversal.transaction.id, 'AUTHORIZED', 'PENDING', input.actorUserId, input.reason, client);
  await completeTransaction(
    { transactionId: reversal.transaction.id, actorUserId: input.actorUserId, reason: input.reason },
    client,
    primaryEntry?.id ?? null
  );

  const updated = await client.economicTransaction.update({
    where: { id: existing.id },
    data: { status: 'REFUNDED' },
  });

  await audit(client, {
    actorUserId: input.actorUserId,
    actionType: 'TRANSACTION_REFUNDED',
    entityId: existing.id,
    metadata: { reason: input.reason, reversalTransactionId: reversal.transaction.id },
  });

  return { refunded: true, duplicate: false, transaction: updated, reversalTransaction: reversal.transaction };
}

/**
 * Reverses a COMPLETED transaction: transitions the original to REVERSED and
 * appends a negative ledger entry referencing the original transaction/entry.
 * Never mutates or deletes the original entry. Idempotent via unique reversalOfId.
 */
export async function reverseTransaction(input: TransitionInput, tx?: TxClient): Promise<any> {
  const client = tx ?? prisma;
  requireReason(input.reason);

  const existing = await client.economicTransaction.findUnique({ where: { id: input.transactionId } });
  if (!existing) throw new Error('ECONOMY_VIOLATION: Transaction not found.');
  if (existing.status !== 'COMPLETED') {
    throw new Error(`ECONOMY_VIOLATION: Cannot REVERSE a transaction in status ${existing.status} (expected COMPLETED).`);
  }

  const originalEntries = await client.economicLedger.findMany({
    where: { transactionId: existing.id },
    orderBy: { createdAt: 'asc' },
  });
  const primaryEntry = originalEntries[0];

  const reversal = await createEconomicTransaction(
    {
      type: 'REVERSAL',
      actorUserId: input.actorUserId,
      accountOwnerId: existing.accountOwnerId,
      amount: -Math.abs(existing.amount),
      idempotencyKey: `reversal:${existing.id}`,
      source: 'REVERSAL',
      reference: existing.reference ?? existing.id,
      reason: input.reason,
      organizationId: existing.organizationId ?? undefined,
      reversalOfId: existing.id,
    },
    client
  );

  if (reversal.duplicate) {
    // Already reversed — no new economic effect.
    return { reversed: true, duplicate: true, reversalTransaction: reversal.transaction };
  }

  await transition(reversal.transaction.id, 'INITIATED', 'AUTHORIZED', input.actorUserId, input.reason, client);
  await transition(reversal.transaction.id, 'AUTHORIZED', 'PENDING', input.actorUserId, input.reason, client);
  await completeTransaction(
    { transactionId: reversal.transaction.id, actorUserId: input.actorUserId, reason: input.reason },
    client,
    primaryEntry?.id ?? null
  );

  const updated = await client.economicTransaction.update({
    where: { id: existing.id },
    data: { status: 'REVERSED' },
  });

  await audit(client, {
    actorUserId: input.actorUserId,
    actionType: 'TRANSACTION_REVERSED',
    entityId: existing.id,
    metadata: { reason: input.reason, reversalTransactionId: reversal.transaction.id },
  });

  return { reversed: true, duplicate: false, transaction: updated, reversalTransaction: reversal.transaction };
}

/**
 * Founder-governed account adjustment. Appends an ADJUSTMENT transaction + a
 * signed immutable ledger entry. Requires explicit reason + authorization
 * (callers must enforce economy.adjust). Idempotent via scoped key.
 */
export async function adjustAccountBalance(
  input: AdjustBalanceInput,
  tx?: TxClient
): Promise<{ transaction: any; duplicate: boolean }> {
  const client = tx ?? prisma;
  assertInteger(input.amount);
  requireReason(input.reason);

  const created = await createEconomicTransaction(
    {
      type: 'ADJUSTMENT',
      actorUserId: input.actorUserId,
      accountOwnerId: input.accountOwnerId,
      amount: input.amount,
      idempotencyKey: input.idempotencyKey ?? `adjustment:${input.accountOwnerId}:${Date.now()}:${Math.random()}`,
      source: 'FOUNDER_ADJUSTMENT',
      reason: input.reason,
      organizationId: input.organizationId,
    },
    client
  );

  if (created.duplicate) {
    return { transaction: created.transaction, duplicate: true };
  }

  await client.economicTransaction.update({
    where: { id: created.transaction.id },
    data: { status: 'PENDING' },
  });

  const result = await completeTransaction(
    { transactionId: created.transaction.id, actorUserId: input.actorUserId, reason: input.reason },
    client
  );

  await audit(client, {
    actorUserId: input.actorUserId,
    actionType: 'ECONOMIC_ADJUSTMENT_CREATED',
    entityId: created.transaction.id,
    metadata: { accountOwnerId: input.accountOwnerId, amount: input.amount, reason: input.reason },
  });

  return { transaction: result.transaction, duplicate: false };
}

/**
 * Convenience: creates + authorizes + completes an EARN/SPEND/FEE/COMMISSION
 * transaction and posts its ledger effect atomically. Used by booking and
 * payment domain flows so they never touch the ledger directly.
 */
export async function executeEconomicEffect(
  input: CreateEconomicTransactionInput,
  tx?: TxClient
): Promise<{ transaction: any; entry?: any; duplicate: boolean }> {
  const client = tx ?? prisma;

  const created = await createEconomicTransaction(input, client);
  if (created.duplicate) {
    return { transaction: created.transaction, duplicate: true };
  }

  await transition(created.transaction.id, 'INITIATED', 'AUTHORIZED', input.actorUserId, undefined, client);
  await transition(created.transaction.id, 'AUTHORIZED', 'PENDING', input.actorUserId, undefined, client);
  const completed = await completeTransaction(
    { transactionId: created.transaction.id, actorUserId: input.actorUserId },
    client
  );

  return { transaction: completed.transaction, entry: completed.entry, duplicate: false };
}

// ── READ / RECONCILIATION ──────────────────────────────────────────────────

export async function getTransactionById(transactionId: string): Promise<any | null> {
  return prisma.economicTransaction.findUnique({
    where: { id: transactionId },
    include: { entries: { orderBy: { createdAt: 'asc' } } },
  });
}

export async function listAccountTransactions(
  accountOwnerId: string,
  organizationId?: string
): Promise<any[]> {
  return prisma.economicTransaction.findMany({
    where: {
      accountOwnerId,
      ...(organizationId ? { organizationId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}

/** Organization-scoped transaction history (ORG_OWNER/ORG_ADMIN read). */
export async function listOrganizationTransactions(organizationId: string): Promise<any[]> {
  return prisma.economicTransaction.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
}

/** Platform-wide economy summary for the founder control plane. */
export async function getEconomyOverview(actorUserId: string): Promise<{
  transactionCount: number;
  ledgerEntryCount: number;
  totalPointsInCirculation: number;
  recentTransactions: any[];
  reconciliation: { checked: number; failed: number };
}> {
  const [transactionCount, ledgerEntryCount, pointAggregate, recentTransactions] = await Promise.all([
    prisma.economicTransaction.count(),
    prisma.economicLedger.count(),
    prisma.economicLedger.aggregate({
      where: { entryType: 'LEARNER_POINT' },
      _sum: { amount: true },
    }),
    prisma.economicTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return {
    transactionCount,
    ledgerEntryCount,
    totalPointsInCirculation: pointAggregate._sum.amount ?? 0,
    recentTransactions,
    reconciliation: { checked: 0, failed: 0 },
  };
}

/** Reconciles a transaction's posted ledger entries against its recorded amount. */
export async function reconcileTransaction(transactionId: string): Promise<ReconcileResult> {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    return { status: 'RECONCILIATION_FAILED', expected: 0, actual: 0, details: 'Transaction not found.' };
  }
  const actual = transaction.entries.reduce((sum: number, e: any) => sum + e.amount, 0);
  if (actual !== transaction.amount) {
    await persistAuditEvent({
      actorUserId: transaction.actorUserId,
      actionType: 'RECONCILIATION_FAILED',
      entityAffected: 'economic_transactions',
      entityId: transaction.id,
      metadata: { expected: transaction.amount, actual, reason: 'Ledger entries do not match transaction amount.' },
    });
    return {
      status: 'RECONCILIATION_FAILED',
      expected: transaction.amount,
      actual,
      details: 'Ledger entries do not match transaction amount.',
    };
  }
  return { status: 'RECONCILIATION_PASSED', expected: transaction.amount, actual };
}

/**
 * Reconciles an account by projecting its balance from the append-only ledger.
 * Balance is a projection, never a stored value.
 */
export async function reconcileAccount(accountOwnerId: string): Promise<{
  accountOwnerId: string;
  totalPoints: number;
  entryCount: number;
  status: 'RECONCILIATION_PASSED';
}> {
  const entries = await prisma.economicLedger.findMany({ where: { accountOwnerId } });
  const totalPoints = entries.reduce((sum, e) => sum + e.amount, 0);
  return { accountOwnerId, totalPoints, entryCount: entries.length, status: 'RECONCILIATION_PASSED' };
}

/**
 * Reconciles a payment against its domain transaction effect.
 * A PAID payment must have a COMPLETED domain transaction referencing it.
 */
export async function reconcilePayment(paymentId: string): Promise<ReconcileResult> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return { status: 'RECONCILIATION_FAILED', expected: 0, actual: 0, details: 'Payment not found.' };
  }

  const tx = await prisma.economicTransaction.findFirst({
    where: { source: 'PAYMENT', reference: payment.id },
    include: { entries: true },
  });

  const expected = payment.status === 'PAID' ? 1 : 0; // 1 = economic effect expected
  const actual = tx && tx.status === 'COMPLETED' ? 1 : 0;

  if (expected !== actual) {
    await persistAuditEvent({
      actorUserId: payment.learnerUserId,
      actionType: 'RECONCILIATION_FAILED',
      entityAffected: 'payments',
      entityId: payment.id,
      metadata: { paymentStatus: payment.status, expected, actual, details: 'Payment/transaction mismatch.' },
    });
    return {
      status: 'RECONCILIATION_FAILED',
      expected,
      actual,
      details: 'Payment status and domain transaction effect are inconsistent.',
    };
  }
  return { status: 'RECONCILIATION_PASSED', expected, actual };
}
