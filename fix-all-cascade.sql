-- Fix ALL foreign key constraints to have ON DELETE CASCADE
-- Only fixes tables that exist (skips missing tables gracefully)
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Fix bets table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bets') THEN
        ALTER TABLE public.bets DROP CONSTRAINT IF EXISTS bets_user_id_fkey CASCADE;
        ALTER TABLE public.bets 
        ADD CONSTRAINT bets_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Fixed bets table';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not fix bets table: %', SQLERRM;
END $$;

-- 2. Fix feedback table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback') THEN
        ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey CASCADE;
        ALTER TABLE public.feedback 
        ADD CONSTRAINT feedback_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Fixed feedback table';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not fix feedback table: %', SQLERRM;
END $$;

-- 3. Fix bet_templates table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bet_templates') THEN
        ALTER TABLE public.bet_templates DROP CONSTRAINT IF EXISTS bet_templates_user_id_fkey CASCADE;
        ALTER TABLE public.bet_templates 
        ADD CONSTRAINT bet_templates_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Fixed bet_templates table';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not fix bet_templates table: %', SQLERRM;
END $$;

-- 4. Fix subscriptions table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey CASCADE;
        ALTER TABLE public.subscriptions 
        ADD CONSTRAINT subscriptions_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Fixed subscriptions table';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not fix subscriptions table: %', SQLERRM;
END $$;

-- 5. Fix profiles table (this is the one causing the current error)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Fixed profiles table';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not fix profiles table: %', SQLERRM;
END $$;

COMMIT;

-- Verify all constraints now have CASCADE (only for tables that exist)
SELECT 
    con.conname AS constraint_name,
    con.conrelid::regclass::text AS table_name,
    pg_get_constraintdef(con.oid) AS constraint_definition,
    CASE 
        WHEN pg_get_constraintdef(con.oid) LIKE '%ON DELETE CASCADE%' THEN '✓ CASCADE enabled'
        ELSE '✗ CASCADE NOT enabled'
    END AS status
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname IN ('bets', 'feedback', 'bet_templates', 'subscriptions', 'profiles')
    AND con.contype = 'f'
    AND (con.conname LIKE '%user_id_fkey' OR con.conname LIKE '%id_fkey')
ORDER BY rel.relname;

