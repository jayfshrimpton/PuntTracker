-- Direct Fix for CASCADE DELETE - Most Reliable Method
-- This script finds the actual constraint names and fixes them
-- Run this in Supabase SQL Editor

-- Step 1: First, let's see what constraints exist (for debugging)
-- Run this query first to see the actual constraint names:
/*
SELECT 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    rc.delete_rule
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
    AND tc.table_schema = 'public';
*/

-- Step 2: Drop and recreate each constraint
-- This uses a transaction to ensure all-or-nothing

BEGIN;

-- Function to drop and recreate a constraint with CASCADE
CREATE OR REPLACE FUNCTION fix_fk_cascade(
    p_table_schema TEXT,
    p_table_name TEXT,
    p_column_name TEXT,
    p_constraint_name TEXT
) RETURNS void AS $$
BEGIN
    -- Drop the constraint
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I CASCADE', 
        p_table_schema, p_table_name, p_constraint_name);
    
    -- Recreate with CASCADE
    EXECUTE format(
        'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE CASCADE',
        p_table_schema, p_table_name, p_constraint_name, p_column_name
    );
    
    RAISE NOTICE 'Fixed constraint % on table %', p_constraint_name, p_table_name;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not fix constraint % on table %: %', p_constraint_name, p_table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Fix all constraints
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
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
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = 'users'
            AND ccu.table_schema = 'auth'
            AND tc.table_schema = 'public'
    LOOP
        PERFORM fix_fk_cascade(
            r.table_schema,
            r.table_name,
            r.column_name,
            r.constraint_name
        );
    END LOOP;
END $$;

-- Clean up the helper function
DROP FUNCTION IF EXISTS fix_fk_cascade(TEXT, TEXT, TEXT, TEXT);

COMMIT;

-- Step 3: Verification - All should show 'CASCADE' now
SELECT 
    tc.table_name, 
    kcu.column_name, 
    tc.constraint_name,
    rc.delete_rule,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✓ CASCADE enabled'
        ELSE '✗ PROBLEM: ' || rc.delete_rule
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
ORDER BY tc.table_name;

