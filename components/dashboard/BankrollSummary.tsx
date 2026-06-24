'use client';

import { Wallet, PiggyBank, TrendingUp, Percent, LineChart } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { useCurrency } from '@/components/CurrencyContext';
import type { BankrollSummary as BankrollSummaryType } from '@/lib/stats';

interface BankrollSummaryProps {
    summary: BankrollSummaryType;
}

export function BankrollSummary({ summary }: BankrollSummaryProps) {
    const { formatValue } = useCurrency();

    if (!summary.enabled) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Bankroll</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatsCard
                    title="Starting Bank"
                    value={formatValue(summary.starting, 2, false)}
                    icon={PiggyBank}
                />
                <StatsCard
                    title="Current Bank"
                    value={formatValue(summary.current, 2, false)}
                    icon={Wallet}
                />
                <StatsCard
                    title="All-time P/L"
                    value={formatValue(summary.allTimeProfit)}
                    icon={TrendingUp}
                    valueClassName={summary.allTimeProfit >= 0 ? 'text-green-500' : 'text-red-500'}
                />
                <StatsCard
                    title="True ROI (on bank)"
                    value={`${summary.trueRoi.toFixed(1)}%`}
                    icon={Percent}
                    valueClassName={summary.trueRoi >= 0 ? 'text-green-500' : 'text-red-500'}
                />
                <StatsCard
                    title="Growth"
                    value={`${summary.growthPct >= 0 ? '+' : ''}${summary.growthPct.toFixed(1)}%`}
                    icon={LineChart}
                    valueClassName={summary.growthPct >= 0 ? 'text-green-500' : 'text-red-500'}
                />
            </div>
        </div>
    );
}
