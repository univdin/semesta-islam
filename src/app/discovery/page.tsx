import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diagnostik & Rekomendasi Pembelajaran — ILMIFY',
  description: 'Temukan jalur pembelajaran Islam yang sesuai dengan kebutuhan keluarga dan tingkat pemahaman Anda.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Diagnostik Pembelajaran Islam — ILMIFY',
    description: 'Temukan rekomendasi metode, materi, dan pengajar ber-sanad yang tepat untuk Anda & keluarga.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Diagnostik Pembelajaran Islam — ILMIFY',
      },
    ],
  },
};

export default function DiscoveryPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium text-xs rounded-full border border-amber-500/20">
            Syi'ar & Discovery Engine · Pratinjau (UI)
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F3D2E] dark:text-[#F3E5AB]">
            Diagnostik Pembelajaran Islam Keluarga
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Bantu kami memahami kebutuhan belajar Anda atau keluarga untuk menyusun rekomendasi metode, materi, dan pengajar ber-sanad yang tepat.
          </p>
        </div>

        {/* Diagnostic Wizard Card */}
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-semibold text-[#0F3D2E] dark:text-slate-100">Langkah 1 dari 3: Fokus Kebutuhan</h2>
            <span className="text-xs font-mono text-slate-400">Step ID: DIAG-01</span>
          </div>

          <form className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Siapa yang akan menjalankan jalur pembelajaran ini?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="border border-emerald-900/10 dark:border-emerald-100/10 hover:border-emerald-700/50 p-4 rounded-xl cursor-pointer flex flex-col space-y-1 bg-surface hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition">
                  <input type="radio" name="targetAudience" value="KIDS" className="sr-only" defaultChecked />
                  <span className="font-semibold text-sm text-[#0F3D2E] dark:text-emerald-400">Anak-Anak & Remaja</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Pendampingan tajwid, hafalan, & adab dasar.</span>
                </label>

                <label className="border border-emerald-900/10 dark:border-emerald-100/10 hover:border-emerald-700/50 p-4 rounded-xl cursor-pointer flex flex-col space-y-1 bg-surface hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition">
                  <input type="radio" name="targetAudience" value="ADULT" className="sr-only" />
                  <span className="font-semibold text-sm text-[#0F3D2E] dark:text-emerald-400">Dewasa / Orang Tua</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Perbaikan tahsin, fiqh ibadah, & keluarga.</span>
                </label>

                <label className="border border-emerald-900/10 dark:border-emerald-100/10 hover:border-emerald-700/50 p-4 rounded-xl cursor-pointer flex flex-col space-y-1 bg-surface hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition">
                  <input type="radio" name="targetAudience" value="SENIOR" className="sr-only" />
                  <span className="font-semibold text-sm text-[#0F3D2E] dark:text-emerald-400">Lanjutan / Penuntut Ilmu</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Pendalaman kitab, bahasa Arab, & qira'at.</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Metode Belajar Utama yang Diharapkan:
              </label>
              <select className="w-full border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-800 outline-none text-slate-800 dark:text-slate-200">
                <option value="ONLINE_ZOOM" className="dark:bg-slate-900">Tatap Muka Online (Zoom / Privat)</option>
                <option value="PRIVATE_HOME" className="dark:bg-slate-900">Guru Datang ke Rumah (Khusus Area Terjangkau)</option>
                <option value="GROUP_MAJELIS" className="dark:bg-slate-900">Majelis / Belajar Kelompok Terbimbing</option>
              </select>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                * Alur diagnostik ini masih berupa pratinjau. Telusuri pendidik terverifikasi langsung dari direktori.
              </span>
              <Link
                href="/directory"
                className="btn btn-primary whitespace-nowrap"
              >
                Telusuri Direktori Pendidik
              </Link>
            </div>
          </form>
        </div>

        {/* Trust Footer */}
        <div className="text-center space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <p>SEMESTA ISLAM — Governed by Lajnah Verification & Trust Principles</p>
          <p>Verifikasi Sanad & Ijazah Keilmuan dilaksanakan secara terpisah oleh Dewan Lajnah.</p>
        </div>
      </div>
    </div>
  );
}
