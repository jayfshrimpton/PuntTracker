import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export const getSubscription = cache(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*, prices(*, products(*))')
        .in('status', ['trialing', 'active'])
        .eq('user_id', user.id)
        .single();

    return subscription;
});

export const getSubscriptionStatus = cache(async () => {
    const subscription = await getSubscription();
    return subscription ? subscription.status : 'none';
});

export const checkFeatureAccess = cache(async (feature: 'unlimited_bets' | 'ai_insights') => {
    const subscription = await getSubscription();

    // Define tiers and their features
    // This could be moved to a config or database
    const tiers = {
        free: {
            unlimited_bets: false,
            ai_insights: false,
        },
        pro: {
            unlimited_bets: true,
            ai_insights: true,
        },
        elite: {
            unlimited_bets: true,
            ai_insights: true,
        }
    };

    // If no subscription, assume free tier
    if (!subscription) {
        // Check if we need to enforce limits for free users
        if (feature === 'unlimited_bets') {
            // We need to check bet count for free users
            // This logic might need to be elsewhere or we return false here and caller checks count
            return false;
        }
        return false;
    }

    // Map price/product to tier
    // For now, let's assume we can determine tier from price metadata or product metadata
    // Or we just check if subscription is active

    // Simple check: if active subscription, allow everything for now (Pro)
    // We need to refine this based on actual products
    return true;
});
