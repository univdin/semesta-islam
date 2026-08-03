/**
 * SEMESTA ISLAM — Idempotent Production Bootstrap Seed
 * Governed by MASTER_PARALLEL_EXECUTION_DIRECTIVE v3.0 §10.
 *
 * SAFETY: This seed is NON-DESTRUCTIVE. It only upserts the minimum platform
 * bootstrap records (founder identity + role) and NEVER calls deleteMany().
 * It is safe to run repeatedly in production.
 *
 * The founder identity is read from validated environment variables
 * (BOOTSTRAP_FOUNDER_EMAIL / BOOTSTRAP_FOUNDER_NAME) via src/lib/env.ts.
 * If BOOTSTRAP_FOUNDER_EMAIL is unset, the seed exits gracefully (no-op).
 */

const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const BootstrapSchema = z.object({
  BOOTSTRAP_FOUNDER_EMAIL: z.string().email().optional(),
  BOOTSTRAP_FOUNDER_NAME: z.string().min(1).optional(),
});

function resolveFounder() {
  const parsed = BootstrapSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('[seed:production] Invalid bootstrap env:', parsed.error.message);
    return null;
  }
  const { BOOTSTRAP_FOUNDER_EMAIL, BOOTSTRAP_FOUNDER_NAME } = parsed.data;
  if (!BOOTSTRAP_FOUNDER_EMAIL) {
    console.log('[seed:production] BOOTSTRAP_FOUNDER_EMAIL unset — nothing to bootstrap. Exiting.');
    return null;
  }
  return {
    email: BOOTSTRAP_FOUNDER_EMAIL.toLowerCase(),
    name: BOOTSTRAP_FOUNDER_NAME ?? 'Founder SEMESTA ISLAM',
  };
}

async function main() {
  const founder = resolveFounder();
  if (!founder) return;

  // Idempotent: match on the canonical email; never recreate.
  const user = await prisma.user.upsert({
    where: { email: founder.email },
    update: {},
    create: { email: founder.email },
  });

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      fullName: founder.name,
      locationCity: 'Jakarta',
    },
  });

  const existingRole = await prisma.roleAssignment.findFirst({
    where: { userId: user.id, role: 'FOUNDER_ADMIN' },
  });
  if (!existingRole) {
    await prisma.roleAssignment.create({ data: { userId: user.id, role: 'FOUNDER_ADMIN' } });
  }

  console.log(
    `[seed:production] Bootstrap complete: founder ${founder.email} (FOUNDER_ADMIN) is ensured.`
  );
}

main()
  .catch((e) => {
    console.error('[seed:production] Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
