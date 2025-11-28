-- Bankroll Management and Goals Schema
-- Run this in Supabase SQL Editor to add bankroll and goals tracking

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  email_notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (idempotent)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (drop first if they exist to make it idempotent)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, email_notifications_enabled)
  VALUES (NEW.id, NEW.email, true)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add bankroll management columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bankroll_starting_amount DECIMAL(10,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bankroll_current_amount DECIMAL(10,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bankroll_tracking_enabled BOOLEAN DEFAULT false;

-- Add goals and targets columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_profit_target DECIMAL(10,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_roi_target DECIMAL(5,2); -- Percentage
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS strike_rate_target DECIMAL(5,2); -- Percentage
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS annual_profit_target DECIMAL(10,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goals_enabled BOOLEAN DEFAULT false;

