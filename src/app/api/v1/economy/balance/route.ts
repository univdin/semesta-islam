import { NextResponse } from 'next/server';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';
import { getAccountLedger } from '@/lib/ledger/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json(unauthorizedIdentity(), { status: 401 });
  }

  const account = await getAccountLedger(identity.userId);

  return NextResponse.json({
    success: true,
    statusCode: 200,
    message: 'Balance projection retrieved successfully',
    data: {
      accountOwnerId: account.accountOwnerId,
      currency: 'POINT',
      balance: account.balance,
      disclaimer: 'Poin internal platform — non-tunai dan tidak dapat ditarik.',
    },
  });
}
