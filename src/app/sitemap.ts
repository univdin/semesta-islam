import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://semesta-islam.vercel.app';
  const now = new Date();

  const staticRoutes: Array<{ path: string; priority: number }> = [
    { path: '', priority: 1.0 },
    { path: '/directory', priority: 0.9 },
    { path: '/discovery', priority: 0.8 },
    { path: '/booking', priority: 0.8 },
    { path: '/changelog', priority: 0.5 },
    { path: '/contributions', priority: 0.5 },
    { path: '/affiliate', priority: 0.4 },
    { path: '/ambassador', priority: 0.4 },
    { path: '/login', priority: 0.3 },
  ];

  const entries = staticRoutes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/directory' ? ('daily' as const) : ('weekly' as const),
    priority,
  }));

  return entries;
}
