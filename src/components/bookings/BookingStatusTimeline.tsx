import React from 'react';
import { Ban, CheckCircle2, Circle, Clock, Info } from 'lucide-react';
import type { BookingStatus } from '@/types';

export interface LifecycleStep {
  status: BookingStatus;
  label: string;
  description: string;
  deferred: boolean;
}

/**
 * Canonical booking lifecycle for presentation.
 * Only PENDING and CONFIRMED are reachable through the domain layer today
 * (createBookingInquiry / confirmBooking). IN_PROGRESS and COMPLETED exist in
 * the BookingStatus enum but are NOT writable by any service — they are marked
 * `deferred` so the UI never implies progress that no event has recorded.
 */
export const BOOKING_LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    status: 'PENDING',
    label: 'Menunggu Konfirmasi Pendidik',
    description:
      'Pengajuan Anda telah diterima. Pendidik akan meninjau permintaan dan mengonfirmasi jadwal.',
    deferred: false,
  },
  {
    status: 'CONFIRMED',
    label: 'Sesi Dikonfirmasi',
    description: 'Pendidik telah menyetujui pengajuan sesi belajar Anda.',
    deferred: false,
  },
  {
    status: 'IN_PROGRESS',
    label: 'Sesi Berlangsung',
    description: 'Sesi bimbingan sedang berlangsung.',
    deferred: true,
  },
  {
    status: 'COMPLETED',
    label: 'Sesi Selesai',
    description: 'Sesi bimbingan telah selesai.',
    deferred: true,
  },
];

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Menunggu Konfirmasi',
  CONFIRMED: 'Sesi Dikonfirmasi',
  IN_PROGRESS: 'Sedang Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const STATUS_EXPLANATIONS: Record<BookingStatus, string> = {
  PENDING: 'Pengajuan sesi telah diterima. Pendidik akan meninjau permintaan Anda.',
  CONFIRMED: 'Pendidik telah menyetujui pengajuan sesi belajar Anda.',
  IN_PROGRESS: 'Sesi bimbingan sedang berlangsung.',
  COMPLETED: 'Sesi bimbingan telah selesai.',
  CANCELLED: 'Pengajuan sesi ini dibatalkan.',
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
};

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface BookingStatusTimelineProps {
  status: BookingStatus;
  createdAt: Date;
  confirmedAt?: Date | null;
}

export function BookingStatusTimeline({ status, createdAt, confirmedAt }: BookingStatusTimelineProps) {
  if (status === 'CANCELLED') {
    return (
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Ban className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-[#0F3D2E]">Status Pengajuan</h2>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${STATUS_STYLES.CANCELLED}`}
        >
          <Ban className="w-3.5 h-3.5" /> {STATUS_LABELS.CANCELLED}
        </span>
        <p className="text-sm text-gray-700 mt-3">{STATUS_EXPLANATIONS.CANCELLED}</p>
        <p className="text-xs text-gray-400 mt-3">Diajukan {formatDate(createdAt)}</p>
      </div>
    );
  }

  const currentIndex = BOOKING_LIFECYCLE_STEPS.findIndex((step) => step.status === status);

  return (
    <section className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[#D4AF37]" />
        <h2 className="text-lg font-bold text-[#0F3D2E]">Perjalanan Pengajuan</h2>
      </div>

      <span
        className={`text-xs font-semibold px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 mb-4 ${
          STATUS_STYLES[status]
        }`}
      >
        {status === 'CONFIRMED' || status === 'COMPLETED' ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          <Clock className="w-3.5 h-3.5" />
        )}
        {STATUS_LABELS[status]}
      </span>

      <ol className="space-y-0">
        {BOOKING_LIFECYCLE_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          const upcoming = index > currentIndex;

          return (
            <li key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                {done || current ? (
                  <CheckCircle2
                    className={`w-5 h-5 ${done ? 'text-emerald-600' : 'text-[#D4AF37]'}`}
                  />
                ) : (
                  <Circle
                    className={`w-5 h-5 ${step.deferred ? 'text-gray-300' : 'text-gray-300'}`}
                  />
                )}
                {index < BOOKING_LIFECYCLE_STEPS.length - 1 && (
                  <div
                    className={`w-px flex-1 min-h-[24px] ${
                      done ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              <div className="pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      current ? 'text-[#0F3D2E]' : done ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.deferred && (
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Mendatang
                    </span>
                  )}
                  {current && (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                      Status saat ini
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  {upcoming && step.deferred
                    ? 'Tersedia pada tahap berikutnya.'
                    : step.description}
                </p>

                {(done || current) && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    {step.status === 'PENDING'
                      ? `Diajukan ${formatDate(createdAt)}`
                      : step.status === 'CONFIRMED' && confirmedAt
                        ? `Dikonfirmasi ${formatDate(confirmedAt)}`
                        : null}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-2 p-3 bg-white/70 border border-emerald-900/10 rounded-xl text-sm text-gray-700 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#D4AF37]" />
        <span>
          {status === 'PENDING'
            ? 'Selanjutnya: tunggu konfirmasi dari pendidik. Status akan diperbarui di halaman ini.'
            : 'Sesi telah dikonfirmasi. Fitur penyelesaian sesi dan umpan balik akan tersedia pada tahap berikutnya.'}
        </span>
      </div>
    </section>
  );
}
