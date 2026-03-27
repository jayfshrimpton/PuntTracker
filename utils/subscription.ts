import { createClient } from '@/lib/supabase/server';
import { priceIdToTier } from '@/lib/stripe/price-tier';
import { cache } from 'react';

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

    const mapped = priceIdToTier(subscription.price_id);
    return mapped ?? 'free';
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
