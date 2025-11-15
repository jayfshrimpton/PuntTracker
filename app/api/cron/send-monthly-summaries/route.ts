import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { fetchUserBetsServer } from '@/lib/api-server';
import { calculateMonthlyStats } from '@/lib/stats';
import { sendMonthlySummaryEmail } from '@/lib/email';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// This endpoint should be protected with a secret token
// You can call this from a cron service like cron-job.org, Vercel Cron, etc.

export async function GET(request: NextRequest) {
  try {
    // Verify the request has the correct secret token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    
    // Get the last month's date range
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const monthStart = startOfMonth(lastMonth);
    const monthEnd = endOfMonth(lastMonth);

    // Get all unique user IDs who have bets in the last month
    const { data: betsData, error: betsError } = await supabase
      .from('bets')
      .select('user_id')
      .gte('bet_date', monthStart.toISOString().split('T')[0])
      .lte('bet_date', monthEnd.toISOString().split('T')[0]);

    if (betsError) {
      return NextResponse.json(
        { error: 'Failed to fetch bets', details: betsError.message },
        { status: 500 }
      );
    }

    if (!betsData || betsData.length === 0) {
      return NextResponse.json(
        { message: 'No bets found for last month', sent: 0 },
        { status: 200 }
      );
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(betsData.map((bet) => bet.user_id))];

    // Get user emails from auth.users using service role
    // We'll get user data for each user ID
    const results = {
      total: uniqueUserIds.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Get all user profiles with emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, email_notifications_enabled, full_name')
      .in('id', uniqueUserIds);

    // Create a map for quick lookup
    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    // Process each user
    for (const userId of uniqueUserIds) {
      try {
        let profile = profileMap.get(userId);
        let userEmail: string | null = null;

        // Get email from profile or auth
        if (profile?.email) {
          userEmail = profile.email;
        } else {
          // Try to get email from auth as fallback
          try {
            const { data: authUser } = await supabase.auth.admin.getUserById(userId);
            if (authUser?.user?.email) {
              userEmail = authUser.user.email;
              // Create a minimal profile object if it doesn't exist
              if (!profile) {
                profile = {
                  id: userId,
                  email: userEmail,
                  email_notifications_enabled: true,
                  full_name: null,
                };
              } else {
                profile.email = userEmail;
              }
            }
          } catch (error) {
            // Admin API might not be available, skip this user
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
        // We need to use service role to bypass RLS for this query
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

        // Skip users with no bets last month (shouldn't happen, but just in case)
        if (!bets || bets.length === 0) {
          results.skipped++;
          continue;
        }

        // Calculate monthly stats
        const stats = calculateMonthlyStats(bets);

        // Send email
        const emailResult = await sendMonthlySummaryEmail({
          userEmail: userEmail,
          userName: profile.full_name || undefined,
          month: format(lastMonth, 'MMMM'),
          year: lastMonth.getFullYear(),
          stats,
          totalBets: bets.length,
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
    console.error('Error in cron job:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
