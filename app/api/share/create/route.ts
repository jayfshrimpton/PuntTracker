import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/api-auth';
import { normalizeDashboardPeriod } from '@/lib/dashboard-period';

export const dynamic = 'force-dynamic';

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = (await req.json()) as {
      period?: unknown;
      show_profit?: boolean;
      show_strike_rate?: boolean;
      show_roi?: boolean;
      show_turnover?: boolean;
      display_name?: string | null;
    };

    const period = normalizeDashboardPeriod(body.period ?? { type: 'all' });
    const show_profit = body.show_profit !== false;
    const show_strike_rate = body.show_strike_rate !== false;
    const show_roi = body.show_roi !== false;
    const show_turnover = body.show_turnover !== false;
    if (!show_profit && !show_strike_rate && !show_roi && !show_turnover) {
      return NextResponse.json(
        { error: 'Enable at least one stat to share.' },
        { status: 400 }
      );
    }
    const display_name =
      typeof body.display_name === 'string' && body.display_name.trim().length > 0
        ? body.display_name.trim().slice(0, 80)
        : null;

    const supabase = createClient();

    const { data: existing } = await supabase
      .from('shared_dashboard_links')
      .select('token')
      .eq('user_id', userId)
      .maybeSingle();

    const token = existing?.token ?? randomBytes(18).toString('base64url');

    const { error } = await supabase.from('shared_dashboard_links').upsert(
      {
        user_id: userId,
        token,
        period,
        show_profit,
        show_strike_rate,
        show_roi,
        show_turnover,
        display_name,
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: 'Could not save share link. Run the shared_dashboard_links migration in Supabase if you have not yet.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ token });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
});
