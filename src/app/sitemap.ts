import type { MetadataRoute } from 'next';

import { listEducatorSummaries } from '@/lib/educators/service';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilmify.id';
  const now = new Date();

  const staticRoutes: Array<{ path: string; priority: number }> = [
    { path: '', priority: 1.0 },
    { path: '/directory', priority: 0.9 },
    { path: '/booking', priority: 0.8 },
    { path: '/discovery', priority: 0.8 },
    { path: '/about', priority: 0.7 },
    { path: '/faq', priority: 0.7 },
    { path: '/contact', priority: 0.6 },
    { path: '/marketing-kit', priority: 0.6 },
    { path: '/privacy-policy', priority: 0.6 },
    { path: '/terms-of-service', priority: 0.6 },
    { path: '/changelog', priority: 0.5 },
    { path: '/developer', priority: 0.5 },
    { path: '/contributions', priority: 0.5 },
    { path: '/affiliate', priority: 0.4 },
    { path: '/ambassador', priority: 0.4 },
    { path: '/login', priority: 0.3 },
  ];

  const staticEntries = staticRoutes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/directory' ? ('daily' as const) : ('weekly' as const),
    priority,
  }));

  // Dynamic Educator Profiles for SERP & AI Indexing
  let dynamicEducatorEntries: MetadataRoute.Sitemap = [];
  try {
    const educators = await listEducatorSummaries({ take: 100 });
    dynamicEducatorEntries = educators.map((edu) => ({
      url: `${baseUrl}/educator/${edu.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: edu.verified ? 0.85 : 0.7,
    }));
  } catch {
    // Graceful fallback if database is unseeded during static generation
  }

  return [...staticEntries, ...dynamicEducatorEntries];
}
