-- Horse Bet Tracker Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Create bets table
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  race_name TEXT NOT NULL,
  horse_name TEXT NOT NULL,
  bet_type TEXT NOT NULL, -- 'win','place','lay','each-way','multi','quinella','exacta','trifecta','first-four','other'
  price DECIMAL(10,2) NOT NULL, -- odds
  stake DECIMAL(10,2) NOT NULL,
  finishing_position INTEGER,
  profit_loss DECIMAL(10,2),
  bet_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX bets_user_id_idx ON bets(user_id);
CREATE INDEX bets_bet_date_idx ON bets(bet_date);

-- Enable Row Level Security
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own bets
CREATE POLICY "Users can view own bets" ON bets
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own bets
CREATE POLICY "Users can insert own bets" ON bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own bets
CREATE POLICY "Users can update own bets" ON bets
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy: Users can delete their own bets
CREATE POLICY "Users can delete own bets" ON bets
  FOR DELETE USING (auth.uid() = user_id);

-- Optional columns for new bet types (idempotent)
ALTER TABLE bets ADD COLUMN IF NOT EXISTS selections JSONB;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS exotic_numbers TEXT;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS num_legs INTEGER;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS description TEXT;
