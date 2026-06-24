import { Bet, Profile, BankTransaction } from './api';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  getDay,
  isWithinInterval,
} from 'date-fns';

export interface MonthlyStats {
  totalStake: number;
  totalProfit: number;
  profitToday: number;
  totalBets: number;
  winningBets: number;
  losingBets: number;
  strikeRate: number;
  pot: number;
  roi: number;
  averageOdds: number;
  averageStake: number;
  bestWin: number;
  worstLoss: number;
}

export const ALL_BET_TYPES = [
  'win',
  'place',
  'lay',
  'each-way',
  'multi',
  'quinella',
  'exacta',
  'trifecta',
  'first-four',
  'other',
] as const;
export type BetType = typeof ALL_BET_TYPES[number];

export type BetTypeStats = Record<BetType, MonthlyStats>;

export interface ProfitLossDataPoint {
  date: string;
  cumulative: number;
  profit: number;
}

export function calculateMonthlyStats(bets: Bet[]): MonthlyStats {
  if (bets.length === 0) {
    return {
      totalStake: 0,
      totalProfit: 0,
      profitToday: 0,
      totalBets: 0,
      winningBets: 0,
      losingBets: 0,
      strikeRate: 0,
      pot: 0,
      roi: 0,
      averageOdds: 0,
      averageStake: 0,
      bestWin: 0,
      worstLoss: 0,
    };
  }

  const totalStake = bets.reduce((sum, bet) => sum + Number(bet.stake), 0);
  const totalProfit = bets.reduce(
    (sum, bet) => sum + (bet.profit_loss ? Number(bet.profit_loss) : 0),
    0
  );
  const today = new Date();
  const profitToday = bets.reduce((sum, bet) => {
    if (!bet.bet_date) return sum;
    const betDate = new Date(bet.bet_date);
    const isSameDay =
      betDate.getFullYear() === today.getFullYear() &&
      betDate.getMonth() === today.getMonth() &&
      betDate.getDate() === today.getDate();

    if (!isSameDay) {
      return sum;
    }

    return sum + (bet.profit_loss ? Number(bet.profit_loss) : 0);
  }, 0);
  const totalBets = bets.length;
  const winningBets = bets.filter(
    (bet) => bet.profit_loss !== null && Number(bet.profit_loss) > 0
  ).length;
  const losingBets = bets.filter(
    (bet) => bet.profit_loss !== null && Number(bet.profit_loss) < 0
  ).length;

  const strikeRate = totalBets > 0 ? (winningBets / totalBets) * 100 : 0;
  const pot = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;
  const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

  const averageOdds =
    bets.length > 0
      ? bets.reduce((sum, bet) => sum + Number(bet.price), 0) / bets.length
      : 0;
  const averageStake =
    bets.length > 0
      ? bets.reduce((sum, bet) => sum + Number(bet.stake), 0) / bets.length
      : 0;

  const profits = bets
    .map((bet) => (bet.profit_loss ? Number(bet.profit_loss) : 0))
    .filter((p) => p !== 0);
  const bestWin = profits.length > 0 ? Math.max(...profits, 0) : 0;
  const worstLoss = profits.length > 0 ? Math.min(...profits, 0) : 0;

  return {
    totalStake,
    totalProfit,
    profitToday,
    totalBets,
    winningBets,
    losingBets,
    strikeRate,
    pot,
    roi,
    averageOdds,
    averageStake,
    bestWin,
    worstLoss,
  };
}

export function groupBetsByMonth(bets: Bet[]): Record<string, Bet[]> {
  const grouped: Record<string, Bet[]> = {};

  bets.forEach((bet) => {
    const date = new Date(bet.bet_date);
    const monthKey = format(date, 'yyyy-MM');

    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }

    grouped[monthKey].push(bet);
  });

  return grouped;
}

export function calculateStatsByBetType(bets: Bet[]): BetTypeStats {
  const map = {} as BetTypeStats;
  ALL_BET_TYPES.forEach((t) => {
    const subset = bets.filter((bet) => bet.bet_type === (t as any));
    (map as any)[t] = calculateMonthlyStats(subset);
  });
  return map;
}

export function getProfitLossTimeSeries(bets: Bet[]): ProfitLossDataPoint[] {
  if (bets.length === 0) {
    return [];
  }

  const sortedBets = [...bets].sort(
    (a, b) =>
      new Date(a.bet_date).getTime() - new Date(b.bet_date).getTime()
  );

  let cumulative = 0;
  const data: ProfitLossDataPoint[] = [];

  sortedBets.forEach((bet) => {
    const profit = bet.profit_loss ? Number(bet.profit_loss) : 0;
    cumulative += profit;

    data.push({
      date: bet.bet_date,
      cumulative,
      profit,
    });
  });

  return data;
}

export function getMonthlyProfitData(bets: Bet[], months: number = 6): Array<{
  month: string;
  profit: number;
}> {
  const grouped = groupBetsByMonth(bets);
  const now = new Date();
  const result: Array<{ month: string; profit: number }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthKey = format(date, 'yyyy-MM');
    const monthBets = grouped[monthKey] || [];
    const stats = calculateMonthlyStats(monthBets);

    result.push({
      month: format(date, 'MMM yyyy'),
      profit: stats.totalProfit,
    });
  }

  return result;
}

export function getMonthlyROIData(bets: Bet[], months: number = 6): Array<{
  month: string;
  roi: number;
}> {
  const grouped = groupBetsByMonth(bets);
  const now = new Date();
  const result: Array<{ month: string; roi: number }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const monthKey = format(date, 'yyyy-MM');
    const monthBets = grouped[monthKey] || [];
    const stats = calculateMonthlyStats(monthBets);

    result.push({
      month: format(date, 'MMM yyyy'),
      roi: stats.roi,
    });
  }

  return result;
}

// Streak Analysis
export interface StreakStats {
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'neutral';
  longestWinStreak: number;
  longestLossStreak: number;
}

export function calculateStreaks(bets: Bet[]): StreakStats {
  if (bets.length === 0) {
    return {
      currentStreak: 0,
      currentStreakType: 'neutral',
      longestWinStreak: 0,
      longestLossStreak: 0,
    };
  }

  const sortedBets = [...bets].sort(
    (a, b) =>
      new Date(a.bet_date).getTime() - new Date(b.bet_date).getTime()
  );

  let currentStreak = 0;
  let currentStreakType: 'win' | 'loss' | 'neutral' = 'neutral';
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  // Calculate longest streaks (forward through all bets)
  for (let i = 0; i < sortedBets.length; i++) {
    const bet = sortedBets[i];
    const profit = bet.profit_loss ? Number(bet.profit_loss) : 0;

    if (profit > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else if (profit < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    } else {
      currentWinStreak = 0;
      currentLossStreak = 0;
    }
  }

  // Calculate current streak (backward from most recent)
  currentWinStreak = 0;
  currentLossStreak = 0;
  for (let i = sortedBets.length - 1; i >= 0; i--) {
    const bet = sortedBets[i];
    const profit = bet.profit_loss ? Number(bet.profit_loss) : 0;

    if (profit > 0) {
      if (currentLossStreak > 0) break; // Streak broken
      currentWinStreak++;
      currentStreakType = 'win';
      currentStreak = currentWinStreak;
    } else if (profit < 0) {
      if (currentWinStreak > 0) break; // Streak broken
      currentLossStreak++;
      currentStreakType = 'loss';
      currentStreak = currentLossStreak;
    } else {
      break; // Neutral bet breaks streak
    }
  }

  return {
    currentStreak,
    currentStreakType,
    longestWinStreak,
    longestLossStreak,
  };
}

// Odds Range Performance
export interface OddsRangeStats {
  range: string;
  bets: number;
  profit: number;
  strikeRate: number;
  roi: number;
}

export function getOddsRangePerformance(bets: Bet[]): OddsRangeStats[] {
  const ranges = [
    { label: 'Favorites (1.0-3.0)', min: 1.0, max: 3.0 },
    { label: 'Short (3.0-5.0)', min: 3.0, max: 5.0 },
    { label: 'Medium (5.0-10.0)', min: 5.0, max: 10.0 },
    { label: 'Long (10.0-20.0)', min: 10.0, max: 20.0 },
    { label: 'Very Long (20.0+)', min: 20.0, max: Infinity },
  ];

  return ranges.map((range) => {
    const rangeBets = bets.filter(
      (bet) => Number(bet.price) >= range.min && Number(bet.price) < range.max
    );

    if (rangeBets.length === 0) {
      return {
        range: range.label,
        bets: 0,
        profit: 0,
        strikeRate: 0,
        roi: 0,
      };
    }

    const stats = calculateMonthlyStats(rangeBets);
    return {
      range: range.label,
      bets: stats.totalBets,
      profit: stats.totalProfit,
      strikeRate: stats.strikeRate,
      roi: stats.roi,
    };
  });
}

// Day of Week Performance
export interface DayOfWeekStats {
  day: string;
  bets: number;
  profit: number;
  strikeRate: number;
  roi: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getDayOfWeekPerformance(bets: Bet[]): DayOfWeekStats[] {
  const dayStats: Record<number, Bet[]> = {};

  bets.forEach((bet) => {
    const date = new Date(bet.bet_date);
    const dayOfWeek = getDay(date);
    if (!dayStats[dayOfWeek]) {
      dayStats[dayOfWeek] = [];
    }
    dayStats[dayOfWeek].push(bet);
  });

  return DAY_NAMES.map((dayName, index) => {
    const dayBets = dayStats[index] || [];
    if (dayBets.length === 0) {
      return {
        day: dayName,
        bets: 0,
        profit: 0,
        strikeRate: 0,
        roi: 0,
      };
    }

    const stats = calculateMonthlyStats(dayBets);
    return {
      day: dayName,
      bets: stats.totalBets,
      profit: stats.totalProfit,
      strikeRate: stats.strikeRate,
      roi: stats.roi,
    };
  });
}

// Bet Size Analysis
export interface BetSizeStats {
  range: string;
  bets: number;
  profit: number;
  strikeRate: number;
  roi: number;
}

export function getBetSizePerformance(bets: Bet[]): BetSizeStats[] {
  const ranges = [
    { label: 'Small ($1-$10)', min: 1, max: 10 },
    { label: 'Medium ($10-$50)', min: 10, max: 50 },
    { label: 'Large ($50-$100)', min: 50, max: 100 },
    { label: 'Very Large ($100+)', min: 100, max: Infinity },
  ];

  return ranges.map((range) => {
    const rangeBets = bets.filter(
      (bet) => Number(bet.stake) >= range.min && Number(bet.stake) < range.max
    );

    if (rangeBets.length === 0) {
      return {
        range: range.label,
        bets: 0,
        profit: 0,
        strikeRate: 0,
        roi: 0,
      };
    }

    const stats = calculateMonthlyStats(rangeBets);
    return {
      range: range.label,
      bets: stats.totalBets,
      profit: stats.totalProfit,
      strikeRate: stats.strikeRate,
      roi: stats.roi,
    };
  });
}

// Horse Performance (Top performing horses)
export interface HorsePerformance {
  horseName: string;
  bets: number;
  wins: number;
  profit: number;
  strikeRate: number;
  averageOdds: number;
}

export function getTopHorsePerformance(bets: Bet[], limit: number = 10): HorsePerformance[] {
  const horseMap: Record<string, Bet[]> = {};

  bets.forEach((bet) => {
    if (!horseMap[bet.horse_name]) {
      horseMap[bet.horse_name] = [];
    }
    horseMap[bet.horse_name].push(bet);
  });

  const horseStats: HorsePerformance[] = Object.entries(horseMap)
    .map(([horseName, horseBets]) => {
      const wins = horseBets.filter(
        (bet) => bet.profit_loss !== null && Number(bet.profit_loss) > 0
      ).length;
      const profit = horseBets.reduce(
        (sum, bet) => sum + (bet.profit_loss ? Number(bet.profit_loss) : 0),
        0
      );
      const averageOdds =
        horseBets.length > 0
          ? horseBets.reduce((sum, bet) => sum + Number(bet.price), 0) / horseBets.length
          : 0;

      return {
        horseName,
        bets: horseBets.length,
        wins,
        profit,
        strikeRate: horseBets.length > 0 ? (wins / horseBets.length) * 100 : 0,
        averageOdds,
      };
    })
    .sort((a, b) => b.profit - a.profit)
    .slice(0, limit);

  return horseStats;
}

// Race Performance (Top performing races)
export interface RacePerformance {
  raceName: string;
  bets: number;
  wins: number;
  profit: number;
  strikeRate: number;
}

export function getTopRacePerformance(bets: Bet[], limit: number = 10): RacePerformance[] {
  const raceMap: Record<string, Bet[]> = {};

  bets.forEach((bet) => {
    if (!bet.race_name) return; // Skip bets without a race name
    if (!raceMap[bet.race_name]) {
      raceMap[bet.race_name] = [];
    }
    raceMap[bet.race_name].push(bet);
  });

  const raceStats: RacePerformance[] = Object.entries(raceMap)
    .map(([raceName, raceBets]) => {
      const wins = raceBets.filter(
        (bet) => bet.profit_loss !== null && Number(bet.profit_loss) > 0
      ).length;
      const profit = raceBets.reduce(
        (sum, bet) => sum + (bet.profit_loss ? Number(bet.profit_loss) : 0),
        0
      );

      return {
        raceName,
        bets: raceBets.length,
        wins,
        profit,
        strikeRate: raceBets.length > 0 ? (wins / raceBets.length) * 100 : 0,
      };
    })
    .sort((a, b) => b.profit - a.profit)
    .slice(0, limit);

  return raceStats;
}

// Venue/Track Performance (Top performing venues)
export interface VenuePerformance {
  venue: string;
  bets: number;
  wins: number;
  profit: number;
  strikeRate: number;
  roi: number;
}

export function getVenuePerformance(bets: Bet[], limit: number = 10): VenuePerformance[] {
  const venueMap: Record<string, Bet[]> = {};

  bets.forEach((bet) => {
    const venue = (bet.venue || '').trim();
    // Skip bets without a venue or with an explicit "Unknown" placeholder
    if (!venue || venue.toLowerCase() === 'unknown') return;
    if (!venueMap[venue]) {
      venueMap[venue] = [];
    }
    venueMap[venue].push(bet);
  });

  const venueStats: VenuePerformance[] = Object.entries(venueMap)
    .map(([venue, venueBets]) => {
      const wins = venueBets.filter(
        (bet) => bet.profit_loss !== null && Number(bet.profit_loss) > 0
      ).length;
      const profit = venueBets.reduce(
        (sum, bet) => sum + (bet.profit_loss ? Number(bet.profit_loss) : 0),
        0
      );
      const totalStake = venueBets.reduce(
        (sum, bet) => sum + (Number(bet.stake) || 0),
        0
      );

      return {
        venue,
        bets: venueBets.length,
        wins,
        profit,
        strikeRate: venueBets.length > 0 ? (wins / venueBets.length) * 100 : 0,
        roi: totalStake > 0 ? (profit / totalStake) * 100 : 0,
      };
    })
    .sort((a, b) => b.profit - a.profit)
    .slice(0, limit);

  return venueStats;
}

// Weekly Performance Trend
export interface WeeklyPerformance {
  week: string;
  profit: number;
  bets: number;
  strikeRate: number;
}

export function getWeeklyPerformance(bets: Bet[], weeks: number = 12): WeeklyPerformance[] {
  if (bets.length === 0) return [];

  const sortedBets = [...bets].sort(
    (a, b) => new Date(a.bet_date).getTime() - new Date(b.bet_date).getTime()
  );

  const weeklyData: Record<string, Bet[]> = {};
  const now = new Date();

  sortedBets.forEach((bet) => {
    const betDate = new Date(bet.bet_date);
    const weekStart = new Date(betDate);
    weekStart.setDate(betDate.getDate() - betDate.getDay()); // Start of week (Sunday)
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = [];
    }
    weeklyData[weekKey].push(bet);
  });

  const result: WeeklyPerformance[] = [];
  const weekKeys = Object.keys(weeklyData).sort().slice(-weeks);

  weekKeys.forEach((weekKey) => {
    const weekBets = weeklyData[weekKey];
    const stats = calculateMonthlyStats(weekBets);
    result.push({
      week: format(new Date(weekKey), 'MMM dd'),
      profit: stats.totalProfit,
      bets: stats.totalBets,
      strikeRate: stats.strikeRate,
    });
  });

  return result;
}

// Insights Analysis
export interface Insight {
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  metric: string;
  value: number;
  priority: number; // Higher number = higher priority
}

export function getPerformanceInsights(bets: Bet[]): Insight[] {
  if (bets.length < 5) return []; // Need some data to generate insights

  const insights: Insight[] = [];

  // 1. Analyze Odds Ranges
  const oddsStats = getOddsRangePerformance(bets);
  oddsStats.forEach(stat => {
    if (stat.bets >= 3 && stat.profit < 0) {
      insights.push({
        type: 'info',
        title: `Optimization: ${stat.range} Odds`,
        description: `This range presents an opportunity to refine your strategy. Review your selection process for these odds.`,
        metric: 'Loss',
        value: stat.profit,
        priority: Math.abs(stat.profit)
      });
    }
  });

  // 2. Analyze Days of Week
  const dayStats = getDayOfWeekPerformance(bets);
  dayStats.forEach(stat => {
    if (stat.bets >= 3 && stat.profit < 0) {
      insights.push({
        type: 'info',
        title: `${stat.day} Strategy Review`,
        description: `Performance on ${stat.day}s could be improved. Consider adjusting your approach on this day.`,
        metric: 'Loss',
        value: stat.profit,
        priority: Math.abs(stat.profit) * 0.8 // Slightly lower priority than odds
      });
    }
  });

  // 3. Analyze Bet Types
  const betTypeStats = calculateStatsByBetType(bets);
  Object.entries(betTypeStats).forEach(([type, stats]) => {
    if (stats.totalBets >= 3 && stats.totalProfit < 0) {
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
      insights.push({
        type: 'info',
        title: `Refine ${formattedType} Bets`,
        description: `Your ${formattedType} bets have room for optimization. Analyzing past results might reveal patterns.`,
        metric: 'Loss',
        value: stats.totalProfit,
        priority: Math.abs(stats.totalProfit) * 0.9
      });
    }
  });

  // 4. Analyze Bet Sizes
  const betSizeStats = getBetSizePerformance(bets);
  betSizeStats.forEach(stat => {
    if (stat.bets >= 3 && stat.profit < 0) {
      insights.push({
        type: 'info',
        title: `Bet Size Adjustment: ${stat.range}`,
        description: `Consider reviewing your stake sizing for bets in this range to maximize long-term growth.`,
        metric: 'Loss',
        value: stat.profit,
        priority: Math.abs(stat.profit)
      });
    }
  });

  // Sort by priority (highest impact first)
  return insights.sort((a, b) => b.priority - a.priority).slice(0, 3); // Return top 3 insights
}

// Goals & Bankroll
export interface GoalProgress {
  id: string;
  label: string;
  current: number;
  target: number;
  pct: number; // 0-100, capped for display
  met: boolean;
  unit: 'currency' | 'percent';
}

function betsWithinInterval(bets: Bet[], start: Date, end: Date): Bet[] {
  return bets.filter((bet) => {
    if (!bet.bet_date) return false;
    const date = new Date(bet.bet_date);
    if (isNaN(date.getTime())) return false;
    return isWithinInterval(date, { start, end });
  });
}

/**
 * Compute progress toward each enabled, non-null goal/target. Goals are measured
 * against fixed calendar periods (current month / year), NOT the dashboard period.
 */
export function getGoalProgress(
  bets: Bet[],
  profile: Profile | null | undefined
): GoalProgress[] {
  if (!profile || !profile.goals_enabled) return [];

  const now = new Date();
  const monthBets = betsWithinInterval(bets, startOfMonth(now), endOfMonth(now));
  const yearBets = betsWithinInterval(bets, startOfYear(now), endOfYear(now));

  const monthStats = calculateMonthlyStats(monthBets);
  const yearStats = calculateMonthlyStats(yearBets);

  const progress: GoalProgress[] = [];

  const pushTarget = (
    id: string,
    label: string,
    current: number,
    target: number | null,
    unit: 'currency' | 'percent'
  ) => {
    if (target === null || target === undefined) return;
    const numericTarget = Number(target);
    if (!numericTarget || isNaN(numericTarget)) return;
    const rawPct = (current / numericTarget) * 100;
    const pct = Math.max(0, Math.min(100, rawPct));
    progress.push({
      id,
      label,
      current,
      target: numericTarget,
      pct,
      met: current >= numericTarget,
      unit,
    });
  };

  pushTarget(
    'monthly_profit',
    'Monthly Profit',
    monthStats.totalProfit,
    profile.monthly_profit_target,
    'currency'
  );
  pushTarget(
    'monthly_roi',
    'Monthly ROI',
    monthStats.roi,
    profile.monthly_roi_target,
    'percent'
  );
  pushTarget(
    'strike_rate',
    'Strike Rate',
    monthStats.strikeRate,
    profile.strike_rate_target,
    'percent'
  );
  pushTarget(
    'annual_profit',
    'Annual Profit',
    yearStats.totalProfit,
    profile.annual_profit_target,
    'currency'
  );

  return progress;
}

export interface BankrollSummary {
  enabled: boolean;
  starting: number;
  current: number;
  allTimeProfit: number;
  trueRoi: number; // profit relative to starting bank
  growthPct: number; // (current - starting) / starting
  suggestedUnit: number; // ~1.5% of current bank (display hint)
}

function sumBetProfit(bets: Bet[]): number {
  return bets.reduce(
    (sum, bet) => sum + (bet.profit_loss ? Number(bet.profit_loss) : 0),
    0
  );
}

/** Net deposits (deposits minus withdrawals) across all bank transactions. */
export function getNetDeposits(transactions: BankTransaction[] | null | undefined): number {
  if (!transactions || transactions.length === 0) return 0;
  return transactions.reduce((sum, tx) => {
    const amount = Number(tx.amount) || 0;
    return sum + (tx.type === 'withdrawal' ? -amount : amount);
  }, 0);
}

/**
 * Derived current bank: starting + net deposits/withdrawals + cumulative bet P/L.
 * This replaces the previously manual `bankroll_current_amount` figure.
 */
export function getDerivedCurrentBank(
  bets: Bet[],
  transactions: BankTransaction[] | null | undefined,
  profile: Profile | null | undefined
): number {
  const starting = Number(profile?.bankroll_starting_amount ?? 0) || 0;
  return starting + getNetDeposits(transactions) + sumBetProfit(bets);
}

/**
 * Summarise bankroll figures and true ROI against the starting bank.
 * `enabled` is false when tracking is off or no starting amount is set so the
 * UI can self-hide. When `transactions` is provided the current bank is derived
 * (starting + net deposits/withdrawals + bet P/L); otherwise it falls back to
 * the stored `bankroll_current_amount` (e.g. before the migration is run).
 */
export function getBankrollSummary(
  bets: Bet[],
  profile: Profile | null | undefined,
  transactions?: BankTransaction[] | null
): BankrollSummary {
  const starting = Number(profile?.bankroll_starting_amount ?? 0) || 0;
  const allTimeProfit = sumBetProfit(bets);
  const current =
    transactions !== undefined && transactions !== null
      ? getDerivedCurrentBank(bets, transactions, profile)
      : Number(profile?.bankroll_current_amount ?? 0) || 0;

  const enabled = Boolean(profile?.bankroll_tracking_enabled) && starting > 0;
  const trueRoi = starting > 0 ? (allTimeProfit / starting) * 100 : 0;
  const growthPct = starting > 0 ? ((current - starting) / starting) * 100 : 0;
  const suggestedUnit = current > 0 ? current * 0.015 : 0;

  return {
    enabled,
    starting,
    current,
    allTimeProfit,
    trueRoi,
    growthPct,
    suggestedUnit,
  };
}

export interface BankBalancePoint {
  date: string; // ISO date of the event (or 'start' baseline)
  balance: number; // running bank balance after this event
  label: string; // short description for tooltip
  kind: 'start' | 'bet' | 'deposit' | 'withdrawal';
}

/**
 * Build a date-sorted running bank balance series by merging bet P/L events
 * (by bet_date) and deposit/withdrawal events (by occurred_on), seeded with a
 * "Start" baseline at the starting bankroll. Returns [] when no starting amount.
 */
export function getBankBalanceTimeSeries(
  bets: Bet[],
  transactions: BankTransaction[] | null | undefined,
  profile: Profile | null | undefined
): BankBalancePoint[] {
  const starting = Number(profile?.bankroll_starting_amount ?? 0) || 0;
  if (!profile?.bankroll_tracking_enabled || starting <= 0) return [];

  type Event = { time: number; date: string; delta: number; kind: BankBalancePoint['kind']; label: string };
  const events: Event[] = [];

  bets.forEach((bet) => {
    if (!bet.bet_date) return;
    const time = new Date(bet.bet_date).getTime();
    if (isNaN(time)) return;
    const delta = bet.profit_loss ? Number(bet.profit_loss) : 0;
    if (delta === 0) return;
    events.push({ time, date: bet.bet_date, delta, kind: 'bet', label: 'Bet result' });
  });

  (transactions ?? []).forEach((tx) => {
    if (!tx.occurred_on) return;
    const time = new Date(tx.occurred_on).getTime();
    if (isNaN(time)) return;
    const amount = Number(tx.amount) || 0;
    if (amount === 0) return;
    if (tx.type === 'withdrawal') {
      events.push({ time, date: tx.occurred_on, delta: -amount, kind: 'withdrawal', label: 'Withdrawal' });
    } else {
      events.push({ time, date: tx.occurred_on, delta: amount, kind: 'deposit', label: 'Deposit' });
    }
  });

  // Stable chronological sort; deposits/withdrawals before bets on the same day.
  const kindOrder: Record<BankBalancePoint['kind'], number> = { start: 0, deposit: 1, withdrawal: 1, bet: 2 };
  events.sort((a, b) => (a.time - b.time) || (kindOrder[a.kind] - kindOrder[b.kind]));

  const series: BankBalancePoint[] = [
    { date: 'start', balance: starting, label: 'Starting bank', kind: 'start' },
  ];

  let running = starting;
  events.forEach((event) => {
    running += event.delta;
    series.push({ date: event.date, balance: running, label: event.label, kind: event.kind });
  });

  return series;
}
