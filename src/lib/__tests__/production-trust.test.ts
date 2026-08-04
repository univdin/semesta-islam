/**
 * ILMIFY — Production Trust Boundary Regression Tests
 *
 * Guards the P0 invariant from docs/audit/PRODUCTION_ACTIVATION_REALITY.md:
 *   PUBLIC VERIFIED EDUCATORS === GENUINE VERIFIED EDUCATORS
 *   PUBLIC DEMO EDUCATORS     === 0
 *
 * These are pure helpers (no DB). In the Vitest environment NODE_ENV=test and
 * APP_ENV is not 'development', so isDemoMode() is false and the trust filter
 * must actively exclude @localhost.test demo identities.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  isDemoMode: vi.fn(() => false),
}));

import {
  DEMO_EMAIL_SUFFIX,
  isProductionTrustMode,
  productionTrustEducatorFilter,
  productionTrustUserFilter,
  isTrustedEducatorEmail,
  isTrustedEducator,
} from '@/lib/auth/production';

describe('production trust mode detection', () => {
  it('is in trust mode when not demo mode', () => {
    expect(isProductionTrustMode()).toBe(true);
  });

  it('exposes the demo email suffix constant', () => {
    expect(DEMO_EMAIL_SUFFIX).toBe('@localhost.test');
  });
});

describe('productionTrustEducatorFilter', () => {
  it('hides demo identities in production via the user email negation', () => {
    const filter = productionTrustEducatorFilter() as any;
    expect(filter.user.email.not.endsWith).toBe(DEMO_EMAIL_SUFFIX);
  });
});

describe('productionTrustUserFilter', () => {
  it('hides demo users in production via email negation', () => {
    const filter = productionTrustUserFilter() as any;
    expect(filter.email.not.endsWith).toBe(DEMO_EMAIL_SUFFIX);
  });
});

describe('isTrustedEducatorEmail / isTrustedEducator', () => {
  it('rejects a demo email suffix', () => {
    expect(isTrustedEducatorEmail('abdullah-hasibuan@localhost.test')).toBe(false);
  });

  it('accepts a genuine email', () => {
    expect(isTrustedEducatorEmail('ustadz@real-institution.id')).toBe(true);
  });

  it('rejects a demo educator row in a public surface', () => {
    expect(
      isTrustedEducator({ user: { email: 'hasibuan.demo@localhost.test' } })
    ).toBe(false);
  });

  it('accepts a genuine educator row', () => {
    expect(
      isTrustedEducator({ user: { email: 'genuine@pesantren.ac.id' } })
    ).toBe(true);
  });

  it('rejects educator rows with no user relation in trust mode (defensive)', () => {
    expect(isTrustedEducator({ user: null })).toBe(false);
  });
});
