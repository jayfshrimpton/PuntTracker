'use client';

import type { ReactNode } from 'react';
import {
  type DashboardPeriodState,
  formatDashboardPeriodLabel,
} from '@/lib/dashboard-period';
import { format } from 'date-fns';

interface DashboardHeaderProps {
  userEmail: string;
  period: DashboardPeriodState;
  setPeriod: (period: DashboardPeriodState) => void;
  /** e.g. Share stats button */
  actions?: ReactNode;
}

export function DashboardHeader({ userEmail, period, setPeriod, actions }: DashboardHeaderProps) {
  const username = userEmail ? userEmail.split('@')[0] : '';
  const periodPhrase = formatDashboardPeriodLabel(period);

  const handlePresetChange = (value: string) => {
    if (value === 'pick-month') {
      const ym =
        period.type === 'pick-month' && period.yearMonth
          ? period.yearMonth
          : format(new Date(), 'yyyy-MM');
      setPeriod({ type: 'pick-month', yearMonth: ym });
      return;
    }
    setPeriod({ type: value as DashboardPeriodState['type'] });
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Welcome back, {username}! 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s what&apos;s happening with your betting portfolio
          {period.type === 'all' ? (
            <> over {periodPhrase}.</>
          ) : (
            <> for {periodPhrase}.</>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label className="sr-only" htmlFor="dashboard-period">
          Time period
        </label>
        <select
          id="dashboard-period"
          value={period.type}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="h-10 min-w-[11rem] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All time</option>
          <option value="this-week">This week</option>
          <option value="this-month">This month</option>
          <option value="last-month">Last month</option>
          <option value="last-3-months">Last 3 months</option>
          <option value="last-6-months">Last 6 months</option>
          <option value="this-year">This year</option>
          <option value="pick-month">Specific month…</option>
        </select>

        {period.type === 'pick-month' && (
          <div className="flex items-center gap-2">
            <label htmlFor="dashboard-month" className="text-sm text-muted-foreground whitespace-nowrap">
              Month
            </label>
            <input
              id="dashboard-month"
              type="month"
              value={period.yearMonth ?? format(new Date(), 'yyyy-MM')}
              onChange={(e) =>
                setPeriod({ type: 'pick-month', yearMonth: e.target.value })
              }
              className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}
