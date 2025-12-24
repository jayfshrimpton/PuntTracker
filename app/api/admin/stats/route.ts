import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
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

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active subscriptions (Pro + Elite)
    const { data: activeSubscriptions } = await supabase
      .from('user_subscriptions')
      .select('tier, status')
      .in('status', ['active', 'trialing']);

    const proEliteCount = activeSubscriptions?.filter(
      sub => (sub.tier === 'pro' || sub.tier === 'elite') && sub.status === 'active'
    ).length || 0;

    // Get total bets
    const { count: totalBets } = await supabase
      .from('bets')
      .select('*', { count: 'exact', head: true });

    // Get tier breakdown
    const { data: allSubscriptions } = await supabase
      .from('user_subscriptions')
      .select('tier, status');

    const tierCounts = {
      free: allSubscriptions?.filter(s => s.tier === 'free').length || 0,
      pro: allSubscriptions?.filter(s => s.tier === 'pro').length || 0,
      elite: allSubscriptions?.filter(s => s.tier === 'elite').length || 0,
    };

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeSubscriptions: proEliteCount,
      totalBets: totalBets || 0,
      tierCounts,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

