import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puntersjournal.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          '/signup',
        ],
        disallow: [
          '/login',
          '/forgot-password',
          '/reset-password',
          '/dashboard',
          '/bets',
          '/insights',
          '/settings',
          '/subscription',
          '/feedback',
          '/admin',
          '/api',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
