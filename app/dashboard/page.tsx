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
import { format } from 'date-fns';

export default function DashboardPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [filteredBets, setFilteredBets] = useState<Bet[]>([]);

  useEffect(() => {
    loadBets();
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

  const pieData = [
    { name: 'Win', value: filteredBets.filter((b) => b.bet_type === 'win').length },
    { name: 'Place', value: filteredBets.filter((b) => b.bet_type === 'place').length },
    { name: 'Lay', value: filteredBets.filter((b) => b.bet_type === 'lay').length },
  ];

  const COLORS = ['#2563eb', '#10B981', '#3b82f6'];

  const strikeRateData = [
    {
      type: 'Win',
      strikeRate: betTypeStats.win.totalBets > 0 ? betTypeStats.win.strikeRate : 0,
    },
    {
      type: 'Place',
      strikeRate: betTypeStats.place.totalBets > 0 ? betTypeStats.place.strikeRate : 0,
    },
    {
      type: 'Lay',
      strikeRate: betTypeStats.lay.totalBets > 0 ? betTypeStats.lay.strikeRate : 0,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-900">Loading dashboard...</div>
      </div>
    );
  }

  const currentMonth = format(new Date(), 'MMMM yyyy');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-900">{currentMonth}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          >
            <option value="all">All Time</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-900">Total Profit/Loss</p>
          <p
            className={`text-2xl font-bold mt-2 ${
              stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            ${stats.totalProfit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">Strike Rate</p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {stats.strikeRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">POT (Profit on Turnover)</p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {stats.pot.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">Total Turnover</p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            ${stats.totalStake.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Additional Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">Total Bets</p>
          <p className="text-2xl font-bold mt-2 text-gray-900">{stats.totalBets}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">Average Odds</p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {stats.averageOdds.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">Current Streak</p>
          <p
            className={`text-2xl font-bold mt-2 ${
              stats.currentStreak >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {stats.currentStreak > 0
              ? `${stats.currentStreak}W`
              : stats.currentStreak < 0
              ? `${Math.abs(stats.currentStreak)}L`
              : '-'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">Best Win</p>
          <p className="text-2xl font-bold mt-2 text-green-600">
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Profit/Loss Over Time</h2>
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <Tooltip
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Monthly Comparison (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyProfitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Bar dataKey="profit" fill="#2563eb" radius={[8, 8, 0, 0]}>
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Strike Rate by Bet Type</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={strikeRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="strikeRate" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Bet Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ROI Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">ROI Trend (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyROIData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
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
        </div>
      )}
    </div>
  );
}
