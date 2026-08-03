import React from 'react';
import Link from 'next/link';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Info,
  MapPin,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { getServerIdentity, isDemoMode } from '@/lib/auth/session';
import {
  listBookingsForLearner,
  BOOKING_STATUS_LABELS,
  BOOKING_METHOD_LABELS,
} from '@/lib/bookings/service';
import { getAccountLedger } from '@/lib/ledger/service';

export const dynamic = 'force-dynamic';

const DEMO_LEARNER_USER_ID = '10000000-0000-0000-0000-000000000001';
const DEMO_LEARNER_EMAIL = 'learner.demo@localhost.test';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function LearnerActivityPage() {
  const identity = await getServerIdentity();

  let learnerUserId: string;
  let accountLabel: string;
  let demoFallback = false;

  if (identity) {
    learnerUserId = identity.userId;
    accountLabel = identity.email;
  } else if (isDemoMode()) {
    learnerUserId = DEMO_LEARNER_USER_ID;
    accountLabel = DEMO_LEARNER_EMAIL;
    demoFallback = true;
  } else {
    return (
      <main className="main-content pt-20">
        <div className="container py-8 max-w-2xl">
          <div className="glass-panel p-6 md:p-10 rounded-2xl text-center">
            <History className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F3D2E] mb-2">Aktivitas Saya</h1>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Masuk untuk melihat riwayat pengajuan sesi belajar dan saldo poin internal Anda.
            </p>
            <Link href="/directory" className="btn btn-primary text-sm inline-flex">
              Jelajahi Direktori Pendidik
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [bookings, ledger] = await Promise.all([
    listBookingsForLearner(learnerUserId),
    getAccountLedger(learnerUserId),
  ]);

  const { totalPoints, totalVoucherCredits } = ledger.balance;

  return (
    <main className="main-content pt-20">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F3D2E]">Aktivitas Saya</h1>
            <p className="text-sm text-gray-500 mt-1">
              Akun: <span className="font-mono text-xs">{accountLabel}</span>
            </p>
          </div>
        </div>

        {demoFallback && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <span>
              Mode demo — menampilkan aktivitas akun pendidik/pembelajar demo. Gunakan pemilih identitas
              demo untuk melihat akun lain.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column: bookings */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F3D2E] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D4AF37]" /> Pengajuan Sesi Belajar
              </h2>
            </div>

            {bookings.length === 0 ? (
              <div className="glass-panel p-6 rounded-2xl text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Belum ada pengajuan sesi belajar. Temukan pendidik terverifikasi dan ajukan jadwal
                  pertemuan pertama Anda.
                </p>
                <Link href="/directory" className="btn btn-primary text-sm inline-flex">
                  Cari Pendidik <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="glass-panel p-5 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-[#0F3D2E]">{booking.educatorName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {booking.educatorTitle}
                          {booking.educatorInstitution && ` · ${booking.educatorInstitution}`}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 w-fit ${
                          STATUS_STYLES[booking.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        {BOOKING_METHOD_LABELS[booking.learningMethod]}
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>{booking.notes ?? 'Detail jadwal akan dikonfirmasi pendidik.'}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-3">
                      <p className="text-xs text-gray-400">
                        Diajukan {formatDate(booking.createdAt)}
                      </p>
                      <Link
                        href={`/learner/activity/${booking.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F3D2E] hover:opacity-80 shrink-0"
                      >
                        Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: points */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-base font-bold text-[#0F3D2E] flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-[#D4AF37]" /> Poin Internal
              </h2>
              <div className="bg-[#0F3D2E] text-white rounded-xl p-5 mb-4">
                <p className="text-xs text-emerald-200 mb-1">Saldo Poin Internal</p>
                <p className="text-3xl font-bold text-[#D4AF37]">{totalPoints}</p>
                <p className="text-[11px] text-emerald-300 mt-2">
                  Nilai internal platform — <strong>non-tunai</strong> dan <strong>tidak dapat ditarik</strong>.
                </p>
              </div>

              {totalVoucherCredits > 0 && (
                <p className="text-sm text-gray-600 mb-3">
                  Kredit voucher: <strong>{totalVoucherCredits}</strong>
                </p>
              )}

              {ledger.entries.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Belum ada aktivitas poin. Ajukan sesi belajar untuk mulai mengumpulkan poin.
                </p>
              ) : (
                <ul className="space-y-3">
                  {ledger.entries.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-3">
                      <div className="bg-amber-50 text-[#D4AF37] p-1.5 rounded-lg shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-snug">{entry.description}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(entry.createdAt)}</p>
                      </div>
                      <span className="text-sm font-bold text-[#0F3D2E] shrink-0">
                        +{entry.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
