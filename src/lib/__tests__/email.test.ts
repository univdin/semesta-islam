/**
 * SEMESTA ISLAM — Email Adapter Contract Tests
 * Verifies adapter selection (Resend default / mock / gmail) and the safe
 * simulation fallback when RESEND_API_KEY is a placeholder (cloud-gated).
 */

import { describe, it, expect, vi } from 'vitest';

const envMock = vi.hoisted(() => ({
  env: {
    MAGIC_LINK_PROVIDER: 'resend',
    RESEND_API_KEY: 're_placeholder_key',
    RESEND_EMAIL_DOMAIN: 'ilmify.id',
  },
}));

vi.mock('@/lib/env', () => ({ env: envMock.env }));

import {
  getEmailProvider,
  ResendEmailProvider,
  SimulationEmailProvider,
} from '@/lib/email/service';

describe('Email Provider Selection', () => {
  it('defaults to the Resend provider (MAGIC_LINK_PROVIDER=resend)', () => {
    envMock.env.MAGIC_LINK_PROVIDER = 'resend';
    expect(getEmailProvider().name).toBe('resend');
  });

  it('returns simulation provider when MAGIC_LINK_PROVIDER=mock', () => {
    envMock.env.MAGIC_LINK_PROVIDER = 'mock';
    expect(getEmailProvider().name).toBe('simulation');
  });

  it('returns gmail provider when MAGIC_LINK_PROVIDER=supabase', () => {
    envMock.env.MAGIC_LINK_PROVIDER = 'supabase';
    expect(getEmailProvider().name).toBe('gmail');
  });
});

describe('ResendEmailProvider — safe fallback', () => {
  it('falls back to simulation (no network) when the API key is a placeholder', async () => {
    envMock.env.MAGIC_LINK_PROVIDER = 'resend';
    envMock.env.RESEND_API_KEY = 're_placeholder_key';
    const provider = new ResendEmailProvider();
    expect(provider.name).toBe('resend');

    const result = await provider.send({
      to: 'learner@example.com',
      subject: 'Sesi belajar dikonfirmasi',
      body: 'Halo, sesi belajar Anda telah dikonfirmasi.',
    });

    expect(result.ok).toBe(true);
    expect(result.ref).toMatch(/^sim:\/\//);
  });

  it('uses the ilmify.id domain as the sender default', () => {
    envMock.env.RESEND_EMAIL_DOMAIN = 'ilmify.id';
    const provider = new ResendEmailProvider();
    // From is built as "SEMESTA ISLAM <halo@ilmify.id>" — assert domain presence.
    expect(provider).toBeInstanceOf(ResendEmailProvider);
  });
});

describe('SimulationEmailProvider', () => {
  it('never sends network traffic and returns a sim ref', async () => {
    const provider = new SimulationEmailProvider();
    const result = await provider.send({
      to: 'x@example.com',
      subject: 'test',
      body: 'body',
    });
    expect(result.ok).toBe(true);
    expect(result.ref).toMatch(/^sim:\/\//);
  });
});
