-- Fix CASCADE DELETE on Foreign Keys
-- This script explicitly finds and updates each foreign key constraint
-- Run this in Supabase SQL Editor

-- Step 1: Check current constraints (for reference)
-- Uncomment the line below to see current constraints before making changes
-- SELECT tc.table_name, tc.constraint_name, rc.delete_rule
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.referential_constraints AS rc
--     ON rc.constraint_name = tc.constraint_name
--     AND rc.constraint_schema = tc.table_schema
-- JOIN information_schema.constraint_column_usage AS ccu
--     ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--     AND ccu.table_name = 'users'
--     AND ccu.table_schema = 'auth'
--     AND tc.table_schema = 'public';

-- Step 2: Drop and recreate constraints with CASCADE
-- This uses a DO block to dynamically find and update constraints

DO $$
DECLARE
    constraint_record RECORD;
    table_record RECORD;
    column_name_var TEXT;
BEGIN
    -- Loop through tables that have foreign keys to auth.users
    FOR table_record IN 
        SELECT DISTINCT tc.table_name, tc.table_schema
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = 'users'
            AND ccu.table_schema = 'auth'
            AND tc.table_schema = 'public'
    LOOP
        -- Get the column name for this table's foreign key
        SELECT kcu.column_name INTO column_name_var
        FROM information_schema.key_column_usage AS kcu
        JOIN information_schema.table_constraints AS tc
            ON kcu.constraint_name = tc.constraint_name
            AND kcu.table_schema = tc.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = table_record.table_name
            AND tc.table_schema = table_record.table_schema
            AND ccu.table_name = 'users'
            AND ccu.table_schema = 'auth'
        LIMIT 1;
        
        -- Find and drop all foreign key constraints for this table
        FOR constraint_record IN
            SELECT tc.constraint_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name = table_record.table_name
                AND tc.table_schema = table_record.table_schema
                AND ccu.table_name = 'users'
                AND ccu.table_schema = 'auth'
        LOOP
            -- Drop the constraint
            EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I CASCADE', 
                table_record.table_schema, 
                table_record.table_name, 
                constraint_record.constraint_name);
            
            RAISE NOTICE 'Dropped constraint % from table %', 
                constraint_record.constraint_name, 
                table_record.table_name;
        END LOOP;
        
        -- Recreate the constraint with ON DELETE CASCADE
        IF column_name_var IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.%I ADD CONSTRAINT %I_user_id_fkey FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE CASCADE',
                table_record.table_schema,
                table_record.table_name,
                table_record.table_name,
                column_name_var
            );
            
            RAISE NOTICE 'Created CASCADE constraint on table %.%', 
                table_record.table_schema, 
                table_record.table_name;
        END IF;
    END LOOP;
END $$;

-- Step 3: Verification - Check that all constraints now have CASCADE
SELECT 
    tc.table_name, 
    kcu.column_name, 
    tc.constraint_name,
    rc.delete_rule AS delete_action,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✓ CASCADE enabled'
        ELSE '✗ CASCADE NOT enabled - ' || rc.delete_rule
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

