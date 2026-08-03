'use client';

import React, { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { useToast } from '@/components/ui/useToast';

export function NotificationReadAllButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/member/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Gagal memperbarui.');
      }
      toast.success('Semua notifikasi ditandai telah dibaca.');
      window.location.reload();
    } catch (err) {
      toast.error('Gagal memperbarui notifikasi.', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkAll}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm text-[#0F3D2E] dark:text-emerald-400 font-medium disabled:opacity-50"
    >
      <CheckCheck className="w-4 h-4" />
      {loading ? 'Memproses...' : 'Tandai semua dibaca'}
    </button>
  );
}
