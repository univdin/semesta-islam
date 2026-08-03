import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import { inviteMember } from '@/lib/organizations/service';

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER', 'ORG_STAFF', 'ORG_MEMBER']),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const membership = await inviteMember(identity, id, parsed.data);
    return NextResponse.json({ success: true, statusCode: 200, data: { membershipId: membership.id } });
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message = (err as Error).message ?? 'Internal server error.';
    return NextResponse.json({ success: false, statusCode, message }, { status: statusCode });
  }
}
