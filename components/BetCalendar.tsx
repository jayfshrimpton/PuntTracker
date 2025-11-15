'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, dayIdx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const stats = getDayStats(day);
          const intensity = getDayIntensity(day);
          
          // Calculate color based on profit
          const hasProfit = stats.totalProfit > 0;
          const hasLoss = stats.totalProfit < 0;
          const hasBets = stats.count > 0;

          // Determine background color
          let bgColor = '';
          if (!isCurrentMonth) {
            bgColor = 'bg-gray-50 dark:bg-gray-900';
          } else if (hasBets) {
            if (hasProfit) {
              // Green shades based on intensity
              if (intensity > 0.7) bgColor = 'bg-green-500 dark:bg-green-700';
              else if (intensity > 0.4) bgColor = 'bg-green-300 dark:bg-green-800';
              else bgColor = 'bg-green-200 dark:bg-green-900';
            } else if (hasLoss) {
              // Red shades based on intensity
              if (intensity > 0.7) bgColor = 'bg-red-500 dark:bg-red-700';
              else if (intensity > 0.4) bgColor = 'bg-red-300 dark:bg-red-800';
              else bgColor = 'bg-red-200 dark:bg-red-900';
            } else {
              bgColor = 'bg-gray-200 dark:bg-gray-700';
            }
          } else {
            bgColor = 'bg-gray-50 dark:bg-gray-900';
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
                relative aspect-square p-1 sm:p-2 rounded-lg transition-all
                ${!isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                ${isSelected 
                  ? 'ring-2 ring-blue-500 ring-offset-1 sm:ring-offset-2 dark:ring-offset-gray-800' 
                  : ''}
                ${isToday && isCurrentMonth 
                  ? 'ring-1 ring-blue-300 dark:ring-blue-600' 
                  : ''}
                ${bgColor}
                hover:brightness-110
                text-gray-900 dark:text-white
                min-h-[44px] sm:min-h-[60px]
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {format(day, 'd')}
                </span>
                {hasBets && isCurrentMonth && (
                  <div className="mt-0.5 sm:mt-1 flex flex-col items-center gap-0.5">
                    <span className="text-[10px] sm:text-xs font-bold">
                      {stats.count}
                    </span>
                    {stats.totalProfit !== 0 && (
                      <span className={`text-[8px] sm:text-[10px] font-semibold ${
                        stats.totalProfit > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                      }`}>
                        {stats.totalProfit > 0 ? '+' : ''}${Math.abs(stats.totalProfit).toFixed(0)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-800"></div>
            <span>Profitable Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-200 dark:bg-red-800"></div>
            <span>Loss Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-500"></div>
            <span>Selected Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-blue-300 dark:border-blue-600"></div>
            <span>Today</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          <p>Click any day to add bets for that date. Color intensity indicates number of bets.</p>
        </div>
      </div>
    </div>
  );
}

