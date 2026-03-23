# Onboarding & Early Insights Implementation

This document describes the implementation of the onboarding flow and early insights system designed to increase paid conversions through truthful data contrast.

## Database Schema

Run `onboarding-schema.sql` in your Supabase SQL Editor to add:
- `wants_truth` column to `profiles` table (stores user's response to permission question)
- `onboarding_completed` column to `profiles` table (tracks if onboarding is done)
- `user_insights` table (stores generated early insights)

## Components Created

### 1. RealityCheck (`components/onboarding/RealityCheck.tsx`)
- Shows belief-challenging statement: "Most punters think they're close to break even. 82% are down more than they realise."
- Asks permission question: "If we could show you exactly where your betting is leaking money — would you want to know?"
- Stores response in `profiles.wants_truth`
- If "No" → user skips advanced insights permanently
- If "Yes" → continues to show early insights

### 2. EarlyInsightCard (`components/onboarding/EarlyInsightCard.tsx`)
- Generates and displays ONE early insight from bet data
- Works with as few as 5 bets (or uses fallback logic)
- Shows cost of inaction calculation
- Paywalls the detailed answer behind Pro subscription
- Uses neutral, truthful language (no shaming, no hype)

### 3. Early Insights Utility (`lib/early-insights.ts`)
Generates insights in priority order:
1. **Stake Sizing**: If losing bets have higher average stake than winning bets
2. **Day of Week**: If a specific day shows negative ROI (≥3 bets, ≥5% negative ROI)
3. **Bet Type**: If a specific bet type shows negative P&L (≥3 bets)
4. **Fallback**: Generic insight about inconsistent stake sizing

## Dashboard Updates

The dashboard (`app/(main)/dashboard/page.tsx`) now:
1. Checks onboarding status on load
2. Shows `RealityCheck` component if onboarding not completed
3. Shows `EarlyInsightCard` if user wants truth and has bets
4. Hides `InsightsSection` (advanced insights) if user said "No" to truth question

## Key Features

### Language & Tone
- ✅ Never says "improve your betting" or "win more"
- ✅ Never shames the user
- ✅ Always externalizes the problem ("This pattern", "This habit", "This leak")
- ✅ Calm, neutral, truthful tone
- ✅ Slightly uncomfortable, never aggressive

### Cost of Inaction
- Calculates monthly loss projection: `average loss per bet × average bets per month`
- Rounds down to be conservative
- Shows contrast: "Doing nothing costs you about $X per month. Pro costs $10/month."

### Paywall Strategy
- Paywalls the ANSWER, not the feature
- Shows: "We've identified your biggest betting leak. Unlock Pro to see exactly what it is and how to fix it."
- No feature lists, no "advanced stats" mentions
- Defaults to Pro plan (no plan selection)

## User Flow

1. **First Login**: User sees `RealityCheck` onboarding screen
2. **User Response**:
   - **"Yes"**: Onboarding completes, user sees early insight when they have ≥5 bets
   - **"No"**: Onboarding completes, user sees basic dashboard only (no advanced insights)
3. **Early Insight Display**: 
   - Shows insight message
   - Shows cost of inaction
   - Shows paywalled answer section (if not Pro)
4. **Pro Upgrade**: Clicking "Upgrade to Pro" opens Stripe checkout for Pro plan

## Success Criteria

This implementation is successful if:
- ✅ Users reach an "aha / discomfort" moment within first session
- ✅ More users reach checkout (even if they don't convert yet)
- ✅ Users understand why they'd pay, not just what they get

## Notes

- All logic is client-side (no new API routes needed)
- Insights are stored in `user_insights` table for persistence
- Pro price ID: `price_1SZP2o4kQE4g2R11vjO4bw5Q` (from pricing page)
- Display shows "$10/month" as per requirements (actual Stripe price may differ)

