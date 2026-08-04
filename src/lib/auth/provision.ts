/**
 * SEMESTA ISLAM — Supabase Identity Provisioning
 * Governed by docs/08_SECURITY_COMPLIANCE.md & DECISION-06/07.
 *
 * Supabase is the authentication boundary; the local `users` + `role_assignments`
 * tables are the authorization boundary. A successfully authenticated Supabase
 * user MUST be provisioned locally before `getServerIdentity()` can resolve
 * them (see session.ts). Provisioning is idempotent: re-login is a no-op.
 */

import { prisma } from '@/lib/db';
import { persistAuditEvent } from '@/lib/audit/service';

export interface ProvisionUserInput {
  email: string;
  fullName?: string | null;
  source: 'oauth' | 'email_password';
}

export async function provisionUser(
  input: ProvisionUserInput
): Promise<{ userId: string; created: boolean }> {
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error('Email is required to provision a user.');

  let user = await prisma.user.findUnique({ where: { email } });
  let created = false;
  if (!user) {
    user = await prisma.user.create({ data: { email } });
    created = true;
  }

  // Every locally-provisioned identity starts as a LEARNER. Elevated roles
  // (EDUCATOR, LAJNAH_VERIFIER, FOUNDER_ADMIN, org roles) are assigned only
  // through governance flows (verification, delegation, seed, or org invites).
  await prisma.roleAssignment.upsert({
    where: { userId_role: { userId: user.id, role: 'LEARNER' } },
    update: {},
    create: { userId: user.id, role: 'LEARNER' },
  });

  if (input.fullName?.trim()) {
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: { fullName: input.fullName.trim() },
      create: { userId: user.id, fullName: input.fullName.trim() },
    });
  }

  if (created) {
    await persistAuditEvent({
      actorUserId: user.id,
      actionType: 'USER_PROVISIONED',
      entityAffected: 'users',
      entityId: user.id,
      metadata: { source: input.source, email },
    });
  }

  return { userId: user.id, created };
}
