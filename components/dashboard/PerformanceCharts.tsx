'use client';

import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    PieLabelRenderProps,
} from 'recharts';
import { format } from 'date-fns';
import { ChartCard } from './ChartCard';
import { useCurrency } from '@/components/CurrencyContext';

interface PerformanceChartsProps {
    profitLossData: any[];
    monthlyProfitData: any[];
    monthlyROIData: any[];
    strikeRateData: any[];
    pieData: any[];
    stats: any;
}

const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--destructive))',
    '#f59e0b',
    '#14b8a6',
    '#0ea5e9',
    '#06b6d4',
    '#0891b2',
    'hsl(var(--muted-foreground))',
];

export function PerformanceCharts({
    profitLossData,
    monthlyProfitData,
    monthlyROIData,
    strikeRateData,
    pieData,
    stats,
}: PerformanceChartsProps) {
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

    const RADIAN = Math.PI / 180;
    const renderPieLabel = ({
        cx = 0,
        cy = 0,
        midAngle = 0,
        innerRadius = 0,
        outerRadius = 0,
        percent = 0,
        name,
    }: PieLabelRenderProps) => {
        if (!percent || !name) return null;

        const numericCx = typeof cx === 'number' ? cx : Number(cx) || 0;
        const numericCy = typeof cy === 'number' ? cy : Number(cy) || 0;
        const numericInner = typeof innerRadius === 'number' ? innerRadius : Number(innerRadius) || 0;
        const numericOuter = typeof outerRadius === 'number' ? outerRadius : Number(outerRadius) || 0;
        const radius = numericInner + (numericOuter - numericInner) * 1.25;
        const x = numericCx + radius * Math.cos(-midAngle * RADIAN);
        const y = numericCy + radius * Math.sin(-midAngle * RADIAN);

        const isRightSide = x >= numericCx;

        return (
            <text
                x={x}
                y={y}
                fill="hsl(var(--muted-foreground))"
                textAnchor={isRightSide ? 'start' : 'end'}
                dominantBaseline="central"
                style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                }}
            >
                {`${name}: ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-6">
            {/* Profit/Loss Over Time */}
            <ChartCard title="Profit/Loss Over Time">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={profitLossData}>
                        <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor={stats.totalProfit >= 0 ? '#10B981' : '#EF4444'}
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={stats.totalProfit >= 0 ? '#10B981' : '#EF4444'}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
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
                            labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                        />
                        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                        <Area
                            type="monotone"
                            dataKey="cumulative"
                            stroke={stats.totalProfit >= 0 ? '#10B981' : '#EF4444'}
                            fillOpacity={1}
                            fill="url(#colorProfit)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Monthly Comparison */}
            <ChartCard title="Monthly Comparison (Last 6 Months)">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyProfitData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="month"
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
                            {monthlyProfitData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strike Rate by Bet Type */}
                <ChartCard title="Strike Rate by Bet Type">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={strikeRateData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis
                                dataKey="type"
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
                                formatter={(value: number) => `${value.toFixed(1)}%`}
                            />
                            <Bar dataKey="strikeRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Bet Distribution */}
                <ChartCard title="Bet Distribution">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                                label={renderPieLabel}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                {...sharedTooltipProps}
                                formatter={(value: number, name) => [`${value} bets`, name as string]}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ paddingLeft: 16 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ROI Trend */}
            <ChartCard title="ROI Trend (Last 6 Months)">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyROIData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="month"
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
                            formatter={(value: number) => `${value.toFixed(1)}%`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="roi"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name="ROI %"
                            dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );
}

export default PerformanceCharts;
