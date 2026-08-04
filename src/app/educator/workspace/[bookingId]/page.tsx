import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Info, LayoutDashboard, ShieldCheck, User, Coins } from 'lucide-react';
import { getServerIdentity, isDemoMode } from '@/lib/auth/session';
import { getEducatorIdForUser } from '@/lib/educators/service';
import { getBookingDetail, BOOKING_METHOD_LABELS } from '@/lib/bookings/service';
import { BookingStatusTimeline } from '@/components/bookings/BookingStatusTimeline';
import { RequestDetailClient } from './RequestDetailClient';

export const dynamic = 'force-dynamic';

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

export default async function EducatorRequestDetailPage({ params }: PageProps) {
  const { bookingId } = await params;
  const identity = await getServerIdentity();

  if (!identity) {
    return (
      <main className="main-content pt-20">
        <div className="container py-8 max-w-2xl">
          <div className="glass-panel p-6 md:p-10 rounded-2xl text-center">
            <LayoutDashboard className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F3D2E] mb-2">Detail Pengajuan Sesi</h1>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Masuk sebagai pendidik pemilik pengajuan untuk melihat detail.
            </p>
            {isDemoMode() && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
                Mode demo — pilih identitas demo <strong>Educator</strong> melalui pemilih identitas.
              </p>
            )}
            <Link href="/educator/workspace" className="btn btn-primary text-sm inline-flex">
              Kembali ke Ruang Pendidik
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const educatorId = await getEducatorIdForUser(identity.userId);

  if (!educatorId) {
    return (
      <main className="main-content pt-20">
        <div className="container py-8 max-w-2xl">
          <div className="glass-panel p-6 md:p-10 rounded-2xl text-center">
            <ShieldCheck className="w-12 h-12 text-[#0F3D2E] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F3D2E] mb-2">Ruang Pendidik</h1>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Akun Anda belum terhubung ke profil pendidik terdaftar.
            </p>
            <Link href="/educator/workspace" className="btn btn-primary text-sm inline-flex">
              Kembali ke Ruang Pendidik
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

  const isFounder = identity.roles.includes('FOUNDER_ADMIN');
  const isOwnerEducator = booking.educator.userId === identity.userId;

  if (!isOwnerEducator && !isFounder) {
    notFound();
  }

  const scheduleLabel = booking.schedule
    ? `${DAY_LABELS[booking.schedule.dayOfWeek] ?? booking.schedule.dayOfWeek}, ${booking.schedule.startTime} – ${booking.schedule.endTime}`
    : null;

  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-3xl">
        <Link
          href="/educator/workspace"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0F3D2E] mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Ruang Pendidik
        </Link>

        <div className="space-y-6">
          <BookingStatusTimeline
            status={booking.status}
            createdAt={booking.createdAt}
            confirmedAt={booking.confirmedAt}
          />

          <RequestDetailClient
            bookingId={booking.id}
            status={booking.status}
            identityEmail={identity.email}
          />

          {/* Learner */}
          <section className="glass-panel p-6 rounded-2xl">
            <h2 className="text-base font-bold text-[#0F3D2E] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#D4AF37]" /> Pembelajar
            </h2>
            <p className="font-bold text-[#0F3D2E]">{booking.learner.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              Pengajuan dicatat pada {new Date(booking.createdAt).toLocaleDateString('id-ID')}.
            </p>
          </section>

          {/* Request info */}
          <section className="glass-panel p-6 rounded-2xl">
            <h2 className="text-base font-bold text-[#0F3D2E] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" /> Informasi Pengajuan
            </h2>            <div className="space-y-3 text-sm text-gray-700">
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
                  <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
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

          {/* Economy state (internal, non-cash) */}
          <section className="glass-panel p-6 rounded-2xl">
            <h2 className="text-base font-bold text-[#0F3D2E] mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#D4AF37]" /> Status Ekonomi Internal
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <Coins className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  Poin pembelajar tercatat pada pengajuan: <strong>{booking.pointsEarned}</strong> poin
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  Poin internal platform — <strong>non-tunai dan tidak dapat ditarik</strong>. Pembayaran
                  eksternal belum diaktifkan; tidak ada tagihan/invoice riil pada pengajuan ini.
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
