'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Metrics {
  signupsPerDay: Record<string, number>;
  mrrOverTime: Record<string, number>;
  conversionFunnel: {
    free: number;
    pro: number;
    elite: number;
    conversionRate: number;
  };
  churnPerMonth: Record<string, number>;
  avgBetsPerUser: number;
  topUsers: Array<{
    email: string;
    name: string;
    betsCount: number;
  }>;
}

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/admin/metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading metrics...</div>
      </div>
    );
  }

  // Format data for charts
  const signupsData = Object.entries(metrics.signupsPerDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const mrrData = Object.entries(metrics.mrrOverTime)
    .map(([month, mrr]) => ({ month, mrr: Math.round(mrr * 100) / 100 }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const churnData = Object.entries(metrics.churnPerMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const funnelData = [
    { name: 'Free', value: metrics.conversionFunnel.free, fill: '#9ca3af' },
    { name: 'Pro', value: metrics.conversionFunnel.pro, fill: '#3b82f6' },
    { name: 'Elite', value: metrics.conversionFunnel.elite, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Metrics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Platform analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>User tier distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {metrics.conversionFunnel.conversionRate}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Bets Per User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {metrics.avgBetsPerUser}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Average number of bets per user
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Signups Per Day (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={signupsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Signups" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Recurring Revenue (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mrrData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="mrr" fill="#8b5cf6" name="MRR ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Churn Rate (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={churnData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#ef4444" name="Canceled Subscriptions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Active Users</CardTitle>
          <CardDescription>Top 10 users by bet count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Rank</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Bets</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topUsers.map((user, index) => (
                  <tr
                    key={user.email}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{user.email}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{user.name}</td>
                    <td className="p-4 text-sm font-semibold text-gray-900 dark:text-white">{user.betsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

