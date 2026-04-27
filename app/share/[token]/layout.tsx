import type { Metadata } from 'next';
import { fetchPublicSharePayloadByToken } from '@/lib/share-by-token';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puntersjournal.com.au';

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const base: Metadata = {
    metadataBase: new URL(siteUrl),
    robots: { index: false, follow: true },
    openGraph: {
      siteName: "Punter's Journal",
      type: 'website',
    },
  };

  const result = await fetchPublicSharePayloadByToken(params.token);

  if (!result.ok) {
    return {
      ...base,
      title: 'Shared stats',
      description: "Punting performance snapshot shared from Punter's Journal.",
      openGraph: {
        ...base.openGraph,
        title: 'Shared punting stats',
        description: "Performance snapshot from Punter's Journal.",
      },
    };
  }

  const p = result.payload;
  const title = `${p.displayName || 'Punter'} · ${p.periodLabel}`;
  const parts: string[] = [];
  if (p.stats.totalProfit != null) {
    parts.push(`P&L ${p.stats.totalProfit >= 0 ? '+' : ''}$${Math.round(p.stats.totalProfit)}`);
  }
  if (p.stats.strikeRate != null) {
    parts.push(`Strike ${p.stats.strikeRate.toFixed(1)}%`);
  }
  if (p.stats.roi != null) {
    parts.push(`ROI ${p.stats.roi >= 0 ? '+' : ''}${p.stats.roi.toFixed(1)}%`);
  }
  const description =
    parts.length > 0
      ? `${parts.join(' · ')} · ${p.totalBets} bet${p.totalBets === 1 ? '' : 's'}`
      : `${p.totalBets} bet${p.totalBets === 1 ? '' : 's'} in ${p.periodLabel}`;

  return {
    ...base,
    title,
    description,
    openGraph: {
      ...base.openGraph,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function ShareTokenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
