import { NextResponse } from 'next/server';
import { DigitalProfileStatusUpdateSchema } from '@/lib/validations';
import { updateDigitalProfileStatus, listAllDigitalProfiles } from '@/lib/identity/service';
import { getServerIdentity } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/authorization';
import { CAPABILITIES } from '@/lib/auth/permissions';
import type { AuthIdentity } from '@/lib/auth/session';

export async function GET() {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json(
      { success: false, statusCode: 401, message: 'Authentication required.' },
      { status: 401 }
    );
  }

  try {
    const profiles = await listAllDigitalProfiles(identity as AuthIdentity);
    return NextResponse.json({ success: true, statusCode: 200, data: { profiles } });
  } catch (error) {
    const status = (error as Error & { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json(
      { success: false, statusCode: status, message: (error as Error).message },
      { status }
    );
  }
}

export async function PATCH(request: Request) {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json(
      { success: false, statusCode: 401, message: 'Authentication required.' },
      { status: 401 }
    );
  }

  try {
    // Management-only surface: verification of external identity requires
    // VERIFICATION_MANAGE. UI hiding is never the only protection.
    await requirePermission({ actor: identity, capability: CAPABILITIES.VERIFICATION_MANAGE });
  } catch {
    return NextResponse.json(
      {
        success: false,
        statusCode: 403,
        message: 'Forbidden: verification management capability required.',
      },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, statusCode: 400, message: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const parsed = DigitalProfileStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 400,
        message: 'Validation failed for digital profile status update',
        details: parsed.error.errors.map((err) => ({
          field: err.path.join('.'),
          issue: err.message,
        })),
      },
      { status: 400 }
    );
  }

  try {
    const profile = await updateDigitalProfileStatus(
      identity as AuthIdentity,
      parsed.data.profileId,
      parsed.data.status
    );
    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: `Digital profile marked ${parsed.data.status}.`,
      data: { profile },
    });
  } catch (error) {
    console.error('[management/digital-profiles] PATCH', error);
    return NextResponse.json(
      { success: false, statusCode: 500, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
