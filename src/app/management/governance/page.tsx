import React from 'react';
import { ShieldAlert, Info, XCircle, Scale, ScrollText, Layers, Users } from 'lucide-react';
import { getServerIdentity, hasRole, isDemoMode } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function GovernanceManagementPage() {
  const identity = await getServerIdentity();
  const authorized = identity && hasRole(identity, 'FOUNDER_ADMIN');

  if (!authorized) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-8 text-center space-y-3">
            <div className="mx-auto w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white">Akses Ditolak</h1>
            <p className="text-sm text-slate-400">
              Panel tata kelola hanya dapat diakses oleh FOUNDER_ADMIN.
            </p>
            {isDemoMode() && (
              <p className="text-xs text-slate-500">
                Gunakan pemilih demo di pojok kanan bawah untuk masuk sebagai Founder Admin, lalu muat ulang.
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  const CAPABILITY_NOTES = [
    {
      icon: ScrollText,
      title: 'Audit Trail Append-Only',
      note: 'Ledger transaksi (XP, komisi, poin) ditulis append-only di lapisan data. Pemantauan terpusat belum diaktifkan.',
    },
    {
      icon: Users,
      title: 'Rekam Atribusi Multi-Aktor',
      note: 'Data model mendukung 8 kanal atribusi. Dasbor agregasi atribusi belum dibangun.',
    },
    {
      icon: Layers,
      title: 'Komisi Internal (Non-Tunai)',
      note: 'Status komisi tersedia sebagai data operasional internal (accrued/approved). Bukan fitur publik.',
    },
    {
      icon: XCircle,
      title: 'Deteksi Anomali & Fraud',
      note: 'Belum diaktifkan. Tidak ada klaim sistem pengawasan aktif pada saat ini.',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Preview Banner */}
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-200">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Preview — belum fungsional</p>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Surface pratinjau internal (deferred). Tidak ada tindakan tata kelola, metrik
              pengawasan, atau observability yang berjalan di halaman ini. Informasi di bawah
              menggambarkan kapabilitas yang direncanakan, bukan status operasional aktual.
            </p>
          </div>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-xs rounded-full border border-emerald-500/30">
              CAP-10: Growth Intelligence & Governance Engine — DEFERRED
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-white mt-2">
              Governance & Compliance — Pratinjau
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Panel pengawasan tata kelola yang direncanakan (non-fungsional, hanya pratinjau).
            </p>
          </div>
          <span className="px-3 py-1 bg-slate-800 text-slate-300 font-mono text-xs rounded-full border border-slate-700">
            Internal · FOUNDER_ADMIN only
          </span>
        </div>

        {/* Capability Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITY_NOTES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.title} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 space-y-2">
                <Icon className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-mono text-slate-400 block">{cap.title}</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">{cap.note}</p>
              </div>
            );
          })}
        </div>

        {/* Invariant Reference Card */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
            <Scale className="w-4 h-4" /> Konstitusi Tata Kelola (referensi kebijakan)
          </h3>
          <div className="space-y-3 text-xs text-slate-300">
            <p className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl leading-relaxed">
              <span className="font-semibold text-white block mb-1">Pemisahan Keilmuan:</span>
              Tindakan CAP-10 DILARANG mengubah, menerbitkan, atau mengabaikan Status Sanad dan
              Ijazah Keilmuan pengajar. Verifikasi Sanad adalah wewenang mutlak Dewan Lajnah.
            </p>
            <p className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl leading-relaxed">
              <span className="font-semibold text-white block mb-1">Idempotensi & Log Append-Only:</span>
              Setiap tindakan reversal XP wajib menggunakan log `REVERSAL_FRAUD` tanpa menghapus
              catatan terdahulu.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
