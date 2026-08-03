import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ReportStatus } from '@prisma/client';
import { getServerIdentity } from '@/lib/auth/session';
import { resolveReport } from '@/lib/community/reports';
import { ServiceError } from '@/lib/community/errors';

export const dynamic = 'force-dynamic';

const ResolveReportSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum([ReportStatus.RESOLVED, ReportStatus.REJECTED]),
  resolution: z.string().min(3).max(1000),
});

export async function PATCH(request: Request) {
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

  const parsed = ResolveReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, statusCode: 400, message: parsed.error.message }, { status: 400 });
  }

  try {
    const report = await resolveReport(identity, parsed.data);
    return NextResponse.json({ success: true, statusCode: 200, data: { report } });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}
