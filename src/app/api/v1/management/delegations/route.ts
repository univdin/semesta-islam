import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import { createDelegation } from '@/lib/delegations/service';
import { CAPABILITIES } from '@/lib/auth/permissions';

const DelegationSchema = z.object({
  delegateUserId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  capabilities: z.array(z.string()).min(1),
  reason: z.string().min(3).optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json({ success: false, statusCode: 401, message: 'Authentication required.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = DelegationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const delegation = await createDelegation(identity, {
      delegateUserId: parsed.data.delegateUserId,
      organizationId: parsed.data.organizationId,
      capabilities: parsed.data.capabilities as (typeof CAPABILITIES)[keyof typeof CAPABILITIES][],
      reason: parsed.data.reason,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    });
    return NextResponse.json({ success: true, statusCode: 200, data: { delegationId: delegation.id } });
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message = (err as Error).message ?? 'Internal server error.';
    return NextResponse.json({ success: false, statusCode, message }, { status: statusCode });
  }
}
