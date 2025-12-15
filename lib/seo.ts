import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puntersjournal.com.au';
const siteName = "Punter's Journal";
const brandPositioning = "Punters Journal is an Australian race-day workbook and education hub for serious, value-driven horse racing punters.";
const defaultDescription = brandPositioning;

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
  // Ensure title is within SEO best practices (50-60 chars)
  const truncatedTitle = fullTitle.length > 60 ? fullTitle.substring(0, 57) + '...' : fullTitle;
  const url = `${siteUrl}${path}`;
  // OG image fallback - create og-image.png (1200x630) for better social sharing
  const ogImage = image || `${siteUrl}/icon-512x512.png`;
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
    title: truncatedTitle,
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
      title: truncatedTitle,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: truncatedTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: truncatedTitle,
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

export function generateStructuredData(type: 'WebSite' | 'WebApplication' | 'Organization' | 'Product', data?: Record<string, any>) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: siteName,
    url: siteUrl,
    description: brandPositioning,
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

  if (type === 'Organization') {
    return {
      ...baseData,
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      description: brandPositioning,
      logo: `${siteUrl}/icon-512x512.png`,
      sameAs: [],
    };
  }

  if (type === 'Product') {
    return {
      ...baseData,
      '@type': 'Product',
      name: siteName,
      description: brandPositioning,
      category: 'Software',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'AUD',
        availability: 'https://schema.org/InStock',
      },
    };
  }

  return baseData;
}

export const BRAND_POSITIONING = brandPositioning;




