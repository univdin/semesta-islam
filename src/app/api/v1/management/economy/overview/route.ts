import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import { getEconomyOverview } from '@/lib/economy/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    // Founder observe; delegated viewers may hold economy.transaction.view.
    try {
      await requirePermission({ actor: identity, capability: CAPABILITIES.ECONOMY_TRANSACTION_VIEW });
    } catch {
      return NextResponse.json(
        { success: false, statusCode: 403, message: 'Forbidden: economy monitoring requires economy.transaction.view.' },
        { status: 403 }
      );
    }

    const overview = await getEconomyOverview(identity.userId);

    // Commission summary — only when the caller holds economy.commission.view.
    const canViewCommissions = identity.roles.includes('FOUNDER_ADMIN');
    const commissionSummary = canViewCommissions
      ? await prisma.commissionLedger.groupBy({
          by: ['status'],
          _count: { _all: true },
          _sum: { accruedAmount: true },
        })
      : null;

    const paymentProvider = 'SIMULATED_INTERNAL';

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: 'Economy overview retrieved successfully',
      data: {
        overview,
        payment: { provider: paymentProvider, mode: 'SIMULATED_INTERNAL' },
        commissions: commissionSummary,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, statusCode: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
