'use client';

import React, { useState } from 'react';
import { Check, Info, Loader2 } from 'lucide-react';
import type { BookingStatus } from '@/types';

interface RequestDetailClientProps {
  bookingId: string;
  status: BookingStatus;
  identityEmail: string;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Menunggu Konfirmasi',
  CONFIRMED: 'Sesi Dikonfirmasi',
  IN_PROGRESS: 'Sedang Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

export function RequestDetailClient({ bookingId, status, identityEmail }: RequestDetailClientProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleConfirm = async () => {
    setIsConfirming(true);
    setMessage(null);
    try {
      const res = await fetch('/api/v1/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setMessage({
          type: 'error',
          text:
            body.statusCode === 401
              ? 'Anda harus masuk sebagai pendidik pemilik pengajuan ini. Pilih identitas demo Educator terlebih dahulu.'
              : body.message || 'Konfirmasi gagal. Silakan coba lagi.',
        });
        return;
      }

      setMessage({ type: 'success', text: 'Sesi berhasil dikonfirmasi. Status telah diperbarui.' });
      setTimeout(() => window.location.reload(), 900);
    } catch {
      setMessage({ type: 'error', text: 'Tidak dapat terhubung ke server. Silakan coba lagi.' });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <section className="glass-panel p-6 rounded-2xl">
      <h2 className="text-base font-bold text-[#0F3D2E] mb-2 flex items-center gap-2">
        <Check className="w-5 h-5 text-[#D4AF37]" /> Tindakan
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Akun: <span className="font-mono">{identityEmail}</span>
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {status === 'PENDING' ? (
        <button
          onClick={handleConfirm}
          disabled={isConfirming}
          className="btn btn-primary text-sm py-3 px-6 disabled:opacity-60 inline-flex items-center justify-center"
        >
          {isConfirming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span className="ml-2">Konfirmasi Sesi</span>
        </button>
      ) : (
        <p className="text-sm text-gray-700">
          Pengajuan ini berstatus <strong>{STATUS_LABELS[status]}</strong>. Tidak ada tindakan lebih
          lanjut yang tersedia pada tahap ini.
        </p>
      )}
    </section>
  );
}
