import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import { createBackup, verifyBackup, requestRestore } from '@/lib/operations/backup';

const ActionSchema = z.object({
  action: z.enum(['create', 'verify', 'restore']),
  backupId: z.string().uuid().optional(),
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

  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    switch (parsed.data.action) {
      case 'create': {
        const result = await createBackup(identity);
        return NextResponse.json({ success: true, statusCode: 200, data: { backupId: result.record.id, status: result.record.status } });
      }
      case 'verify': {
        if (!parsed.data.backupId) {
          return NextResponse.json({ success: false, statusCode: 400, message: 'backupId required.' }, { status: 400 });
        }
        const result = await verifyBackup(identity, parsed.data.backupId);
        return NextResponse.json({ success: true, statusCode: 200, data: result });
      }
      case 'restore': {
        if (!parsed.data.backupId) {
          return NextResponse.json({ success: false, statusCode: 400, message: 'backupId required.' }, { status: 400 });
        }
        const result = await requestRestore(identity, parsed.data.backupId);
        return NextResponse.json({ success: true, statusCode: 200, data: result });
      }
      default:
        return NextResponse.json({ success: false, statusCode: 400, message: 'Unknown action.' }, { status: 400 });
    }
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message = (err as Error).message ?? 'Internal server error.';
    return NextResponse.json({ success: false, statusCode, message }, { status: statusCode });
  }
}
