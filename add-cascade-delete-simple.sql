-- Add CASCADE DELETE to Foreign Keys (Simple Version)
-- This is a simpler alternative if the dynamic version doesn't work
-- Run this in Supabase SQL Editor

-- First, find the actual constraint names by running this query:
-- SELECT 
--     tc.table_name, 
--     tc.constraint_name
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.constraint_column_usage AS ccu
--     ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--     AND ccu.table_name = 'users'
--     AND ccu.table_schema = 'auth'
--     AND tc.table_schema = 'public';

-- Then replace the constraint names below with the actual ones from the query above

-- 1. Bets table
ALTER TABLE bets DROP CONSTRAINT IF EXISTS bets_user_id_fkey;
ALTER TABLE bets ADD CONSTRAINT bets_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Feedback table  
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;
ALTER TABLE feedback ADD CONSTRAINT feedback_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Bet Templates table
ALTER TABLE bet_templates DROP CONSTRAINT IF EXISTS bet_templates_user_id_fkey;
ALTER TABLE bet_templates ADD CONSTRAINT bet_templates_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Subscriptions table
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Note: If any of the DROP CONSTRAINT commands fail because the constraint name is different,
-- first run the query at the top to find the actual constraint names, then update this script.

