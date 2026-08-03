'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/useToast';
import { useRouter } from 'next/navigation';

interface ProfileData {
  fullName?: string | null;
  bio?: string | null;
  locationCity?: string | null;
  avatarUrl?: string | null;
}

export function ProfileForm({ profile }: { profile: ProfileData | null }) {
  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [locationCity, setLocationCity] = useState(profile?.locationCity ?? '');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/member/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, bio, locationCity }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Gagal menyimpan.');
      }
      toast.success('Profil diperbarui.');
      router.refresh();
    } catch (err) {
      toast.error('Gagal menyimpan profil.', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kota</label>
        <input
          value={locationCity}
          onChange={(e) => setLocationCity(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-[#0F3D2E] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#16533F] disabled:opacity-50"
      >
        {loading ? 'Menyimpan...' : 'Simpan Profil'}
      </button>
    </form>
  );
}
