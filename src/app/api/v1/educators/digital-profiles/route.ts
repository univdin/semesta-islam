import { NextResponse } from 'next/server';
import { DigitalProfileCreateSchema } from '@/lib/validations';
import { submitDigitalProfile } from '@/lib/identity/service';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';
import type { AuthIdentity } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    const body = await request.json();
    const validationResult = DigitalProfileCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed for digital profile payload',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const educator = await prisma.educatorProfile.findUnique({
      where: { id: data.educatorId },
      select: { userId: true },
    });
    if (!educator) {
      return NextResponse.json(
        { success: false, statusCode: 404, message: 'Educator not found.' },
        { status: 404 }
      );
    }

    // SEC-02: only the owning educator or a VERIFICATION_MANAGE actor may
    // declare an external profile for an educator.
    if (educator.userId !== identity.userId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 403,
          message: 'Forbidden: you can only submit a digital profile for your own educator account.',
        },
        { status: 403 }
      );
    }

    const profile = await submitDigitalProfile(identity as AuthIdentity, {
      educatorId: data.educatorId,
      platform: data.platform,
      url: data.url,
      handle: data.handle,
    });

    return NextResponse.json(
      {
        success: true,
        statusCode: 201,
        message: 'Digital profile submitted for review.',
        data: { profile },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[digital-profiles] POST', error);
    return NextResponse.json(
      { success: false, statusCode: 500, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
