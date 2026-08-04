import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';
import { spendPointsSafely } from '@/lib/economy/service';
import { getAccountLedger } from '@/lib/ledger/service';

export const dynamic = 'force-dynamic';

const SpendSchema = z.object({
  amount: z.number().int().positive('Amount must be a positive integer'),
  reason: z.string().min(3, 'Reason is required (min 3 characters)').max(300),
  idempotencyKey: z
    .string()
    .min(8, 'Idempotency key required (min 8 chars)')
    .max(200),
});

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    const body = await request.json();
    const parsed = SpendSchema.safeParse(body);
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

    const { amount, reason, idempotencyKey } = parsed.data;

    // Self-scoped: the authenticated member spends their OWN points only.
    const result = await spendPointsSafely({
      accountOwnerId: identity.userId,
      actorUserId: identity.userId,
      amount,
      reason,
      idempotencyKey: `spend:${identity.userId}:${idempotencyKey}`,
      source: 'LEARNER_SPEND',
    });

    const account = await getAccountLedger(identity.userId);

    return NextResponse.json({
      success: true,
      statusCode: 201,
      message: result.duplicate
        ? 'Poin sudah digunakan pada transaksi sebelumnya (idempotent).'
        : 'Poin internal berhasil digunakan.',
      data: {
        transactionId: result.transaction.id,
        amount: -amount,
        duplicate: result.duplicate,
        balance: account.balance.totalPoints,
        disclaimer: 'Poin internal platform — non-tunai dan tidak dapat ditarik.',
      },
    }, { status: result.duplicate ? 200 : 201 });
  } catch (error: any) {
    if (error?.message?.startsWith('INSUFFICIENT_FUNDS')) {
      return NextResponse.json(
        { success: false, statusCode: 409, message: 'Saldo poin tidak mencukupi.' },
        { status: 409 }
      );
    }
    if (error?.message?.startsWith('ECONOMY_VIOLATION')) {
      return NextResponse.json(
        { success: false, statusCode: 400, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, statusCode: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
