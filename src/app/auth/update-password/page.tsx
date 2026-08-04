import React from 'react';
import type { Metadata } from 'next';
import { UpdatePasswordForm } from './UpdatePasswordForm';

export const metadata: Metadata = {
  title: 'Perbarui Kata Sandi | ILMIFY',
  description: 'Tetapkan kata sandi baru untuk akun ILMIFY Anda.',
  robots: { index: false, follow: false },
};

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 font-heading mb-2">
            Tetapkan Kata Sandi Baru
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Masukkan kata sandi baru untuk mengamankan akun ILMIFY Anda.
          </p>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
