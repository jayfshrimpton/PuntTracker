import { NextResponse } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puntersjournal.com';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Allow: /pricing
Allow: /signup
Disallow: /login
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /dashboard
Disallow: /bets
Disallow: /insights
Disallow: /settings
Disallow: /subscription
Disallow: /feedback
Disallow: /admin
Disallow: /api

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}



