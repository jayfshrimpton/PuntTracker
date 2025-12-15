-- Force Fix CASCADE DELETE - Most Aggressive Approach
-- This script will find and fix ALL foreign key constraints to auth.users
-- Run this in Supabase SQL Editor

-- Step 1: Check what we're about to fix
SELECT 
    tc.table_name, 
    tc.constraint_name,
    rc.delete_rule AS before_fix
FROM information_schema.table_constraints AS tc 
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'auth'
    AND tc.table_schema = 'public';

-- Step 2: Fix all constraints using pg_constraint system catalog
-- This is more direct than information_schema

DO $$
DECLARE
    constraint_rec RECORD;
    table_oid_var OID;
    constraint_def TEXT;
    new_constraint_def TEXT;
    table_name_var TEXT;
    column_name_var TEXT;
BEGIN
    -- Loop through all foreign key constraints referencing auth.users
    FOR constraint_rec IN
        SELECT 
            con.conname AS constraint_name,
            con.conrelid::regclass::text AS table_name,
            con.oid AS constraint_oid,
            pg_get_constraintdef(con.oid) AS constraint_def,
            a.attname AS column_name
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
        JOIN pg_constraint con_fk ON con_fk.oid = con.oid
        JOIN pg_class rel_fk ON rel_fk.oid = con_fk.confrelid
        JOIN pg_namespace nsp_fk ON nsp_fk.oid = rel_fk.relnamespace
        WHERE con.contype = 'f'  -- Foreign key constraint
            AND nsp.nspname = 'public'
            AND nsp_fk.nspname = 'auth'
            AND rel_fk.relname = 'users'
            AND con.confdeltype != 'c'  -- Only fix ones that don't have CASCADE ('c')
    LOOP
        BEGIN
            -- Extract table and column info
            table_name_var := constraint_rec.table_name;
            column_name_var := constraint_rec.column_name;
            
            -- Drop the constraint
            EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I CASCADE', 
                table_name_var, 
                constraint_rec.constraint_name);
            
            -- Recreate with CASCADE
            EXECUTE format(
                'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE CASCADE',
                table_name_var,
                constraint_rec.constraint_name,
                column_name_var
            );
            
            RAISE NOTICE 'Fixed constraint % on table %', 
                constraint_rec.constraint_name, 
                table_name_var;
                
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to fix constraint % on table %: %', 
                constraint_rec.constraint_name, 
                table_name_var, 
                SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 3: Verify the fix worked
SELECT 
    tc.table_name, 
    tc.constraint_name,
    rc.delete_rule AS after_fix,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✓ FIXED - CASCADE enabled'
        ELSE '✗ STILL BROKEN - ' || rc.delete_rule
    END AS status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'auth'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

