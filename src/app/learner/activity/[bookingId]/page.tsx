import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  History,
  Info,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { getServerIdentity, isDemoMode } from '@/lib/auth/session';
import {
  getBookingDetail,
  BOOKING_METHOD_LABELS,
} from '@/lib/bookings/service';
import { BookingStatusTimeline } from '@/components/bookings/BookingStatusTimeline';

export const dynamic = 'force-dynamic';

const DEMO_LEARNER_USER_ID = '10000000-0000-0000-0000-000000000001';

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jumat',
  SATURDAY: 'Sabtu',
  SUNDAY: 'Minggu',
};

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function LearnerBookingDetailPage({ params }: PageProps) {
  const { bookingId } = await params;
  const identity = await getServerIdentity();

  let viewerUserId: string | null = identity?.userId ?? null;
  let demoFallback = false;

  if (!identity && isDemoMode()) {
    viewerUserId = DEMO_LEARNER_USER_ID;
    demoFallback = true;
  }

  if (!viewerUserId) {
    return (
      <main className="main-content pt-20">
        <div className="container py-8 max-w-2xl">
          <div className="glass-panel p-6 md:p-10 rounded-2xl text-center">
            <History className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F3D2E] mb-2">Detail Pengajuan</h1>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Masuk untuk melihat detail pengajuan sesi belajar Anda.
            </p>
            <Link href="/learner/activity" className="btn btn-primary text-sm inline-flex">
              Kembali ke Aktivitas Saya
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const booking = await getBookingDetail(bookingId);

  if (!booking) {
    notFound();
  }

  const isFounder = identity?.roles.includes('FOUNDER_ADMIN') ?? false;
  const isOwner = booking.learner.userId === viewerUserId;

  if (!isOwner && !isFounder) {
    notFound();
  }

  const scheduleLabel = booking.schedule
    ? `${DAY_LABELS[booking.schedule.dayOfWeek] ?? booking.schedule.dayOfWeek}, ${booking.schedule.startTime} – ${booking.schedule.endTime}`
    : null;

  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-3xl">
        <Link
          href="/learner/activity"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0F3D2E] mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Aktivitas Saya
        </Link>

        {demoFallback && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <span>
              Mode demo — menampilkan detail pengajuan akun pembelajar demo. Data ini adalah data
              simulasi untuk pengembangan lokal.
            </span>
          </div>
        )}

        <div className="space-y-6">
          <BookingStatusTimeline
            status={booking.status}
            createdAt={booking.createdAt}
            confirmedAt={booking.confirmedAt}
          />

          {/* Educator */}
          <section className="glass-panel p-6 rounded-2xl">
            <h2 className="text-base font-bold text-[#0F3D2E] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> Pendidik
            </h2>
            <Link
              href={`/educator/${booking.educator.slug || booking.educator.id}`}
              className="flex items-center gap-4 hover:opacity-90"
            >
              {booking.educator.avatar && (
                <img
                  src={booking.educator.avatar}
                  alt={booking.educator.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#0F3D2E]"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0F3D2E] flex items-center gap-1.5 flex-wrap">
                  {booking.educator.name}
                  {booking.educator.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Terverifikasi
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[booking.educator.title, booking.educator.institution]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </Link>
          </section>

          {/* Request info */}
          <section className="glass-panel p-6 rounded-2xl">
            <h2 className="text-base font-bold text-[#0F3D2E] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D4AF37]" /> Informasi Pengajuan
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  Metode belajar: <strong>{BOOKING_METHOD_LABELS[booking.learningMethod]}</strong>
                </span>
              </p>
              {booking.course && (
                <p className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>
                    Program: <strong>{booking.course.title}</strong>{' '}
                    <span className="text-gray-500">({booking.course.category})</span>
                  </span>
                </p>
              )}
              {scheduleLabel && (
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>Jadwal: <strong>{scheduleLabel}</strong></span>
                </p>
              )}
              {booking.notes && (
                <p className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{booking.notes}</span>
                </p>
              )}
            </div>
          </section>

          {/* Internal points */}
          {booking.pointsEarned > 0 && (
            <section className="glass-panel p-6 rounded-2xl">
              <h2 className="text-base font-bold text-[#0F3D2E] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D4AF37]" /> Poin Internal
              </h2>
              <div className="bg-[#0F3D2E] text-white rounded-xl p-5">
                <p className="text-xs text-emerald-200 mb-1">Poin dari pengajuan ini</p>
                <p className="text-3xl font-bold text-[#D4AF37]">+{booking.pointsEarned}</p>
                <p className="text-[11px] text-emerald-300 mt-2">
                  Poin internal platform — <strong>non-tunai</strong> dan{' '}
                  <strong>tidak dapat ditarik</strong>.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
