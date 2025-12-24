import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify admin access
    if (!(await verifyAdminSession(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service client to bypass RLS for admin access
    let supabase: ReturnType<typeof createServiceClient>;
    try {
      supabase = createServiceClient();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
          details: 'This is required for admin operations.'
        },
        { status: 500 }
      );
    }
    const userId = params.userId;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get bets count
    const { count: betsCount } = await supabase
      .from('bets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get bets per month
    const { data: bets } = await supabase
      .from('bets')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Calculate bets per month
    const betsPerMonth: Record<string, number> = {};
    bets?.forEach((bet) => {
      const date = new Date(bet.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      betsPerMonth[monthKey] = (betsPerMonth[monthKey] || 0) + 1;
    });

    // Get recent bets
    const { data: recentBets } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get usage stats
    const { data: usageStats } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('period_start', { ascending: false })
      .limit(12);

    return NextResponse.json({
      profile,
      subscription: subscription || null,
      stats: {
        totalBets: betsCount || 0,
        betsPerMonth,
        usageStats: usageStats || [],
      },
      recentBets: recentBets || [],
    });
  } catch (error) {
    console.error('Admin user detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

