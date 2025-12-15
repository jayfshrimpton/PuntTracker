-- Simple Direct Fix - Uses exact constraint names
-- Based on the error, the constraint is named "bets_user_id_fkey"
-- Run this in Supabase SQL Editor

BEGIN;

-- Fix bets table (this is the one causing the error)
ALTER TABLE public.bets DROP CONSTRAINT IF EXISTS bets_user_id_fkey CASCADE;
ALTER TABLE public.bets 
ADD CONSTRAINT bets_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Fix feedback table
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey CASCADE;
ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Fix bet_templates table
ALTER TABLE public.bet_templates DROP CONSTRAINT IF EXISTS bet_templates_user_id_fkey CASCADE;
ALTER TABLE public.bet_templates 
ADD CONSTRAINT bet_templates_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Fix subscriptions table
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey CASCADE;
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

COMMIT;

-- Verify all constraints now have CASCADE
SELECT 
    tc.table_name, 
    tc.constraint_name,
    rc.delete_rule,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✓ Fixed'
        ELSE '✗ Still needs fixing'
    END AS status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
    AND rc.constraint_schema = tc.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'auth'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

