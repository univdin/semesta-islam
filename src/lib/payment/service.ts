/**
 * SEMESTA ISLAM — Payment Boundary Service
 * Governed by the Economy & Security Closure execution directive (blueprint §28-31).
 *
 * This service orchestrates the EXTERNAL payment boundary. It is strictly
 * separated from the internal economy: a payment is never the source of truth
 * for internal balance. The canonical path is:
 *
 *   External Provider → PaymentGatewayAdapter → verified webhook → Payment
 *   → EconomicTransaction → EconomicLedger → Balance projection
 *
 * The gateway/adapter NEVER mutates internal balance. Verified webhook events
 * are the ONLY entry into the domain transaction path. Duplicate webhooks must
 * produce at most one economic effect.
 */

import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { PaymentStatus } from '@prisma/client';
import {
  MockPaymentGatewayAdapter,
  PaymentGatewayAdapter,
  type WebhookEvent,
} from '@/lib/payment/mockAdapter';
import { executeEconomicEffect, refundTransaction } from '@/lib/economy/service';
import { persistAuditEvent } from '@/lib/audit/service';

export class PaymentProviderError extends Error {}

/**
 * Resolves the active payment provider adapter from PAYMENT_PROVIDER env.
 * Only the mock provider is implemented in this slice; Midtrans/Xendit remain
 * documented future adapter boundaries (no SDKs are installed).
 */
export function getPaymentProvider(): PaymentGatewayAdapter {
  switch (env.PAYMENT_PROVIDER) {
    case 'midtrans':
      throw new PaymentProviderError('PAYMENT_PROVIDER=midtrans is not configured in this slice. Add the MidtransPaymentGatewayAdapter boundary before enabling.');
    case 'xendit':
      throw new PaymentProviderError('PAYMENT_PROVIDER=xendit is not configured in this slice. Add the XenditPaymentGatewayAdapter boundary before enabling.');
    case 'mock':
    default:
      return new MockPaymentGatewayAdapter();
  }
}

export interface HandleWebhookResult {
  payment: any;
  transaction: any | null;
  duplicate: boolean;
  webhookEvent: WebhookEvent;
}

/**
 * Handles a provider webhook. Verifies the signature, validates the payload,
 * persists/updates the Payment record idempotently (externalId = eventId), and —
 * for a verified PAID event — creates a COMPLETED domain economic transaction.
 * Duplicate events return the existing result and produce no new economic effect.
 */
export async function handlePaymentWebhook(
  payload: unknown,
  signature: string
): Promise<HandleWebhookResult> {
  const provider = getPaymentProvider();
  const webhookEvent = await provider.handleWebhook(payload, signature); // throws on invalid signature/payload

  const existingPayment = await prisma.payment.findUnique({
    where: { externalId: webhookEvent.eventId },
  });
  if (existingPayment) {
    // Duplicate webhook — return existing result, no new economic effect.
    const tx = await prisma.economicTransaction.findFirst({
      where: { source: 'PAYMENT', reference: existingPayment.id },
    });
    return { payment: existingPayment, transaction: tx, duplicate: true, webhookEvent };
  }

  // The booking must exist for the payment FK.
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: webhookEvent.bookingId },
  });
  if (!booking) {
    throw new PaymentProviderError('PAYMENT_WEBHOOK_BOOKING_NOT_FOUND: Booking does not exist for this payment event.');
  }

  const learnerUserId = booking.learnerUserId;

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      learnerUserId,
      amount: webhookEvent.amount,
      currency: 'POINT', // SIMULATED_INTERNAL: internal non-cash value
      provider: 'SIMULATED_INTERNAL',
      externalId: webhookEvent.eventId,
      status: mapWebhookStatus(webhookEvent.status),
      rawPayload: { eventId: webhookEvent.eventId, status: webhookEvent.status, paidAt: webhookEvent.paidAt ?? null },
      paidAt: webhookEvent.status === 'PAID' ? new Date(webhookEvent.paidAt ?? Date.now()) : null,
    },
  });

  await persistAuditEvent({
    actorUserId: learnerUserId,
    actionType: 'PAYMENT_CREATED',
    entityAffected: 'payments',
    entityId: payment.id,
    metadata: { externalId: webhookEvent.eventId, status: webhookEvent.status, amount: webhookEvent.amount },
  });

  // Only a verified PAID event enters the domain transaction path (explicit
  // internal-economy policy). Non-PAID statuses are recorded but have no
  // economic effect.
  if (webhookEvent.status !== 'PAID') {
    return { payment, transaction: null, duplicate: false, webhookEvent };
  }

  const result = await executeEconomicEffect({
    type: 'EARN',
    actorUserId: learnerUserId,
    accountOwnerId: learnerUserId,
    amount: webhookEvent.amount,
    idempotencyKey: `payment:paid:${webhookEvent.eventId}`,
    source: 'PAYMENT',
    reference: payment.id,
    reason: `Poin internal dari pembayaran tersimulasi ${webhookEvent.eventId}`,
  });

  await persistAuditEvent({
    actorUserId: learnerUserId,
    actionType: 'PAYMENT_PAID',
    entityAffected: 'payments',
    entityId: payment.id,
    metadata: { transactionId: result.transaction.id, amount: webhookEvent.amount },
  });

  return { payment, transaction: result.transaction, duplicate: false, webhookEvent };
}

function mapWebhookStatus(status: WebhookEvent['status']): PaymentStatus {
  switch (status) {
    case 'PAID':
      return 'PAID';
    case 'REFUNDED':
      return 'REFUNDED';
    case 'EXPIRED':
      return 'EXPIRED';
    case 'FAILED':
    default:
      return 'FAILED';
  }
}

/**
 * Founder-gated payment refund (callers enforce economy.refund). Marks the
 * payment REFUNDED and reverses the domain transaction economic effect.
 */
export async function refundPayment(
  paymentId: string,
  actorUserId: string,
  reason: string
): Promise<{ payment: any; transaction: any }> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new PaymentProviderError('PAYMENT_REFUND_NOT_FOUND: Payment not found.');
  if (payment.status !== 'PAID') {
    throw new PaymentProviderError(`PAYMENT_REFUND_INVALID_STATE: Payment is in status ${payment.status}.`);
  }

  const domainTx = await prisma.economicTransaction.findFirst({
    where: { source: 'PAYMENT', reference: payment.id, status: 'COMPLETED' },
  });
  if (!domainTx) throw new PaymentProviderError('PAYMENT_REFUND_NO_EFFECT: No completed domain transaction to refund.');

  const reversalResult = await refundTransaction({
    transactionId: domainTx.id,
    actorUserId,
    reason: `REFUND: ${reason}`,
  });

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'REFUNDED', refundedAt: new Date() },
  });

  await persistAuditEvent({
    actorUserId,
    actionType: 'PAYMENT_REFUNDED',
    entityAffected: 'payments',
    entityId: payment.id,
    metadata: { reason, reversalTransactionId: reversalResult.reversalTransaction?.id ?? null },
  });

  return { payment: updatedPayment, transaction: reversalResult };
}
