'use client';

import React, { useState } from 'react';
import { Loader2, Gift } from 'lucide-react';
import { useToast } from '@/components/ui/useToast';
import { useRouter } from 'next/navigation';

export function PointsSpendCard({ balance }: { balance: number }) {
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const submit = async () => {
    const num = Number(amount);
    if (!Number.isInteger(num) || num <= 0) {
      toast.error('Masukkan jumlah poin (bilangan bulat positif).');
      return;
    }
    if (!reason.trim()) {
      toast.error('Tuliskan alasan penggunaan.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/economy/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: num,
          reason: reason.trim(),
          idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message ?? 'Gagal menggunakan poin.');
      }
      toast.success(
        data?.data?.duplicate ? 'Poin sudah digunakan sebelumnya.' : 'Poin berhasil digunakan.',
        data?.data ? `Saldo sekarang: ${data.data.balance} poin` : undefined
      );
      setAmount('');
      setReason('');
      router.refresh();
    } catch (err) {
      toast.error('Gagal.', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="w-4 h-4 text-[#0F3D2E]" />
        <h2 className="text-base font-semibold text-gray-900 font-heading">Gunakan Poin</h2>
      </div>
      <p className="text-xs text-gray-500">
        Poin internal platform — <strong>non-tunai dan tidak dapat ditarik</strong>. Gunakan untuk
        kredit belajar atau penukaran sesuai kebijakan ILMIFY. Saldo saat ini:{' '}
        <strong>{balance}</strong> poin.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-3">
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Jumlah poin"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Alasan penggunaan (mis. kredit sesi belajar)"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
        />
      </div>
      <button
        onClick={submit}
        disabled={loading || balance <= 0}
        className="w-full flex justify-center items-center gap-2 rounded-xl bg-[#0F3D2E] text-white text-sm font-bold py-3 hover:bg-[#16533F] disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gunakan Poin'}
      </button>
    </section>
  );
}
