import type { SupabaseClient } from '@supabase/supabase-js';
import type { Bet, DateRange } from './api';

/** PostgREST/Supabase default max rows; fetch in pages to load full history. */
const BETS_FETCH_PAGE_SIZE = 1000;

function buildBetsQuery(
  supabase: SupabaseClient,
  userId: string,
  dateRange?: DateRange,
  customStart?: Date,
  customEnd?: Date
) {
  let query = supabase
    .from('bets')
    .select('*')
    .eq('user_id', userId)
    .order('bet_date', { ascending: false });

  if (dateRange === 'this-month') {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    query = query
      .gte('bet_date', start.toISOString().split('T')[0])
      .lte('bet_date', end.toISOString().split('T')[0]);
  } else if (dateRange === 'last-month') {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    query = query
      .gte('bet_date', start.toISOString().split('T')[0])
      .lte('bet_date', end.toISOString().split('T')[0]);
  } else if (dateRange === 'custom' && customStart && customEnd) {
    query = query
      .gte('bet_date', customStart.toISOString().split('T')[0])
      .lte('bet_date', customEnd.toISOString().split('T')[0]);
  }

  return query;
}

/**
 * Fetches all matching bets, paging past PostgREST's default 1000-row cap.
 */
export async function fetchAllBetsForUserPaginated(
  supabase: SupabaseClient,
  userId: string,
  options?: { dateRange?: DateRange; customStart?: Date; customEnd?: Date }
): Promise<{ data: Bet[] | null; error: Error | null }> {
  const { dateRange, customStart, customEnd } = options || {};

  try {
    const all: Bet[] = [];
    let from = 0;

    while (true) {
      const to = from + BETS_FETCH_PAGE_SIZE - 1;
      const { data, error } = await buildBetsQuery(
        supabase,
        userId,
        dateRange,
        customStart,
        customEnd
      ).range(from, to);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      const batch = (data as Bet[]) || [];
      if (batch.length === 0) {
        break;
      }
      all.push(...batch);
      if (batch.length < BETS_FETCH_PAGE_SIZE) {
        break;
      }
      from += BETS_FETCH_PAGE_SIZE;
    }

    return { data: all, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
