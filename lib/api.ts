import { createClient } from '@/lib/supabase/client';

export interface Bet {
  id: string;
  user_id: string;
  race_name: string;
  horse_name: string;
  bet_type: 'win' | 'place' | 'lay';
  price: number;
  stake: number;
  finishing_position: number | null;
  profit_loss: number | null;
  bet_date: string;
  created_at: string;
  updated_at: string;
}

export interface BetInput {
  race_name: string;
  horse_name: string;
  bet_type: 'win' | 'place' | 'lay';
  price: number;
  stake: number;
  finishing_position?: number | null;
  profit_loss?: number | null;
  bet_date: string;
}

export type DateRange = 'all' | 'this-month' | 'last-month' | 'custom';

// Client-side functions
export async function fetchUserBets(
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

export async function createBet(
  betData: BetInput
): Promise<{ data: Bet | null; error: Error | null }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('bets')
      .insert({
        ...betData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Bet, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function updateBet(
  betId: string,
  betData: Partial<BetInput>
): Promise<{ data: Bet | null; error: Error | null }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('bets')
      .update({
        ...betData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', betId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Bet, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function deleteBet(
  betId: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('bets')
      .delete()
      .eq('id', betId)
      .eq('user_id', user.id);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export interface Feedback {
  id: string;
  user_id: string;
  feedback_type: 'Bug Report' | 'Feature Request' | 'General Feedback';
  title: string;
  description: string;
  email: string;
  status: 'new' | 'reviewing' | 'completed';
  created_at: string;
}

export interface FeedbackInput {
  feedback_type: 'Bug Report' | 'Feature Request' | 'General Feedback';
  title: string;
  description: string;
  email: string;
}

export async function createFeedback(
  feedbackData: FeedbackInput
): Promise<{ data: Feedback | null; error: Error | null }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        ...feedbackData,
        user_id: user.id,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Feedback, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function fetchUserFeedback(
  userId: string
): Promise<{ data: Feedback[] | null; error: Error | null }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Feedback[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function fetchAllFeedback(): Promise<{
  data: Feedback[] | null;
  error: Error | null;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Feedback[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}