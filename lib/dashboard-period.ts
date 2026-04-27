import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from 'date-fns';
import type { Bet } from '@/lib/api';

export type DashboardPeriodType =
  | 'all'
  | 'this-week'
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'this-year'
  | 'pick-month';

export interface DashboardPeriodState {
  type: DashboardPeriodType;
  /** Required when type is `pick-month` — ISO `YYYY-MM` */
  yearMonth?: string;
}

export const DASHBOARD_PERIOD_STORAGE_KEY = 'punters_journal_dashboard_period';

export const DEFAULT_DASHBOARD_PERIOD: DashboardPeriodState = { type: 'all' };

const PERIOD_TYPES: DashboardPeriodType[] = [
  'all',
  'this-week',
  'this-month',
  'last-month',
  'last-3-months',
  'last-6-months',
  'this-year',
  'pick-month',
];

function isValidYearMonth(s: string): boolean {
  return /^\d{4}-\d{2}$/.test(s);
}

export function normalizeDashboardPeriod(raw: unknown): DashboardPeriodState {
  if (!raw || typeof raw !== 'object') return DEFAULT_DASHBOARD_PERIOD;
  const o = raw as Record<string, unknown>;
  const t = o.type;
  if (typeof t !== 'string' || !PERIOD_TYPES.includes(t as DashboardPeriodType)) {
    return DEFAULT_DASHBOARD_PERIOD;
  }
  if (t === 'pick-month') {
    const ym = o.yearMonth;
    if (typeof ym !== 'string' || !isValidYearMonth(ym)) {
      return { type: 'pick-month', yearMonth: format(new Date(), 'yyyy-MM') };
    }
    return { type: 'pick-month', yearMonth: ym };
  }
  return { type: t as DashboardPeriodType };
}

export function loadDashboardPeriodFromStorage(): DashboardPeriodState {
  if (typeof window === 'undefined') return DEFAULT_DASHBOARD_PERIOD;
  try {
    const raw = localStorage.getItem(DASHBOARD_PERIOD_STORAGE_KEY);
    if (!raw) return DEFAULT_DASHBOARD_PERIOD;
    return normalizeDashboardPeriod(JSON.parse(raw));
  } catch {
    return DEFAULT_DASHBOARD_PERIOD;
  }
}

export function saveDashboardPeriodToStorage(period: DashboardPeriodState): void {
  if (typeof window === 'undefined') return;
  try {
    const payload =
      period.type === 'pick-month'
        ? { type: period.type, yearMonth: period.yearMonth }
        : { type: period.type };
    localStorage.setItem(DASHBOARD_PERIOD_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Inclusive date bounds in local time; `null` means no filter (all time). */
export function getPeriodDateBounds(
  period: DashboardPeriodState,
  now: Date = new Date()
): { start: Date; end: Date } | null {
  switch (period.type) {
    case 'all':
      return null;
    case 'this-week': {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      return { start, end: endOfDay(end) };
    }
    case 'this-month': {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return { start, end: endOfDay(end) };
    }
    case 'last-month': {
      const ref = subMonths(now, 1);
      const start = startOfMonth(ref);
      const end = endOfMonth(ref);
      return { start, end: endOfDay(end) };
    }
    case 'last-3-months': {
      const start = startOfMonth(subMonths(now, 2));
      return { start, end: endOfDay(now) };
    }
    case 'last-6-months': {
      const start = startOfMonth(subMonths(now, 5));
      return { start, end: endOfDay(now) };
    }
    case 'this-year': {
      const start = startOfYear(now);
      return { start, end: endOfDay(now) };
    }
    case 'pick-month': {
      const ym = period.yearMonth && isValidYearMonth(period.yearMonth)
        ? period.yearMonth
        : format(now, 'yyyy-MM');
      const start = parseISO(`${ym}-01`);
      const end = endOfMonth(start);
      return { start, end: endOfDay(end) };
    }
    default:
      return null;
  }
}

function betDateOnly(bet: Bet): Date {
  const s = bet.bet_date;
  if (!s) return new Date(0);
  const [y, m, d] = s.split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return new Date(0);
  return new Date(y, m - 1, d);
}

export function filterBetsByPeriod(bets: Bet[], period: DashboardPeriodState): Bet[] {
  const bounds = getPeriodDateBounds(period);
  if (!bounds) return [...bets];

  return bets.filter((bet) => {
    const d = betDateOnly(bet);
    return d >= bounds.start && d <= bounds.end;
  });
}

export function formatDashboardPeriodLabel(period: DashboardPeriodState, now: Date = new Date()): string {
  switch (period.type) {
    case 'all':
      return 'all time';
    case 'this-week': {
      const { start, end } = getPeriodDateBounds(period, now)!;
      return `the week of ${format(start, 'd MMM')}–${format(end, 'd MMM yyyy')}`;
    }
    case 'this-month':
      return format(now, 'MMMM yyyy');
    case 'last-month':
      return format(subMonths(now, 1), 'MMMM yyyy');
    case 'last-3-months':
      return 'the last 3 months';
    case 'last-6-months':
      return 'the last 6 months';
    case 'this-year':
      return format(now, 'yyyy');
    case 'pick-month': {
      const ym =
        period.yearMonth && isValidYearMonth(period.yearMonth)
          ? period.yearMonth
          : format(now, 'yyyy-MM');
      return format(parseISO(`${ym}-01`), 'MMMM yyyy');
    }
    default:
      return 'all time';
  }
}
