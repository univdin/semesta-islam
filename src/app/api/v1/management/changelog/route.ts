import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import { createChangelogEntry } from '@/lib/changelog/service';

const ChangelogSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  summary: z.string().max(500).optional(),
  body: z.string().max(5000).optional(),
  version: z.string().max(50).optional(),
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

  const parsed = ChangelogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const entry = await createChangelogEntry(identity, parsed.data);
    return NextResponse.json({ success: true, statusCode: 200, data: { id: entry.id } });
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message = (err as Error).message ?? 'Internal server error.';
    return NextResponse.json({ success: false, statusCode, message }, { status: statusCode });
  }
}
