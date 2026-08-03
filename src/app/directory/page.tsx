import { searchEducators, listDirectoryFilterOptions } from '@/lib/educators/service';
import { isPlatformSettingEnabled, PLATFORM_SETTING_KEYS } from '@/lib/settings/service';
import { DirectoryClient, type DirectoryFilters } from './DirectoryClient';
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

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function str(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // Founder-controlled public visibility (default: enabled). Fail-closed is
  // the reverse: a `false` here hides the public directory regardless of UI.
  const directoryEnabled = await isPlatformSettingEnabled(
    PLATFORM_SETTING_KEYS.PUBLIC_DIRECTORY_ENABLED
  );
  if (!directoryEnabled) {
    return (
      <main className="main-content pt-20">
        <div className="container py-16 max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-[#0F3D2E] mb-2">Direktori Tidak Tersedia</h1>
          <p className="text-sm text-gray-600">
            Direktori publik sedang dinonaktifkan oleh pengelola platform. Silakan kembali lagi nanti.
          </p>
        </div>
      </main>
    );
  }

  const filters: DirectoryFilters = {
    q: str(sp.q),
    expertise: str(sp.expertise),
    location: str(sp.location),
    method: str(sp.method) ?? 'all',
    sort: str(sp.sort) ?? 'rating',
  };

  const page = Math.max(1, parseInt(str(sp.page) ?? '1', 10) || 1);
  const limit = 9;

  const [result, filterOptions] = await Promise.all([
    searchEducators({
      q: filters.q,
      expertise: filters.expertise,
      location: filters.location,
      method: (filters.method ?? 'all') as 'all' | 'ONLINE_ZOOM' | 'PRIVATE_HOME' | 'GROUP_MAJELIS',
      sort: (filters.sort ?? 'rating') as 'rating' | 'reviews',
      page,
      limit,
    }),
    listDirectoryFilterOptions(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilmify.id';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Direktori Pendidik Islam Terverifikasi SEMESTA ISLAM',
    description: 'Daftar pendidik Islam, ustaz, dan ustazah terverifikasi Lajnah.',
    url: `${siteUrl}/directory`,
    numberOfItems: result.total,
    itemListElement: result.educators.map((edu, idx) => ({
      '@type': 'ListItem',
      position: (page - 1) * limit + idx + 1,
      item: {
        '@type': 'Person',
        name: edu.name,
        jobTitle: edu.title,
        url: `${siteUrl}/educator/${edu.slug || edu.id}`,
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
      <DirectoryClient
        educators={result.educators}
        total={result.total}
        page={result.page}
        limit={result.limit}
        filters={filters}
        expertiseOptions={filterOptions.expertise}
        locationOptions={filterOptions.locations}
      />
    </>
  );
}
