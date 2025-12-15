-- Fix profiles table foreign key constraint
-- The constraint profiles_id_fkey needs ON DELETE CASCADE
-- Run this in Supabase SQL Editor

BEGIN;

-- Drop the existing foreign key constraint
-- Note: This is safe - it only drops the FK, not the primary key
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

-- Recreate with ON DELETE CASCADE
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

COMMIT;

-- Verify it worked
SELECT 
    con.conname AS constraint_name,
    con.conrelid::regclass::text AS table_name,
    pg_get_constraintdef(con.oid) AS constraint_definition,
    CASE 
        WHEN pg_get_constraintdef(con.oid) LIKE '%ON DELETE CASCADE%' THEN '✓ CASCADE enabled'
        ELSE '✗ CASCADE NOT enabled'
    END AS status
FROM pg_constraint con
WHERE con.conrelid = 'public.profiles'::regclass
    AND con.conname = 'profiles_id_fkey';

