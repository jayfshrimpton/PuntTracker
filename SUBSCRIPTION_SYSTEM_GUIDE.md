# Subscription Feature Gating System Guide

This document describes the comprehensive subscription feature gating system implemented for PuntTracker.

## Overview

The system provides:
- Tier-based feature access (Free, Pro, Elite)
- Usage rate limiting (monthly/daily limits)
- API route protection
- Frontend component gating
- Consistent error handling

## Database Schema

### 1. user_subscriptions Table

Run `user-subscriptions-schema.sql` in your Supabase SQL Editor to create the table.

**Columns:**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users, unique)
- `tier` (text: 'free', 'pro', 'elite')
- `status` (text: 'active', 'canceled', 'past_due', 'trialing', etc.)
- `stripe_customer_id` (text, nullable)
- `stripe_subscription_id` (text, nullable)
- `special_pricing` (text, nullable: 'beta_tester', 'founding_member', 'influencer')
- `current_price` (numeric, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. usage_tracking Table

Run `usage-tracking-schema.sql` in your Supabase SQL Editor to create the table.

**Columns:**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `resource_type` (text: 'bet', 'ai_insight', 'export')
- `count` (integer)
- `period_start` (date)
- `period_end` (date)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Feature Limits by Tier

### Free Tier
- **Bets**: 50 per month
- **AI Insights**: 0 per day (no access)
- **Advanced Stats**: ❌
- **Export Data**: ❌
- **Venue Breakdown**: ❌
- **Bankroll Tools**: ❌

### Pro Tier
- **Bets**: Unlimited
- **AI Insights**: 50 per day
- **Advanced Stats**: ✅
- **Export Data**: ✅
- **Venue Breakdown**: ✅
- **Bankroll Tools**: ✅

### Elite Tier
- **Bets**: Unlimited
- **AI Insights**: Unlimited
- **Advanced Stats**: ✅
- **Export Data**: ✅
- **Venue Breakdown**: ✅
- **Bankroll Tools**: ✅

## API Routes

### Protected Routes

#### 1. `/api/bets` (POST)
- **Access**: All tiers (with limits for free)
- **Free Limit**: 50 bets per month
- **Returns**: 402 Payment Required if limit exceeded

#### 2. `/api/insights` (POST)
- **Access**: Pro, Elite only
- **Pro Limit**: 50 insights per day
- **Elite Limit**: Unlimited
- **Returns**: 403 Forbidden if wrong tier, 402 if limit exceeded

#### 3. `/api/bets/export` (GET)
- **Access**: Pro, Elite only
- **Formats**: CSV, JSON
- **Returns**: 403 Forbidden if wrong tier

#### 4. `/api/stats/advanced` (GET)
- **Access**: Pro, Elite only
- **Returns**: Advanced statistics with venue breakdown, bet type breakdown, monthly breakdown
- **Returns**: 403 Forbidden if wrong tier

#### 5. `/api/check-subscription` (GET)
- **Access**: Authenticated users
- **Returns**: Current subscription tier and status

## Usage

### Backend: Protecting API Routes

```typescript
import { withSubscriptionCheck } from '@/lib/api-auth';

export const POST = withSubscriptionCheck(['pro', 'elite'], async (
  req: NextRequest,
  subscription: UserSubscription,
  userId: string
) => {
  // This only runs if user has pro or elite tier
  // subscription object is passed automatically
  // userId is also available
});
```

### Backend: Checking Usage Limits

```typescript
import { getUserSubscription, checkUsageLimit, incrementUsage } from '@/lib/subscription-guard';

const subscription = await getUserSubscription(userId);
const usageCheck = await checkUsageLimit(userId, subscription, 'bet', 'month');

if (!usageCheck.canProceed) {
  return NextResponse.json({ error: 'Limit exceeded' }, { status: 402 });
}

// After successful operation
await incrementUsage(userId, 'bet', 'month', 1);
```

### Frontend: Using FeatureGate Component

```tsx
import { FeatureGate } from '@/components/FeatureGate';

<FeatureGate requiredTier="pro" featureName="Advanced Stats">
  <AdvancedStatsComponent />
</FeatureGate>
```

### Frontend: Using UpgradePrompt Component

```tsx
import { UpgradePrompt } from '@/components/UpgradePrompt';

<UpgradePrompt
  featureName="AI Insights"
  requiredTier="pro"
  currentTier="free"
  currentUsage={45}
  limit={50}
  variant="compact"
/>
```

## Error Response Format

All protected API routes return consistent error format:

```json
{
  "error": "Feature not available",
  "message": "AI Insights require Pro or Elite tier",
  "currentTier": "free",
  "requiredTier": "pro",
  "upgradeUrl": "/pricing",
  "code": "FEATURE_LOCKED"
}
```

**HTTP Status Codes:**
- `401`: Unauthorized (not logged in)
- `402`: Payment Required (limit exceeded or subscription inactive)
- `403`: Forbidden (wrong tier)
- `500`: Internal Server Error

## Caching

Subscription data is cached for 5 minutes to reduce database calls. The cache is automatically cleared when needed.

## Testing Checklist

### Free Tier Tests
- [ ] Can create up to 50 bets per month
- [ ] Cannot create bet after 50 bets (returns 402)
- [ ] Cannot access AI Insights (returns 403)
- [ ] Cannot access export feature (returns 403)
- [ ] Cannot access advanced stats (returns 403)
- [ ] Usage tracking increments correctly

### Pro Tier Tests
- [ ] Can create unlimited bets
- [ ] Can access AI Insights (up to 50 per day)
- [ ] Cannot access AI Insights after 50 per day (returns 402)
- [ ] Can access export feature
- [ ] Can access advanced stats
- [ ] Usage tracking increments correctly

### Elite Tier Tests
- [ ] Can create unlimited bets
- [ ] Can access unlimited AI Insights
- [ ] Can access export feature
- [ ] Can access advanced stats
- [ ] Usage tracking increments correctly

### Edge Cases
- [ ] Inactive subscription (canceled, past_due) returns 402
- [ ] Trialing subscription has access
- [ ] Cache invalidation works correctly
- [ ] Monthly limits reset at start of new month
- [ ] Daily limits reset at start of new day

## Migration Notes

1. Run both SQL schema files in Supabase SQL Editor
2. Create default free subscriptions for existing users (optional):
   ```sql
   INSERT INTO user_subscriptions (user_id, tier, status)
   SELECT id, 'free', 'active' FROM auth.users
   ON CONFLICT (user_id) DO NOTHING;
   ```
3. Update existing API routes to use new protection system
4. Update frontend components to use FeatureGate where needed

## Files Created

### Backend
- `lib/subscription-guard.ts` - Core subscription logic
- `lib/api-auth.ts` - API route protection wrappers
- `app/api/bets/route.ts` - Bet creation with limits
- `app/api/bets/export/route.ts` - Export feature
- `app/api/stats/advanced/route.ts` - Advanced stats
- `app/api/check-subscription/route.ts` - Subscription status endpoint
- `app/api/insights/route.ts` - Updated with new system

### Frontend
- `components/UpgradePrompt.tsx` - Upgrade prompt component
- `components/FeatureGate.tsx` - Feature gating component

### Database
- `user-subscriptions-schema.sql` - Subscription table schema
- `usage-tracking-schema.sql` - Usage tracking table schema

## Next Steps

1. Run the SQL schema files in Supabase
2. Update Stripe webhook to sync subscription data to `user_subscriptions` table
3. Test all protected routes with different subscription tiers
4. Add frontend components to UI where features are gated
5. Monitor usage tracking to ensure limits are working correctly

