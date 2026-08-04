import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { isDemoMode } from '@/lib/auth/session';
import { AuthPanel } from './AuthPanel';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Masuk | ILMIFY',
  description: 'Masuk ke portal ILMIFY untuk mengelola pembelajaran dan sesi Anda.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Masuk Portal — ILMIFY',
    description: 'Masuk ke akun Anda di platform ILMIFY.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'ILMIFY — Portal Masuk',
      },
    ],
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string; register?: string }>;
}) {
  const demoMode = isDemoMode();
  const { redirect, error, register } = await searchParams;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-emerald-900/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 font-heading mb-2">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Masuk ke portal ILMIFY untuk mengelola pembelajaran dan sesi Anda.
          </p>
        </div>

        <AuthPanel
          demoMode={demoMode}
          redirect={redirect}
          error={error}
          initialMode={register === '1' ? 'register' : undefined}
        />

        {demoMode && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200/80 leading-relaxed">
              <strong>Catatan Pengembang (Localhost):</strong> Integrasi Supabase Cloud dinonaktifkan di mode demo. Gunakan tombol <strong>Quick Demo Login</strong> untuk mensimulasikan otentikasi.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
