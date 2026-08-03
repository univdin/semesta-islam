import React from 'react';

export const metadata = {
  title: 'Portal Distribusi Komersial & Affiliate — SEMESTA ISLAM',
  description: 'Panel pengawasan komisi komersial terverifikasi dan siklus penyelesaian (Settlement Lifecycle).',
};

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-3 shadow-md">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-medium text-xs rounded-full border border-amber-400/30">
            Capability 07: Commercial Affiliate System
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif">
            Manajemen Distribusi Komersial & Siklus Komisi
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Distribusi komersial terstruktur berlisensi resmi. Komisi beroperasi terpisah secara total dari XP dan Reputasi Komunitas.
          </p>
        </div>

        {/* Commercial Lifecycle Explanation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Tahapan Siklus Komisi (Commercial Lifecycle)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700 block">1. Conversion</span>
              <span className="text-slate-500">Booking terbayar</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-bold text-amber-800 block">2. Accrual</span>
              <span className="text-amber-700">Pencatatan akrual</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <span className="font-bold text-blue-800 block">3. Approval</span>
              <span className="text-blue-700">Verifikasi tenggang refund</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-bold text-emerald-800 block">4. Settlement & Payout</span>
              <span className="text-emerald-700">Pencairan komisi</span>
            </div>
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Commission Ledger Audit</h3>
            <span className="text-xs text-slate-400 font-mono">Disiplin Financially Audited</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-medium">
                  <th className="pb-2">Commission ID</th>
                  <th className="pb-2">Booking Ref</th>
                  <th className="pb-2">Jumlah Akrual</th>
                  <th className="pb-2">Status Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-mono text-slate-600">COMM-9012</td>
                  <td className="py-2.5 font-mono text-slate-500">BOOK-8810</td>
                  <td className="py-2.5 font-semibold text-slate-900">Rp 50.000</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-medium">ACCRUED</span>
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
