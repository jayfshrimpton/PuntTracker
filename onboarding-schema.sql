-- Onboarding and Early Insights Schema
-- Run this in Supabase SQL Editor

-- Add wants_truth column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wants_truth BOOLEAN DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create user_insights table
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  first_pain_insight TEXT,
  insight_type TEXT, -- 'stake_sizing', 'day_of_week', 'bet_type', 'fallback'
  insight_data JSONB, -- Store additional data about the insight
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_insights_user_id_idx ON user_insights(user_id);

-- Enable Row Level Security
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own insights
CREATE POLICY "Users can view own insights" ON user_insights
  FOR SELECT USING ((select auth.uid()) = user_id);

-- Create policy: Users can insert their own insights
CREATE POLICY "Users can insert own insights" ON user_insights
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Create policy: Users can update their own insights
CREATE POLICY "Users can update own insights" ON user_insights
  FOR UPDATE USING ((select auth.uid()) = user_id);

