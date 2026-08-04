import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilmify.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/management/', '/member/', '/educator/workspace', '/learner/', '/discovery', '/contributions', '/affiliate', '/ambassador'],
      },
      // Explicit rules for AI Search & Answer Engine crawlers (GEO/AEO Optimization)
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'GoogleOther', 'Bingbot'],
        allow: ['/', '/directory', '/topics', '/educator/*', '/about', '/faq', '/changelog', '/developer', '/llms.txt'],
        disallow: ['/api/', '/management/', '/member/', '/educator/workspace', '/learner/', '/discovery', '/contributions', '/affiliate', '/ambassador'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
