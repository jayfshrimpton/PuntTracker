import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export type SubscriptionTier = 'free' | 'pro' | 'elite';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused';
export type SpecialPricing = 'beta_tester' | 'founding_member' | 'influencer';

export interface SubscriptionFeatures {
  maxBetsPerMonth: number;
  aiInsightsPerDay: number;
  advancedStats: boolean;
  exportData: boolean;
  venueBreakdown: boolean;
  bankrollTools: boolean;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  features: SubscriptionFeatures;
  canAccess: (feature: string) => boolean;
  isActive: boolean;
  specialPricing?: SpecialPricing;
  currentPrice?: number;
}

// Feature definitions per tier
const TIER_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    maxBetsPerMonth: 50,
    aiInsightsPerDay: 0,
    advancedStats: false,
    exportData: false,
    venueBreakdown: false,
    bankrollTools: false,
  },
  pro: {
    maxBetsPerMonth: -1, // -1 means unlimited
    aiInsightsPerDay: 50,
    advancedStats: true,
    exportData: true,
    venueBreakdown: true,
    bankrollTools: true,
  },
  elite: {
    maxBetsPerMonth: -1, // -1 means unlimited
    aiInsightsPerDay: -1, // -1 means unlimited
    advancedStats: true,
    exportData: true,
    venueBreakdown: true,
    bankrollTools: true,
  },
};

// Feature access map
const FEATURE_ACCESS: Record<string, SubscriptionTier[]> = {
  'bets': ['free', 'pro', 'elite'],
  'bets_unlimited': ['pro', 'elite'],
  'ai_insights': ['pro', 'elite'],
  'ai_insights_unlimited': ['elite'],
  'advanced_stats': ['pro', 'elite'],
  'export_data': ['pro', 'elite'],
  'venue_breakdown': ['pro', 'elite'],
  'bankroll_tools': ['pro', 'elite'],
};

// Cache for subscription data (5 minutes)
const subscriptionCache = new Map<string, { data: UserSubscription; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetches user's subscription from Supabase with caching
 * @param userId - The user ID to fetch subscription for
 * @returns Subscription object with helper methods
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  // Check cache first
  const cached = subscriptionCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const supabase = createClient();
  
  // Fetch subscription from database
  const { data: subscription, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Default to free tier if no subscription found or error occurred
  // PGRST116 is the error code when no rows are found
  const tier: SubscriptionTier = (error && error.code !== 'PGRST116') 
    ? 'free' // If there's a real error (not just "no rows"), default to free
    : (subscription?.tier || 'free');
  const status: SubscriptionStatus = subscription?.status || 'active';
  const isActive = status === 'active' || status === 'trialing';

  // Get features for this tier
  const features = { ...TIER_FEATURES[tier] };

  // Create subscription object with helper methods
  const subscriptionObj: UserSubscription = {
    tier,
    status,
    features,
    isActive,
    specialPricing: subscription?.special_pricing as SpecialPricing | undefined,
    currentPrice: subscription?.current_price ? Number(subscription.current_price) : undefined,
    canAccess: (feature: string) => {
      const allowedTiers = FEATURE_ACCESS[feature] || [];
      return allowedTiers.includes(tier);
    },
  };

  // Cache the result
  subscriptionCache.set(userId, {
    data: subscriptionObj,
    timestamp: Date.now(),
  });

  return subscriptionObj;
}

/**
 * Clears the subscription cache for a user (useful after subscription updates)
 * @param userId - The user ID to clear cache for
 */
export function clearSubscriptionCache(userId: string): void {
  subscriptionCache.delete(userId);
}

/**
 * Gets the current usage count for a resource type in the current period
 * @param userId - The user ID
 * @param resourceType - The resource type ('bet', 'ai_insight', 'export')
 * @param periodType - 'month' for monthly limits, 'day' for daily limits
 * @returns Current usage count
 */
export async function getCurrentUsage(
  userId: string,
  resourceType: 'bet' | 'ai_insight' | 'export',
  periodType: 'month' | 'day' = 'month'
): Promise<number> {
  const supabase = createClient();
  const now = new Date();
  
  let periodStart: Date;
  let periodEnd: Date;
  
  if (periodType === 'month') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    // For daily, use the date only (time doesn't matter for period boundaries)
    periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const { data: usage, error } = await supabase
    .from('usage_tracking')
    .select('count')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .eq('period_start', periodStart.toISOString().split('T')[0])
    .single();

  if (error || !usage) {
    return 0;
  }

  return usage.count || 0;
}

/**
 * Increments usage count for a resource type
 * @param userId - The user ID
 * @param resourceType - The resource type ('bet', 'ai_insight', 'export')
 * @param periodType - 'month' for monthly limits, 'day' for daily limits
 * @param amount - Amount to increment (default: 1)
 */
export async function incrementUsage(
  userId: string,
  resourceType: 'bet' | 'ai_insight' | 'export',
  periodType: 'month' | 'day' = 'month',
  amount: number = 1
): Promise<void> {
  const supabase = createClient();
  const now = new Date();
  
  let periodStart: Date;
  let periodEnd: Date;
  
  if (periodType === 'month') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    // For daily, use the date only (time doesn't matter for period boundaries)
    periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const periodStartStr = periodStart.toISOString().split('T')[0];
  const periodEndStr = periodEnd.toISOString().split('T')[0];

  // Try to update existing record
  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('id, count')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .eq('period_start', periodStartStr)
    .single();

  if (existing) {
    // Update existing record
    await supabase
      .from('usage_tracking')
      .update({ count: (existing.count || 0) + amount })
      .eq('id', existing.id);
  } else {
    // Insert new record
    await supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        resource_type: resourceType,
        count: amount,
        period_start: periodStartStr,
        period_end: periodEndStr,
      });
  }
}

/**
 * Checks if user can perform an action based on their subscription and usage
 * @param userId - The user ID
 * @param subscription - The user's subscription object
 * @param resourceType - The resource type to check
 * @param periodType - 'month' for monthly limits, 'day' for daily limits
 * @returns Object with canProceed flag and current usage info
 */
export async function checkUsageLimit(
  userId: string,
  subscription: UserSubscription,
  resourceType: 'bet' | 'ai_insight' | 'export',
  periodType: 'month' | 'day' = 'month'
): Promise<{ canProceed: boolean; currentUsage: number; limit: number; remaining: number }> {
  let limit: number;
  
  if (resourceType === 'bet') {
    limit = subscription.features.maxBetsPerMonth;
  } else if (resourceType === 'ai_insight') {
    limit = subscription.features.aiInsightsPerDay;
  } else {
    // Export doesn't have a count limit, just access control
    return {
      canProceed: subscription.features.exportData,
      currentUsage: 0,
      limit: -1,
      remaining: -1,
    };
  }

  // Unlimited access
  if (limit === -1) {
    return {
      canProceed: true,
      currentUsage: 0,
      limit: -1,
      remaining: -1,
    };
  }

  const currentUsage = await getCurrentUsage(userId, resourceType, periodType);
  const remaining = Math.max(0, limit - currentUsage);

  return {
    canProceed: currentUsage < limit,
    currentUsage,
    limit,
    remaining,
  };
}

