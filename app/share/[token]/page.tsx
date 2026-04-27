'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { PublicSharePayload } from '@/lib/share-payload';
import Logo from '@/components/Logo';

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<PublicSharePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/share/${token}`);
        const json = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(json.error || 'Link not found');
          return;
        }
        if (!cancelled) setData(json as PublicSharePayload);
      } catch {
        if (!cancelled) setError('Could not load this page');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex flex-col">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-90">
            <Logo size={36} />
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold rounded-lg bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/90"
          >
            Start tracking
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        {loading && (
          <p className="text-muted-foreground animate-pulse">Loading stats…</p>
        )}
        {error && !loading && (
          <div className="text-center max-w-md">
            <p className="text-lg font-medium text-foreground mb-2">Unavailable</p>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/" className="text-primary font-medium hover:underline">
              Back to home
            </Link>
          </div>
        )}
        {data && !loading && (
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl shadow-primary/5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Shared punting stats
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-1">
                {data.displayName || 'Punter'}
              </h1>
              <p className="text-sm text-muted-foreground mb-8">Period: {data.periodLabel}</p>

              <div className="grid grid-cols-2 gap-4">
                {data.stats.totalProfit != null && (
                  <div className="rounded-2xl bg-muted/50 p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">P&amp;L</p>
                    <p
                      className={`text-xl font-bold tabular-nums ${
                        data.stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {`${data.stats.totalProfit >= 0 ? '+' : ''}$${data.stats.totalProfit.toFixed(0)}`}
                    </p>
                  </div>
                )}
                {data.stats.strikeRate != null && (
                  <div className="rounded-2xl bg-muted/50 p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Strike rate</p>
                    <p className="text-xl font-bold tabular-nums text-foreground">
                      {data.stats.strikeRate.toFixed(1)}%
                    </p>
                  </div>
                )}
                {data.stats.roi != null && (
                  <div className="rounded-2xl bg-muted/50 p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">ROI</p>
                    <p
                      className={`text-xl font-bold tabular-nums ${
                        data.stats.roi >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {data.stats.roi >= 0 ? '+' : ''}
                      {data.stats.roi.toFixed(1)}%
                    </p>
                  </div>
                )}
                {data.stats.totalStake != null && (
                  <div className="rounded-2xl bg-muted/50 p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Turnover</p>
                    <p className="text-xl font-bold tabular-nums text-foreground">
                      ${data.stats.totalStake.toFixed(0)}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-8">
                {data.totalBets} bet{data.totalBets === 1 ? '' : 's'} in period
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Track your own edge with{' '}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Punter&apos;s Journal
              </Link>
              .
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
