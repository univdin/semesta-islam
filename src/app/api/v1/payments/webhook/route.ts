import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { handlePaymentWebhook, PaymentProviderError } from '@/lib/payment/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Production safety: the mock webhook uses a default dev secret. In
  // production it is only permitted when an explicit PAYMENT_MOCK_SECRET is
  // configured (i.e. an operator consciously accepts the mock provider).
  if (
    env.NODE_ENV === 'production' &&
    env.PAYMENT_PROVIDER === 'mock' &&
    !process.env.PAYMENT_MOCK_SECRET
  ) {
    return NextResponse.json(
      { success: false, statusCode: 503, message: 'Mock payment webhook is disabled in production without an explicit PAYMENT_MOCK_SECRET.' },
      { status: 503 }
    );
  }

  try {
    const raw = await request.text();
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { success: false, statusCode: 400, message: 'PAYMENT_WEBHOOK_INVALID_BODY: Invalid JSON.' },
        { status: 400 }
      );
    }

    const signature = request.headers.get('x-mock-signature') ?? '';
    const result = await handlePaymentWebhook(payload, signature);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: result.duplicate ? 'Webhook already processed' : 'Webhook processed',
      data: {
        eventId: result.webhookEvent.eventId,
        paymentId: result.payment.id,
        paymentStatus: result.payment.status,
        transactionId: result.transaction?.id ?? null,
        duplicate: result.duplicate,
        mode: 'SIMULATED_INTERNAL',
      },
    });
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : '';
    const isWebhookClientError =
      error instanceof PaymentProviderError || /PAYMENT_WEBHOOK_/.test(message);
    if (isWebhookClientError) {
      const isAuthError = /SIGNATURE/.test(message) || /INVALID/.test(message);
      return NextResponse.json(
        { success: false, statusCode: isAuthError ? 401 : 400, message },
        { status: isAuthError ? 401 : 400 }
      );
    }
    return NextResponse.json(
      { success: false, statusCode: 500, message: message || 'Internal server error' },
      { status: 500 }
    );
  }
}
