'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/useToast';
import { useRouter } from 'next/navigation';

const ROLES = ['ORG_MEMBER', 'ORG_STAFF', 'ORG_MANAGER', 'ORG_ADMIN'] as const;

export function MemberInviteForm({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<(typeof ROLES)[number]>('ORG_MEMBER');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/organizations/${organizationId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Gagal mengundang.');
      }
      toast.success('Undangan anggota terkirim.');
      setEmail('');
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error('Gagal mengundang.', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm bg-[#0F3D2E] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#16533F]"
        >
          <UserPlus className="w-4 h-4" /> Undang
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anggota@example.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Peran</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0F3D2E] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim Undangan'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
