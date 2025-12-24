import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    const supabase = createClient();

    // Get signups per day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    const signupsPerDay: Record<string, number> = {};
    profiles?.forEach((profile) => {
      const date = new Date(profile.created_at).toISOString().split('T')[0];
      signupsPerDay[date] = (signupsPerDay[date] || 0) + 1;
    });

    // Get MRR over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('tier, current_price, created_at, updated_at, status')
      .in('tier', ['pro', 'elite'])
      .eq('status', 'active')
      .gte('created_at', sixMonthsAgo.toISOString());

    const defaultPrices = {
      pro: 29.99,
      elite: 49.99,
    };

    // Calculate MRR per month
    const mrrOverTime: Record<string, number> = {};
    subscriptions?.forEach((sub) => {
      const date = new Date(sub.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const price = sub.current_price 
        ? Number(sub.current_price) 
        : defaultPrices[sub.tier as 'pro' | 'elite'];
      mrrOverTime[monthKey] = (mrrOverTime[monthKey] || 0) + price;
    });

    // Get conversion funnel
    const { data: allSubscriptions } = await supabase
      .from('user_subscriptions')
      .select('tier, status');

    const freeCount = allSubscriptions?.filter(s => s.tier === 'free').length || 0;
    const proCount = allSubscriptions?.filter(s => s.tier === 'pro' && s.status === 'active').length || 0;
    const eliteCount = allSubscriptions?.filter(s => s.tier === 'elite' && s.status === 'active').length || 0;

    const totalUsers = freeCount + proCount + eliteCount;
    const conversionRate = totalUsers > 0 ? ((proCount + eliteCount) / totalUsers) * 100 : 0;

    // Get churn rate over time
    const { data: canceledSubscriptions } = await supabase
      .from('user_subscriptions')
      .select('updated_at')
      .eq('status', 'canceled')
      .gte('updated_at', sixMonthsAgo.toISOString());

    const churnPerMonth: Record<string, number> = {};
    canceledSubscriptions?.forEach((sub) => {
      const date = new Date(sub.updated_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      churnPerMonth[monthKey] = (churnPerMonth[monthKey] || 0) + 1;
    });

    // Get average bets per user
    const { count: totalBets } = await supabase
      .from('bets')
      .select('*', { count: 'exact', head: true });

    const { count: totalUsersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const avgBetsPerUser = totalUsersCount && totalUsersCount > 0
      ? (totalBets || 0) / totalUsersCount
      : 0;

    // Get most active users
    const { data: betsByUser } = await supabase
      .from('bets')
      .select('user_id')
      .limit(1000); // Sample

    const userBetCounts = new Map<string, number>();
    betsByUser?.forEach((bet) => {
      userBetCounts.set(bet.user_id, (userBetCounts.get(bet.user_id) || 0) + 1);
    });

    const topUsers = Array.from(userBetCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    // Get user emails for top users
    const topUserIds = topUsers.map(u => u.userId);
    const { data: topUserProfiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', topUserIds);

    const topUsersWithNames = topUsers.map((user) => {
      const profile = topUserProfiles?.find(p => p.id === user.userId);
      return {
        email: profile?.email || 'N/A',
        name: profile?.full_name || 'N/A',
        betsCount: user.count,
      };
    });

    return NextResponse.json({
      signupsPerDay,
      mrrOverTime,
      conversionFunnel: {
        free: freeCount,
        pro: proCount,
        elite: eliteCount,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      churnPerMonth,
      avgBetsPerUser: Math.round(avgBetsPerUser * 100) / 100,
      topUsers: topUsersWithNames,
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

