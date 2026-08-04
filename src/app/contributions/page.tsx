import React from 'react';

export const metadata = {
  title: 'Apresiasi Kontributor Syi\'ar & XP Ledger — ILMIFY',
  description: 'Pusat apresiasi kontribusi komunitas dan transparansi audit XP Ledger.',
  robots: { index: false, follow: false },
};

export default function ContributionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 space-y-3 shadow-md">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-medium text-xs rounded-full border border-amber-400/30">
            Apresiasi Kontributor Syi'ar
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif">
            Rekam Kontribusi Bermakna & Transparansi Ledger
          </h1>
          <p className="text-sm text-emerald-100/80 max-w-2xl">
            Sistem pengakuan kontribusi komunitas SEMESTA ISLAM. XP adalah skor pengakuan aktivitas terkualifikasi, bukan bentuk reputasi keilmuan atau ijazah sanad.
          </p>
        </div>

        {/* Governance Notice Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
          <p className="font-semibold">Pratinjau — Data Ilustrasi (Bukan Data Riil)</p>
          <p className="text-amber-800">
            Status, skor, dan entri ledger pada halaman ini adalah contoh ilustrasi untuk pengembangan.
            Data riil hanya ditampilkan setelah program kontributor dibuka dan terhubung ke ledger.
          </p>
        </div>

        {/* Governance Notice Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
          <p className="font-semibold">Prinsip Tata Kelola Reputasi & Invariant Keilmuan:</p>
          <p className="text-amber-800">
            Skor XP dan Badge Komunitas dilarang diposisikan sebagai Sanad atau Ijazah Keilmuan. Verifikasi Sanad pengajar dikelola secara independen oleh Dewan Lajnah.
          </p>
        </div>

        {/* Grid Layout: Reputation Summary & XP Ledger Audit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Standing Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Status Komunitas</h3>
            <div className="space-y-1">
              <span className="text-2xl font-bold text-emerald-950 block">CONTRIBUTOR INITIATE</span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">Integritas 100%</span>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Skor Konsistensi:</span>
                <span className="font-semibold text-slate-900">100 / 100</span>
              </div>
              <div className="flex justify-between">
                <span>Skor Kontribusi:</span>
                <span className="font-semibold text-slate-900">50 / 100</span>
              </div>
            </div>
          </div>

          {/* XP Ledger Audit Log Table */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-emerald-950">Append-Only XP Ledger Audit</h3>
              <span className="text-xs text-slate-400 font-mono">Immutable Logs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-medium">
                    <th className="pb-2">Event ID</th>
                    <th className="pb-2">Aksi</th>
                    <th className="pb-2">Jumlah XP</th>
                    <th className="pb-2">Idempotency Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 font-mono text-slate-600">EVT-DIAG-01</td>
                    <td className="py-2.5">DIAGNOSTIC_COMPLETED</td>
                    <td className="py-2.5 font-semibold text-emerald-700">+30 XP</td>
                    <td className="py-2.5 font-mono text-slate-400 text-[10px]">xp-usr1-evt1-diag</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-mono text-slate-600">EVT-REF-4021</td>
                    <td className="py-2.5">QUALIFIED_REFERRAL_ACTIVATION</td>
                    <td className="py-2.5 font-semibold text-emerald-700">+10 XP</td>
                    <td className="py-2.5 font-mono text-slate-400 text-[10px]">xp-usr1-evt2-ref</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
