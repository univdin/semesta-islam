/**
 * SEMESTA ISLAM — Dev PageSpeed Insights API Endpoint
 *
 * GET /api/v1/dev/pagespeed?url=https://ilmify.id&strategy=mobile
 *
 * Runs Google PageSpeed Insights audit using server-only GOOGLE_API_KEY.
 * Protected: available in development or for authenticated FOUNDER_ADMIN users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchPageSpeedAudit } from '@/lib/google/pagespeed';
import { getServerIdentity } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url') ?? 'https://ilmify.id';
  const strategyParam = searchParams.get('strategy') === 'desktop' ? 'desktop' : 'mobile';

  // Access control: allow in development or for authenticated FOUNDER_ADMIN
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev) {
    const identity = await getServerIdentity();
    const isFounder = identity?.roles.includes('FOUNDER_ADMIN');
    if (!isFounder) {
      return NextResponse.json({ error: 'FORBIDDEN', message: 'Founder role required' }, { status: 403 });
    }
  }

  try {
    const auditResult = await fetchPageSpeedAudit({
      url: targetUrl,
      strategy: strategyParam,
    });

    return NextResponse.json({
      success: true,
      data: auditResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PageSpeed API error';
    return NextResponse.json(
      {
        success: false,
        error: 'PAGESPEED_AUDIT_FAILED',
        message,
      },
      { status: 500 }
    );
  }
}
