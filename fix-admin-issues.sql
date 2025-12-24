-- SQL Commands to Fix Admin Dashboard Issues
-- Run these in Supabase SQL Editor

-- 1. Check your current subscription status
-- Replace 'YOUR_USER_ID' with your actual user ID (you can find it in the admin dashboard URL or auth.users table)
SELECT 
    us.user_id,
    p.email,
    p.full_name,
    us.tier,
    us.status,
    us.current_price,
    us.special_pricing,
    us.created_at,
    us.updated_at
FROM user_subscriptions us
LEFT JOIN profiles p ON p.id = us.user_id
WHERE us.user_id = 'YOUR_USER_ID'  -- Replace with your user ID
ORDER BY us.updated_at DESC;

-- 2. Check all active subscriptions that are contributing to MRR
-- This shows all subscriptions that would be counted in MRR calculation
SELECT 
    us.user_id,
    p.email,
    p.full_name,
    us.tier,
    us.status,
    us.current_price,
    us.special_pricing,
    CASE 
        WHEN us.current_price IS NOT NULL THEN us.current_price
        WHEN us.tier = 'pro' THEN 29.99
        WHEN us.tier = 'elite' THEN 49.99
        ELSE 0
    END AS calculated_mrr_contribution
FROM user_subscriptions us
LEFT JOIN profiles p ON p.id = us.user_id
WHERE us.status IN ('active', 'trialing')
    AND us.tier IN ('pro', 'elite')
ORDER BY calculated_mrr_contribution DESC;

-- 3. Fix your subscription if it's showing as elite/pro when it should be free
-- Replace 'YOUR_USER_ID' with your actual user ID
UPDATE user_subscriptions
SET 
    tier = 'free',
    status = 'active',
    current_price = NULL,
    special_pricing = NULL,
    updated_at = NOW()
WHERE user_id = 'YOUR_USER_ID';  -- Replace with your user ID

-- 4. Check all users in the system (to verify you can see them after the code fix)
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.created_at,
    COALESCE(us.tier, 'free') as tier,
    COALESCE(us.status, 'active') as status
FROM profiles p
LEFT JOIN user_subscriptions us ON us.user_id = p.id
ORDER BY p.created_at DESC;

-- 5. Count total users vs visible users
SELECT 
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM user_subscriptions WHERE tier = 'free') as free_users,
    (SELECT COUNT(*) FROM user_subscriptions WHERE tier = 'pro' AND status = 'active') as active_pro_users,
    (SELECT COUNT(*) FROM user_subscriptions WHERE tier = 'elite' AND status = 'active') as active_elite_users;

-- 6. Find your user ID by email (if you don't know it)
-- Replace 'your-email@example.com' with your actual email
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as auth_created_at,
    p.full_name,
    p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'your-email@example.com';  -- Replace with your email

-- 7. Verify RLS policies allow service role to access profiles
-- This should show that service role bypasses RLS (which is the default)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 8. Check if there are any orphaned subscriptions (subscriptions without profiles)
SELECT 
    us.user_id,
    us.tier,
    us.status,
    us.current_price,
    us.created_at
FROM user_subscriptions us
LEFT JOIN profiles p ON p.id = us.user_id
WHERE p.id IS NULL;

