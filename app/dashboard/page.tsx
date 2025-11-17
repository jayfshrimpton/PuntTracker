'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchUserBets, type Bet, type DateRange } from '@/lib/api';
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
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, DollarSign, Target, Activity, Trophy, Calendar, Flame, BarChart3, Clock, Coins, TrendingDown, Award } from 'lucide-react';

export default function DashboardPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [filteredBets, setFilteredBets] = useState<Bet[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    loadBets();
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    })();
  }, []);

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
    'win': '#2563eb',
    'place': '#10B981',
    'each-way': '#7c3aed',
    'lay': '#ef4444',
    'multi': '#f59e0b',
    'quinella': '#14b8a6',
    'exacta': '#0ea5e9',
    'trifecta': '#06b6d4',
    'first-four': '#0891b2',
    'other': '#6b7280',
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
        fill="#6b7280"
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
      backgroundColor: 'rgba(15,23,42,0.95)',
      border: 'none',
      borderRadius: '0.85rem',
      color: '#f8fafc',
      boxShadow: '0 20px 45px rgba(15,23,42,0.35)',
      padding: '0.85rem 1rem',
    },
    labelStyle: {
      color: '#cbd5f5',
      fontWeight: 600,
      marginBottom: '0.25rem',
    },
    itemStyle: {
      color: '#f8fafc',
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
        <div className="text-gray-900">Loading dashboard...</div>
      </div>
    );
  }

  const currentMonth = format(new Date(), 'MMMM yyyy');
  const profitTodayDisplay =
    stats.profitToday > 0
      ? `+$${stats.profitToday.toFixed(2)}`
      : stats.profitToday < 0
      ? `-$${Math.abs(stats.profitToday).toFixed(2)}`
      : '$0.00';

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold drop-shadow">Welcome back{userEmail ? `, ${userEmail.split('@')[0]}` : ''}!</h2>
            <p className="mt-1 text-white/90">Here’s a quick snapshot of your performance.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm shadow-md">
              <div className="flex items-center gap-2 text-white">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Monthly P&L</span>
              </div>
              <div className="text-xl font-bold">${stats.totalProfit.toFixed(2)}</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm shadow-md">
              <div className="flex items-center gap-2 text-white">
                <Target className="h-4 w-4" />
                <span className="text-sm">Strike Rate</span>
              </div>
              <div className="text-xl font-bold">{stats.strikeRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{currentMonth}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500 transition-colors"
          >
            <option value="all">All Time</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl shadow-lg p-6 text-white bg-gradient-to-r from-green-500 to-teal-500 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/90">Total Profit/Loss</p>
            <DollarSign className="h-5 w-5 opacity-90" />
          </div>
          <p
            className={`text-4xl font-bold mt-2 drop-shadow`}
          >
            ${stats.totalProfit.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl shadow-lg p-6 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/90">Strike Rate</p>
            <Target className="h-5 w-5 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-2">
            {stats.strikeRate.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl shadow-lg p-6 text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/90">POT (Profit on Turnover)</p>
            <TrendingUp className="h-5 w-5 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-2">
            {stats.pot.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl shadow-lg p-6 text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/90">Total Turnover</p>
            <Activity className="h-5 w-5 opacity-90" />
          </div>
          <p className="text-4xl font-bold mt-2">
            ${stats.totalStake.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Celebrations & Milestones */}
      <div className="flex flex-wrap gap-3">
        {stats.totalBets >= 100 && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-semibold">100 bets tracked! 🎉</span>
          </div>
        )}
        {streakStats.currentStreak > 0 && (
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full shadow ${
            streakStats.currentStreakType === 'win' 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
              : 'bg-gradient-to-r from-red-400 to-rose-500 text-white'
          }`}>
            <Flame className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {streakStats.currentStreak} {streakStats.currentStreakType === 'win' ? 'Win' : 'Loss'} Streak {streakStats.currentStreakType === 'win' ? '🔥' : '⚠️'}
            </span>
          </div>
        )}
      </div>

      {/* Additional Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500">Total Bets</p>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalBets}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500">Average Odds</p>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
            {stats.averageOdds.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Today&apos;s Profit/Loss</p>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <p
            className={`text-3xl font-bold mt-2 ${
              stats.profitToday > 0
                ? 'text-green-600'
                : stats.profitToday < 0
                ? 'text-red-600'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {profitTodayDisplay}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500">Best Win</p>
          <p className="text-3xl font-bold mt-2 text-green-600">
            ${stats.bestWin.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      {filteredBets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-900">No data available. Add some bets to see statistics!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profit/Loss Over Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Profit/Loss Over Time</h2>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <Tooltip
                  {...sharedTooltipProps}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                />
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Monthly Comparison (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyProfitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  {...sharedTooltipProps}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="profit" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Strike Rate by Bet Type</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={strikeRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip
                    {...sharedTooltipProps}
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Bar dataKey="strikeRate" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Bet Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="40%"
                    cy="50%"
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">ROI Trend (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyROIData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  {...sharedTooltipProps}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="ROI %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Advanced Insights Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Advanced Insights
            </h2>

            {/* Streak Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className={`h-5 w-5 ${streakStats.currentStreakType === 'win' ? 'text-green-500' : streakStats.currentStreakType === 'loss' ? 'text-red-500' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium text-gray-500">Current Streak</p>
                </div>
                <p className={`text-3xl font-bold ${streakStats.currentStreakType === 'win' ? 'text-green-600' : streakStats.currentStreakType === 'loss' ? 'text-red-600' : 'text-gray-600'}`}>
                  {streakStats.currentStreak} {streakStats.currentStreakType === 'win' ? 'Wins' : streakStats.currentStreakType === 'loss' ? 'Losses' : ''}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <p className="text-sm font-medium text-gray-500">Longest Win Streak</p>
                </div>
                <p className="text-3xl font-bold text-green-600">{streakStats.longestWinStreak}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <p className="text-sm font-medium text-gray-500">Longest Loss Streak</p>
                </div>
                <p className="text-3xl font-bold text-red-600">{streakStats.longestLossStreak}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <p className="text-sm font-medium text-gray-500">Best Streak Ratio</p>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Weekly Performance Trend (Last 12 Weeks)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip
                    {...sharedTooltipProps}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Bar dataKey="profit" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Performance by Odds Range</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={oddsRangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip
                      {...sharedTooltipProps}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Bar dataKey="profit" fill="#2563eb" radius={[8, 8, 0, 0]}>
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

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Performance by Day of Week</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      {...sharedTooltipProps}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Bar dataKey="profit" fill="#7c3aed" radius={[8, 8, 0, 0]}>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Performance by Bet Size
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={betSizeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip
                    {...sharedTooltipProps}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Bar dataKey="profit" fill="#f59e0b" radius={[8, 8, 0, 0]}>
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Top Performing Horses</h2>
                {topHorses.length > 0 ? (
                  <div className="space-y-3">
                    {topHorses.map((horse, index) => (
                      <div
                        key={horse.horseName}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-700' :
                            index === 2 ? 'bg-amber-600 text-white' :
                            'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{horse.horseName}</p>
                            <p className="text-xs text-gray-500">{horse.bets} bets • {horse.wins} wins ({horse.strikeRate.toFixed(1)}%)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${horse.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${horse.profit.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Avg: {horse.averageOdds.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No horse data available</p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Top Performing Races</h2>
                {topRaces.length > 0 ? (
                  <div className="space-y-3">
                    {topRaces.map((race, index) => (
                      <div
                        key={race.raceName}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-700' :
                            index === 2 ? 'bg-amber-600 text-white' :
                            'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{race.raceName}</p>
                            <p className="text-xs text-gray-500">{race.bets} bets • {race.wins} wins ({race.strikeRate.toFixed(1)}%)</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className={`font-bold ${race.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${race.profit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No race data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
