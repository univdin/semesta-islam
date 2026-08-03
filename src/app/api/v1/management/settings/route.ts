import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import {
  listPlatformSettings,
  setPlatformSetting,
  PLATFORM_SETTING_KEYS,
} from '@/lib/settings/service';
import type { AuthIdentity } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const SettingsUpsertSchema = z.object({
  key: z.enum([
    PLATFORM_SETTING_KEYS.PUBLIC_DIRECTORY_ENABLED,
    PLATFORM_SETTING_KEYS.PUBLIC_TOPICS_ENABLED,
    PLATFORM_SETTING_KEYS.MAINTENANCE_MODE,
    PLATFORM_SETTING_KEYS.SEARCH_CONSOLE_ENABLED,
    PLATFORM_SETTING_KEYS.ENTITY_PUBLISHING_POLICY,
    PLATFORM_SETTING_KEYS.COMMUNITY_COMMENTS_ENABLED,
    PLATFORM_SETTING_KEYS.COMMUNITY_QUESTIONS_ENABLED,
    PLATFORM_SETTING_KEYS.COMMUNITY_ANSWERS_ENABLED,
    PLATFORM_SETTING_KEYS.COMMUNITY_VOTING_ENABLED,
    PLATFORM_SETTING_KEYS.COMMUNITY_REPORTS_ENABLED,
    PLATFORM_SETTING_KEYS.COMMUNITY_ANONYMOUS_PARTICIPATION_ENABLED,
    PLATFORM_SETTING_KEYS.COMMUNITY_MODERATION_POLICY,
    PLATFORM_SETTING_KEYS.COMMUNITY_REPORT_THRESHOLD,
    PLATFORM_SETTING_KEYS.COMMUNITY_QA_INDEXING_ENABLED,
    PLATFORM_SETTING_KEYS.COMMUNITY_CONTENT_VISIBILITY,
  ]),
  value: z.string().min(1).max(200),
});

export async function GET() {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json({ success: false, statusCode: 401, message: 'Authentication required.' }, { status: 401 });
  }
  try {
    const settings = await listPlatformSettings(identity as AuthIdentity);
    return NextResponse.json({ success: true, statusCode: 200, data: { settings } });
  } catch (error) {
    const status = (error as Error & { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json(
      { success: false, statusCode: status, message: (error as Error).message },
      { status }
    );
  }
}

export async function PATCH(request: Request) {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json({ success: false, statusCode: 401, message: 'Authentication required.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, statusCode: 400, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = SettingsUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, statusCode: 400, message: parsed.error.message },
      { status: 400 }
    );
  }

  try {
    const setting = await setPlatformSetting(identity as AuthIdentity, parsed.data.key, parsed.data.value);
    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: 'Platform setting updated.',
      data: { setting },
    });
  } catch (error) {
    const status = (error as Error & { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json(
      { success: false, statusCode: status, message: (error as Error).message },
      { status }
    );
  }
}
