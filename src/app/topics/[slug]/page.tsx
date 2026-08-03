import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BookOpen, ChevronRight, Users, ShieldCheck, GraduationCap } from 'lucide-react';
import {
  getTopicBySlug,
  listVerifiedEducatorsForTopic,
  listRelatedTopics,
} from '@/lib/topics/service';
import { EducatorCard } from '@/components/ui/EducatorCard';
import { CommunitySection } from '@/components/community/CommunitySection';
import type { EducatorSummary } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug, { includeStats: true });
  if (!topic) {
    return { title: 'Topik Tidak Ditemukan — ILMIFY' };
  }

  const title = `${topic.name} — Topik Pembelajaran ILMIFY`;
  const description =
    topic.description ??
    `Pendidik terverifikasi dan program belajar terkait topik ${topic.name} di ILMIFY.`;

  // Thin-page quality gate: non-indexable topics get a noindex robots policy.
  return {
    title,
    description,
    alternates: { canonical: `/topics/${topic.slug}` },
    robots: topic.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `/topics/${topic.slug}`,
      type: 'website',
      images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: `${topic.name} — ILMIFY` }],
    },
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug, { includeStats: true });
  if (!topic) {
    notFound();
  }

  const [educators, relatedTopics] = await Promise.all([
    listVerifiedEducatorsForTopic(topic.id, 24),
    listRelatedTopics(topic.id, 6),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilmify.id';
  const topicUrl = `${siteUrl}/topics/${topic.slug}`;

  const educatorSummaries: EducatorSummary[] = educators.map((e) => ({
    id: e.id,
    slug: e.slug,
    name: e.name,
    title: e.title,
    location: e.location,
    rating: 0,
    reviewsCount: 0,
    expertise: [],
    avatar: e.avatar,
    verified: e.verified,
    verifiedStatus: e.verified ? 'VERIFIED' : 'DRAFT',
    institution: '',
    method: '',
  }));

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: topic.name,
      description: topic.description ?? undefined,
      url: topicUrl,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: educators.length,
        itemListElement: educators.map((e, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Person',
            name: e.name,
            url: `${siteUrl}/educator/${e.slug}`,
          },
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Topik', item: `${siteUrl}/topics` },
        { '@type': 'ListItem', position: 3, name: topic.name, item: topicUrl },
      ],
    },
  ];

  return (
    <main className="main-content pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-8 max-w-5xl">
        {/* Breadcrumbs */}
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
            <li>
              <Link href="/topics" className="hover:text-emerald-800">
                Topik
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </li>
            <li className="text-gray-700 font-medium truncate max-w-[220px]" aria-current="page">
              {topic.name}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="glass-panel p-6 md:p-8 rounded-2xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="p-2.5 rounded-xl bg-[#0F3D2E]/10 text-[#0F3D2E]">
              <BookOpen className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F3D2E] font-serif">
              {topic.name}
            </h1>
          </div>
          {topic.description && (
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
              {topic.description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
              <Users className="w-3.5 h-3.5" />
              {topic.verifiedEducatorCount} pendidik terverifikasi
            </span>
            {topic.childCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                <GraduationCap className="w-3.5 h-3.5" />
                {topic.childCount} topik turunan
              </span>
            )}
          </div>
        </header>

        {topic.children.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-bold text-[#0F3D2E] mb-3">Topik Turunan</h2>
            <div className="flex flex-wrap gap-2">
              {topic.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/topics/${child.slug}`}
                  className="px-3 py-1.5 rounded-full border border-emerald-200 bg-white text-sm text-emerald-800 hover:bg-emerald-50 transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Verified educators */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-base font-bold text-[#0F3D2E]">
              Pendidik Terverifikasi
            </h2>
          </div>

          {educators.length === 0 ? (
            <div className="glass-panel p-6 rounded-2xl text-center text-sm text-gray-500">
              Belum ada pendidik yang terverifikasi pada topik ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {educatorSummaries.map((educator) => (
                <EducatorCard key={educator.id} educator={educator} />
              ))}
            </div>
          )}
        </section>

        {/* Related topics */}
        {relatedTopics.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[#0F3D2E] mb-3">Topik Terkait</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((related) => (
                <Link
                  key={related.id}
                  href={`/topics/${related.slug}`}
                  className="px-3 py-1.5 rounded-full border border-emerald-200 bg-white text-sm text-emerald-800 hover:bg-emerald-50 transition-colors"
                >
                  {related.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8">
          <CommunitySection targetType="TOPIC" targetId={topic.id} context={{ topicId: topic.id }} />
        </div>
      </div>
    </main>
  );
}
