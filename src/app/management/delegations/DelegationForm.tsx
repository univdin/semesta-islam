'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/useToast';
import { useRouter } from 'next/navigation';

const DELEGATABLE = [
  'members.view',
  'members.invite',
  'members.update',
  'bookings.view',
  'bookings.manage',
  'courses.view',
  'courses.manage',
  'reports.view',
  'reports.export',
  'content.manage',
  'communications.send',
  'backup.view',
  'backup.create',
] as const;

export function DelegationForm({
  users,
  organizations,
}: {
  users: { id: string; email: string; profile?: { fullName?: string | null } | null }[];
  organizations: { id: string; name: string }[];
}) {
  const [delegateUserId, setDelegateUserId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [capabilities, setCapabilities] = useState<string[]>([DELEGATABLE[0]]);
  const [reason, setReason] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  const toggleCapability = (cap: string) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/management/delegations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegateUserId,
          organizationId: organizationId || undefined,
          capabilities,
          reason: reason || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Gagal membuat delegasi.');
      }
      toast.success('Delegasi dibuat.');
      setDelegateUserId('');
      setReason('');
      setExpiresAt('');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setError(message);
      toast.error('Gagal membuat delegasi.', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 dark:text-gray-50">Buat Delegasi Baru</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Delegasi kepada (pengguna)
          </label>
          <select
            value={delegateUserId}
            onChange={(e) => setDelegateUserId(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
          >
            <option value="">Pilih pengguna...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.profile?.fullName ?? u.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Scope organisasi (opsional)
          </label>
          <select
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
          >
            <option value="">Semua (platform)</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Kapabilitas (hanya yang dipilih — default DENY)
        </label>
        <div className="flex flex-wrap gap-2">
          {DELEGATABLE.map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => toggleCapability(cap)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                capabilities.includes(cap)
                  ? 'bg-[#0F3D2E] text-white border-[#0F3D2E]'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700'
              }`}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alasan (wajib untuk audit)
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Contoh: delegasi operasional anggota untuk Q1"
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kedaluwarsa (opsional)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#0F3D2E] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#16533F] disabled:opacity-50"
      >
        {loading ? 'Membuat...' : 'Buat Delegasi'}
      </button>
    </form>
  );
}
