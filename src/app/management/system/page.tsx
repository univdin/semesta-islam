import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Activity } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { listIntegrationHealth } from '@/lib/integrations/service';

export const dynamic = 'force-dynamic';

export default async function ManagementSystemPage() {
  const identity = await getServerIdentity();
  if (!identity || !identity.roles.includes('FOUNDER_ADMIN')) notFound();

  const health = await listIntegrationHealth();

  const statusColor = (status: string) => {
    if (status === 'CONNECTED' || status === 'SYNCED') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (status === 'FAILED') return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <main className="main-content">
      <div className="container py-8 max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/management" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Sistem &amp; Integrasi</h1>
            <p className="text-sm text-gray-500">Kesehatan integrasi eksternal (Google Cloud / Workspace)</p>
          </div>
        </div>

        {health.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Activity className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Belum ada data kesehatan integrasi.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {health.map((h) => (
              <div key={h.id} className="card p-4 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{h.provider}</p>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${statusColor(h.status)}`}>{h.status}</span>
                </div>
                {h.errorMessage && <p className="text-xs text-gray-500">{h.errorMessage}</p>}
                <div className="flex flex-wrap gap-4 text-[11px] text-gray-400">
                  {h.lastSuccessAt && <span>Sukses: {new Date(h.lastSuccessAt).toLocaleString('id-ID')}</span>}
                  {h.lastFailureAt && <span>Gagal: {new Date(h.lastFailureAt).toLocaleString('id-ID')}</span>}
                  {h.errorCode && <span>Kode: {h.errorCode}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 text-sm px-4 py-3 rounded-xl">
          Integrasi Google (Drive, Gmail, Calendar, Meet, Sheets, Docs, Workspace Admin) memerlukan konfigurasi cloud:
          OAuth / service account, folder Drive target, dan kredensial server-side. Lihat docs/integrations/.
        </div>
      </div>
    </main>
  );
}
