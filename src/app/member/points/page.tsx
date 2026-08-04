import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Coins, TrendingUp, History } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { getAccountLedger } from '@/lib/ledger/service';
import { listAccountTransactions } from '@/lib/economy/service';
import { PointsSpendCard } from './PointsSpendCard';

export const dynamic = 'force-dynamic';

const TX_TYPE_LABELS: Record<string, string> = {
  EARN: 'Diperoleh',
  SPEND: 'Digunakan',
  REVERSAL: 'Dibatalkan',
  ADJUSTMENT: 'Penyesuaian',
  FEE_COLLECTION: 'Biaya Platform',
  COMMISSION_ACCRUAL: 'Komisi',
};

export default async function MemberPointsPage() {
  const identity = await getServerIdentity();
  if (!identity) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-gray-500">
          Silakan <Link href="/login" className="text-[#0F3D2E] underline">masuk</Link> terlebih dahulu.
        </p>
      </div>
    );
  }

  const [account, transactions] = await Promise.all([
    getAccountLedger(identity.userId),
    listAccountTransactions(identity.userId),
  ]);

  return (
    <main className="main-content">
      <div className="container py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/member" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Poin Saya</h1>
            <p className="text-sm text-gray-500">Poin internal platform — non-tunai dan tidak dapat ditarik.</p>
          </div>
        </div>

        {/* Balance projection */}
        <section className="card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <Coins className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Saldo Poin</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">{account.balance.totalPoints}</p>
            </div>
          </div>
        </section>

        {/* Spend points (internal, non-cash) */}
        <PointsSpendCard balance={account.balance.totalPoints} />

        {/* Transaksi / Aktivitas Poin */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-heading">Transaksi</h2>
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const isCredit = tx.amount > 0;
                return (
                  <div key={tx.id} className="card p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                        {TX_TYPE_LABELS[tx.type] ?? tx.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tx.source} · {tx.status}
                        {tx.reason ? ` — ${tx.reason}` : ''}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <span
                      className={`font-bold text-sm whitespace-nowrap ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                      {isCredit ? '+' : ''}{tx.amount} Poin
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Riwayat ledger */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-heading">Aktivitas Poin</h2>
          </div>
          {account.entries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada aktivitas.</p>
          ) : (
            <div className="space-y-2">
              {account.entries.map((entry) => (
                <div key={entry.id} className="card p-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{entry.description}</p>
                  <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">
                    +{entry.amount} Poin
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
