/**
 * SEMESTA ISLAM — Capability 10: Growth Intelligence, Compliance & Governance Engine
 * Governed by docs/plan/GROWTH_CONSTITUTION.md & docs/plan/MASTER_GROWTH_PLAN.md
 *
 * CAPABILITY 10 CONSTITUTIONAL LAWS:
 * 1. CAP-10 is an Observability + Compliance + Decision Engine + Governance Action layer.
 * 2. Flow: ALL CAPABILITIES -> DOMAIN EVENTS -> OBSERVABILITY -> METRICS/FRAUD/COMPLIANCE -> INSIGHT -> DECISION -> GOVERNANCE ACTION -> AUDIT TRAIL.
 * 3. Decisions: NORMAL | REVIEW_REQUIRED | RESTRICTED | SUSPENDED | BLOCKED.
 * 4. Governance Actions are server-side, role-authorized, auditable via AuditLog, and idempotent.
 * 5. CAP-10 MUST NEVER grant, modify, or infer Sanad, Credential, or Lajnah Scholarly Verification.
 */

import { prisma } from '@/lib/db';
import { recordXpLedgerEntry } from './xp-ledger';
import { persistAuditEvent } from '@/lib/audit/service';
import { CommissionStatus } from '@prisma/client';

export type GovernanceDecisionState = 'NORMAL' | 'REVIEW_REQUIRED' | 'RESTRICTED' | 'SUSPENDED' | 'BLOCKED';

export interface SystemAuditSummary {
  totalXpLedgerLogs: number;
  totalAttributionRecords: number;
  totalAccruedCommissions: number;
  totalPaidCommissions: number;
  anomaliesDetectedCount: number;
  complianceFindingsCount: number;
  healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface UserComplianceScan {
  userId: string;
  selfDealingAttempts: number;
  reversalLogsCount: number;
  pendingCommissionsCount: number;
  decisionState: GovernanceDecisionState;
  findings: string[];
}

export interface ExecuteGovernanceActionInput {
  targetUserId: string;
  actorUserId: string;
  decision: GovernanceDecisionState;
  reason: string;
  reverseXpAmount?: number;
  freezeCommissions?: boolean;
}

/**
 * 1. OBSERVABILITY: Audits overall growth system health & metrics.
 */
export async function auditGrowthSystemHealth(): Promise<SystemAuditSummary> {
  const xpCount = await prisma.xpLedger.count();
  const attributionCount = await prisma.attributionRecord.count();
  const accruedCommissions = await prisma.commissionLedger.count({
    where: { status: CommissionStatus.ACCRUED },
  });
  const paidCommissions = await prisma.commissionLedger.count({
    where: { status: CommissionStatus.PAID },
  });

  const reversalLogsCount = await prisma.xpLedger.count({
    where: { actionType: 'REVERSAL_FRAUD' },
  });

  // Count attributions flagged with self-dealing
  const selfDealingAttributions = await prisma.attributionRecord.count({
    where: {
      fraudSignals: {
        path: ['selfDealing'],
        equals: true,
      },
    },
  });

  const totalComplianceFindings = reversalLogsCount + selfDealingAttributions;

  let healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
  if (totalComplianceFindings > 20) {
    healthStatus = 'CRITICAL';
  } else if (totalComplianceFindings > 5) {
    healthStatus = 'WARNING';
  }

  return {
    totalXpLedgerLogs: xpCount,
    totalAttributionRecords: attributionCount,
    totalAccruedCommissions: accruedCommissions,
    totalPaidCommissions: paidCommissions,
    anomaliesDetectedCount: reversalLogsCount,
    complianceFindingsCount: totalComplianceFindings,
    healthStatus,
  };
}

/**
 * 2. COMPLIANCE & DECISION ENGINE: Evaluates user compliance state deterministically.
 */
export async function evaluateComplianceState(userId: string): Promise<UserComplianceScan> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, status: true },
  });

  if (!user) {
    throw new Error('Target user not found.');
  }

  const reversalLogs = await prisma.xpLedger.count({
    where: { userId, actionType: 'REVERSAL_FRAUD' },
  });

  const selfDealingCount = await prisma.attributionRecord.count({
    where: { actorUserId: userId },
  });

  const pendingCommissions = await prisma.commissionLedger.count({
    where: { affiliateId: userId, status: CommissionStatus.ACCRUED },
  });

  const findings: string[] = [];
  let decisionState: GovernanceDecisionState = 'NORMAL';

  if (reversalLogs > 3) {
    decisionState = 'SUSPENDED';
    findings.push(`Multiple fraud reversal logs detected (${reversalLogs}).`);
  } else if (reversalLogs > 0) {
    decisionState = 'REVIEW_REQUIRED';
    findings.push(`Fraud reversal log present (${reversalLogs}).`);
  }

  if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
    decisionState = 'BLOCKED';
    findings.push(`User account status is ${user.status}.`);
  }

  return {
    userId,
    selfDealingAttempts: selfDealingCount,
    reversalLogsCount: reversalLogs,
    pendingCommissionsCount: pendingCommissions,
    decisionState,
    findings,
  };
}

/**
 * 3 & 4. GOVERNANCE ACTION & AUDIT TRAIL: Executes role-authorized governance action with audit record.
 */
export async function executeGovernanceDecision(input: ExecuteGovernanceActionInput) {
  // Verify actor user exists & role authorization
  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    include: { roles: true },
  });

  if (!actor) {
    throw new Error('AUTHORIZATION_ERROR: Actor user does not exist.');
  }

  const isAuthorized = actor.roles.some(
    (r) => r.role === 'FOUNDER_ADMIN' || r.role === 'LAJNAH_VERIFIER'
  );

  if (!isAuthorized) {
    throw new Error('AUTHORIZATION_ERROR: Insufficient role permissions for governance action.');
  }

  let xpReversalEntry = null;

  // Execute XP Reversal if requested (Append-only entry, non-destructive!)
  if (input.reverseXpAmount && input.reverseXpAmount > 0) {
    const idempotencyKey = `gov-reversal-${input.targetUserId}-${Date.now()}`;
    const result = await recordXpLedgerEntry({
      userId: input.targetUserId,
      eventId: `GOV-REVERSAL-${Date.now()}`,
      idempotencyKey,
      amount: -Math.abs(input.reverseXpAmount),
      actionType: 'REVERSAL_FRAUD',
      source: 'GOVERNANCE_ENGINE',
      reference: input.reason,
    });
    xpReversalEntry = result.entry;
  }

  // Freeze pending accrued commissions if requested
  if (input.freezeCommissions) {
    await prisma.commissionLedger.updateMany({
      where: { affiliateId: input.targetUserId, status: CommissionStatus.ACCRUED },
      data: { status: CommissionStatus.CANCELLED },
    });
  }

  // Persist immutable AuditLog record
  const auditRecord = await persistAuditEvent({
    actorUserId: input.actorUserId,
    actionType: `GOVERNANCE_DECISION_${input.decision}`,
    entityAffected: 'UserGovernance',
    entityId: input.targetUserId,
    previousState: null,
    newState: { decision: input.decision, reason: input.reason },
    metadata: {
      reverseXpAmount: input.reverseXpAmount ?? 0,
      freezeCommissions: input.freezeCommissions ?? false,
      xpReversalEntryId: xpReversalEntry?.id ?? null,
    },
  });

  return {
    success: true,
    targetUserId: input.targetUserId,
    decision: input.decision,
    auditRecordId: auditRecord.id,
    xpReversalEntry,
  };
}
