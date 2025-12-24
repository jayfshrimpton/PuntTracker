import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { clearSubscriptionCache } from '@/lib/subscription-guard';

export const dynamic = 'force-dynamic';

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    // Clear the subscription cache for this user
    clearSubscriptionCache(userId);

    return NextResponse.json({
      success: true,
      message: 'Subscription cache cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing subscription cache:', error);
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

