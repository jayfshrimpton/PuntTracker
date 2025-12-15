-- Diagnostic Script - Check Current Constraint State
-- Run this FIRST to see what constraints exist and their current delete rules

SELECT 
    tc.table_schema,
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    rc.delete_rule AS current_delete_rule,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✓ Has CASCADE'
        WHEN rc.delete_rule = 'RESTRICT' THEN '✗ RESTRICT (blocks deletion)'
        WHEN rc.delete_rule = 'NO ACTION' THEN '✗ NO ACTION (blocks deletion)'
        WHEN rc.delete_rule = 'SET NULL' THEN '⚠ SET NULL'
        WHEN rc.delete_rule = 'SET DEFAULT' THEN '⚠ SET DEFAULT'
        ELSE '? Unknown: ' || rc.delete_rule
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

-- Also check if there are any constraints on the bets table specifically
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.bets'::regclass
    AND contype = 'f'
ORDER BY conname;

