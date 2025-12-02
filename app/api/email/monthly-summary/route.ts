import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchUserBetsServer } from '@/lib/api-server';
import { calculateMonthlyStats } from '@/lib/stats';
import { sendMonthlySummaryEmail } from '@/lib/email';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the last month's data
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const monthStart = startOfMonth(lastMonth);
    const monthEnd = endOfMonth(lastMonth);

    // Fetch bets for last month
    const { data: bets, error: betsError } = await fetchUserBetsServer(
      user.id,
      'custom',
      monthStart,
      monthEnd
    );

    if (betsError) {
      return NextResponse.json(
        { error: 'Failed to fetch bets', details: betsError.message },
        { status: 500 }
      );
    }

    if (!bets || bets.length === 0) {
      return NextResponse.json(
        { message: 'No bets found for last month' },
        { status: 200 }
      );
    }

    // Calculate monthly stats
    const stats = calculateMonthlyStats(bets);

    // Get user metadata
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Send email
    const emailResult = await sendMonthlySummaryEmail({
      userEmail: user.email!,
      userName: userData?.full_name || undefined,
      month: format(lastMonth, 'MMMM'),
      year: lastMonth.getFullYear(),
      stats,
      totalBets: bets.length,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Monthly summary email sent successfully',
    });
  } catch (error) {
    console.error('Error sending monthly summary:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

