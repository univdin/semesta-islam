import React from 'react';
import { LayoutDashboard, ShieldCheck, Info } from 'lucide-react';
import { getServerIdentity, isDemoMode } from '@/lib/auth/session';
import { getEducatorIdForUser } from '@/lib/educators/service';
import { listBookingsForEducator, EducatorBookingItem } from '@/lib/bookings/service';
import { getAccountLedger } from '@/lib/ledger/service';
import { EducatorEconomySummary } from '@/components/educator/EducatorEconomySummary';
import { WorkspaceClient } from './WorkspaceClient';

export const dynamic = 'force-dynamic';

export default async function EducatorWorkspacePage() {
  const identity = await getServerIdentity();

  if (!identity) {
    return (
      <main className="main-content pt-20">
        <div className="container py-8 max-w-2xl">
          <div className="glass-panel p-6 md:p-10 rounded-2xl text-center">
            <LayoutDashboard className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0F3D2E] mb-2">Ruang Pendidik</h1>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Area kerja untuk pendidik melihat pengajuan sesi belajar dan mengonfirmasi jadwal.
            </p>
            {isDemoMode() && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
                Mode demo — pilih identitas demo <strong>Educator</strong> melalui pemilih identitas
                untuk melihat area kerja pendidik.
              </p>
            )}
            <p className="text-xs text-gray-500">
              Anda harus masuk sebagai pendidik terdaftar untuk mengakses area ini.
            </p>
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
            {isDemoMode() && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Mode demo — pilih identitas <strong>educator.demo@localhost.test</strong> untuk melihat
                area kerja pendidik.
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  const bookings = await listBookingsForEducator(educatorId);
  const ledger = await getAccountLedger(identity.userId);

  return (
    <>
      <EducatorEconomySummary ledger={ledger} educatorId={educatorId} />
      <WorkspaceClient identityEmail={identity.email} initialBookings={bookings} />
    </>
  );
}
