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
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';

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
          message: 'No bets found to export',
          code: 'NO_DATA',
        },
        { status: 404 }
      );
    }

    // Format data based on requested format
    if (format === 'csv') {
      // Convert to CSV
      const headers = [
        'Date',
        'Horse Name',
        'Race Name',
        'Venue',
        'Race Number',
        'Bet Type',
        'Price',
        'Stake',
        'Profit/Loss',
        'Finishing Position',
        'Notes',
      ];

      const rows = bets.map((bet) => [
        bet.bet_date,
        bet.horse_name,
        bet.race_name || '',
        bet.venue || '',
        bet.race_number || '',
        bet.bet_type,
        bet.price,
        bet.stake,
        bet.profit_loss || '',
        bet.finishing_position || '',
        bet.notes || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="bets-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'json') {
      return NextResponse.json(
        {
          data: bets,
          exportedAt: new Date().toISOString(),
          count: bets.length,
        },
        {
          status: 200,
          headers: {
            'Content-Disposition': `attachment; filename="bets-export-${new Date().toISOString().split('T')[0]}.json"`,
          },
        }
      );
    } else {
      return NextResponse.json(
        {
          error: 'Invalid format',
          message: 'Format must be "csv" or "json"',
          code: 'INVALID_FORMAT',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Export Error:', error);
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

