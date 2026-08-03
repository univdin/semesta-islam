import { NextResponse } from 'next/server';
import { rateLimitAnonymous } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const started = Date.now();
  const result: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
      status: string;
      environment: string;
      database: 'up' | 'down' | 'unconfigured';
      version: string;
      timestamp: string;
      responseTimeMs: number;
    };
  } = {
    success: true,
    statusCode: 200,
    message: 'Service health check completed',
    data: {
      status: 'ok',
      environment: process.env.APP_ENV ?? 'development',
      database: 'unconfigured',
      version: 'v1',
      timestamp: new Date().toISOString(),
      responseTimeMs: 0,
    },
  };

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const rl = await rateLimitAnonymous(`health:${ip}`);
  if (rl && !rl.success) {
    return NextResponse.json(
      { success: false, statusCode: 429, message: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
    );
  }

  const dbUrl = process.env.DATABASE_URL ?? '';
  if (dbUrl.includes('localhost') || dbUrl.includes('placeholder')) {
    result.data.database = 'unconfigured';
  } else {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      result.data.database = 'up';
    } catch {
      result.data.database = 'down';
      result.success = false;
      result.statusCode = 503;
      result.message = 'Database unreachable';
    }
  }

  result.data.responseTimeMs = Date.now() - started;
  return NextResponse.json(result, { status: result.statusCode });
}
