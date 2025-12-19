'use client';

import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Flame, TrendingUp, TrendingDown, Award, BarChart3, Clock, Lightbulb } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { useCurrency } from '@/components/CurrencyContext';

interface InsightsSectionProps {
    insights: any[];
    streakStats: any;
    weeklyData: any[];
    oddsRangeData: any[];
    dayOfWeekData: any[];
}

export function InsightsSection({
    insights,
    streakStats,
    weeklyData,
    oddsRangeData,
    dayOfWeekData,
}: InsightsSectionProps) {
    const { formatValue } = useCurrency();

    const sharedTooltipProps = {
        contentStyle: {
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            color: 'hsl(var(--popover-foreground))',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            padding: '0.75rem',
        },
        labelStyle: {
            color: 'hsl(var(--muted-foreground))',
            fontWeight: 600,
            marginBottom: '0.25rem',
        },
        itemStyle: {
            color: 'hsl(var(--popover-foreground))',
            fontWeight: 500,
        },
    } as const;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Advanced Insights</h2>
            </div>

            {/* Key Insights Cards */}
            {insights.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="mb-4 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-400">
                            Performance Insights
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-900/50 dark:bg-gray-800"
                            >
                                <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                                    {insight.title}
                                </h3>
                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                    {insight.description}
                                </p>
                                <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                    {insight.metric}: {formatValue(insight.value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Streak Analysis */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                        <Flame
                            className={`h-5 w-5 ${streakStats.currentStreakType === 'win'
                                    ? 'text-green-500'
                                    : streakStats.currentStreakType === 'loss'
                                        ? 'text-red-500'
                                        : 'text-muted-foreground'
                                }`}
                        />
                        <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                    </div>
                    <p
                        className={`text-3xl font-bold ${streakStats.currentStreakType === 'win'
                                ? 'text-green-600'
                                : streakStats.currentStreakType === 'loss'
                                    ? 'text-red-600'
                                    : 'text-foreground'
                            }`}
                    >
                        {streakStats.currentStreak}{' '}
                        {streakStats.currentStreakType === 'win'
                            ? 'Wins'
                            : streakStats.currentStreakType === 'loss'
                                ? 'Losses'
                                : ''}
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <p className="text-sm font-medium text-muted-foreground">Longest Win Streak</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{streakStats.longestWinStreak}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                        <p className="text-sm font-medium text-muted-foreground">Longest Loss Streak</p>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{streakStats.longestLossStreak}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-500" />
                        <p className="text-sm font-medium text-muted-foreground">Best Streak Ratio</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                        {streakStats.longestWinStreak > 0 && streakStats.longestLossStreak > 0
                            ? (streakStats.longestWinStreak / streakStats.longestLossStreak).toFixed(1)
                            : streakStats.longestWinStreak > 0
                                ? '∞'
                                : '0'}
                    </p>
                </div>
            </div>

            {/* Weekly Performance */}
            <ChartCard
                title="Weekly Performance Trend (Last 12 Weeks)"
                action={<Clock className="h-5 w-5 text-muted-foreground" />}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="week"
                            stroke="hsl(var(--muted-foreground))"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                        />
                        <Tooltip
                            {...sharedTooltipProps}
                            formatter={(value: number) => formatValue(value)}
                        />
                        <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                            {weeklyData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Odds Range Performance */}
                <ChartCard title="Performance by Odds Range">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={oddsRangeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis
                                dataKey="range"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                stroke="hsl(var(--muted-foreground))"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                tickLine={false}
                                axisLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                {...sharedTooltipProps}
                                formatter={(value: number) => formatValue(value)}
                            />
                            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                                {oddsRangeData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Day of Week Performance */}
                <ChartCard title="Performance by Day of Week">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayOfWeekData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis
                                dataKey="day"
                                stroke="hsl(var(--muted-foreground))"
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                tickLine={false}
                                axisLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                {...sharedTooltipProps}
                                formatter={(value: number) => formatValue(value)}
                            />
                            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                                {dayOfWeekData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
}

export default InsightsSection;
