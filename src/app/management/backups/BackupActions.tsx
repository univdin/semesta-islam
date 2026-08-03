'use client';

import React, { useState } from 'react';
import { DatabaseBackup, CheckCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/useToast';
import { useRouter } from 'next/navigation';

export function BackupActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  const runAction = async (action: 'create' | 'verify' | 'restore', backupId?: string) => {
    setLoading(action);
    try {
      const res = await fetch('/api/v1/management/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, backupId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? 'Gagal.');
      if (action === 'create') toast.success('Backup dibuat.');
      if (action === 'verify') toast.success(data?.data?.status === 'VERIFIED' ? 'Backup terverifikasi.' : 'Verifikasi gagal.');
      if (action === 'restore') toast.info('Permintaan restore (DRY-RUN) tercatat.', data?.data?.message);
      router.refresh();
    } catch (err) {
      toast.error('Gagal.', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => runAction('create')}
        disabled={loading !== null}
        className="inline-flex items-center gap-2 bg-[#0F3D2E] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#16533F] disabled:opacity-50"
      >
        <DatabaseBackup className="w-4 h-4" />
        {loading === 'create' ? 'Membuat...' : 'Buat Backup'}
      </button>
      <button
        onClick={() => runAction('verify', undefined)}
        disabled
        className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-500 px-5 py-2.5 rounded-xl font-medium"
        title="Pilih backup dari daftar untuk verifikasi"
      >
        <CheckCircle className="w-4 h-4" />
        Verifikasi (pilih dari daftar)
      </button>
      <button
        onClick={() => runAction('restore', undefined)}
        disabled
        className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-red-300 dark:border-red-800 text-red-600 px-5 py-2.5 rounded-xl font-medium"
        title="Restore selalu DRY-RUN — pilih backup dari daftar"
      >
        <RotateCcw className="w-4 h-4" />
        Restore (DRY-RUN)
      </button>
    </div>
  );
}
