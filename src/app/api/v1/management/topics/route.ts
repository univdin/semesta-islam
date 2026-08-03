import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerIdentity } from '@/lib/auth/session';
import {
  createTopic,
  publishTopic,
  archiveTopic,
  listPublishedTopics,
} from '@/lib/topics/service';
import type { AuthIdentity } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const CreateTopicSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(1000).optional(),
  parentId: z.string().uuid().optional().nullable(),
  aliases: z.array(z.string().min(2).max(120)).max(20).optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
});

const TopicActionSchema = z.object({
  topicId: z.string().uuid(),
  action: z.enum(['publish', 'archive']),
});

export async function GET() {
  const identity = await getServerIdentity();
  if (!identity) {
    return NextResponse.json({ success: false, statusCode: 401, message: 'Authentication required.' }, { status: 401 });
  }
  try {
    const topics = await listPublishedTopics({ includeThin: true });
    return NextResponse.json({ success: true, statusCode: 200, data: { topics } });
  } catch (error) {
    const status = (error as Error & { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json(
      { success: false, statusCode: status, message: (error as Error).message },
      { status }
    );
  }
}

export async function POST(request: Request) {
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

  const parsed = CreateTopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, statusCode: 400, message: parsed.error.message },
      { status: 400 }
    );
  }

  try {
    const { topic } = await createTopic(identity as AuthIdentity, parsed.data);
    return NextResponse.json({
      success: true,
      statusCode: 201,
      message: 'Topic created as DRAFT. Publish it to make it visible.',
      data: { topic },
    });
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

  const parsed = TopicActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, statusCode: 400, message: parsed.error.message },
      { status: 400 }
    );
  }

  try {
    const { action, topicId } = parsed.data;
    const result =
      action === 'publish'
        ? await publishTopic(identity as AuthIdentity, topicId)
        : await archiveTopic(identity as AuthIdentity, topicId);
    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: `Topic ${action === 'publish' ? 'published' : 'archived'}.`,
      data: { topic: result.topic },
    });
  } catch (error) {
    const status = (error as Error & { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json(
      { success: false, statusCode: status, message: (error as Error).message },
      { status }
    );
  }
}
