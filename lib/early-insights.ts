import { Bet } from './api';

export type InsightType = 'stake_sizing' | 'day_of_week' | 'bet_type' | 'fallback';

export interface EarlyInsight {
  type: InsightType;
  message: string;
  data?: {
    avgLosingStake?: number;
    avgWinningStake?: number;
    dayOfWeek?: string;
    betType?: string;
    monthlyLoss?: number;
  };
}

/**
 * Generates an early insight from bet data
 * Works with as few as 5 bets, or falls back to generic insight
 */
export function generateEarlyInsight(bets: Bet[]): EarlyInsight {
  // Need at least 5 bets for meaningful insights
  if (bets.length < 5) {
    return {
      type: 'fallback',
      message: 'Most users lose money due to inconsistent stake sizing. This is the most common leak we detect.',
      data: {},
    };
  }

  // Insight 1: Check if losing bets have higher average stake than winning bets
  const winningBets = bets.filter((bet) => bet.profit_loss !== null && Number(bet.profit_loss) > 0);
  const losingBets = bets.filter((bet) => bet.profit_loss !== null && Number(bet.profit_loss) < 0);

  if (losingBets.length >= 2 && winningBets.length >= 2) {
    const avgLosingStake =
      losingBets.reduce((sum, bet) => sum + Number(bet.stake), 0) / losingBets.length;
    const avgWinningStake =
      winningBets.reduce((sum, bet) => sum + Number(bet.stake), 0) / winningBets.length;

    if (avgLosingStake > avgWinningStake * 1.1) {
      // At least 10% higher
      return {
        type: 'stake_sizing',
        message: `Your losing bets average $${avgLosingStake.toFixed(2)} per bet, while your winning bets average $${avgWinningStake.toFixed(2)}. This pattern costs money.`,
        data: {
          avgLosingStake,
          avgWinningStake,
        },
      };
    }
  }

  // Insight 2: Check for negative ROI on a specific day of week
  const dayStats = new Map<string, { totalStake: number; totalProfit: number; count: number }>();

  bets.forEach((bet) => {
    const betDate = new Date(bet.bet_date);
    const dayName = betDate.toLocaleDateString('en-US', { weekday: 'long' });
    const profit = bet.profit_loss ? Number(bet.profit_loss) : 0;
    const stake = Number(bet.stake);

    if (!dayStats.has(dayName)) {
      dayStats.set(dayName, { totalStake: 0, totalProfit: 0, count: 0 });
    }

    const stats = dayStats.get(dayName)!;
    stats.totalStake += stake;
    stats.totalProfit += profit;
    stats.count += 1;
  });

  // Find day with negative ROI and at least 3 bets
  for (const [day, stats] of dayStats.entries()) {
    if (stats.count >= 3) {
      const roi = stats.totalStake > 0 ? (stats.totalProfit / stats.totalStake) * 100 : 0;
      if (roi < -5) {
        // At least 5% negative ROI
        return {
          type: 'day_of_week',
          message: `Your ${day} bets are losing money. This pattern shows a ${Math.abs(roi).toFixed(1)}% negative return.`,
          data: {
            dayOfWeek: day,
            monthlyLoss: Math.abs(stats.totalProfit),
          },
        };
      }
    }
  }

  // Insight 3: Check for negative P&L on a specific bet type with at least 3 bets
  const betTypeStats = new Map<
    string,
    { totalStake: number; totalProfit: number; count: number }
  >();

  bets.forEach((bet) => {
    const betType = bet.bet_type;
    const profit = bet.profit_loss ? Number(bet.profit_loss) : 0;
    const stake = Number(bet.stake);

    if (!betTypeStats.has(betType)) {
      betTypeStats.set(betType, { totalStake: 0, totalProfit: 0, count: 0 });
    }

    const stats = betTypeStats.get(betType)!;
    stats.totalStake += stake;
    stats.totalProfit += profit;
    stats.count += 1;
  });

  // Find bet type with negative P&L and at least 3 bets
  for (const [betType, stats] of betTypeStats.entries()) {
    if (stats.count >= 3 && stats.totalProfit < 0) {
      const roi = stats.totalStake > 0 ? (stats.totalProfit / stats.totalStake) * 100 : 0;
      return {
        type: 'bet_type',
        message: `Your ${betType} bets are losing money. This pattern shows a ${Math.abs(roi).toFixed(1)}% negative return.`,
        data: {
          betType,
          monthlyLoss: Math.abs(stats.totalProfit),
        },
      };
    }
  }

  // Fallback: Generic insight about stake sizing
  return {
    type: 'fallback',
    message: 'Most users lose money due to inconsistent stake sizing. This is the most common leak we detect.',
    data: {},
  };
}

/**
 * Calculates monthly loss projection based on bet data
 */
export function calculateMonthlyLossProjection(bets: Bet[]): number {
  if (bets.length === 0) {
    return 0;
  }

  // Calculate average loss per bet
  const losingBets = bets.filter((bet) => bet.profit_loss !== null && Number(bet.profit_loss) < 0);
  if (losingBets.length === 0) {
    return 0;
  }

  const avgLossPerBet =
    losingBets.reduce((sum, bet) => sum + Math.abs(Number(bet.profit_loss || 0)), 0) /
    losingBets.length;

  // Estimate average bets per month
  // If we have date data, calculate from actual frequency
  // Otherwise, use a conservative estimate
  let avgBetsPerMonth = 20; // Conservative default

  if (bets.length > 1) {
    const dates = bets.map((bet) => new Date(bet.bet_date)).sort((a, b) => a.getTime() - b.getTime());
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    const betsPerDay = bets.length / daysDiff;
    avgBetsPerMonth = Math.round(betsPerDay * 30);
  }

  // Monthly loss = average loss per bet × average bets per month
  // Round down to be conservative
  return Math.floor(avgLossPerBet * avgBetsPerMonth);
}

