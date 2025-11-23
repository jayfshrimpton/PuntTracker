-- Add unit settings columns to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS unit_size DECIMAL(10,2) DEFAULT 10.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_units BOOLEAN DEFAULT false;
