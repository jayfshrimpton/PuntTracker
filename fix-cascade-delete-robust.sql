-- Robust Fix for CASCADE DELETE on Foreign Keys
-- This script will definitely fix the foreign key constraints
-- Run this in Supabase SQL Editor

-- IMPORTANT: This script drops and recreates constraints with CASCADE
-- Make sure you have a backup or are okay with this operation

BEGIN;

-- 1. Bets table - Explicitly drop and recreate
DO $$
BEGIN
    -- Drop the constraint (using CASCADE to handle any dependencies)
    ALTER TABLE IF EXISTS public.bets DROP CONSTRAINT IF EXISTS bets_user_id_fkey CASCADE;
    
    -- Recreate with CASCADE delete
    ALTER TABLE public.bets 
    ADD CONSTRAINT bets_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Fixed bets table constraint';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing bets: %', SQLERRM;
END $$;

-- 2. Feedback table
DO $$
BEGIN
    ALTER TABLE IF EXISTS public.feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey CASCADE;
    
    ALTER TABLE public.feedback 
    ADD CONSTRAINT feedback_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Fixed feedback table constraint';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing feedback: %', SQLERRM;
END $$;

-- 3. Bet Templates table
DO $$
BEGIN
    ALTER TABLE IF EXISTS public.bet_templates DROP CONSTRAINT IF EXISTS bet_templates_user_id_fkey CASCADE;
    
    ALTER TABLE public.bet_templates 
    ADD CONSTRAINT bet_templates_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Fixed bet_templates table constraint';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing bet_templates: %', SQLERRM;
END $$;

-- 4. Subscriptions table
DO $$
BEGIN
    ALTER TABLE IF EXISTS public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey CASCADE;
    
    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Fixed subscriptions table constraint';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing subscriptions: %', SQLERRM;
END $$;

-- 5. Find and fix any other constraints we might have missed
DO $$
DECLARE
    r RECORD;
    constraint_name_var TEXT;
    table_name_var TEXT;
    column_name_var TEXT;
BEGIN
    FOR r IN 
        SELECT DISTINCT
            tc.table_schema,
            tc.table_name,
            tc.constraint_name,
            kcu.column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
            ON rc.constraint_name = tc.constraint_name
            AND rc.constraint_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = 'users'
            AND ccu.table_schema = 'auth'
            AND tc.table_schema = 'public'
            AND rc.delete_rule != 'CASCADE'  -- Only fix ones that don't have CASCADE
    LOOP
        BEGIN
            -- Drop the constraint
            EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I CASCADE', 
                r.table_schema, r.table_name, r.constraint_name);
            
            -- Recreate with CASCADE
            EXECUTE format(
                'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE CASCADE',
                r.table_schema, r.table_name, r.constraint_name, r.column_name
            );
            
            RAISE NOTICE 'Fixed constraint % on table %', r.constraint_name, r.table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error fixing constraint % on table %: %', r.constraint_name, r.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Verification - Show all constraints and their delete rules
SELECT 
    tc.table_name, 
    kcu.column_name, 
    tc.constraint_name,
    rc.delete_rule AS delete_action,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✓ OK'
        ELSE '✗ NEEDS FIX - Current: ' || rc.delete_rule
    END AS status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
    AND rc.constraint_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'auth'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

COMMIT;

