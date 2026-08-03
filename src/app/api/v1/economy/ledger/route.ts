import { NextResponse } from 'next/server';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';
import { getAccountLedger } from '@/lib/ledger/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json(unauthorizedIdentity(), { status: 401 });
  }

  // SELF-scoped: only the authenticated member's own append-only ledger.
  const account = await getAccountLedger(identity.userId);

  return NextResponse.json({
    success: true,
    statusCode: 200,
    message: 'Ledger entries retrieved successfully',
    data: {
      accountOwnerId: account.accountOwnerId,
      balance: account.balance,
      entries: account.entries,
    },
  });
}
