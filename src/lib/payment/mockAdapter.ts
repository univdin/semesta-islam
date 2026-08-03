/**
 * SEMESTA ISLAM — Payment Gateway Adapter (Pre-Wired Architecture)
 * Governed by docs/IMPLEMENTATION_CONTRACT.md, docs/07_API_ENDPOINTS.md &
 * the Economy & Security Closure execution directive (blueprint §28-31).
 *
 * The mock adapter is the CANONICAL development/simulation implementation of
 * the PaymentGatewayAdapter boundary. Future real providers (Midtrans/Xendit)
 * implement the same boundary without changing economy/domain services.
 *
 * NON-NEGOTIABLE
 * - SIMULATED_INTERNAL is preserved: the value is internal, non-cash,
 *   non-withdrawable, and never represents real money ("Belum ada pembayaran riil").
 * - The adapter NEVER mutates internal balance. It returns PENDING invoices and
 *   verified webhook events; the domain payment service decides any economic effect.
 * - Webhook events require HMAC-SHA256 signature verification and are idempotent
 *   (duplicate events return the previously processed result).
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface InvoicePayload {
  bookingId: string;
  learnerUserId: string;
  amount: number;
  description: string;
}

export interface InvoiceResponse {
  invoiceId: string;
  paymentUrl: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  /** Closed-loop internal value marker (DECISION-04/DECISION-11). */
  mode: 'SIMULATED_INTERNAL';
}

export type WebhookEventStatus = 'PAID' | 'REFUNDED' | 'EXPIRED' | 'FAILED';

export interface WebhookEvent {
  eventId: string;
  bookingId: string;
  amount: number;
  status: WebhookEventStatus;
  paidAt?: string;
}

export interface RefundResult {
  refunded: boolean;
  refundedAt: string;
}

export interface PaymentGatewayAdapter {
  createInvoice(payload: InvoicePayload): Promise<InvoiceResponse>;
  getPaymentStatus(invoiceId: string): Promise<{ status: InvoiceResponse['status'] }>;
  handleWebhook(payload: unknown, signature: string): Promise<WebhookEvent>;
  refund(invoiceId: string): Promise<RefundResult>;
}

const DEFAULT_MOCK_SECRET = 'semesta-mock-secret-dev';

function getMockSecret(): string {
  return process.env.PAYMENT_MOCK_SECRET || DEFAULT_MOCK_SECRET;
}

/**
 * Deterministic HMAC-SHA256 signature over the raw JSON payload using the
 * configured PAYMENT_MOCK_SECRET. In a real provider this corresponds to the
 * provider's webhook signature scheme (e.g. Midtrans signature key, Xendit
 * callback token + HMAC) and is implemented inside that adapter only.
 */
export function signMockWebhook(payload: unknown): string {
  const secret = getMockSecret();
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return createHmac('sha256', secret).update(body).digest('hex');
}

function verifySignature(payload: unknown, signature: string | undefined): boolean {
  if (!signature || typeof signature !== 'string' || signature.length === 0) return false;
  const expected = signMockWebhook(payload);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
}

/**
 * MVP Mock Implementation — canonical simulation of the payment boundary.
 * Pre-wired to the internal virtual ledger. Swapping in a production adapter
 * requires no changes to economy/domain services.
 */
export class MockPaymentGatewayAdapter implements PaymentGatewayAdapter {
  private processedEvents = new Map<string, WebhookEvent>();
  private invoices = new Map<string, { status: InvoiceResponse['status']; bookingId: string }>();

  async createInvoice(payload: InvoicePayload): Promise<InvoiceResponse> {
    const invoiceId = `MOCK-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.invoices.set(invoiceId, { status: 'PENDING', bookingId: payload.bookingId });
    return {
      invoiceId,
      paymentUrl: `#simulated-payment?invoiceId=${invoiceId}&bookingId=${payload.bookingId}`,
      status: 'PENDING',
      mode: 'SIMULATED_INTERNAL',
    };
  }

  async getPaymentStatus(invoiceId: string): Promise<{ status: InvoiceResponse['status'] }> {
    return { status: this.invoices.get(invoiceId)?.status ?? 'EXPIRED' };
  }

  /**
   * Handles a provider webhook event. Requires a valid HMAC signature,
   * validates the payload, and is idempotent per eventId (a replayed/duplicate
   * event returns the already-processed result and creates no new effect).
   */
  async handleWebhook(payload: unknown, signature: string): Promise<WebhookEvent> {
    if (!verifySignature(payload, signature)) {
      throw new Error('PAYMENT_WEBHOOK_INVALID_SIGNATURE: Webhook signature verification failed.');
    }

    const event = (typeof payload === 'string' ? JSON.parse(payload) : payload) as Record<string, any>;

    const eventId = event?.eventId;
    const bookingId = event?.bookingId;
    const amount = event?.amount;
    const status = event?.status as WebhookEventStatus;

    if (!eventId || !bookingId || typeof amount !== 'number' || amount < 0) {
      throw new Error('PAYMENT_WEBHOOK_INVALID_PAYLOAD: Webhook payload is missing required fields.');
    }
    if (!['PAID', 'REFUNDED', 'EXPIRED', 'FAILED'].includes(status)) {
      throw new Error(`PAYMENT_WEBHOOK_INVALID_STATUS: Unsupported webhook status ${status}.`);
    }

    const processed = this.processedEvents.get(eventId);
    if (processed) {
      return processed;
    }

    const webhookEvent: WebhookEvent = {
      eventId,
      bookingId,
      amount,
      status,
      paidAt: status === 'PAID' ? (event?.paidAt ?? new Date().toISOString()) : undefined,
    };
    this.processedEvents.set(eventId, webhookEvent);

    // Track invoice status for getPaymentStatus/refund bookkeeping.
    const targetInvoice = [...this.invoices.entries()].find(([, v]) => v.bookingId === bookingId)?.[0];
    if (targetInvoice && status === 'PAID') {
      this.invoices.set(targetInvoice, { status: 'PAID', bookingId });
    }
    if (targetInvoice && (status === 'EXPIRED' || status === 'FAILED')) {
      this.invoices.set(targetInvoice, { status: 'EXPIRED', bookingId });
    }

    return webhookEvent;
  }

  async refund(invoiceId: string): Promise<RefundResult> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('PAYMENT_REFUND_NOT_FOUND: Invoice not found.');
    }
    if (invoice.status !== 'PAID') {
      throw new Error('PAYMENT_REFUND_INVALID_STATE: Only PAID invoices can be refunded.');
    }
    this.invoices.set(invoiceId, { status: 'EXPIRED', bookingId: invoice.bookingId });
    return { refunded: true, refundedAt: new Date().toISOString() };
  }
}
