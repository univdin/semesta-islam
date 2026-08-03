/**
 * SEMESTA ISLAM — Email & Mailing Adapter
 * Governed by MASTER_EXECUTION_PROMPT §28-29 + Google Cloud & Workspace Directive.
 *
 * Adapter boundaries:
 *   SimulationEmailProvider   — local dev, no network
 *   GmailEmailProvider        — Google Workspace, CLOUD CONFIGURATION REQUIRED
 *   FutureEmailProvider       — e.g. Resend
 *
 * The application remains the system of record for members, consent and audit.
 * Transactional email is separate from bulk mailing.
 */

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

export function getEmailProvider(): EmailProvider {
  // Adapter selection mirrors PAYMENT_PROVIDER / STORAGE_MODE.
  const provider = env.MAGIC_LINK_PROVIDER ?? 'mock';
  if (provider === 'supabase' || provider === 'resend') {
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
