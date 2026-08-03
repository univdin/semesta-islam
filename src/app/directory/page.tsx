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
  openGraph: {
    title: 'Direktori Pendidik Islam Terverifikasi — SEMESTA ISLAM',
    description:
      'Cari dan telusuri direktori ustaz, ustazah, dan pendidik Islam terverifikasi Lajnah.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Direktori Pendidik Islam Terverifikasi — SEMESTA ISLAM',
      },
    ],
  },
};

export default async function DirectoryPage() {
  const educators = await listEducatorSummaries();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://semesta-islam.vercel.app';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Direktori Pendidik Islam Terverifikasi SEMESTA ISLAM',
    description: 'Daftar pendidik Islam, ustaz, dan ustazah terverifikasi Lajnah.',
    url: `${siteUrl}/directory`,
    numberOfItems: educators.length,
    itemListElement: educators.map((edu, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Person',
        name: edu.name,
        jobTitle: edu.title,
        url: `${siteUrl}/educator/${edu.id}`,
        image: edu.avatar,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DirectoryClient educators={educators} />
    </>
  );
}
