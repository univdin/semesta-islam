import { ShieldAlert } from 'lucide-react';
import { listVerificationQueue } from '@/lib/verification/service';
import { getServerIdentity, hasRole, isDemoMode } from '@/lib/auth/session';
import { LajnahClient } from './LajnahClient';

export const dynamic = 'force-dynamic';

export default async function LajnahDashboardPage() {
  const identity = await getServerIdentity();
  const authorized = identity && hasRole(identity, 'LAJNAH_VERIFIER', 'FOUNDER_ADMIN');

  if (!authorized) {
    return (
      <main className="main-content pt-20">
        <div className="container py-8 max-w-2xl">
          <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
            <div className="mx-auto w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-[#0F3D2E]">Akses Ditolak</h1>
            <p className="text-sm text-gray-600">
              Antrean verifikasi hanya dapat diakses oleh Lajnah Verifikasi Keilmuan
              (LAJNAH_VERIFIER) atau FOUNDER_ADMIN.
            </p>
            {isDemoMode() && (
              <p className="text-xs text-gray-400">
                Gunakan pemilih demo di pojok kanan bawah untuk masuk sebagai Lajnah Verifier, lalu muat ulang.
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  const queue = await listVerificationQueue();
  return <LajnahClient items={queue} />;
}
