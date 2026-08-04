/**
 * SEMESTA ISLAM — Email & Mailing Adapter
 * Governed by MASTER_EXECUTION_PROMPT §28-29 + Google Cloud & Workspace Directive.
 *
 * Adapter boundaries:
 *   SimulationEmailProvider   — local dev, no network
 *   ResendEmailProvider       — transactional email via Resend (domain: ilmify.id)
 *   GmailEmailProvider        — Google Workspace, CLOUD CONFIGURATION REQUIRED
 *
 * The application remains the system of record for members, consent and audit.
 * Transactional email is separate from bulk mailing.
 */

import { Resend } from 'resend';
import { env } from '@/lib/env';

export type EmailKind = 'transactional' | 'operational' | 'marketing';

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  kind?: EmailKind;
  template?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<{ ok: boolean; ref?: string }>;
}

export class SimulationEmailProvider implements EmailProvider {
  readonly name = 'simulation';

  async send(message: EmailMessage): Promise<{ ok: boolean; ref?: string }> {
    // Localhost simulation: never sends network traffic.
    void message;
    return { ok: true, ref: `sim://${Date.now()}` };
  }
}

export class GmailEmailProvider implements EmailProvider {
  readonly name = 'gmail';

  async send(): Promise<{ ok: boolean; ref?: string }> {
    throw new Error(
      'Gmail integration requires GOOGLE_CLIENT_ID/SECRET + OAuth user consent (CLOUD CONFIGURATION REQUIRED).'
    );
  }
}

const PLACEHOLDER_API_KEYS = ['re_placeholder_key', 're_123456789'];

function hasRealResendKey(): boolean {
  const key = env.RESEND_API_KEY;
  return Boolean(key) && !PLACEHOLDER_API_KEYS.includes(key as string);
}

/**
 * Resend provider for transactional email from the ilmify.id domain.
 * Degrades safely to simulation when no real API key is configured, so the
 * application never crashes on a missing secret (cloud-gated per env.ts policy).
 */
export class ResendEmailProvider implements EmailProvider {
  readonly name = 'resend';
  private readonly client: Resend | null;
  private readonly from: string;

  constructor() {
    const domain = env.RESEND_EMAIL_DOMAIN ?? 'ilmify.id';
    this.from = `SEMESTA ISLAM <halo@${domain}>`;
    this.client = hasRealResendKey() ? new Resend(env.RESEND_API_KEY!) : null;
  }

  async send(message: EmailMessage): Promise<{ ok: boolean; ref?: string }> {
    if (!this.client) {
      // Fail-closed in production: a missing Resend key must never silently
      // fake a successful delivery. Dev/test keeps the simulation fallback.
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          '[email] RESEND_API_KEY is not configured — refusing to fake a successful delivery in production.'
        );
      }
      console.warn(
        '[email] RESEND_API_KEY is not configured — falling back to simulation provider. ' +
          'Set a real Resend key to enable transactional email from ' + this.from
      );
      return { ok: true, ref: `sim://${Date.now()}` };
    }

    const { data, error } = await this.client.emails.send({
      from: this.from,
      to: [message.to],
      subject: message.subject,
      text: message.body,
    });

    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }

    return { ok: true, ref: data?.id };
  }
}

export function getEmailProvider(): EmailProvider {
  // Adapter selection mirrors PAYMENT_PROVIDER / STORAGE_MODE.
  const provider = env.MAGIC_LINK_PROVIDER ?? 'resend';
  if (provider === 'resend') {
    return new ResendEmailProvider();
  }
  if (provider === 'supabase') {
    return new GmailEmailProvider();
  }
  return new SimulationEmailProvider();
}

/**
 * Transactional email delivery record (kept simple; no queue dependency yet).
 */
export async function sendTransactionalEmail(message: EmailMessage) {
  const provider = getEmailProvider();
  return provider.send(message);
}
