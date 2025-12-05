-- Add custom_venues column to profiles table
-- This stores user's custom venue names that aren't in the predefined list

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_venues TEXT[];

-- Add a comment to document the column
COMMENT ON COLUMN profiles.custom_venues IS 'Array of custom venue names added by the user for tracks not in the predefined list';
