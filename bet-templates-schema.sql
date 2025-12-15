-- Bet Templates Schema
-- Run this in Supabase SQL Editor

-- Create bet_templates table
CREATE TABLE bet_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  -- Template data (stores bet configuration)
  bet_type TEXT NOT NULL,
  price DECIMAL(10,2),
  stake DECIMAL(10,2),
  venue TEXT,
  race_class TEXT,
  strategy_tags TEXT[],
  notes TEXT,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX bet_templates_user_id_idx ON bet_templates(user_id);
CREATE INDEX bet_templates_name_idx ON bet_templates(name);

-- Enable Row Level Security
ALTER TABLE bet_templates ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own templates
CREATE POLICY "Users can view own templates" ON bet_templates
  FOR SELECT USING ((select auth.uid()) = user_id);

-- Create policy: Users can insert their own templates
CREATE POLICY "Users can insert own templates" ON bet_templates
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Create policy: Users can update their own templates
CREATE POLICY "Users can update own templates" ON bet_templates
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- Create policy: Users can delete their own templates
CREATE POLICY "Users can delete own templates" ON bet_templates
  FOR DELETE USING ((select auth.uid()) = user_id);





