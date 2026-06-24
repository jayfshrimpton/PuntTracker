-- ============================================================================
-- Migration 0001: bank_transactions (PUN-71 Bank History)
-- STATUS: NOT YET APPLIED to the live Supabase database.
-- HOW TO RUN: open the Supabase dashboard -> SQL Editor -> paste this file ->
--             Run. Safe to run more than once (uses IF NOT EXISTS / DROP POLICY).
-- Until this runs, the app shows a "Database update required" banner on the
-- dashboard and settings bankroll sections instead of the bank history feature.
-- ============================================================================

-- Requires public.update_updated_at_column() (already defined in database-schema.sql).

CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  occurred_on DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT bank_transactions_type_check CHECK (type = ANY (ARRAY['deposit','withdrawal']::text[])),
  CONSTRAINT bank_transactions_amount_check CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS bank_transactions_user_id_idx ON public.bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS bank_transactions_occurred_on_idx ON public.bank_transactions(occurred_on);

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bank transactions" ON public.bank_transactions;
CREATE POLICY "Users can view own bank transactions" ON public.bank_transactions
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own bank transactions" ON public.bank_transactions;
CREATE POLICY "Users can insert own bank transactions" ON public.bank_transactions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own bank transactions" ON public.bank_transactions;
CREATE POLICY "Users can update own bank transactions" ON public.bank_transactions
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own bank transactions" ON public.bank_transactions;
CREATE POLICY "Users can delete own bank transactions" ON public.bank_transactions
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS update_bank_transactions_updated_at ON public.bank_transactions;
CREATE TRIGGER update_bank_transactions_updated_at
  BEFORE UPDATE ON public.bank_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
