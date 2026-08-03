import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { listAllChangelog } from '@/lib/changelog/service';
import { ChangelogForm } from './ChangelogForm';

export const dynamic = 'force-dynamic';

export default async function ManagementCommunicationsPage() {
  const identity = await getServerIdentity();
  if (!identity || !identity.roles.includes('FOUNDER_ADMIN')) notFound();

  const entries = await listAllChangelog();

  return (
    <main className="main-content">
      <div className="container py-8 max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/management" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Komunikasi</h1>
            <p className="text-sm text-gray-500">Changelog produk &amp; pengumuman</p>
          </div>
        </div>

        <ChangelogForm />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-heading">Perubahan Terbaru</h2>
          {entries.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Megaphone className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>Belum ada changelog.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e.id} className="card p-4 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{e.title}</p>
                    <span className={`text-[10px] px-2 py-1 rounded-full ${e.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {e.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    v{e.version ?? '—'} · {e.audience} · {e.slug}
                  </p>
                  {e.summary && <p className="text-xs text-gray-600">{e.summary}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
