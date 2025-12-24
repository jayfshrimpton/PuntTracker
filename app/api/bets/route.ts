import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/api-auth';
import { getUserSubscription, checkUsageLimit, incrementUsage } from '@/lib/subscription-guard';

export const dynamic = 'force-dynamic';

interface BetInput {
  race_name?: string | null;
  horse_name: string;
  bet_type: string;
  price: number;
  stake: number;
  finishing_position?: number | null;
  profit_loss?: number | null;
  bet_date: string;
  selections?: Record<string, unknown> | null;
  exotic_numbers?: string | null;
  num_legs?: number | null;
  description?: string | null;
  notes?: string | null;
  strategy_tags?: string[] | null;
  venue?: string | null;
  race_number?: number | null;
  race_class?: string | null;
  best_starting_price?: number | null;
}

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body: BetInput = await req.json();

    // Validate required fields
    if (!body.horse_name || !body.bet_type || body.price === undefined || body.stake === undefined || !body.bet_date) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Missing required fields: horse_name, bet_type, price, stake, bet_date',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Get user subscription
    const subscription = await getUserSubscription(userId);

    // Check bet limit for free tier
    if (subscription.tier === 'free') {
      const usageCheck = await checkUsageLimit(userId, subscription, 'bet', 'month');
      
      if (!usageCheck.canProceed) {
        return NextResponse.json(
          {
            error: 'Monthly limit exceeded',
            message: `You've reached your monthly limit of ${usageCheck.limit} bets. Upgrade to Pro or Elite for unlimited bets.`,
            currentTier: subscription.tier,
            requiredTier: 'pro' as const,
            upgradeUrl: '/pricing',
            code: 'LIMIT_EXCEEDED',
            currentUsage: usageCheck.currentUsage,
            limit: usageCheck.limit,
          },
          { status: 402 }
        );
      }
    }

    // Create the bet
    const supabase = createClient();
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert({
        ...body,
        user_id: userId,
      })
      .select()
      .single();

    if (betError) {
      console.error('Error creating bet:', betError);
      return NextResponse.json(
        {
          error: 'Database error',
          message: betError.message,
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }

    // Increment usage tracking for free tier
    if (subscription.tier === 'free') {
      await incrementUsage(userId, 'bet', 'month', 1);
    }

    return NextResponse.json(
      { data: bet, message: 'Bet created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
});

