import type { Bet } from '@/lib/api';
import {
  filterBetsByPeriod,
  formatDashboardPeriodLabel,
  normalizeDashboardPeriod,
  type DashboardPeriodState,
} from '@/lib/dashboard-period';
import { calculateMonthlyStats } from '@/lib/stats';

export interface ShareVisibility {
  show_profit: boolean;
  show_strike_rate: boolean;
  show_roi: boolean;
  show_turnover: boolean;
}

export interface PublicSharePayload {
  periodLabel: string;
  period: DashboardPeriodState;
  displayName: string | null;
  totalBets: number;
  visibility: ShareVisibility;
  stats: {
    totalProfit: number | null;
    strikeRate: number | null;
    roi: number | null;
    totalStake: number | null;
  };
}

export function buildPublicSharePayload(
  bets: Bet[],
  periodRaw: unknown,
  visibility: ShareVisibility,
  displayName: string | null
): PublicSharePayload {
  const period = normalizeDashboardPeriod(periodRaw ?? { type: 'all' });
  const filtered = filterBetsByPeriod(bets, period);
  const s = calculateMonthlyStats(filtered);

  return {
    periodLabel: formatDashboardPeriodLabel(period),
    period,
    displayName,
    totalBets: s.totalBets,
    visibility,
    stats: {
      totalProfit: visibility.show_profit ? s.totalProfit : null,
      strikeRate: visibility.show_strike_rate ? s.strikeRate : null,
      roi: visibility.show_roi ? s.roi : null,
      totalStake: visibility.show_turnover ? s.totalStake : null,
    },
  };
}
