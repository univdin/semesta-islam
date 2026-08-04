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
    <div className="min-h-screen bg-emerald-950/5 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-700 font-medium text-xs rounded-full border border-amber-500/20">
            Syi'ar & Discovery Engine · Pratinjau (UI)
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-950 font-serif">
            Diagnostik Pembelajaran Islam Keluarga
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Bantu kami memahami kebutuhan belajar Anda atau keluarga untuk menyusun rekomendasi metode, materi, dan pengajar ber-sanad yang tepat.
          </p>
        </div>

        {/* Diagnostic Wizard Card */}
        <div className="bg-white border border-emerald-900/10 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-emerald-950">Langkah 1 dari 3: Fokus Kebutuhan</h2>
            <span className="text-xs font-mono text-slate-400">Step ID: DIAG-01</span>
          </div>

          <form className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Siapa yang akan menjalankan jalur pembelajaran ini?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="border border-emerald-900/10 hover:border-emerald-700/50 p-4 rounded-xl cursor-pointer flex flex-col space-y-1 bg-slate-50/50 hover:bg-emerald-50/30 transition">
                  <input type="radio" name="targetAudience" value="KIDS" className="sr-only" defaultChecked />
                  <span className="font-semibold text-sm text-emerald-900">Anak-Anak & Remaja</span>
                  <span className="text-xs text-slate-500">Pendampingan tajwid, hafalan, & adab dasar.</span>
                </label>

                <label className="border border-emerald-900/10 hover:border-emerald-700/50 p-4 rounded-xl cursor-pointer flex flex-col space-y-1 bg-slate-50/50 hover:bg-emerald-50/30 transition">
                  <input type="radio" name="targetAudience" value="ADULT" className="sr-only" />
                  <span className="font-semibold text-sm text-emerald-900">Dewasa / Orang Tua</span>
                  <span className="text-xs text-slate-500">Perbaikan tahsin, fiqh ibadah, & keluarga.</span>
                </label>

                <label className="border border-emerald-900/10 hover:border-emerald-700/50 p-4 rounded-xl cursor-pointer flex flex-col space-y-1 bg-slate-50/50 hover:bg-emerald-50/30 transition">
                  <input type="radio" name="targetAudience" value="SENIOR" className="sr-only" />
                  <span className="font-semibold text-sm text-emerald-900">Lanjutan / Penuntut Ilmu</span>
                  <span className="text-xs text-slate-500">Pendalaman kitab, bahasa Arab, & qira'at.</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Metode Belajar Utama yang Diharapkan:
              </label>
              <select className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-800 outline-none">
                <option value="ONLINE_ZOOM">Tatap Muka Online (Zoom / Privat)</option>
                <option value="PRIVATE_HOME">Guru Datang ke Rumah (Khusus Area Terjangkau)</option>
                <option value="GROUP_MAJELIS">Majelis / Belajar Kelompok Terbimbing</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">
                * Alur diagnostik ini masih berupa pratinjau. Telusuri pendidik terverifikasi langsung dari direktori.
              </span>
              <Link
                href="/directory"
                className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white font-medium text-sm rounded-xl transition shadow-sm inline-flex items-center gap-2"
              >
                Telusuri Direktori Pendidik
              </Link>
            </div>
          </form>
        </div>

        {/* Trust Footer */}
        <div className="text-center space-y-2 text-xs text-slate-500">
          <p>SEMESTA ISLAM — Governed by Lajnah Verification & Trust Principles</p>
          <p>Verifikasi Sanad & Ijazah Keilmuan dilaksanakan secara terpisah oleh Dewan Lajnah.</p>
        </div>
      </div>
    </div>
  );
}
