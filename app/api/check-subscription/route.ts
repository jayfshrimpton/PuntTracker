import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { getUserSubscription } from '@/lib/subscription-guard';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const subscription = await getUserSubscription(userId);

    return NextResponse.json({
      tier: subscription.tier,
      status: subscription.status,
      isActive: subscription.isActive,
      features: subscription.features,
      specialPricing: subscription.specialPricing,
      currentPrice: subscription.currentPrice,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
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

