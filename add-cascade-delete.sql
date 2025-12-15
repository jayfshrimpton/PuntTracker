-- Add CASCADE DELETE to Foreign Keys
-- This migration adds ON DELETE CASCADE to all foreign keys referencing auth.users
-- This allows users to be deleted from auth.users, and all their associated data
-- will be automatically deleted from related tables.
-- 
-- Run this in Supabase SQL Editor

-- This script dynamically finds and updates all foreign key constraints
-- that reference auth.users to add ON DELETE CASCADE

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop through all foreign key constraints that reference auth.users
    FOR r IN 
        SELECT 
            tc.table_schema, 
            tc.table_name, 
            kcu.column_name, 
            tc.constraint_name
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
        -- Drop the existing constraint
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I', 
            r.table_schema, r.table_name, r.constraint_name);
        
        -- Recreate the constraint with ON DELETE CASCADE
        EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE CASCADE', 
            r.table_schema, r.table_name, r.constraint_name, r.column_name);
        
        RAISE NOTICE 'Updated constraint % on table %.%', r.constraint_name, r.table_schema, r.table_name;
    END LOOP;
END $$;

-- Verification query - Run this to verify all constraints now have CASCADE delete
-- All delete_rule values should be 'CASCADE'
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    rc.delete_rule,
    tc.constraint_name
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

