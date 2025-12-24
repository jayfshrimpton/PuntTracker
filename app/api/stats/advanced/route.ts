import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withSubscriptionCheck } from '@/lib/api-auth';
import { UserSubscription } from '@/lib/subscription-guard';

export const dynamic = 'force-dynamic';

export const GET = withSubscriptionCheck(['pro', 'elite'], async (
  req: NextRequest,
  subscription: UserSubscription,
  userId: string
) => {
  try {
    const supabase = createClient();

    // Fetch user's bets
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .order('bet_date', { ascending: false });

    if (betsError) {
      console.error('Error fetching bets:', betsError);
      return NextResponse.json(
        {
          error: 'Database error',
          message: 'Failed to fetch betting data',
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      );
    }

    if (!bets || bets.length === 0) {
      return NextResponse.json(
        {
          error: 'No data',
          message: 'No bets found to analyze',
          code: 'NO_DATA',
        },
        { status: 404 }
      );
    }

    // Calculate advanced statistics
    const totalBets = bets.length;
    const totalStake = bets.reduce((sum, bet) => sum + (Number(bet.stake) || 0), 0);
    const totalPL = bets.reduce((sum, bet) => sum + (Number(bet.profit_loss) || 0), 0);
    const winners = bets.filter((bet) => (Number(bet.profit_loss) || 0) > 0).length;
    const strikeRate = totalBets > 0 ? (winners / totalBets) * 100 : 0;
    const roi = totalStake > 0 ? (totalPL / totalStake) * 100 : 0;

    // Advanced stats by venue
    const venueStats = bets.reduce((acc: Record<string, any>, bet) => {
      const venue = bet.venue || 'Unknown';
      if (!acc[venue]) {
        acc[venue] = {
          venue,
          totalBets: 0,
          totalStake: 0,
          totalPL: 0,
          winners: 0,
          strikeRate: 0,
          roi: 0,
        };
      }
      acc[venue].totalBets += 1;
      acc[venue].totalStake += Number(bet.stake) || 0;
      acc[venue].totalPL += Number(bet.profit_loss) || 0;
      if ((Number(bet.profit_loss) || 0) > 0) {
        acc[venue].winners += 1;
      }
      return acc;
    }, {});

    // Calculate strike rate and ROI for each venue
    Object.values(venueStats).forEach((venue: any) => {
      venue.strikeRate = venue.totalBets > 0 ? (venue.winners / venue.totalBets) * 100 : 0;
      venue.roi = venue.totalStake > 0 ? (venue.totalPL / venue.totalStake) * 100 : 0;
    });

    // Advanced stats by bet type
    const betTypeStats = bets.reduce((acc: Record<string, any>, bet) => {
      const type = bet.bet_type || 'unknown';
      if (!acc[type]) {
        acc[type] = {
          type,
          totalBets: 0,
          totalStake: 0,
          totalPL: 0,
          winners: 0,
          strikeRate: 0,
          roi: 0,
          averageOdds: 0,
        };
      }
      acc[type].totalBets += 1;
      acc[type].totalStake += Number(bet.stake) || 0;
      acc[type].totalPL += Number(bet.profit_loss) || 0;
      acc[type].averageOdds += Number(bet.price) || 0;
      if ((Number(bet.profit_loss) || 0) > 0) {
        acc[type].winners += 1;
      }
      return acc;
    }, {});

    // Calculate averages for each bet type
    Object.values(betTypeStats).forEach((type: any) => {
      type.strikeRate = type.totalBets > 0 ? (type.winners / type.totalBets) * 100 : 0;
      type.roi = type.totalStake > 0 ? (type.totalPL / type.totalStake) * 100 : 0;
      type.averageOdds = type.totalBets > 0 ? type.averageOdds / type.totalBets : 0;
    });

    // Monthly breakdown
    const monthlyStats = bets.reduce((acc: Record<string, any>, bet) => {
      const date = new Date(bet.bet_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          totalBets: 0,
          totalStake: 0,
          totalPL: 0,
          winners: 0,
          strikeRate: 0,
          roi: 0,
        };
      }
      acc[monthKey].totalBets += 1;
      acc[monthKey].totalStake += Number(bet.stake) || 0;
      acc[monthKey].totalPL += Number(bet.profit_loss) || 0;
      if ((Number(bet.profit_loss) || 0) > 0) {
        acc[monthKey].winners += 1;
      }
      return acc;
    }, {});

    // Calculate strike rate and ROI for each month
    Object.values(monthlyStats).forEach((month: any) => {
      month.strikeRate = month.totalBets > 0 ? (month.winners / month.totalBets) * 100 : 0;
      month.roi = month.totalStake > 0 ? (month.totalPL / month.totalStake) * 100 : 0;
    });

    return NextResponse.json({
      summary: {
        totalBets,
        totalStake: Number(totalStake.toFixed(2)),
        totalPL: Number(totalPL.toFixed(2)),
        winners,
        strikeRate: Number(strikeRate.toFixed(2)),
        roi: Number(roi.toFixed(2)),
      },
      venueBreakdown: Object.values(venueStats),
      betTypeBreakdown: Object.values(betTypeStats),
      monthlyBreakdown: Object.values(monthlyStats),
    });
  } catch (error) {
    console.error('Advanced Stats Error:', error);
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

