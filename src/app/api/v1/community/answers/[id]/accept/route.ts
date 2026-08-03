import { NextResponse } from 'next/server';
import { getServerIdentity } from '@/lib/auth/session';
import { acceptAnswer, unacceptAnswer } from '@/lib/community/qa';
import { ServiceError } from '@/lib/community/errors';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(_request: Request, { params }: RouteContext) {
  const identity = await getServerIdentity();
  const { id } = await params;

  try {
    const result = await acceptAnswer(identity, id);
    return NextResponse.json({ success: true, statusCode: 200, data: result });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const identity = await getServerIdentity();
  const { id } = await params;

  try {
    const result = await unacceptAnswer(identity, id);
    return NextResponse.json({ success: true, statusCode: 200, data: result });
  } catch (error) {
    const status = (error as ServiceError).statusCode ?? 500;
    return NextResponse.json({ success: false, statusCode: status, message: (error as Error).message }, { status });
  }
}
