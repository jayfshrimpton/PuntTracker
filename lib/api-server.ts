import { createClient } from '@/lib/supabase/server';
import { fetchAllBetsForUserPaginated } from '@/lib/fetch-user-bets-paginated';
import type { Bet, DateRange } from './api';

// Server-side functions
export async function fetchUserBetsServer(
  userId: string,
  dateRange?: DateRange,
  customStart?: Date,
  customEnd?: Date
): Promise<{ data: Bet[] | null; error: Error | null }> {
  const supabase = createClient();
  return fetchAllBetsForUserPaginated(supabase, userId, {
    dateRange: dateRange === 'all' ? undefined : dateRange,
    customStart,
    customEnd,
  });
}

