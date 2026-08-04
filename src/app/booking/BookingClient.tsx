'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, User, Phone, Award, Info, CheckCircle, AlertCircle, History, BookOpen, MapPin, ClipboardList, ArrowRight } from 'lucide-react';
import { BookingInquirySchema } from '@/lib/validations';
import type { EducatorDetail } from '@/lib/educators/service';
import type { VerificationStatus } from '@/types';
import { useToast } from '@/components/ui/useToast';

interface BookingClientProps {
  educator: EducatorDetail;
  courseId?: string;
}

const VERIFICATION_STATUS: Record<VerificationStatus, { label: string; cls: string }> = {
  VERIFIED: { label: 'Terverifikasi Lajnah', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SUBMITTED: { label: 'Menunggu Verifikasi Lajnah', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  UNDER_REVIEW_LAJNAH: { label: 'Sedang Ditelaah Lajnah', cls: 'bg-blue-50 text-blue-800 border-blue-200' },
  REJECTED: { label: 'Verifikasi Ditolak', cls: 'bg-red-50 text-red-700 border-red-200' },
  DRAFT: { label: 'Belum Diverifikasi', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  REVOKED: { label: 'Verifikasi Dicabut', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export function BookingClient({ educator, courseId }: BookingClientProps) {
  const toast = useToast();
  const router = useRouter();
  const [learningMethod, setLearningMethod] = useState<'ONLINE_ZOOM' | 'PRIVATE_HOME' | 'GROUP_MAJELIS'>(
    (educator.method === 'Online (Zoom / Google Meet)') ? 'ONLINE_ZOOM' : 
    (educator.method === 'Privat Tatap Muka di Rumah') ? 'PRIVATE_HOME' : 'GROUP_MAJELIS'
  );
  
  // Set default selected course if provided
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || (educator.courses.length === 1 ? educator.courses[0].id : ''));
  const [preferredSchedule, setPreferredSchedule] = useState('');
  const [learnerName, setLearnerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<{
    bookingId: string;
    ledgerPointsEarned: number;
    paymentAmount: number;
    invoiceStatus: string | null;
    paymentMode: string | null;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const payload = {
      educatorId: educator.id,
      courseId: selectedCourseId || undefined,
      learningMethod,
      preferredSchedule,
      learnerName,
      contactPhone,
      notes
    };

    const validationResult = BookingInquirySchema.safeParse(payload);
    if (!validationResult.success) {
      const msg = validationResult.error.errors[0]?.message || 'Input tidak valid';
      setStatus('error');
      setErrorMessage(msg);
      toast.error('Pengajuan belum lengkap', msg);
      return;
    }

    try {
      const res = await fetch('/api/v1/bookings/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (res.status === 401) {
        // Session expired / not authenticated (server-side identity check).
        // Redirect to login preserving the booking page so the user returns.
        const redirect = encodeURIComponent(`/booking?educatorId=${educator.id}`);
        router.push(`/login?redirect=${redirect}`);
        router.refresh();
        return;
      }

      if (!res.ok || !body.success) {
        const msg = body.message || 'Pengajuan gagal dikirim. Silakan coba lagi.';
        setStatus('error');
        setErrorMessage(msg);
        toast.error('Gagal Mengirim Pengajuan', msg);
        return;
      }

      setStatus('success');
      toast.success(
        'Bismillah, Pengajuan Sesi Berhasil Terkirim!',
        `Permintaan Anda telah disampaikan kepada ${educator.name}. Anda mendapatkan +50 Poin Internal.`
      );
      setResult({
        bookingId: body.data?.bookingId ?? '',
        ledgerPointsEarned: body.data?.ledgerPointsEarned ?? 50,
        paymentAmount: body.data?.paymentAmount ?? 0,
        invoiceStatus: body.data?.invoiceStatus ?? null,
        paymentMode: body.data?.paymentMode ?? null,
      });
    } catch {
      const msg = 'Tidak dapat terhubung ke server. Pastikan layanan backend berjalan.';
      setStatus('error');
      setErrorMessage(msg);
      toast.error('Gangguan Koneksi', msg);
    }
  };

  return (
    <div className="glass-panel p-6 md:p-8 rounded-2xl">
      <h1 className="text-2xl font-bold text-[#0F3D2E] mb-2">Ajukan Sesi Belajar</h1>
      <p className="text-sm text-gray-600 mb-6">
        Ajukan permintaan sesi belajar atau bimbingan dengan pendidik pilihan Anda.
      </p>

      {/* Selected Educator Context */}
      <div className="bg-white/60 p-4 rounded-xl border border-emerald-900/10 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Anda sedang mengajukan sesi dengan
        </p>
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <img
            src={educator.avatar}
            alt={educator.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#0F3D2E] shrink-0"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-lg font-bold text-[#0F3D2E]">{educator.name}</h2>
            <p className="text-sm text-gray-600 font-medium mb-1">{educator.title}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {educator.location}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> {educator.method}
              </span>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium border ${
                  VERIFICATION_STATUS[educator.verifiedStatus]?.cls ?? 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {VERIFICATION_STATUS[educator.verifiedStatus]?.label ?? 'Belum Diverifikasi'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#E6F4ED] p-3 rounded-xl mb-6 text-xs text-emerald-800 flex items-start gap-2 border border-[#C2E3D0]">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
        <div>
          <strong className="block mb-0.5 text-emerald-900">Ini Pengajuan Permintaan — Bukan Pembayaran</strong>
          Permintaan jadwal ini akan dicatat dan pendidik akan meninjau jadwal Anda. Anda menerima 50 Poin
          Internal sebagai apresiasi. Poin bersifat non-tunai dan tidak dapat ditarik.
        </div>
      </div>

      {status === 'success' ? (
        <div className="text-center py-4">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0F3D2E]">Pengajuan Berhasil Dibuat</h2>
          <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
            Sesi Anda dengan <strong>{educator.name}</strong> telah diajukan. Status saat ini:{' '}
            <strong>Menunggu Konfirmasi</strong>.
          </p>

          {result?.bookingId && (
            <div className="mt-4 bg-white/70 border border-emerald-900/10 rounded-xl p-3 text-left max-w-md mx-auto">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#0F3D2E] shrink-0" />
                Nomor Pengajuan:{' '}
                <span className="font-mono text-[11px] text-gray-700 break-all">{result.bookingId}</span>
              </p>
            </div>
          )}

          {result?.ledgerPointsEarned != null && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-1">
              <p className="text-sm font-bold text-[#0F3D2E] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                Poin Internal Diterima: {result.ledgerPointsEarned} poin
              </p>
              <p className="text-xs text-gray-600">
                Poin internal platform — <strong>non-tunai</strong> dan <strong>tidak dapat ditarik</strong>.
              </p>
            </div>
          )}

          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-1">
            <p className="text-xs font-semibold text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              Belum ada pembayaran — tagihan hanya dibuat setelah sesi dikonfirmasi pendidik.
            </p>
          </div>

          <div className="mt-5 bg-white/70 border border-emerald-900/10 rounded-xl p-4 text-left max-w-md mx-auto">
            <p className="text-xs font-semibold text-[#0F3D2E] mb-2">Langkah Selanjutnya</p>
            <ol className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#D4AF37]" />
                Pendidik akan meninjau permintaan jadwal Anda.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#D4AF37]" />
                Jika disetujui, status berubah menjadi &ldquo;Sesi Dikonfirmasi&rdquo;.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#D4AF37]" />
                Pantau perkembangan di Aktivitas Saya.
              </li>
            </ol>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/learner/activity/${result?.bookingId ?? ''}`}
              className="btn btn-primary text-sm inline-flex items-center justify-center"
            >
              Lihat Detail Pengajuan
            </Link>
            <Link
              href="/learner/activity"
              className="btn btn-secondary text-sm inline-flex items-center justify-center"
            >
              <History className="w-4 h-4 mr-2" /> Aktivitas Saya
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {status === 'error' && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {educator.courses.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Program Belajar (Opsional)</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E]"
              >
                <option value="">Pilih Program Belajar</option>
                {educator.courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title} — {course.category}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Nama Pembelajar</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={learnerName}
                  onChange={(e) => setLearnerName(e.target.value)}
                  placeholder="Nama lengkap..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Nomor WhatsApp / HP</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Metode Belajar</label>
            <select
              value={learningMethod}
              onChange={(e) => setLearningMethod(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E]"
            >
              <option value="ONLINE_ZOOM">Online Via Zoom / Google Meet</option>
              <option value="PRIVATE_HOME">Privat Tatap Muka di Rumah</option>
              <option value="GROUP_MAJELIS">Majelis / Kelompok Belajar</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Pendidik ini mengutamakan metode: {educator.method}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Preferensi Jadwal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={preferredSchedule}
                onChange={(e) => setPreferredSchedule(e.target.value)}
                placeholder="Contoh: Setiap Sabtu, Jam 16.00 WIB"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Catatan Khusus (Opsional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sampaikan level bacaan / hafalan saat ini..."
              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E]"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full btn btn-primary py-3.5 text-sm font-semibold rounded-xl"
          >
            {status === 'submitting' ? 'Memproses Pengajuan...' : 'Ajukan Sesi'}
          </button>
        </form>
      )}
    </div>
  );
}
