'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchUserBets, fetchProfile, type Bet, type DateRange, type Profile } from '@/lib/api';
import {
  calculateMonthlyStats,
  calculateStatsByBetType,
  getProfitLossTimeSeries,
  getMonthlyProfitData,
  getMonthlyROIData,
  calculateStreaks,
  getOddsRangePerformance,
  getDayOfWeekPerformance,
  getBetSizePerformance,
  getTopHorsePerformance,
  getTopRacePerformance,
  getWeeklyPerformance,
  getPerformanceInsights,
  ALL_BET_TYPES,
} from '@/lib/stats';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, DollarSign, Target, Activity, Trophy, Calendar, Flame, BarChart3, Clock, Coins, TrendingDown, Award, Lightbulb } from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';

export default function DashboardPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [filteredBets, setFilteredBets] = useState<Bet[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const { formatValue, mode } = useCurrency();

  useEffect(() => {
    loadBets();
    loadProfile();
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    })();
  }, []);

  const loadProfile = async () => {
    const { data } = await fetchProfile();
    if (data) setProfile(data);
  };

  const filterBets = useCallback(() => {
    let filtered = [...bets];

    if (dateRange === 'this-month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filtered = bets.filter((bet) => {
        const betDate = new Date(bet.bet_date);
        return betDate >= start && betDate <= end;
      });
    } else if (dateRange === 'last-month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      filtered = bets.filter((bet) => {
        const betDate = new Date(bet.bet_date);
        return betDate >= start && betDate <= end;
      });
    }

    setFilteredBets(filtered);
  }, [bets, dateRange]);

  useEffect(() => {
    filterBets();
  }, [filterBets]);

  const loadBets = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data } = await fetchUserBets(user.id, 'all');
      setBets(data || []);
    } catch (err) {
      console.error('Failed to load bets:', err);
    } finally {
      setLoading(false);
    }
  };



  const stats = calculateMonthlyStats(filteredBets);
  const betTypeStats = calculateStatsByBetType(filteredBets);
  const profitLossData = getProfitLossTimeSeries(filteredBets);
  const monthlyProfitData = getMonthlyProfitData(filteredBets, 6);
  const monthlyROIData = getMonthlyROIData(filteredBets, 6);
  const streakStats = calculateStreaks(filteredBets);
  const oddsRangeData = getOddsRangePerformance(filteredBets);
  const dayOfWeekData = getDayOfWeekPerformance(filteredBets);
  const betSizeData = getBetSizePerformance(filteredBets);
  const topHorses = getTopHorsePerformance(filteredBets, 5);
  const topRaces = getTopRacePerformance(filteredBets, 5);
  const weeklyData = getWeeklyPerformance(filteredBets, 12);
  const insights = getPerformanceInsights(filteredBets);

  const BET_TYPE_LABELS: Record<string, string> = {
    'win': 'Win',
    'place': 'Place',
    'lay': 'Lay',
    'each-way': 'Each-Way',
    'multi': 'Multi',
    'quinella': 'Quinella',
    'exacta': 'Exacta',
    'trifecta': 'Trifecta',
    'first-four': 'First Four',
    'other': 'Other',
  };

  const BET_TYPE_COLORS: Record<string, string> = {
    'win': 'hsl(var(--primary))',
    'place': 'hsl(var(--secondary))',
    'each-way': 'hsl(var(--accent))',
    'lay': 'hsl(var(--destructive))',
    'multi': '#f59e0b',
    'quinella': '#14b8a6',
    'exacta': '#0ea5e9',
    'trifecta': '#06b6d4',
    'first-four': '#0891b2',
    'other': 'hsl(var(--muted-foreground))',
  };

  const pieData = ALL_BET_TYPES.map((t) => ({
    name: BET_TYPE_LABELS[t],
    value: filteredBets.filter((b) => b.bet_type === (t as any)).length,
    type: t,
  }));

  const COLORS = ALL_BET_TYPES.map((t) => BET_TYPE_COLORS[t]);

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

  const strikeRateData = ALL_BET_TYPES.map((t) => ({
    type: BET_TYPE_LABELS[t],
    strikeRate: (betTypeStats as any)[t]?.totalBets > 0 ? (betTypeStats as any)[t].strikeRate : 0,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const currentMonth = format(new Date(), 'MMMM yyyy');
  const profitTodayDisplay = formatValue(stats.profitToday);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="rounded-2xl p-6 sm:p-8 bg-card border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back{userEmail ? `, ${userEmail.split('@')[0]}` : ''}!</h2>
            <p className="mt-1 text-muted-foreground">Here’s a quick snapshot of your performance.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Monthly P&L</span>
              </div>
              <div className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatValue(stats.totalProfit)}
              </div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-sm">Strike Rate</span>
              </div>
              <div className="text-xl font-bold text-foreground">{stats.strikeRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{currentMonth}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground bg-background transition-colors"
          >
            <option value="all">All Time</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl shadow-sm p-6 bg-card border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Profit/Loss</p>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p
            className={`text-4xl font-bold mt-2 ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {formatValue(stats.totalProfit)}
          </p>
        </div>
        <div className="rounded-xl shadow-sm p-6 bg-card border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Strike Rate</p>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <p className="text-4xl font-bold mt-2 text-foreground">
            {stats.strikeRate.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl shadow-sm p-6 bg-card border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">POT (Profit on Turnover)</p>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <p className={`text-4xl font-bold mt-2 ${stats.pot >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.pot.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl shadow-sm p-6 bg-card border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Turnover</p>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <p className="text-4xl font-bold mt-2 text-foreground">
            {formatValue(stats.totalStake, 2, false)}
          </p>
        </div>
      </div>

      {/* Celebrations & Milestones */}
      <div className="flex flex-wrap gap-3">
        {stats.totalBets >= 100 && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-semibold">100 bets tracked! 🎉</span>
          </div>
        )}
        {streakStats.currentStreak > 0 && streakStats.currentStreakType === 'win' && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {streakStats.currentStreak} Win Streak 🔥
            </span>
          </div>
        )}
      </div>



      {/* Key Insights Section */}
      {
        insights.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-400">Performance Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 shadow-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{insight.description}</p>
                  <div className="text-sm font-medium text-red-600 dark:text-red-400">
                    {insight.metric}: {formatValue(insight.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* Goals Progress Section */}
      {
        profile?.goals_enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.monthly_profit_target && (
              <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Monthly Profit Goal</span>
                  <span className="text-sm font-bold text-foreground">
                    {formatValue(stats.totalProfit)} / {formatValue(profile.monthly_profit_target)}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${stats.totalProfit >= profile.monthly_profit_target ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(Math.max((stats.totalProfit / profile.monthly_profit_target) * 100, 0), 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {((stats.totalProfit / profile.monthly_profit_target) * 100).toFixed(1)}%
                </p>
              </div>
            )}

            {profile.monthly_roi_target && (
              <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Monthly ROI Goal</span>
                  <span className="text-sm font-bold text-foreground">
                    {stats.roi.toFixed(1)}% / {profile.monthly_roi_target.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${stats.roi >= profile.monthly_roi_target ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(Math.max((stats.roi / profile.monthly_roi_target) * 100, 0), 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {((stats.roi / profile.monthly_roi_target) * 100).toFixed(1)}%
                </p>
              </div>
            )}

            {profile.strike_rate_target && (
              <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Strike Rate Goal</span>
                  <span className="text-sm font-bold text-foreground">
                    {stats.strikeRate.toFixed(1)}% / {profile.strike_rate_target.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${stats.strikeRate >= profile.strike_rate_target ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(Math.max((stats.strikeRate / profile.strike_rate_target) * 100, 0), 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {((stats.strikeRate / profile.strike_rate_target) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )
      }

      {/* Additional Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Bets</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{stats.totalBets}</p>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
          <p className="text-sm font-medium text-muted-foreground">Average Odds</p>
          <p className="text-3xl font-bold mt-2 text-foreground">
            {stats.averageOdds.toFixed(2)}
          </p>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Today&apos;s Profit/Loss</p>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <p
            className={`text-3xl font-bold mt-2 ${stats.profitToday > 0
              ? 'text-green-600'
              : stats.profitToday < 0
                ? 'text-red-600'
                : 'text-foreground'
              }`}
          >
            {profitTodayDisplay}
          </p>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
          <p className="text-sm font-medium text-muted-foreground">Best Win</p>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {formatValue(stats.bestWin)}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      {
        filteredBets.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center border border-border">
            <p className="text-muted-foreground">No data available. Add some bets to see statistics!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profit/Loss Over Time */}
            <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Profit/Loss Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Comparison */}
            <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Monthly Comparison (Last 6 Months)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyProfitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    {...sharedTooltipProps}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {monthlyProfitData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Strike Rate by Bet Type and Bet Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Strike Rate by Bet Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={strikeRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      {...sharedTooltipProps}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Bar dataKey="strikeRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Bet Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="40%"
                      cy="50%"
                      labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                      label={renderPieLabel}
                      outerRadius={95}
                      paddingAngle={3}
                      fill="#8884d8"
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
              </div>
            </div>

            {/* ROI Trend */}
            <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
              <h2 className="text-lg font-semibold mb-4 text-foreground">ROI Trend (Last 6 Months)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyROIData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
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
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Advanced Insights Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Advanced Insights
              </h2>

              {/* Streak Analysis Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className={`h-5 w-5 ${streakStats.currentStreakType === 'win' ? 'text-green-500' : streakStats.currentStreakType === 'loss' ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  </div>
                  <p className={`text-3xl font-bold ${streakStats.currentStreakType === 'win' ? 'text-green-600' : streakStats.currentStreakType === 'loss' ? 'text-red-600' : 'text-foreground'}`}>
                    {streakStats.currentStreak} {streakStats.currentStreakType === 'win' ? 'Wins' : streakStats.currentStreakType === 'loss' ? 'Losses' : ''}
                  </p>
                </div>
                <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium text-muted-foreground">Longest Win Streak</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{streakStats.longestWinStreak}</p>
                </div>
                <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <p className="text-sm font-medium text-muted-foreground">Longest Loss Streak</p>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{streakStats.longestLossStreak}</p>
                </div>
                <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
                  <div className="flex items-center gap-2 mb-2">
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
              <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border mb-6">
                <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Weekly Performance Trend (Last 12 Weeks)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      {...sharedTooltipProps}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Odds Range & Day of Week Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
                  <h2 className="text-lg font-semibold mb-4 text-foreground">Performance by Odds Range</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={oddsRangeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="range" angle={-45} textAnchor="end" height={100} stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        {...sharedTooltipProps}
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                        {oddsRangeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
                  <h2 className="text-lg font-semibold mb-4 text-foreground">Performance by Day of Week</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dayOfWeekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        {...sharedTooltipProps}
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                        {dayOfWeekData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bet Size Performance */}
              <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border mb-6">
                <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  Performance by Bet Size
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={betSizeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      {...sharedTooltipProps}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {betSizeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Horses & Races */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
                  <h2 className="text-lg font-semibold mb-4 text-foreground">Top Performing Horses</h2>
                  {topHorses.length > 0 ? (
                    <div className="space-y-3">
                      {topHorses.map((horse, index) => (
                        <div
                          key={horse.horseName}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                                index === 2 ? 'bg-amber-600 text-white' :
                                  'bg-muted text-muted-foreground'
                              }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{horse.horseName}</p>
                              <p className="text-xs text-muted-foreground">{horse.bets} bets • {horse.wins} wins ({horse.strikeRate.toFixed(1)}%)</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${horse.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatValue(horse.profit)}
                            </p>
                            <p className="text-xs text-muted-foreground">Avg: {horse.averageOdds.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No horse data available</p>
                  )}
                </div>

                <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-border">
                  <h2 className="text-lg font-semibold mb-4 text-foreground">Top Performing Races</h2>
                  {topRaces.length > 0 ? (
                    <div className="space-y-3">
                      {topRaces.map((race, index) => (
                        <div
                          key={race.raceName}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                                index === 2 ? 'bg-amber-600 text-white' :
                                  'bg-muted text-muted-foreground'
                              }`}>
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-foreground truncate">{race.raceName}</p>
                              <p className="text-xs text-muted-foreground">{race.bets} bets • {race.wins} wins ({race.strikeRate.toFixed(1)}%)</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className={`font-bold ${race.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatValue(race.profit)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No race data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
