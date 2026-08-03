'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  LayoutDashboard,
  MapPin,
  BookOpen,
  Info,
  Loader2,
  Check,
  User,
  ArrowRight,
} from 'lucide-react';
import type { BookingStatus, LearningMethod } from '@/types';
import type { EducatorBookingItem } from '@/lib/bookings/service';

interface WorkspaceClientProps {
  identityEmail: string;
  initialBookings: EducatorBookingItem[];
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Menunggu Konfirmasi',
  CONFIRMED: 'Sesi Dikonfirmasi',
  IN_PROGRESS: 'Sedang Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
};

const METHOD_LABELS: Record<LearningMethod, string> = {
  ONLINE_ZOOM: 'Online (Zoom / Google Meet)',
  PRIVATE_HOME: 'Privat Tatap Muka di Rumah',
  GROUP_MAJELIS: 'Majelis / Kelompok Belajar',
};

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WorkspaceClient({ identityEmail, initialBookings }: WorkspaceClientProps) {
  const [bookings, setBookings] = useState<EducatorBookingItem[]>(initialBookings);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  const handleConfirm = async (bookingId: string) => {
    setConfirmingId(bookingId);
    setActionMessage(null);
    try {
      const res = await fetch('/api/v1/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setActionMessage({
          type: 'error',
          text:
            body.statusCode === 401
              ? 'Anda harus masuk sebagai pendidik pemilik pengajuan ini. Pilih identitas demo Educator terlebih dahulu.'
              : body.message || 'Konfirmasi gagal. Silakan coba lagi.',
        });
        return;
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CONFIRMED' as BookingStatus } : b))
      );
      setActionMessage({ type: 'success', text: 'Sesi berhasil dikonfirmasi.' });
    } catch {
      setActionMessage({ type: 'error', text: 'Tidak dapat terhubung ke server. Silakan coba lagi.' });
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <main className="main-content pt-20">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F3D2E] flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-[#D4AF37]" /> Ruang Pendidik
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Akun: <span className="font-mono text-xs">{identityEmail}</span>
            </p>
          </div>
          <span className="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full w-fit">
            {pendingCount} pengajuan menunggu konfirmasi
          </span>
        </div>

        <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-900 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
          <span>
            Pengajuan di bawah datang dari pembelajar yang mengajukan jadwal bimbingan. Konfirmasi
            jadwal yang disetujui agar status terlihat oleh pembelajar di Aktivitas Saya.
          </span>
        </div>

        {actionMessage && (
          <div
            className={`mb-5 p-3 rounded-xl text-sm flex items-center gap-2 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <Info className="w-4 h-4 shrink-0" />
            )}
            {actionMessage.text}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl text-center">
            <p className="text-sm text-gray-600">
              Belum ada pengajuan sesi belajar untuk profil Anda saat ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const pending = booking.status === 'PENDING';
              return (
                <div key={booking.id} className="glass-panel p-5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-[#0F3D2E] flex items-center gap-2">
                        <User className="w-4 h-4 text-[#D4AF37]" /> {booking.learnerName}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 w-fit mt-2 ${
                          STATUS_STYLES[booking.status]
                        }`}
                      >
                        {booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </div>

                    {pending && (
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        disabled={confirmingId === booking.id}
                        className="btn btn-primary text-sm py-2 px-4 disabled:opacity-60 w-fit"
                      >
                        {confirmingId === booking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span className="ml-2">Konfirmasi Sesi</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      {METHOD_LABELS[booking.learningMethod]}
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span>{booking.notes ?? 'Detail jadwal menunggu koordinasi.'}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-3">
                    <p className="text-xs text-gray-400">
                      Diajukan {formatDate(booking.createdAt)}
                    </p>
                    <Link
                      href={`/educator/workspace/${booking.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F3D2E] hover:opacity-80 shrink-0"
                    >
                      Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
