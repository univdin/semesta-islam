import { NextResponse } from 'next/server';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';
import { requirePermission, requireOrganizationAccess } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import { listAccountTransactions, listOrganizationTransactions } from '@/lib/economy/service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    // SELF scope by default.
    let transactions: any[];
    if (organizationId) {
      // Organization-scoped read: caller must be an active member of the org
      // with ECONOMY_TRANSACTION_VIEW (ORG_OWNER/ORG_ADMIN).
      try {
        await requireOrganizationAccess(identity, organizationId);
        await requirePermission({ actor: identity, capability: CAPABILITIES.ECONOMY_TRANSACTION_VIEW, organizationId });
      } catch {
        return NextResponse.json(
          { success: false, statusCode: 403, message: 'Forbidden: you do not have access to this organization economy.' },
          { status: 403 }
        );
      }
      transactions = await listOrganizationTransactions(organizationId);
    } else {
      transactions = await listAccountTransactions(identity.userId);
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: 'Transactions retrieved successfully',
      data: {
        scope: organizationId ? 'ORGANIZATION' : 'SELF',
        organizationId: organizationId ?? null,
        transactions,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, statusCode: 500, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
