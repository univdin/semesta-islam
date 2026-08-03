import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { listPublishedChangelog } from '@/lib/changelog/service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catatan Perubahan & Pembaruan — SEMESTA ISLAM',
  description:
    'Lihat pembaruan terbaru platform SEMESTA ISLAM: fitur baru, perbaikan, dan peningkatan keamanan.',
  alternates: { canonical: '/changelog' },
};

export default async function ChangelogPublicPage() {
  const entries = await listPublishedChangelog();

  return (
    <main className="main-content">
      <div className="container py-8 max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Perubahan Terbaru</h1>
            <p className="text-sm text-gray-500">Catatan rilis produk SEMESTA ISLAM</p>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Megaphone className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Belum ada perubahan yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((e) => (
              <article key={e.id} className="card p-6 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{e.title}</h2>
                  {e.version && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-[#0F3D2E] text-[#D4AF37]">v{e.version}</span>
                  )}
                </div>
                {e.summary && <p className="text-sm text-gray-600 dark:text-gray-400">{e.summary}</p>}
                {e.publishedAt && (
                  <p className="text-xs text-gray-400">
                    {new Date(e.publishedAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
