'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { useCurrency } from '@/components/CurrencyContext';
import type { BankBalancePoint } from '@/lib/stats';

interface BankHistoryChartProps {
    /** Bankroll tracking enabled and a starting amount set. */
    enabled: boolean;
    /** True when the bank_transactions table/migration is not yet applied. */
    tableMissing: boolean;
    series: BankBalancePoint[];
    starting: number;
}

export function BankHistoryChart({ enabled, tableMissing, series, starting }: BankHistoryChartProps) {
    const { formatValue } = useCurrency();

    if (!enabled) return null;

    if (tableMissing) {
        return (
            <ChartCard title="Bank History">
                <div className="flex h-full items-center justify-center">
                    <div className="flex max-w-md items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-300">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-medium">Database update required</p>
                            <p className="mt-1">
                                Run <code className="font-mono">migrations/0001_bank_transactions.sql</code> in the Supabase
                                SQL editor to enable your bank history chart and deposit/withdrawal log.
                            </p>
                        </div>
                    </div>
                </div>
            </ChartCard>
        );
    }

    const lastBalance = series.length > 0 ? series[series.length - 1].balance : starting;
    const isUp = lastBalance >= starting;
    const lineColor = isUp ? '#10B981' : '#EF4444';

    const formatXTick = (value: string) =>
        value === 'start' ? 'Start' : format(new Date(value), 'MMM dd');

    return (
        <ChartCard title="Bank History">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                    <defs>
                        <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatXTick}
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
                        contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                            color: 'hsl(var(--popover-foreground))',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            padding: '0.75rem',
                        }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600, marginBottom: '0.25rem' }}
                        itemStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 500 }}
                        formatter={(value: number, _name, item) => [
                            formatValue(value, 2, false),
                            item?.payload?.label ?? 'Balance',
                        ]}
                        labelFormatter={(value) => (value === 'start' ? 'Starting bank' : format(new Date(value), 'MMM dd, yyyy'))}
                    />
                    <ReferenceLine y={starting} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke={lineColor}
                        fillOpacity={1}
                        fill="url(#colorBank)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

export default BankHistoryChart;
