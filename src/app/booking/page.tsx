import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { UserRound, ArrowRight, Info } from 'lucide-react';
import { getEducatorDetail } from '@/lib/educators/service';
import { BookingClient } from './BookingClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ajukan Sesi Belajar — SEMESTA ISLAM',
  description:
    'Ajukan jadwal sesi belajar dengan pendidik Islam terverifikasi. Pilih metode online, privat, atau majelis sesuai kebutuhan keluarga.',
  alternates: { canonical: '/booking' },
  openGraph: {
    title: 'Ajukan Sesi Belajar — SEMESTA ISLAM',
    description:
      'Ajukan jadwal sesi belajar dengan pendidik Islam terverifikasi.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Ajukan Sesi Belajar — SEMESTA ISLAM',
      },
    ],
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookingPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const educatorId = typeof resolvedParams.educatorId === 'string' ? resolvedParams.educatorId : undefined;
  const courseId = typeof resolvedParams.courseId === 'string' ? resolvedParams.courseId : undefined;

  // No educator selected yet: show an honest "pilih pendidik" state instead of
  // inventing an educator or defaulting to a demo profile.
  if (!educatorId) {
    return (
      <main className="main-content pt-20">
        <div className="container py-8 max-w-2xl">
          <div className="glass-panel p-6 md:p-8 rounded-2xl">
            <h1 className="text-2xl font-bold text-[#0F3D2E] mb-2">Ajukan Sesi Belajar</h1>
            <p className="text-sm text-gray-600 mb-6">
              Untuk mengajukan sesi, pilih lebih dulu pendidik yang ingin Anda ajak belajar.
            </p>

            <div className="bg-white/60 p-5 rounded-xl border border-emerald-900/10 mb-6 text-center">
              <div className="bg-[#E6F4ED] text-[#0F3D2E] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserRound className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-[#0F3D2E] mb-1">
                Siapa pendidik tujuan Anda?
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Buka Direktori Pendidik, pilih profil, lalu tekan &ldquo;Ajukan Sesi Belajar&rdquo;
                pada halaman pendidik tersebut.
              </p>
            </div>

            <Link
              href="/directory"
              className="w-full btn btn-primary text-sm inline-flex items-center justify-center"
            >
              Buka Direktori Pendidik <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <p className="mt-4 text-xs text-gray-500 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
              Pengajuan sesi adalah permintaan jadwal belajar — bukan pembayaran. Poin internal
              yang diterima bersifat non-tunai dan tidak dapat ditarik.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const educator = await getEducatorDetail(educatorId);

  if (!educator) {
    notFound();
  }

  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-2xl">
        <BookingClient educator={educator} courseId={courseId} />
      </div>
    </main>
  );
}
