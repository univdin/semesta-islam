import type { MetadataRoute } from 'next';

import { listEducatorSummaries } from '@/lib/educators/service';
import { listPublishedTopics } from '@/lib/topics/service';
import { isPlatformSettingEnabled, PLATFORM_SETTING_KEYS } from '@/lib/settings/service';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilmify.id';
  const now = new Date();

  const staticRoutes: Array<{ path: string; priority: number }> = [
    { path: '', priority: 1.0 },
    { path: '/directory', priority: 0.9 },
    { path: '/booking', priority: 0.8 },
    { path: '/topics', priority: 0.7 },
    { path: '/about', priority: 0.7 },
    { path: '/faq', priority: 0.7 },
    { path: '/contact', priority: 0.6 },
    { path: '/marketing-kit', priority: 0.6 },
    { path: '/privacy-policy', priority: 0.6 },
    { path: '/terms-of-service', priority: 0.6 },
    { path: '/changelog', priority: 0.5 },
    { path: '/developer', priority: 0.5 },
  ];

  const staticEntries = staticRoutes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/directory' ? ('daily' as const) : ('weekly' as const),
    priority,
  }));

  // Dynamic Educator Profiles for SERP & AI Indexing
  // Only VERIFIED educators with a canonical slug are emitted. Unverified
  // educators are not indexable trust entities and must never appear in the
  // sitemap (trust-gate; the directory page mirrors this contract).
  let dynamicEducatorEntries: MetadataRoute.Sitemap = [];
  try {
    const educators = await listEducatorSummaries({ take: 100, verifiedOnly: true });
    dynamicEducatorEntries = educators
      .filter((edu) => edu.slug)
      .map((edu) => ({
        url: `${baseUrl}/educator/${edu.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: edu.verified ? 0.85 : 0.7,
      }));
  } catch {
    // Graceful fallback if database is unseeded during static generation
  }

  // Dynamic Topic taxonomy pages (EXP-03). Only indexable topics are emitted;
  // thin topics are excluded by the quality gate.
  let topicEntries: MetadataRoute.Sitemap = [];
  try {
    const topicsEnabled = await isPlatformSettingEnabled(PLATFORM_SETTING_KEYS.PUBLIC_TOPICS_ENABLED);
    if (topicsEnabled) {
      const topics = await listPublishedTopics();
      topicEntries = topics.map((topic) => ({
        url: `${baseUrl}/topics/${topic.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // Graceful fallback if database is unseeded during static generation
  }

  return [...staticEntries, ...dynamicEducatorEntries, ...topicEntries];
}
