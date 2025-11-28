-- Optimize RLS Policies
-- This script drops existing policies and recreates them with optimized syntax
-- to avoid re-evaluating auth.uid() for every row.

-- 1. Bets Table
DROP POLICY IF EXISTS "Users can view own bets" ON bets;
CREATE POLICY "Users can view own bets" ON bets
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own bets" ON bets;
CREATE POLICY "Users can insert own bets" ON bets
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own bets" ON bets;
CREATE POLICY "Users can update own bets" ON bets
  FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own bets" ON bets;
CREATE POLICY "Users can delete own bets" ON bets
  FOR DELETE USING ((select auth.uid()) = user_id);

-- 2. Feedback Table
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own feedback" ON feedback;
CREATE POLICY "Users can update own feedback" ON feedback
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- 3. Profiles Table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING ((select auth.uid()) = id);

-- 4. Bet Templates Table
DROP POLICY IF EXISTS "Users can view own templates" ON bet_templates;
CREATE POLICY "Users can view own templates" ON bet_templates
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own templates" ON bet_templates;
CREATE POLICY "Users can insert own templates" ON bet_templates
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own templates" ON bet_templates;
CREATE POLICY "Users can update own templates" ON bet_templates
  FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own templates" ON bet_templates;
CREATE POLICY "Users can delete own templates" ON bet_templates
  FOR DELETE USING ((select auth.uid()) = user_id);
