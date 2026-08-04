import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import { adjustAccountBalance } from '@/lib/economy/service';

export const dynamic = 'force-dynamic';

const AdjustmentSchema = z.object({
  accountOwnerId: z.string().uuid('Invalid account owner UUID'),
  amount: z.number().int('Amount must be an integer'),
  reason: z.string().min(1, 'Reason is required'),
});

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    // Founder-only governance mutation (not delegable).
    try {
      await requirePermission({ actor: identity, capability: CAPABILITIES.ECONOMY_ADJUST });
    } catch {
      return NextResponse.json(
        { success: false, statusCode: 403, message: 'Forbidden: economy.adjust is founder-only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = AdjustmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          details: parsed.error.errors.map((err) => ({ field: err.path.join('.'), issue: err.message })),
        },
        { status: 400 }
      );
    }

    const { accountOwnerId, amount, reason } = parsed.data;

    const result = await adjustAccountBalance({
      accountOwnerId,
      actorUserId: identity.userId,
      amount,
      reason,
      // Deterministic idempotency key: identical retries of the same founder
      // adjustment dedupe (unique DB constraint), while distinct adjustments
      // (different amount/reason) always apply.
      idempotencyKey: `adjustment:${accountOwnerId}:${amount}:${reason.trim().toLowerCase()}`,
    });

    return NextResponse.json({
      success: true,
      statusCode: 201,
      message: result.duplicate ? 'Adjustment already applied' : 'Economic adjustment applied',
      data: {
        transactionId: result.transaction.id,
        accountOwnerId,
        amount,
        reason,
        status: result.transaction.status,
        duplicate: result.duplicate,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, statusCode: 500, message: error?.message ?? 'Internal server error' },
      { status: 500 }
    );
  }
}
