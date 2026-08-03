import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://semesta-islam.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/management/', '/member/', '/educator/workspace', '/learner/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
