import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puntersjournal.com';
const siteName = "Punter's Journal";
const defaultDescription = "Track your horse racing bets with ease. Automatic stats, beautiful charts, and insights. Built for Aussie punters.";

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  noindex?: boolean;
  nofollow?: boolean;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateMetadata({
  title,
  description = defaultDescription,
  keywords = [],
  path = '',
  noindex = false,
  nofollow = false,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
}: SEOConfig): Metadata {
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const url = `${siteUrl}${path}`;
  const ogImage = image || `${siteUrl}/og-image.png`;
  const defaultKeywords = [
    'horse racing',
    'bet tracker',
    'betting stats',
    'punt tracker',
    'racing bets',
    'Australian horse racing',
    'betting analytics',
    'betting performance',
    'horse racing tips',
  ];

  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      siteName,
      title: fullTitle,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@puntersjournal',
      site: '@puntersjournal',
    },
    alternates: {
      canonical: url,
    },
    metadataBase: new URL(siteUrl),
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
  };
}

export function generateStructuredData(type: 'WebSite' | 'WebApplication' | 'Organization', data?: Record<string, any>) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: siteName,
    url: siteUrl,
    description: defaultDescription,
    ...data,
  };

  if (type === 'WebApplication') {
    return {
      ...baseData,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'AUD',
      },
    };
  }

  return baseData;
}
