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
import { MapPin, Trophy, Flag } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { useCurrency } from '@/components/CurrencyContext';
import type {
    VenuePerformance,
    HorsePerformance,
    RacePerformance,
} from '@/lib/stats';

interface VenuePerformanceSectionProps {
    venueData: VenuePerformance[];
    topHorses: HorsePerformance[];
    topRaces: RacePerformance[];
}

export function VenuePerformanceSection({
    venueData,
    topHorses,
    topRaces,
}: VenuePerformanceSectionProps) {
    const { formatValue } = useCurrency();

    // Nothing to show if the user hasn't logged venues/horses/races (e.g. sport-only bets)
    if (venueData.length === 0 && topHorses.length === 0 && topRaces.length === 0) {
        return null;
    }

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

    // Top 8 venues by profit for the chart
    const venueChartData = venueData.slice(0, 8).map((v) => ({
        venue: v.venue,
        profit: v.profit,
    }));

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                    Venue, Horse &amp; Race Performance
                </h2>
            </div>

            {/* Profit by Venue */}
            {venueChartData.length > 0 && (
                <ChartCard
                    title="Profit by Venue (Top 8)"
                    action={<MapPin className="h-5 w-5 text-muted-foreground" />}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={venueChartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="venue"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
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
                                {venueChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Horses */}
                {topHorses.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            <h3 className="text-lg font-semibold text-foreground">Top Horses</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-muted-foreground">
                                        <th className="pb-2 pr-2 font-medium">Horse</th>
                                        <th className="pb-2 px-2 text-right font-medium">Bets</th>
                                        <th className="pb-2 px-2 text-right font-medium">Strike</th>
                                        <th className="pb-2 pl-2 text-right font-medium">Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topHorses.slice(0, 8).map((horse, index) => (
                                        <tr
                                            key={`${horse.horseName}-${index}`}
                                            className="border-b border-border/50 last:border-0"
                                        >
                                            <td className="py-2 pr-2 font-medium text-foreground">
                                                {horse.horseName}
                                            </td>
                                            <td className="py-2 px-2 text-right text-muted-foreground">
                                                {horse.bets}
                                            </td>
                                            <td className="py-2 px-2 text-right text-muted-foreground">
                                                {horse.strikeRate.toFixed(0)}%
                                            </td>
                                            <td
                                                className={`py-2 pl-2 text-right font-semibold ${horse.profit >= 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                    }`}
                                            >
                                                {formatValue(horse.profit)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Top Races */}
                {topRaces.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Flag className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-semibold text-foreground">Top Races</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-muted-foreground">
                                        <th className="pb-2 pr-2 font-medium">Race</th>
                                        <th className="pb-2 px-2 text-right font-medium">Bets</th>
                                        <th className="pb-2 px-2 text-right font-medium">Strike</th>
                                        <th className="pb-2 pl-2 text-right font-medium">Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topRaces.slice(0, 8).map((race, index) => (
                                        <tr
                                            key={`${race.raceName}-${index}`}
                                            className="border-b border-border/50 last:border-0"
                                        >
                                            <td className="py-2 pr-2 font-medium text-foreground">
                                                {race.raceName}
                                            </td>
                                            <td className="py-2 px-2 text-right text-muted-foreground">
                                                {race.bets}
                                            </td>
                                            <td className="py-2 px-2 text-right text-muted-foreground">
                                                {race.strikeRate.toFixed(0)}%
                                            </td>
                                            <td
                                                className={`py-2 pl-2 text-right font-semibold ${race.profit >= 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                    }`}
                                            >
                                                {formatValue(race.profit)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VenuePerformanceSection;
