import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { calculateMonthlyStats } from '@/lib/stats';
import { sendMonthlySummary } from '@/lib/resend';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Bet } from '@/lib/api';

// Price IDs for subscription tiers
const PRO_PRICE_ID = 'price_1SZVqG7Uv9v0RZydSebiiCsw';
const ELITE_PRICE_ID = 'price_1SZVQM7Uv9v0RZydzVRWIcPs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify the request has the correct secret token or is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const vercelCronSecret = request.headers.get('x-vercel-cron-secret');

    // Allow Vercel Cron or Bearer token authentication
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && vercelCronSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Get the last month's date range
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const monthStart = startOfMonth(lastMonth);
    const monthEnd = endOfMonth(lastMonth);

    // Get all Pro and Elite subscribers
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id, price_id, status')
      .in('status', ['trialing', 'active'])
      .in('price_id', [PRO_PRICE_ID, ELITE_PRICE_ID]);

    if (subError) {
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions', details: subError.message },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No Pro/Elite subscribers found', sent: 0 },
        { status: 200 }
      );
    }

    const proEliteUserIds = subscriptions.map((sub) => sub.user_id);

    // Get user profiles with email preferences
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, email_notifications_enabled, full_name')
      .in('id', proEliteUserIds);

    if (profilesError) {
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profilesError.message },
        { status: 500 }
      );
    }

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    const results = {
      total: proEliteUserIds.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Process each Pro/Elite user
    for (const userId of proEliteUserIds) {
      try {
        const profile = profileMap.get(userId);
        let userEmail: string | null = null;

        // Get email from profile or auth
        if (profile?.email) {
          userEmail = profile.email;
        } else {
          // Try to get email from auth
          try {
            const { data: authUser } = await supabase.auth.admin.getUserById(userId);
            if (authUser?.user?.email) {
              userEmail = authUser.user.email;
            }
          } catch (error) {
            results.skipped++;
            results.errors.push(`User ${userId}: Could not get email`);
            continue;
          }
        }

        if (!userEmail) {
          results.skipped++;
          results.errors.push(`User ${userId}: No email found`);
          continue;
        }

        // Skip if user has disabled email notifications
        if (profile?.email_notifications_enabled === false) {
          results.skipped++;
          continue;
        }

        // Fetch bets for last month for this user
        const { data: bets, error: betsFetchError } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', userId)
          .gte('bet_date', monthStart.toISOString().split('T')[0])
          .lte('bet_date', monthEnd.toISOString().split('T')[0])
          .order('bet_date', { ascending: false });

        if (betsFetchError) {
          results.failed++;
          results.errors.push(`User ${userEmail}: ${betsFetchError.message}`);
          continue;
        }

        // Skip users with no bets last month
        if (!bets || bets.length === 0) {
          results.skipped++;
          continue;
        }

        // Calculate monthly stats
        const stats = calculateMonthlyStats(bets as Bet[]);

        // Find best bet (highest profit)
        const bestBet = bets.reduce((best, bet) => {
          const profit = bet.profit_loss ? Number(bet.profit_loss) : 0;
          const bestProfit = best?.profit_loss ? Number(best.profit_loss) : -Infinity;
          return profit > bestProfit ? bet : best;
        }, bets[0]);

        // Find worst bet (lowest profit/loss)
        const worstBet = bets.reduce((worst, bet) => {
          const loss = bet.profit_loss ? Number(bet.profit_loss) : 0;
          const worstLoss = worst?.profit_loss ? Number(worst.profit_loss) : Infinity;
          return loss < worstLoss ? bet : worst;
        }, bets[0]);

        // Calculate venue performance
        const venueMap = new Map<string, number>();
        bets.forEach((bet) => {
          if (bet.venue && bet.profit_loss) {
            const current = venueMap.get(bet.venue) || 0;
            venueMap.set(bet.venue, current + Number(bet.profit_loss));
          }
        });

        // Find top venue
        let topVenue: { name: string; profit: number } | undefined;
        if (venueMap.size > 0) {
          const sortedVenues = Array.from(venueMap.entries())
            .map(([name, profit]) => ({ name, profit }))
            .sort((a, b) => b.profit - a.profit);
          topVenue = sortedVenues[0];
        }

        // Prepare summary data
        const summaryData = {
          totalBets: bets.length,
          profit: stats.totalProfit,
          roi: stats.roi,
          strikeRate: stats.strikeRate,
          bestBet: bestBet && bestBet.profit_loss && Number(bestBet.profit_loss) > 0
            ? {
                horse: bestBet.horse_name,
                profit: Number(bestBet.profit_loss),
                venue: bestBet.venue || undefined,
              }
            : undefined,
          worstBet: worstBet && worstBet.profit_loss && Number(worstBet.profit_loss) < 0
            ? {
                horse: worstBet.horse_name,
                loss: Number(worstBet.profit_loss),
                venue: worstBet.venue || undefined,
              }
            : undefined,
          topVenue: topVenue && topVenue.profit > 0 ? topVenue : undefined,
        };

        // Send email using new function
        const emailResult = await sendMonthlySummary({
          to: userEmail,
          userName: profile?.full_name || undefined,
          summaryData,
        });

        if (emailResult.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`User ${userEmail}: ${emailResult.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `User ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Monthly summaries processed',
      results,
    });
  } catch (error) {
    console.error('Error in monthly summary cron job:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

