/**
 * SEMESTA ISLAM — Audit Trail & Event Logging Service
 * Governed by docs/08_SECURITY_COMPLIANCE.md & docs/03_ERD.md
 */

export interface AuditEventPayload {
  actorUserId: string;
  actionType: string;
  entityAffected: string;
  entityId: string;
  previousState?: any;
  newState?: any;
  metadata?: Record<string, any>;
}

export interface AuditEventRecord extends AuditEventPayload {
  id: string;
  createdAt: string;
}

/**
 * Construct an immutable audit log record for state-changing operations
 */
export function createAuditEvent(payload: AuditEventPayload): AuditEventRecord {
  return {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorUserId: payload.actorUserId,
    actionType: payload.actionType,
    entityAffected: payload.entityAffected,
    entityId: payload.entityId,
    previousState: payload.previousState || null,
    newState: payload.newState || null,
    metadata: payload.metadata || {},
    createdAt: new Date().toISOString(),
  };
}

/**
 * Persists an audit event to the AuditLog table.
 * entityId is stored in the dedicated entity_id column (SEC-12) AND mirrored
 * inside the JSON metadata for backward compatibility with existing readers.
 *
 * When `tx` is provided the audit row is created inside that database
 * transaction, so economic mutations can be audited atomically.
 */
export async function persistAuditEvent(
  payload: AuditEventPayload,
  tx?: { auditLog: { create: (args: { data: any }) => Promise<{ id: string; createdAt: Date }> } }
): Promise<{ id: string; createdAt: string }> {
  const { prisma } = await import('@/lib/db');
  const client = tx ?? prisma;

  const record = await client.auditLog.create({
    data: {
      actorUserId: payload.actorUserId,
      actionType: payload.actionType,
      entityAffected: payload.entityAffected,
      entityId: payload.entityId ?? null,
      metadata: {
        entityId: payload.entityId,
        previousState: payload.previousState ?? null,
        newState: payload.newState ?? null,
        ...(payload.metadata ?? {}),
      },
    },
  });

  return { id: record.id, createdAt: record.createdAt.toISOString() };
}
