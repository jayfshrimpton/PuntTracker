import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

// Price IDs for each tier (from Stripe)
const PRO_PRICE_ID = 'price_1SZVqG7Uv9v0RZydSebiiCsw';
const ELITE_PRICE_ID = 'price_1SZVQM7Uv9v0RZydzVRWIcPs';

export type SubscriptionTier = 'free' | 'pro' | 'elite';

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

export const getSubscriptionTier = cache(async (): Promise<SubscriptionTier> => {
    const subscription = await getSubscription();

    if (!subscription) {
        return 'free';
    }

    const priceId = subscription.price_id;

    if (priceId === ELITE_PRICE_ID) {
        return 'elite';
    } else if (priceId === PRO_PRICE_ID) {
        return 'pro';
    }

    // Default to free if price ID doesn't match known tiers
    return 'free';
});

export const getSubscriptionStatus = cache(async () => {
    const subscription = await getSubscription();
    return subscription ? subscription.status : 'none';
});

export const checkFeatureAccess = cache(async (
    feature: 'unlimited_bets' | 'ai_insights' | 'csv_import_export'
): Promise<boolean> => {
    const tier = await getSubscriptionTier();

    // Define tiers and their features
    const tiers: Record<SubscriptionTier, Record<string, boolean>> = {
        free: {
            unlimited_bets: true,
            ai_insights: true, // Enabled for Beta
            csv_import_export: true,
        },
        pro: {
            unlimited_bets: true,
            ai_insights: true, // Enabled for Beta
            csv_import_export: true,
        },
        elite: {
            unlimited_bets: true,
            ai_insights: true,
            csv_import_export: true,
        }
    };

    return tiers[tier][feature] || false;
});
