import type { MetadataRoute } from 'next';

export const metadataRoute = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://semesta-islam.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/management/', '/member/', '/educator/workspace', '/learner/'],
      },
      // Explicit rules for AI Search & Answer Engine crawlers (GEO/AEO Optimization)
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'GoogleOther', 'Bingbot'],
        allow: ['/', '/directory', '/educator/*', '/about', '/faq', '/changelog', '/developer', '/llms.txt'],
        disallow: ['/api/', '/management/', '/member/', '/educator/workspace'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
