-- Fix ONLY the bets table constraint (the one causing the error)
-- This is the simplest possible fix - just fixes what's broken
-- Run this in Supabase SQL Editor

BEGIN;

-- Drop the constraint that's causing the error
-- Using CASCADE to ensure it drops even if there are dependencies
ALTER TABLE public.bets DROP CONSTRAINT bets_user_id_fkey CASCADE;

-- Recreate it with ON DELETE CASCADE
ALTER TABLE public.bets 
ADD CONSTRAINT bets_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

COMMIT;

-- Verify it worked
SELECT 
    'bets' AS table_name,
    constraint_name,
    delete_rule,
    CASE 
        WHEN delete_rule = 'CASCADE' THEN '✓ FIXED'
        ELSE '✗ STILL BROKEN'
    END AS status
FROM information_schema.referential_constraints rc
JOIN information_schema.table_constraints tc 
    ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'bets'
    AND tc.table_schema = 'public'
    AND tc.constraint_type = 'FOREIGN KEY';

