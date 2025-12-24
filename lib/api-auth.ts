import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserSubscription, SubscriptionTier, UserSubscription } from '@/lib/subscription-guard';

export interface SubscriptionErrorResponse {
  error: string;
  message: string;
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  upgradeUrl: string;
  code: string;
}

/**
 * Wraps an API route handler to check authentication and subscription tier
 * @param allowedTiers - Array of subscription tiers that can access this route
 * @param handler - The route handler function
 * @returns Wrapped route handler
 */
export function withSubscriptionCheck(
  allowedTiers: SubscriptionTier[],
  handler: (req: NextRequest, subscription: UserSubscription, userId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Check authentication
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'You must be logged in to access this resource',
            code: 'UNAUTHORIZED',
          },
          { status: 401 }
        );
      }

      // Get user subscription
      const subscription = await getUserSubscription(user.id);

      // Check if subscription is active
      if (!subscription.isActive && subscription.status !== 'trialing') {
        return NextResponse.json<SubscriptionErrorResponse>(
          {
            error: 'Subscription inactive',
            message: `Your subscription is ${subscription.status}. Please reactivate your subscription to access this feature.`,
            currentTier: subscription.tier,
            requiredTier: allowedTiers[0],
            upgradeUrl: '/pricing',
            code: 'SUBSCRIPTION_INACTIVE',
          },
          { status: 402 }
        );
      }

      // Check if user's tier is allowed
      if (!allowedTiers.includes(subscription.tier)) {
        const highestRequiredTier = allowedTiers[0]; // Assuming first tier is the minimum required
        
        return NextResponse.json<SubscriptionErrorResponse>(
          {
            error: 'Feature not available',
            message: `This feature requires ${highestRequiredTier === 'pro' ? 'Pro' : 'Elite'} tier subscription`,
            currentTier: subscription.tier,
            requiredTier: highestRequiredTier,
            upgradeUrl: '/pricing',
            code: 'FEATURE_LOCKED',
          },
          { status: 403 }
        );
      }

      // Call the handler with subscription context
      return await handler(req, subscription, user.id);
    } catch (error) {
      console.error('API Auth Error:', error);
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Wraps an API route handler to check authentication only (no subscription check)
 * @param handler - The route handler function
 * @returns Wrapped route handler
 */
export function withAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'You must be logged in to access this resource',
            code: 'UNAUTHORIZED',
          },
          { status: 401 }
        );
      }

      return await handler(req, user.id);
    } catch (error) {
      console.error('API Auth Error:', error);
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

