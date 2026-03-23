'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EarlyInsight, calculateMonthlyLossProjection } from '@/lib/early-insights';
import { Bet } from '@/lib/api';
import { Lock } from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';

interface EarlyInsightCardProps {
  bets: Bet[];
  wantsTruth: boolean;
}

export function EarlyInsightCard({ bets, wantsTruth }: EarlyInsightCardProps) {
  const [insight, setInsight] = useState<EarlyInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const { formatValue } = useCurrency();

  useEffect(() => {
    async function loadInsight() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Check if user has Pro subscription
        const subResponse = await fetch('/api/check-subscription');
        if (subResponse.ok) {
          const subData = await subResponse.json();
          setIsPro(subData.tier === 'pro' || subData.tier === 'elite');
        }

        // Fetch existing insight or generate new one
        const { data: existingInsight } = await supabase
          .from('user_insights')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingInsight?.first_pain_insight) {
          // Parse stored insight
          try {
            const parsed = JSON.parse(existingInsight.first_pain_insight);
            setInsight(parsed);
          } catch {
            // If parsing fails, generate new one
            const { generateEarlyInsight } = await import('@/lib/early-insights');
            const newInsight = generateEarlyInsight(bets);
            setInsight(newInsight);
            // Save it
            await supabase.from('user_insights').upsert({
              user_id: user.id,
              first_pain_insight: JSON.stringify(newInsight),
              insight_type: newInsight.type,
              insight_data: newInsight.data || {},
            });
          }
        } else {
          // Generate new insight
          const { generateEarlyInsight } = await import('@/lib/early-insights');
          const newInsight = generateEarlyInsight(bets);
          setInsight(newInsight);
          // Save it
          await supabase.from('user_insights').upsert({
            user_id: user.id,
            first_pain_insight: JSON.stringify(newInsight),
            insight_type: newInsight.type,
            insight_data: newInsight.data || {},
          });
        }
      } catch (error) {
        console.error('Error loading insight:', error);
      } finally {
        setLoading(false);
      }
    }

    if (wantsTruth && bets.length > 0) {
      loadInsight();
    } else {
      setLoading(false);
    }
  }, [bets, wantsTruth]);

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1SZP2o4kQE4g2R11vjO4bw5Q', // Pro price ID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
    }
  };

  if (!wantsTruth) {
    return null;
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card/50 px-4 py-3 text-center">
        <div className="text-xs text-muted-foreground">Analyzing your betting patterns...</div>
      </div>
    );
  }

  if (!insight) {
    return null;
  }

  const monthlyLoss = calculateMonthlyLossProjection(bets);
  const monthlyLossFormatted = formatValue(monthlyLoss);

  return (
    <div className="rounded-xl border border-border bg-card/80 px-4 py-3 md:px-5 md:py-4 space-y-3">
      {/* Insight Message */}
      <div className="space-y-1.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Early insight
        </h2>
        <p className="text-sm text-foreground leading-snug">{insight.message}</p>
      </div>

      {/* Cost of Inaction */}
      {monthlyLoss > 0 && (
        <div className="space-y-1 pt-2 border-t border-border/80">
          <p className="text-xs text-muted-foreground">Doing nothing costs you about</p>
          <p className="text-lg font-bold text-foreground tabular-nums">{monthlyLossFormatted}/mo</p>
          <p className="text-xs text-muted-foreground">Pro is $10/month.</p>
        </div>
      )}

      {/* Paywalled Answer Section */}
      <div className="pt-2 border-t border-border/80">
        {isPro ? (
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">Your biggest betting leak</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {insight.type === 'stake_sizing' &&
                'You\'re betting more on losing positions than winning ones. This pattern amplifies losses while limiting gains. The fix: standardize your stake sizing or use a staking plan that increases bets only when you have an edge.'}
              {insight.type === 'day_of_week' &&
                `Your ${insight.data?.dayOfWeek} betting is consistently unprofitable. This suggests emotional betting or poor preparation on this day. The fix: either skip betting on ${insight.data?.dayOfWeek} or develop a specific strategy for this day.`}
              {insight.type === 'bet_type' &&
                `Your ${insight.data?.betType} bets are losing money consistently. This bet type may not suit your betting style or knowledge. The fix: either stop betting this type or study it more deeply before continuing.`}
              {insight.type === 'fallback' &&
                'Inconsistent stake sizing is the most common leak. Without a clear staking plan, emotions drive bet sizes, leading to larger losses on bad days. The fix: implement a fixed stake or percentage-based staking plan and stick to it.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-2.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs font-medium text-foreground">
                  We&apos;ve identified your biggest betting leak.
                </p>
                <p className="text-xs text-muted-foreground leading-snug">
                  Unlock Pro to see exactly what it is and how to fix it.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUpgrade}
              className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Upgrade to Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

