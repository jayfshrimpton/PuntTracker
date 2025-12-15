-- Final Fix - Direct approach using exact constraint name
-- The constraint exists but doesn't have ON DELETE CASCADE
-- Run this in Supabase SQL Editor

BEGIN;

-- Drop the existing constraint
ALTER TABLE public.bets DROP CONSTRAINT bets_user_id_fkey CASCADE;

-- Recreate with ON DELETE CASCADE
ALTER TABLE public.bets 
ADD CONSTRAINT bets_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

COMMIT;

-- Verify it worked - should show "ON DELETE CASCADE" in the definition
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.bets'::regclass
    AND conname = 'bets_user_id_fkey';

-- Should show: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

