import React from 'react';

export const metadata = {
  title: 'Program Syi\'ar & Apresiasi Kemitraan — SEMESTA ISLAM',
  description: 'Panel pengawasan dukungan apresiasi kemitraan terverifikasi dan siklus transparansi alokasi.',
};

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-[#0F3D2E] text-white rounded-2xl p-6 sm:p-8 space-y-3 shadow-md">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-medium text-xs rounded-full border border-amber-400/30">
            Program Kemitraan Syi'ar
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif">
            Apresiasi Kemitraan &amp; Dukungan Syi'ar
          </h1>
          <p className="text-sm text-slate-200 max-w-2xl">
            Sistem pengakuan kemitraan terstruktur yang amanah dan transparan. Alokasi apresiasi beroperasi terpisah secara total dari XP dan Reputasi Komunitas.
          </p>
        </div>

        {/* Commercial Lifecycle Explanation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Tahapan Alokasi Apresiasi Kemitraan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700 block">1. Rekomendasi</span>
              <span className="text-slate-500">Sesi terkonfirmasi</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-bold text-amber-800 block">2. Pencatatan</span>
              <span className="text-amber-700">Pencatatan alokasi</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <span className="font-bold text-blue-800 block">3. Verifikasi</span>
              <span className="text-blue-700">Audit kesesuaian</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-bold text-emerald-800 block">4. Alokasi Apresiasi</span>
              <span className="text-emerald-700">Penyaluran apresiasi</span>
            </div>
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Catatan Audit Apresiasi</h3>
            <span className="text-xs text-slate-400 font-mono">Disiplin Transparansi Amanah</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-medium">
                  <th className="pb-2">ID Kemitraan</th>
                  <th className="pb-2">Referensi Sesi</th>
                  <th className="pb-2">Nilai Apresiasi</th>
                  <th className="pb-2">Status Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-mono text-slate-600">PARTNER-9012</td>
                  <td className="py-2.5 font-mono text-slate-500">BOOK-8810</td>
                  <td className="py-2.5 font-semibold text-slate-900">Nisbah Apresiasi 50.000 Poin</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-medium">TERCATAT</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
