import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
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
