import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, ChevronRight, Users } from 'lucide-react';
import { listPublishedTopics } from '@/lib/topics/service';
import { isPlatformSettingEnabled, PLATFORM_SETTING_KEYS } from '@/lib/settings/service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Topik Pembelajaran — ILMIFY',
  description:
    'Jelajahi topik pembelajaran Islam: tahsin, fiqh, hadits, aqidah, bahasa Arab, dan lainnya, beserta pendidik terverifikasi.',
  alternates: { canonical: '/topics' },
  openGraph: {
    title: 'Topik Pembelajaran — ILMIFY',
    description:
      'Jelajahi topik pembelajaran Islam beserta pendidik terverifikasi.',
    url: '/topics',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Topik Pembelajaran — ILMIFY' }],
  },
};

export default async function TopicsIndexPage() {
  const topicsEnabled = await isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.PUBLIC_TOPICS_ENABLED);
  if (!topicsEnabled) {
    return (
      <main className="main-content pt-20">
        <div className="container py-16 max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-[#0F3D2E] mb-2">Topik Tidak Tersedia</h1>
          <p className="text-sm text-gray-600">
            Jelajah topik publik sedang dinonaktifkan oleh pengelola platform.
          </p>
        </div>
      </main>
    );
  }

  const topics = await listPublishedTopics();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilmify.id';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Topik Pembelajaran ILMIFY',
    description: 'Topik pembelajaran Islam beserta pendidik terverifikasi.',
    url: `${siteUrl}/topics`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: topics.length,
      itemListElement: topics.map((topic, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Thing',
          name: topic.name,
          url: `${siteUrl}/topics/${topic.slug}`,
        },
      })),
    },
  };

  return (
    <main className="main-content pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-8 max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
            <li>
              <Link href="/" className="hover:text-emerald-800">
                Beranda
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </li>
            <li className="text-gray-700 font-medium" aria-current="page">
              Topik
            </li>
          </ol>
        </nav>

        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 rounded-xl bg-[#0F3D2E]/10 text-[#0F3D2E]">
              <BookOpen className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F3D2E] font-serif">
              Topik Pembelajaran
            </h1>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl">
            Topik pembelajaran Islam yang didukung pendidik terverifikasi ILMIFY.
          </p>
        </header>

        {topics.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-sm text-gray-500">
            Belum ada topik yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/topics/${topic.slug}`}
                className="glass-panel p-5 rounded-2xl hover:shadow-md transition-shadow group"
              >
                <h2 className="font-bold text-[#0F3D2E] group-hover:text-emerald-800 transition-colors">
                  {topic.name}
                </h2>
                {topic.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{topic.description}</p>
                )}
                <span className="inline-flex items-center gap-1.5 mt-3 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5" />
                  {topic.verifiedEducatorCount} pendidik terverifikasi
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
