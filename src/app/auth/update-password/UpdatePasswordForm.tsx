'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/useToast';

function UpdatePasswordFormInner() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      const msg = updateError.message.toLowerCase();
      if (msg.includes('session') || msg.includes('missing') || msg.includes('unauthorized')) {
        setError('Sesi reset tidak ditemukan. Mohon mulai ulang dari tautan reset kata sandi di email Anda.');
      } else {
        setError(updateError.message);
      }
      return;
    }

    toast.success('Kata sandi berhasil diperbarui', 'Silakan masuk dengan kata sandi baru Anda.');
    router.push('/member');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 space-y-5 relative overflow-hidden">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Kata Sandi Baru
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-[#0F3D2E] transition-colors text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Konfirmasi Kata Sandi
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Ulangi kata sandi"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-[#0F3D2E] transition-colors text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0F3D2E] hover:bg-[#16533F] transition-all disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Perbarui Kata Sandi
            <ArrowRight className="ml-2 w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        <a href="/login" className="text-emerald-700 dark:text-emerald-400 hover:underline">
          Kembali ke halaman masuk
        </a>
      </p>
    </form>
  );
}

export function UpdatePasswordForm() {
  return <UpdatePasswordFormInner />;
}
