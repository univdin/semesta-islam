import { NextResponse } from 'next/server';
import { BookingInquirySchema } from '@/lib/validations';
import { createBookingInquiry } from '@/lib/bookings/service';
import { MockPaymentGatewayAdapter } from '@/lib/payment/mockAdapter';
import { getServerIdentity, unauthorizedIdentity } from '@/lib/auth/session';

/**
 * Booking inquiry entry point. SEC-08: the learner is ALWAYS resolved
 * SERVER-SIDE from the authenticated session (DECISION-07) — there is no
 * hardcoded demo-user fallback. Unauthenticated requests are rejected 401.
 * Demo authentication flows through the existing demo session cookie
 * (semesta_demo_identity) only while LOCAL_DEMO_MODE is enabled.
 */
export async function POST(request: Request) {
  try {
    const identity = await getServerIdentity();
    if (!identity) {
      return NextResponse.json(unauthorizedIdentity(), { status: 401 });
    }
    const learnerUserId = identity.userId;

    const body = await request.json();
    const validationResult = BookingInquirySchema.safeParse(body);

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

    const result = await createBookingInquiry({
      ...data,
      learnerUserId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, statusCode: result.statusCode, message: result.message },
        { status: result.statusCode }
      );
    }

    const paymentAdapter = new MockPaymentGatewayAdapter();
    const invoice = await paymentAdapter.createInvoice({
      bookingId: result.data!.bookingId,
      learnerUserId,
      amount: 0,
      description: `Inquiry booking for educator ${data.educatorId}`,
    });

    return NextResponse.json(
      {
        success: true,
        statusCode: 201,
        message: result.message,
        data: {
          bookingId: result.data!.bookingId,
          learnerName: data.learnerName,
          learningMethod: data.learningMethod,
          preferredSchedule: data.preferredSchedule,
          ledgerPointsEarned: result.data!.ledgerPointsEarned,
          invoiceStatus: invoice.status,
          paymentMode: invoice.mode,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
