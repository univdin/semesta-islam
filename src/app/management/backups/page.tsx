import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, DatabaseBackup } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { listBackups } from '@/lib/operations/backup';
import { BackupActions } from './BackupActions';

export const dynamic = 'force-dynamic';

export default async function ManagementBackupsPage() {
  const identity = await getServerIdentity();
  if (!identity || !identity.roles.includes('FOUNDER_ADMIN')) notFound();

  const backups = await listBackups(identity);

  return (
    <main className="main-content">
      <div className="container py-8 max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/management" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Backup &amp; Operasional</h1>
            <p className="text-sm text-gray-500">
              Provider: lokal (simulasi) · Restore selalu DRY-RUN / REVIEW
            </p>
          </div>
        </div>

        <BackupActions />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-heading">Riwayat Backup</h2>
          {backups.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <DatabaseBackup className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>Belum ada backup.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((b) => {
                const manifest = b.manifest && typeof b.manifest === 'object' ? (b.manifest as Record<string, unknown>) : {};
                return (
                  <div key={b.id} className="card p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        Backup {new Date(b.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {b.provider} · {typeof manifest.checksum === 'string' ? manifest.checksum.slice(0, 16) : '—'}…
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full ${b.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : b.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {b.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
