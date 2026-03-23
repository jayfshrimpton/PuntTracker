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
      <div className="rounded-2xl border border-border p-8 text-center">
        <div className="text-muted-foreground">Analyzing your betting patterns...</div>
      </div>
    );
  }

  if (!insight) {
    return null;
  }

  const monthlyLoss = calculateMonthlyLossProjection(bets);
  const monthlyLossFormatted = formatValue(monthlyLoss);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
      {/* Insight Message */}
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">Early Insight</h2>
        <p className="text-base md:text-lg text-foreground leading-relaxed">{insight.message}</p>
      </div>

      {/* Cost of Inaction */}
      {monthlyLoss > 0 && (
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">Doing nothing costs you about</p>
          <p className="text-2xl md:text-3xl font-bold text-foreground">{monthlyLossFormatted} per month.</p>
          <p className="text-sm text-muted-foreground">Pro costs $10/month.</p>
        </div>
      )}

      {/* Paywalled Answer Section */}
      <div className="pt-4 border-t border-border">
        {isPro ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Your Biggest Betting Leak</h3>
            <p className="text-muted-foreground">
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
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-foreground">
                  We&apos;ve identified your biggest betting leak.
                </p>
                <p className="text-sm text-muted-foreground">
                  Unlock Pro to see exactly what it is and how to fix it.
                </p>
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

