'use client';

import { DateRange } from '@/lib/api';
import { format } from 'date-fns';

interface DashboardHeaderProps {
    userEmail: string;
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
}

export function DashboardHeader({ userEmail, dateRange, setDateRange }: DashboardHeaderProps) {
    const currentMonth = format(new Date(), 'MMMM yyyy');
    const username = userEmail ? userEmail.split('@')[0] : '';

    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Welcome back, {username}! 👋
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Here&apos;s what&apos;s happening with your betting portfolio this {currentMonth}.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as DateRange)}
                    className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <option value="all">All Time</option>
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                </select>
            </div>
        </div>
    );
}
