import { createClient } from '@/lib/supabase/server';
import type { Bet, BetInput, DateRange } from './api';

// Server-side functions
export async function fetchUserBetsServer(
  userId: string,
  dateRange?: DateRange,
  customStart?: Date,
  customEnd?: Date
): Promise<{ data: Bet[] | null; error: Error | null }> {
  try {
    const supabase = createClient();
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

    const { data, error } = await query;

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Bet[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

