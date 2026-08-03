'use client';

import React, { useState } from 'react';
import { Scale, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/useToast';
import { useRouter } from 'next/navigation';

export function EconomyActions() {
  const [loading, setLoading] = useState<'adjust' | 'reversal' | null>(null);
  const [adjustAccount, setAdjustAccount] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [reversalId, setReversalId] = useState('');
  const [reversalReason, setReversalReason] = useState('');
  const toast = useToast();
  const router = useRouter();

  const submitAdjustment = async () => {
    setLoading('adjust');
    try {
      const res = await fetch('/api/v1/management/economy/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountOwnerId: adjustAccount.trim(),
          amount: Number(adjustAmount),
          reason: adjustReason.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? 'Gagal.');
      toast.success(data?.data?.duplicate ? 'Penyesuaian sudah pernah diterapkan.' : 'Penyesuaian ekonomi diterapkan.');
      setAdjustAccount('');
      setAdjustAmount('');
      setAdjustReason('');
      router.refresh();
    } catch (err) {
      toast.error('Gagal.', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(null);
    }
  };

  const submitReversal = async () => {
    setLoading('reversal');
    try {
      const res = await fetch('/api/v1/management/economy/reversals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: reversalId.trim(),
          reason: reversalReason.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? 'Gagal.');
      toast.success(data?.data?.duplicate ? 'Transaksi sudah pernah direversal.' : 'Transaksi ekonomi direversal.');
      setReversalId('');
      setReversalReason('');
      router.refresh();
    } catch (err) {
      toast.error('Gagal.', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Founder-governed adjustment */}
      <section className="card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Penyesuaian Ekonomi</h3>
        </div>
        <p className="text-xs text-gray-500">
          Founder-only (economy.adjust). Membuat entri ADJUSTMENT append-only dengan alasan wajib + audit.
        </p>
        <input
          value={adjustAccount}
          onChange={(e) => setAdjustAccount(e.target.value)}
          placeholder="Account Owner ID (UUID)"
          className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
        />
        <input
          value={adjustAmount}
          onChange={(e) => setAdjustAmount(e.target.value)}
          placeholder="Jumlah (integer, +/−)"
          type="number"
          className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
        />
        <textarea
          value={adjustReason}
          onChange={(e) => setAdjustReason(e.target.value)}
          placeholder="Alasan (wajib)"
          rows={2}
          className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
        />
        <button
          onClick={submitAdjustment}
          disabled={loading !== null || !adjustAccount || !adjustAmount || !adjustReason.trim()}
          className="inline-flex items-center gap-2 bg-[#0F3D2E] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#16533F] disabled:opacity-50"
        >
          <Scale className="w-4 h-4" />
          {loading === 'adjust' ? 'Memproses...' : 'Terapkan Penyesuaian'}
        </button>
      </section>

      {/* Founder-governed reversal */}
      <section className="card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Reversal Transaksi</h3>
        </div>
        <p className="text-xs text-gray-500">
          Founder-only (economy.reversal). Membuat transaksi REVERSAL yang merujuk transaksi asli + entri negatif. Tidak pernah mengubah entri asli.
        </p>
        <input
          value={reversalId}
          onChange={(e) => setReversalId(e.target.value)}
          placeholder="Transaction ID (UUID)"
          className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
        />
        <textarea
          value={reversalReason}
          onChange={(e) => setReversalReason(e.target.value)}
          placeholder="Alasan (wajib)"
          rows={2}
          className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
        />
        <button
          onClick={submitReversal}
          disabled={loading !== null || !reversalId || !reversalReason.trim()}
          className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-red-300 dark:border-red-800 text-red-600 px-5 py-2.5 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          {loading === 'reversal' ? 'Memproses...' : 'Reversal Transaksi'}
        </button>
      </section>
    </div>
  );
}
