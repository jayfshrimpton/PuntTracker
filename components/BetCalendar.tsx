'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Bet } from '@/lib/api';

interface BetCalendarProps {
  bets: Bet[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function BetCalendar({ bets, selectedDate, onDateSelect }: BetCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calculate daily stats
  const dailyStats = useMemo(() => {
    const stats: Record<string, { count: number; totalStake: number; totalProfit: number }> = {};

    bets.forEach((bet) => {
      const dateKey = format(new Date(bet.bet_date), 'yyyy-MM-dd');
      if (!stats[dateKey]) {
        stats[dateKey] = { count: 0, totalStake: 0, totalProfit: 0 };
      }
      stats[dateKey].count += 1;
      stats[dateKey].totalStake += Number(bet.stake);
      stats[dateKey].totalProfit += bet.profit_loss ? Number(bet.profit_loss) : 0;
    });

    return stats;
  }, [bets]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Start from Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 }); // End of week containing month end

  // Get all days in the calendar view
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayStats = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return dailyStats[dateKey] || { count: 0, totalStake: 0, totalProfit: 0 };
  };

  const getDayIntensity = (date: Date) => {
    const stats = getDayStats(date);
    if (stats.count === 0) return 0;
    // Normalize based on max bets in month
    const maxBets = Math.max(...Object.values(dailyStats).map(s => s.count), 1);
    return Math.min(stats.count / maxBets, 1);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white pl-2">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 mb-4">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, dayIdx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const stats = getDayStats(day);
            const intensity = getDayIntensity(day);

            const hasProfit = stats.totalProfit > 0;
            const hasLoss = stats.totalProfit < 0;
            const hasBets = stats.count > 0;

            // Determine background color with softer palette
            let bgColor = '';
            let textColor = 'text-gray-700 dark:text-gray-300';

            if (!isCurrentMonth) {
              bgColor = 'bg-transparent';
              textColor = 'text-gray-300 dark:text-gray-700';
            } else if (hasBets) {
              if (hasProfit) {
                // Softer green gradients
                if (intensity > 0.7) bgColor = 'bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800';
                else if (intensity > 0.4) bgColor = 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900';
                else bgColor = 'bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-50 dark:border-emerald-900/50';
                textColor = 'text-emerald-700 dark:text-emerald-400';
              } else if (hasLoss) {
                // Softer red gradients
                if (intensity > 0.7) bgColor = 'bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800';
                else if (intensity > 0.4) bgColor = 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900';
                else bgColor = 'bg-rose-50/50 dark:bg-rose-900/10 border border-rose-50 dark:border-rose-900/50';
                textColor = 'text-rose-700 dark:text-rose-400';
              } else {
                bgColor = 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
              }
            } else {
              bgColor = 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700 shadow-sm';
            }

            return (
              <button
                key={dayIdx}
                onClick={() => {
                  if (isCurrentMonth) {
                    onDateSelect(day);
                  }
                }}
                disabled={!isCurrentMonth}
                className={`
                  relative aspect-square rounded-xl p-1 transition-all duration-200
                  flex flex-col items-center justify-between
                  ${!isCurrentMonth ? 'cursor-default' : 'cursor-pointer hover:shadow-sm hover:-translate-y-0.5'}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 z-10' : ''}
                  ${isToday && !isSelected ? 'ring-1 ring-blue-300 dark:ring-blue-700' : ''}
                  ${bgColor}
                `}
              >
                <div className="w-full flex justify-end px-1">
                  <span className={`text-xs font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : textColor}`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {hasBets && isCurrentMonth && (
                  <div className="flex-1 flex flex-col items-center justify-center w-full pb-1">
                    <span className={`text-[10px] font-bold ${hasProfit ? 'text-emerald-600 dark:text-emerald-400' : hasLoss ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500'}`}>
                      {hasProfit ? '+' : ''}{Math.abs(stats.totalProfit) >= 1000 ? (Math.abs(stats.totalProfit) / 1000).toFixed(1) + 'k' : Math.abs(stats.totalProfit).toFixed(0)}
                    </span>
                    <div className="flex gap-0.5 mt-0.5">
                      {/* Dot indicators for volume */}
                      {Array.from({ length: Math.min(stats.count, 3) }).map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${hasProfit ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      ))}
                      {stats.count > 3 && <div className={`w-1 h-1 rounded-full ${hasProfit ? 'bg-emerald-300' : 'bg-rose-300'} opacity-50`} />}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800"></div>
            <span>Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-100 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800"></div>
            <span>Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-blue-500"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <span>Bets Placed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

