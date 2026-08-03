import { listEducatorSummaries } from '@/lib/educators/service';
import { DirectoryClient } from './DirectoryClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Direktori Pendidik Islam Terverifikasi — SEMESTA ISLAM',
  description:
    'Cari dan telusuri direktori ustaz, ustazah, dan pendidik Islam terverifikasi Lajnah berdasarkan mata pelajaran, lokasi, dan metode belajar.',
  alternates: {
    canonical: '/directory',
  },
};

export default async function DirectoryPage() {
  const educators = await listEducatorSummaries();
  return <DirectoryClient educators={educators} />;
}
