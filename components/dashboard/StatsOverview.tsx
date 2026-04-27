'use client';

import { DollarSign, Target, TrendingUp, Activity, HelpCircle, Calendar } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { useCurrency } from '@/components/CurrencyContext';
import { formatValue } from '@/lib/utils'; // Assuming this exists or I should use the context one
// Actually, useCurrency provides formatValue. I should use that.

interface StatsOverviewProps {
    stats: {
        totalProfit: number;
        strikeRate: number;
        pot: number;
        totalStake: number;
        profitToday: number;
        bestWin: number;
        totalBets: number;
        averageOdds: number;
    };
    /** Bets included in the current period (for empty-state hints) */
    betsCount: number;
    /** All-time bet count (user may have bets outside the selected period) */
    totalBetsAllTime: number;
}

export function StatsOverview({ stats, betsCount, totalBetsAllTime }: StatsOverviewProps) {
    const { formatValue } = useCurrency();

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="Total Profit/Loss"
                value={formatValue(stats.totalProfit)}
                icon={DollarSign}
                valueClassName={stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}
                description={
                    totalBetsAllTime === 0
                        ? 'Start betting to see your P&L'
                        : betsCount === 0
                          ? 'No bets in this period'
                          : undefined
                }
            />
            <StatsCard
                title="Strike Rate"
                value={`${stats.strikeRate.toFixed(1)}%`}
                icon={Target}
            />
            <StatsCard
                title="POT (Profit on Turnover)"
                value={`${stats.pot.toFixed(1)}%`}
                icon={TrendingUp}
                valueClassName={stats.pot >= 0 ? 'text-green-500' : 'text-red-500'}
            />
            <StatsCard
                title="Total Turnover"
                value={formatValue(stats.totalStake)}
                icon={Activity}
            />
        </div>
    );
}
