import { createClient } from '@/lib/supabase/client';
import { fetchAllBetsForUserPaginated } from '@/lib/fetch-user-bets-paginated';

export interface Bet {
  id: string;
  user_id: string;
  race_name: string | null;
  horse_name: string;
  bet_type:
  | 'win'
  | 'place'
  | 'lay'
  | 'each-way'
  | 'multi'
  | 'quinella'
  | 'exacta'
  | 'trifecta'
  | 'first-four'
  | 'other';
  price: number;
  stake: number;
  finishing_position: number | null;
  profit_loss: number | null;
  bet_date: string;
  created_at: string;
  updated_at: string;
  // Optional fields for new bet types
  selections?: Record<string, unknown> | null; // JSONB
  exotic_numbers?: string | null;
  num_legs?: number | null;
  description?: string | null;
  // Notes and strategy tracking
  notes?: string | null;
  strategy_tags?: string[] | null;
  // Venue and race number
  venue?: string | null;
  race_number?: number | null;
  race_class?: string | null;
  // Best starting price for comparison
  best_starting_price?: number | null;
  bookie?: string | null;
}

export interface BetInput {
  race_name?: string | null;
  horse_name: string;
  bet_type:
  | 'win'
  | 'place'
  | 'lay'
  | 'each-way'
  | 'multi'
  | 'quinella'
  | 'exacta'
  | 'trifecta'
  | 'first-four'
  | 'other';
  price: number;
  stake: number;
  finishing_position?: number | null;
  profit_loss?: number | null;
  bet_date: string;
  // Optional fields for new bet types
  selections?: Record<string, unknown> | null;
  exotic_numbers?: string | null;
  num_legs?: number | null;
  description?: string | null;
  // Notes and strategy tracking
  notes?: string | null;
  strategy_tags?: string[] | null;
  // Venue and race number
  venue?: string | null;
  race_number?: number | null;
  race_class?: string | null;
  // Best starting price for comparison
  best_starting_price?: number | null;
  bookie?: string | null;
}

export type DateRange = 'all' | 'this-month' | 'last-month' | 'custom';

// Client-side functions
export async function fetchUserBets(
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

export async function createBet(
  betData: BetInput
): Promise<{ data: Bet | null; error: Error | null }> {
  try {
    const res = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(betData),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        typeof body.message === 'string'
          ? body.message
          : typeof body.error === 'string'
            ? body.error
            : 'Failed to create bet';
      return { data: null, error: new Error(message) };
    }

    return { data: body.data as Bet, error: null };
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

// Bank transactions (deposit/withdrawal log -> derived bank history; PUN-71)
export type BankTransactionType = 'deposit' | 'withdrawal';

export interface BankTransaction {
  id: string;
  user_id: string;
  type: BankTransactionType;
  amount: number;
  occurred_on: string; // DATE (yyyy-MM-dd)
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankTransactionInput {
  type: BankTransactionType;
  amount: number;
  occurred_on: string;
  note?: string | null;
}

/**
 * True when a Supabase error indicates the relation does not exist yet, i.e.
 * the bank_transactions migration has not been run. Postgres reports 42P01;
 * PostgREST reports PGRST205 (and historically PGRST200 for schema cache misses).
 */
export function isMissingTableError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === '42P01' || error.code === 'PGRST205' || error.code === 'PGRST200') {
    return true;
  }
  const message = error.message?.toLowerCase() ?? '';
  return (
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    message.includes("relation \"public.bank_transactions\"")
  );
}

export async function fetchBankTransactions(
  userId: string
): Promise<{ data: BankTransaction[] | null; error: Error | null; tableMissing: boolean }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_on', { ascending: true });

    if (error) {
      if (isMissingTableError(error)) {
        return { data: null, error: null, tableMissing: true };
      }
      return { data: null, error: new Error(error.message), tableMissing: false };
    }

    return { data: (data as BankTransaction[]) ?? [], error: null, tableMissing: false };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
      tableMissing: false,
    };
  }
}

export async function createBankTransaction(
  input: BankTransactionInput
): Promise<{ data: BankTransaction | null; error: Error | null; tableMissing: boolean }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated'), tableMissing: false };
    }

    const { data, error } = await supabase
      .from('bank_transactions')
      .insert({ ...input, user_id: user.id })
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        return { data: null, error: null, tableMissing: true };
      }
      return { data: null, error: new Error(error.message), tableMissing: false };
    }

    return { data: data as BankTransaction, error: null, tableMissing: false };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
      tableMissing: false,
    };
  }
}

export async function updateBankTransaction(
  id: string,
  input: Partial<BankTransactionInput>
): Promise<{ data: BankTransaction | null; error: Error | null; tableMissing: boolean }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated'), tableMissing: false };
    }

    const { data, error } = await supabase
      .from('bank_transactions')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        return { data: null, error: null, tableMissing: true };
      }
      return { data: null, error: new Error(error.message), tableMissing: false };
    }

    return { data: data as BankTransaction, error: null, tableMissing: false };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
      tableMissing: false,
    };
  }
}

export async function deleteBankTransaction(
  id: string
): Promise<{ error: Error | null; tableMissing: boolean }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: new Error('User not authenticated'), tableMissing: false };
    }

    const { error } = await supabase
      .from('bank_transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      if (isMissingTableError(error)) {
        return { error: null, tableMissing: true };
      }
      return { error: new Error(error.message), tableMissing: false };
    }

    return { error: null, tableMissing: false };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
      tableMissing: false,
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

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  email_notifications_enabled: boolean;
  // Bankroll management
  bankroll_starting_amount: number | null;
  bankroll_current_amount: number | null;
  bankroll_tracking_enabled: boolean;
  // Goals and targets
  monthly_profit_target: number | null;
  monthly_roi_target: number | null;
  strike_rate_target: number | null;
  annual_profit_target: number | null;
  goals_enabled: boolean;
  unit_size: number; // Default 10
  display_units: boolean; // Default false
  custom_venues: string[] | null; // User's custom venue names
  custom_bookies: string[] | null; // User's custom bookie names
  onboarding_completed?: boolean;
  wants_truth?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  full_name?: string | null;
  email_notifications_enabled?: boolean;
  // Bankroll management
  bankroll_starting_amount?: number | null;
  bankroll_current_amount?: number | null;
  bankroll_tracking_enabled?: boolean;
  // Goals and targets
  monthly_profit_target?: number | null;
  monthly_roi_target?: number | null;
  strike_rate_target?: number | null;
  annual_profit_target?: number | null;
  goals_enabled?: boolean;
  unit_size?: number;
  display_units?: boolean;
  custom_venues?: string[] | null;
  custom_bookies?: string[] | null;
}

export async function fetchProfile(): Promise<{
  data: Profile | null;
  error: Error | null;
}> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (data) {
      return { data: data as Profile, error: null };
    }

    const baseProfile = {
      id: user.id,
      email: user.email,
      email_notifications_enabled: true,
      bankroll_tracking_enabled: false,
      goals_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: insertedProfile, error: insertError } = await supabase
      .from('profiles')
      .upsert(baseProfile, { onConflict: 'id' })
      .select('*')
      .single();

    if (insertError) {
      return { data: null, error: new Error(insertError.message) };
    }

    return { data: insertedProfile as Profile, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function updateProfile(
  profileData: ProfileUpdate
): Promise<{ data: Profile | null; error: Error | null }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Profile, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export interface BetTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  bet_type: string;
  price: number | null;
  stake: number | null;
  venue: string | null;
  race_class: string | null;
  strategy_tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BetTemplateInput {
  name: string;
  description?: string | null;
  bet_type: string;
  price?: number | null;
  stake?: number | null;
  venue?: string | null;
  race_class?: string | null;
  strategy_tags?: string[] | null;
  notes?: string | null;
}

export async function fetchBetTemplates(): Promise<{
  data: BetTemplate[] | null;
  error: Error | null;
}> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('bet_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as BetTemplate[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function createBetTemplate(
  templateData: BetTemplateInput
): Promise<{ data: BetTemplate | null; error: Error | null }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('bet_templates')
      .insert({
        ...templateData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as BetTemplate, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function updateBetTemplate(
  templateId: string,
  templateData: Partial<BetTemplateInput>
): Promise<{ data: BetTemplate | null; error: Error | null }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('bet_templates')
      .update({
        ...templateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as BetTemplate, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function deleteBetTemplate(
  templateId: string
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
      .from('bet_templates')
      .delete()
      .eq('id', templateId)
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