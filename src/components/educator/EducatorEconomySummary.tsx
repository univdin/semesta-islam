import React from 'react';
import Link from 'next/link';
import { Wallet, TrendingUp, Coins } from 'lucide-react';
import type { AccountLedger } from '@/lib/ledger/service';

interface EducatorEconomySummaryProps {
  ledger: AccountLedger;
  educatorId: string;
}

export function EducatorEconomySummary({ ledger }: EducatorEconomySummaryProps) {
  const { balance, entries } = ledger;

  return (
    <section className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#0F3D2E]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Saldo Poin</p>
              <p className="text-2xl font-bold text-[#0F3D2E]">{balance.totalPoints}</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-3">
            Poin internal platform — non-tunai dan tidak dapat ditarik.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Coins className="w-5 h-5 text-[#B45309]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Biaya Platform (Komisi)</p>
              <p className="text-2xl font-bold text-[#B45309]">{balance.totalFeeCollections}</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-3">
            Akrual komisi internal tercatat pada konfirmasi sesi (idempoten per booking).
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Entri Ledger</p>
              <p className="text-2xl font-bold text-blue-700">{entries.length}</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-3">
            Riwayat transaksi internal akun Anda.{" "}
            <Link href="/member/points" className="text-emerald-800 underline">
              Lihat rincian
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
