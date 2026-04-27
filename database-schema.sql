-- ============================================================================
-- Punter's Journal: full Supabase (PostgreSQL) schema
-- Run in the SQL Editor (new projects: run once; existing DBs: safe sections
-- use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS where noted).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at fresh
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bankroll_starting_amount NUMERIC(10,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bankroll_current_amount NUMERIC(10,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bankroll_tracking_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_profit_target NUMERIC(10,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_roi_target NUMERIC(5,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS strike_rate_target NUMERIC(5,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS annual_profit_target NUMERIC(10,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goals_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unit_size NUMERIC(10,2) DEFAULT 10.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_units BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_venues TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_bookies TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wants_truth BOOLEAN;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

COMMENT ON COLUMN public.profiles.custom_venues IS 'Custom venue names not in the predefined list';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, email_notifications_enabled)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- bets
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  race_name TEXT NOT NULL,
  horse_name TEXT NOT NULL,
  bet_type TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stake NUMERIC(10,2) NOT NULL,
  finishing_position INTEGER,
  profit_loss NUMERIC(10,2),
  bet_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS bets_user_id_idx ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS bets_bet_date_idx ON public.bets(bet_date);

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bets" ON public.bets;
CREATE POLICY "Users can view own bets" ON public.bets
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own bets" ON public.bets;
CREATE POLICY "Users can insert own bets" ON public.bets
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own bets" ON public.bets;
CREATE POLICY "Users can update own bets" ON public.bets
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own bets" ON public.bets;
CREATE POLICY "Users can delete own bets" ON public.bets
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS selections JSONB;
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS exotic_numbers TEXT;
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS num_legs INTEGER;
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS strategy_tags TEXT[];
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS race_number INTEGER;
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS race_class TEXT;
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS best_starting_price NUMERIC(10,2);
ALTER TABLE public.bets ADD COLUMN IF NOT EXISTS bookie TEXT;

-- ---------------------------------------------------------------------------
-- feedback
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'new' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON public.feedback(status);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback(created_at);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback;
CREATE POLICY "Users can insert own feedback" ON public.feedback
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own feedback" ON public.feedback;
CREATE POLICY "Users can update own feedback" ON public.feedback
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Stripe mirror (webhook / service role)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  metadata JSONB,
  price_id TEXT,
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  current_period_start TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  current_period_end TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  ended_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  CONSTRAINT subscriptions_status_check CHECK (
    status = ANY (ARRAY[
      'trialing','active','canceled','incomplete','incomplete_expired',
      'past_due','unpaid','paused'
    ]::text[])
  )
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- user_subscriptions (app tier / admin grants)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  special_pricing TEXT,
  current_price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT user_subscriptions_tier_check CHECK (tier = ANY (ARRAY['free','pro','elite']::text[])),
  CONSTRAINT user_subscriptions_status_check CHECK (
    status = ANY (ARRAY[
      'active','canceled','past_due','trialing','incomplete',
      'incomplete_expired','unpaid','paused'
    ]::text[])
  ),
  CONSTRAINT user_subscriptions_special_pricing_check CHECK (
    special_pricing IS NULL OR special_pricing = ANY (
      ARRAY['beta_tester','founding_member','influencer']::text[]
    )
  )
);

CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS user_subscriptions_tier_idx ON public.user_subscriptions(tier);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view own user_subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- user_insights (onboarding / early insights)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_pain_insight TEXT,
  insight_type TEXT,
  insight_data JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS user_insights_user_id_idx ON public.user_insights(user_id);

ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own insights" ON public.user_insights;
CREATE POLICY "Users can view own insights" ON public.user_insights
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own insights" ON public.user_insights;
CREATE POLICY "Users can insert own insights" ON public.user_insights
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own insights" ON public.user_insights;
CREATE POLICY "Users can update own insights" ON public.user_insights
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- bet_templates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bet_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  bet_type TEXT NOT NULL,
  price NUMERIC(10,2),
  stake NUMERIC(10,2),
  venue TEXT,
  race_class TEXT,
  strategy_tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS bet_templates_user_id_idx ON public.bet_templates(user_id);
CREATE INDEX IF NOT EXISTS bet_templates_name_idx ON public.bet_templates(name);

ALTER TABLE public.bet_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own templates" ON public.bet_templates;
CREATE POLICY "Users can view own templates" ON public.bet_templates
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own templates" ON public.bet_templates;
CREATE POLICY "Users can insert own templates" ON public.bet_templates
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own templates" ON public.bet_templates;
CREATE POLICY "Users can update own templates" ON public.bet_templates
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own templates" ON public.bet_templates;
CREATE POLICY "Users can delete own templates" ON public.bet_templates
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- admin_audit_log (service role / server only; RLS on, no user policies)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_tier TEXT,
  new_tier TEXT,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT admin_audit_log_action_check CHECK (
    action = ANY (
      ARRAY['grant_access','revoke_access','update_tier','bulk_action']::text[]
    )
  )
);

CREATE INDEX IF NOT EXISTS admin_audit_log_user_id_idx ON public.admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_action_idx ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON public.admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS admin_audit_log_admin_id_idx ON public.admin_audit_log(admin_id);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- usage_tracking (limits / quotas)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT usage_tracking_resource_check CHECK (
    resource_type = ANY (ARRAY['bet','ai_insight','export']::text[])
  ),
  CONSTRAINT usage_tracking_user_resource_period_key UNIQUE (user_id, resource_type, period_start)
);

CREATE INDEX IF NOT EXISTS usage_tracking_user_id_idx ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS usage_tracking_resource_type_idx ON public.usage_tracking(resource_type);
CREATE INDEX IF NOT EXISTS usage_tracking_period_idx ON public.usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS usage_tracking_user_resource_period_idx ON public.usage_tracking(user_id, resource_type, period_start);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_tracking;
CREATE POLICY "Users can insert own usage" ON public.usage_tracking
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_tracking;
CREATE POLICY "Users can update own usage" ON public.usage_tracking
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON public.usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- shared_dashboard_links (public stats card — read via Next.js API + service role)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_dashboard_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  period JSONB NOT NULL DEFAULT '{"type":"all"}'::jsonb,
  show_profit BOOLEAN NOT NULL DEFAULT true,
  show_strike_rate BOOLEAN NOT NULL DEFAULT true,
  show_roi BOOLEAN NOT NULL DEFAULT true,
  show_turnover BOOLEAN NOT NULL DEFAULT true,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT shared_dashboard_links_user_id_key UNIQUE (user_id),
  CONSTRAINT shared_dashboard_links_token_key UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS shared_dashboard_links_token_idx ON public.shared_dashboard_links(token);

ALTER TABLE public.shared_dashboard_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own share links" ON public.shared_dashboard_links;
CREATE POLICY "Users manage own share links" ON public.shared_dashboard_links
  FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS update_shared_dashboard_links_updated_at ON public.shared_dashboard_links;
CREATE TRIGGER update_shared_dashboard_links_updated_at
  BEFORE UPDATE ON public.shared_dashboard_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
