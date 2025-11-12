import { Bet } from './api';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

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
