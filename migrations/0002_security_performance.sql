-- Security & performance migration (quota bypass fix, profile protection, indexes, atomic usage RPC)
-- Safe to re-run (IF NOT EXISTS / DROP IF EXISTS).

-- ---------------------------------------------------------------------------
-- usage_tracking: users may only read their own rows; writes via service role / RPC
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_tracking;

-- ---------------------------------------------------------------------------
-- Atomic usage increment (server-only via SECURITY DEFINER)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_resource_type TEXT,
  p_period_start DATE,
  p_period_end DATE,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_amount IS NULL OR p_amount < 1 THEN
    RAISE EXCEPTION 'increment amount must be >= 1';
  END IF;

  INSERT INTO public.usage_tracking (user_id, resource_type, count, period_start, period_end)
  VALUES (p_user_id, p_resource_type, p_amount, p_period_start, p_period_end)
  ON CONFLICT (user_id, resource_type, period_start)
  DO UPDATE SET
    count = public.usage_tracking.count + EXCLUDED.count,
    updated_at = timezone('utc'::text, now());
END;
$$;

REVOKE ALL ON FUNCTION public.increment_usage(UUID, TEXT, DATE, DATE, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_usage(UUID, TEXT, DATE, DATE, INTEGER) TO service_role;

-- ---------------------------------------------------------------------------
-- profiles: prevent users from overwriting server-managed billing columns
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_server_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
    NEW.stripe_customer_id := OLD.stripe_customer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_server_columns ON public.profiles;
CREATE TRIGGER protect_profile_server_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_server_columns();

-- ---------------------------------------------------------------------------
-- Performance indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS bets_user_id_bet_date_idx
  ON public.bets(user_id, bet_date DESC);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
  ON public.profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS bank_transactions_user_occurred_on_idx
  ON public.bank_transactions(user_id, occurred_on DESC);
