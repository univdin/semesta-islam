'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, FlaskConical } from 'lucide-react';
import { useToast } from '@/components/ui/useToast';

const DEMO_IDENTITIES = [
  { email: 'learner.demo@localhost.test', label: 'Learner' },
  { email: 'educator.demo@localhost.test', label: 'Educator' },
  { email: 'lajnah.demo@localhost.test', label: 'Lajnah' },
  { email: 'founder.demo@localhost.test', label: 'Founder' },
  { email: 'orgadmin.demo@localhost.test', label: 'Org Admin' },
  { email: 'orgstaff.demo@localhost.test', label: 'Org Staff' },
];

export function DemoLoginPanel({ demoMode }: { demoMode: boolean }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const getTargetRouteForRole = (email: string): string => {
    if (email.includes('learner')) return '/learner/activity';
    if (email.includes('educator')) return '/educator/workspace';
    if (email.includes('lajnah')) return '/management/lajnah';
    if (email.includes('founder')) return '/management/governance';
    if (email.includes('org')) return '/organization';
    return '/member';
  };

  const handleQuickLogin = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Gagal masuk.');
      }
      const target = getTargetRouteForRole(email);
      toast.success('Bismillah, Anda telah masuk ke mode demo.', `Status aktif: ${email}`);
      router.push(target);
      router.refresh();
    } catch (err) {
      toast.error('Gagal masuk.', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Localhost mockup: the form is informational only. Demo login via quick buttons.
    toast.info('Gunakan tombol Quick Demo Login (mode lokal).');
  };

  return (
    <div className="glass-panel p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 pointer-events-none" />

      <form className="space-y-5 relative z-10" onSubmit={handleFormSubmit}>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              disabled={!demoMode}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-[#0F3D2E] focus:border-[#0F3D2E] dark:focus:ring-[#D4AF37] transition-colors text-sm"
              placeholder="anda@email.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Kata Sandi</label>
            <a href="#" className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline" onClick={(e) => e.preventDefault()}>
              Lupa kata sandi?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              disabled={!demoMode}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-[#0F3D2E] focus:border-[#0F3D2E] dark:focus:ring-[#D4AF37] transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!demoMode}
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0F3D2E] hover:bg-[#16533F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F3D2E] transition-all group disabled:opacity-50"
        >
          Masuk ke Workspace
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      {demoMode && (
        <div className="mt-6 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 rounded-full text-xs flex items-center gap-1">
                <FlaskConical className="w-3.5 h-3.5" /> Quick Demo Login (localhost)
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DEMO_IDENTITIES.map((d) => (
              <button
                key={d.email}
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin(d.email)}
                className="py-2 px-3 rounded-xl border border-emerald-700/40 bg-emerald-50/60 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 rounded-full text-xs">
              Atau masuk dengan
            </span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Google
          </button>
          <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}
