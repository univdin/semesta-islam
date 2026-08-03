import { NextResponse } from 'next/server';
import { z } from 'zod';
import { confirmBooking } from '@/lib/bookings/service';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';

/**
 * Educator/Founder confirms a PENDING booking.
 * Domain event `booking.confirmed` (PRD §450, WEBHOOK_CONTRACT).
 * Identity & roles are resolved server-side (DECISION-07): the caller must be
 * the owning educator or a FOUNDER_ADMIN; client-supplied actor fields are not accepted.
 */
const BookingConfirmSchema = z.object({
  bookingId: z.string().uuid('Invalid Booking UUID'),
});

export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }

    const body = await request.json();
    const validationResult = BookingConfirmSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            issue: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const result = await confirmBooking({
      bookingId: data.bookingId,
      actorUserId: identity.userId,
      actorRoles: identity.roles,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, statusCode: result.statusCode, message: result.message },
        { status: result.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: result.message,
      data: {
        bookingId: result.data!.bookingId,
        status: result.data!.status,
        confirmedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error during booking confirmation',
      },
      { status: 500 }
    );
  }
}
