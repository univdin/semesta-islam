/**
 * SEMESTA ISLAM — Notification Service
 * Governed by MASTER_EXECUTION_PROMPT §25.
 *
 * Toast = immediate UX feedback (UI-only).
 * Notification = persistent in-app message (DB-backed).
 * Email/Mailing = external delivery (adapter, separate).
 */

import { prisma } from '@/lib/db';
import type { NotificationType } from '@prisma/client';

export type NotificationTxClient = {
  notification: {
    create: (args: {
      data: {
        userId: string;
        type: NotificationType;
        title: string;
        body: string | null;
        metadata: object;
      };
    }) => Promise<unknown>;
  };
};

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput, tx?: NotificationTxClient) {
  const client = tx ?? prisma;
  return client.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      metadata: (input.metadata ?? {}) as object,
    },
  });
}

export async function listNotificationsForUser(userId: string, onlyUnread = false) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(onlyUnread ? { readAt: null } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
