/**
 * SEMESTA ISLAM — Booking Inquiry & Confirmation Service (DB-backed)
 * Governed by docs/03_ERD.md §3.5 & docs/07_API_ENDPOINTS.md §2.6
 */

import { prisma } from '@/lib/db';
import { UserRole, BookingStatus, LearningMethod } from '@/types';
import type { BookingInquiryPayload } from '@/types';
import { getPlatformCommissionPercentage } from '@/lib/ledger/service';
import { executeEconomicEffect } from '@/lib/economy/service';

export interface ServiceResult<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

const INQUIRY_LEARNER_POINTS = 50;

export async function createBookingInquiry(
  input: BookingInquiryPayload & { learnerUserId: string }
): Promise<ServiceResult<{ bookingId: string; status: string; ledgerPointsEarned: number }>> {
  const educator = await prisma.educatorProfile.findUnique({
    where: { id: input.educatorId },
    include: {
      courses: input.courseId ? { where: { id: input.courseId } } : false,
    },
  });

  if (!educator) {
    return {
      success: false,
      statusCode: 404,
      message: 'Educator not found for the requested booking inquiry',
    };
  }

  if (input.courseId && educator.courses.length === 0) {
    return {
      success: false,
      statusCode: 400,
      message: 'The selected course does not belong to this educator',
    };
  }

  const notes = [
    `Nama pembelajar: ${input.learnerName}`,
    `Kontak WhatsApp/HP: ${input.contactPhone}`,
    `Preferensi jadwal: ${input.preferredSchedule}`,
    input.notes ? `Catatan: ${input.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.bookingRequest.create({
      data: {
        learnerUserId: input.learnerUserId,
        educatorId: input.educatorId,
        courseId: input.courseId ?? null,
        scheduleId: input.scheduleId ?? null,
        learningMethod: input.learningMethod,
        status: 'PENDING',
        notes,
      },
    });

    // Economy goes through the canonical transaction service — the booking code
    // never writes the ledger directly. Idempotent per booking.
    const econ = await executeEconomicEffect(
      {
        type: 'EARN',
        actorUserId: input.learnerUserId,
        accountOwnerId: input.learnerUserId,
        amount: INQUIRY_LEARNER_POINTS,
        idempotencyKey: `booking-inquiry:${booking.id}`,
        source: 'BOOKING_INQUIRY',
        reference: booking.id,
        reason: `Poin pendaftaran booking inquiry (${booking.id})`,
      },
      tx
    );

    await tx.auditLog.create({
      data: {
        actorUserId: input.learnerUserId,
        actionType: 'BOOKING_INQUIRED',
        entityAffected: 'booking_requests',
        metadata: {
          entityId: booking.id,
          status: 'PENDING',
          ledgerPointsEarned: INQUIRY_LEARNER_POINTS,
          transactionId: econ.transaction.id,
          ledgerEntryId: econ.entry?.id ?? null,
          learnerName: input.learnerName,
          contactPhone: input.contactPhone,
        },
      },
    });

    return booking;
  });

  return {
    success: true,
    statusCode: 201,
    message: 'Booking inquiry submitted successfully and logged to virtual ledger',
    data: {
      bookingId: result.id,
      status: result.status,
      ledgerPointsEarned: INQUIRY_LEARNER_POINTS,
    },
  };
}

export interface ConfirmBookingInput {
  bookingId: string;
  actorUserId: string;
  actorRoles: UserRole[];
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Menunggu Konfirmasi',
  CONFIRMED: 'Sesi Dikonfirmasi',
  IN_PROGRESS: 'Sedang Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

export const BOOKING_METHOD_LABELS: Record<LearningMethod, string> = {
  ONLINE_ZOOM: 'Online (Zoom / Google Meet)',
  PRIVATE_HOME: 'Privat Tatap Muka di Rumah',
  GROUP_MAJELIS: 'Majelis / Kelompok Belajar',
};

export interface LearnerBookingItem {
  id: string;
  status: BookingStatus;
  learningMethod: LearningMethod;
  notes: string | null;
  createdAt: Date;
  educatorName: string;
  educatorTitle: string;
  educatorInstitution: string;
}

export interface EducatorBookingItem {
  id: string;
  status: BookingStatus;
  learningMethod: LearningMethod;
  notes: string | null;
  createdAt: Date;
  learnerName: string;
}

export async function listBookingsForLearner(learnerUserId: string): Promise<LearnerBookingItem[]> {
  const rows = await prisma.bookingRequest.findMany({
    where: { learnerUserId },
    orderBy: { createdAt: 'desc' },
    include: {
      educator: {
        select: {
          user: { select: { email: true, profile: true } },
          titleSuffix: true,
          institutionName: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    learningMethod: row.learningMethod,
    notes: row.notes,
    createdAt: row.createdAt,
    educatorName: row.educator.user.profile?.fullName ?? row.educator.user.email,
    educatorTitle: row.educator.titleSuffix ?? '',
    educatorInstitution: row.educator.institutionName ?? '',
  }));
}

export async function listBookingsForEducator(educatorProfileId: string): Promise<EducatorBookingItem[]> {
  const rows = await prisma.bookingRequest.findMany({
    where: { educatorId: educatorProfileId },
    orderBy: { createdAt: 'desc' },
    include: {
      learner: { select: { email: true, profile: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    learningMethod: row.learningMethod,
    notes: row.notes,
    createdAt: row.createdAt,
    learnerName: row.learner.profile?.fullName ?? row.learner.email,
  }));
}

export interface BookingCourseInfo {
  id: string;
  title: string;
  category: string;
}

export interface BookingScheduleInfo {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface BookingDetail {
  id: string;
  status: BookingStatus;
  learningMethod: LearningMethod;
  notes: string | null;
  createdAt: Date;
  confirmedAt: Date | null;
  pointsEarned: number;
  learner: { userId: string; name: string };
  educator: {
    id: string;
    slug: string;
    userId: string;
    name: string;
    title: string;
    institution: string;
    avatar: string;
    verified: boolean;
  };
  course: BookingCourseInfo | null;
  schedule: BookingScheduleInfo | null;
}

/**
 * Read-only booking detail used by learner & educator detail surfaces.
 * `confirmedAt` is derived from the persisted BOOKING_CONFIRMED audit event
 * (the booking row itself carries no confirmation timestamp). `pointsEarned`
 * is the sum of persisted LEARNER_POINT ledger entries that reference this
 * booking in their description.
 */
export async function getBookingDetail(bookingId: string): Promise<BookingDetail | null> {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: bookingId },
    include: {
      learner: { select: { id: true, email: true, profile: true } },
      educator: {
        select: {
          id: true,
          slug: true,
          userId: true,
          titleSuffix: true,
          institutionName: true,
          verifiedStatus: true,
          user: { select: { email: true, profile: true } },
        },
      },
      course: { select: { id: true, title: true, category: true } },
      schedule: { select: { id: true, dayOfWeek: true, startTime: true, endTime: true } },
    },
  });

  if (!booking) return null;

  const [confirmEvent, pointRows] = await Promise.all([
    prisma.auditLog.findFirst({
      where: {
        actionType: 'BOOKING_CONFIRMED',
        entityAffected: 'booking_requests',
        metadata: { path: ['bookingId'], equals: bookingId },
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    prisma.economicLedger.findMany({
      where: {
        accountOwnerId: booking.learnerUserId,
        entryType: 'LEARNER_POINT',
        description: { contains: `(${bookingId})` },
      },
      select: { amount: true },
    }),
  ]);

  const learnerProfile = booking.learner.profile;
  const educatorProfile = booking.educator.user.profile;

  return {
    id: booking.id,
    status: booking.status,
    learningMethod: booking.learningMethod,
    notes: booking.notes,
    createdAt: booking.createdAt,
    confirmedAt: confirmEvent?.createdAt ?? null,
    pointsEarned: pointRows.reduce((sum, row) => sum + row.amount, 0),
    learner: {
      userId: booking.learner.id,
      name: learnerProfile?.fullName ?? booking.learner.email,
    },
    educator: {
      id: booking.educator.id,
      slug: booking.educator.slug ?? '',
      userId: booking.educator.userId,
      name: educatorProfile?.fullName ?? booking.educator.user.email,
      title: booking.educator.titleSuffix ?? '',
      institution: booking.educator.institutionName ?? '',
      avatar: educatorProfile?.avatarUrl ?? '',
      verified: booking.educator.verifiedStatus === 'VERIFIED',
    },
    course: booking.course,
    schedule: booking.schedule,
  };
}

export async function confirmBooking(
  input: ConfirmBookingInput
): Promise<ServiceResult<{ bookingId: string; status: string }>> {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: input.bookingId },
    include: { educator: { select: { userId: true } } },
  });

  if (!booking) {
    return { success: false, statusCode: 404, message: 'Booking not found' };
  }

  if (booking.status !== 'PENDING') {
    return {
      success: false,
      statusCode: 409,
      message: `Conflict: Booking cannot be confirmed from status ${booking.status}`,
    };
  }

  const isFounder = input.actorRoles.includes('FOUNDER_ADMIN');
  const isOwnerEducator =
    input.actorRoles.includes('EDUCATOR') && booking.educator.userId === input.actorUserId;

  if (!isFounder && !isOwnerEducator) {
    return {
      success: false,
      statusCode: 403,
      message: 'Forbidden: Only the owning educator or a FOUNDER_ADMIN can confirm this booking',
    };
  }

  const platformAccount = await prisma.user.findFirst({
    where: { roles: { some: { role: 'FOUNDER_ADMIN' } } },
    select: { id: true },
  });

  const commissionPercent = getPlatformCommissionPercentage();

  await prisma.$transaction(async (tx) => {
    await tx.bookingRequest.update({
      where: { id: input.bookingId },
      data: { status: 'CONFIRMED' },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        actionType: 'BOOKING_CONFIRMED',
        entityAffected: 'booking_requests',
        metadata: { entityId: input.bookingId, previousStatus: 'PENDING', newStatus: 'CONFIRMED' },
      },
    });

    // Platform commission accrues through the canonical economy service
    // (idempotent per booking). Zero commission = no economic effect.
    if (platformAccount && commissionPercent > 0) {
      await executeEconomicEffect(
        {
          type: 'FEE_COLLECTION',
          actorUserId: input.actorUserId,
          accountOwnerId: platformAccount.id,
          amount: commissionPercent,
          idempotencyKey: `booking-confirm-fee:${input.bookingId}`,
          source: 'BOOKING_CONFIRM',
          reference: input.bookingId,
          reason: `Komisi platform internal (non-tunai, closed-loop) booking ${input.bookingId} dikonfirmasi`,
        },
        tx
      );
    }
  });

  return {
    success: true,
    statusCode: 200,
    message: `Booking ${input.bookingId} successfully confirmed`,
    data: { bookingId: input.bookingId, status: 'CONFIRMED' },
  };
}
