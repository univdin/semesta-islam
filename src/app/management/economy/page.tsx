import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Coins, Wallet, Activity, ShieldCheck } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { getEconomyOverview } from '@/lib/economy/service';
import { EconomyActions } from './EconomyActions';

export const dynamic = 'force-dynamic';

const TX_TYPE_LABELS: Record<string, string> = {
  EARN: 'Diperoleh',
  SPEND: 'Digunakan',
  REVERSAL: 'Reversal',
  ADJUSTMENT: 'Penyesuaian',
  FEE_COLLECTION: 'Biaya Platform',
  COMMISSION_ACCRUAL: 'Komisi',
};

export default async function ManagementEconomyPage() {
  const identity = await getServerIdentity();
  if (!identity || !identity.roles.includes('FOUNDER_ADMIN')) notFound();

  const overview = await getEconomyOverview(identity.userId);
  const recentAudit = await prisma.auditLog.findMany({
    where: {
      entityAffected: 'economic_transactions',
      actionType: { in: ['TRANSACTION_CREATED', 'TRANSACTION_COMPLETED', 'TRANSACTION_REVERSED', 'TRANSACTION_REFUNDED', 'ECONOMIC_ADJUSTMENT_CREATED', 'RECONCILIATION_FAILED'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <main className="main-content">
      <div className="container py-8 max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/management" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Ekonomi</h1>
            <p className="text-sm text-gray-500">
              Monitoring &amp; kontrol Founder · Ledger adalah sumber kebenaran, saldo adalah proyeksi
            </p>
          </div>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{overview.transactionCount}</p>
            <p className="text-xs text-gray-500">Transaksi Ekonomi</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{overview.ledgerEntryCount}</p>
            <p className="text-xs text-gray-500">Entri Ledger</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{overview.totalPointsInCirculation}</p>
            <p className="text-xs text-gray-500">Poin Beredar</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">SIMULATED_INTERNAL</p>
            <p className="text-xs text-gray-500">Payment — Belum ada pembayaran riil</p>
          </div>
        </section>

        <EconomyActions />

        {/* Recent transactions */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-heading">Transaksi Terbaru</h2>
          </div>
          {overview.recentTransactions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-2">
              {overview.recentTransactions.map((tx) => (
                <div key={tx.id} className="card p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {TX_TYPE_LABELS[tx.type] ?? tx.type} · {tx.status}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.source}{tx.reference ? ` · ${tx.reference}` : ''}
                    </p>
                    <p className="text-[10px] text-gray-400">{tx.id}</p>
                  </div>
                  <span className="font-bold text-sm whitespace-nowrap">{tx.amount} Poin</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Audit feed */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-heading">Audit Ekonomi</h2>
          </div>
          {recentAudit.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada peristiwa audit ekonomi.</p>
          ) : (
            <div className="space-y-2">
              {recentAudit.map((e) => (
                <div key={e.id} className="card p-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{e.actionType}</p>
                  <span className="text-[10px] text-gray-400">
                    {new Date(e.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
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
