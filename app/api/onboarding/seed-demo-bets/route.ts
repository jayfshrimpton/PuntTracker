import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/api-auth';
import { buildDemoBetRows, DEMO_COUNT } from '@/lib/demo-sample-bets';
import { checkUsageLimit, getUserSubscription, incrementUsage } from '@/lib/subscription-guard';

export const dynamic = 'force-dynamic';

export const POST = withAuth(async (_req, userId) => {
  try {
    const supabase = createClient();

    const { count, error: countError } = await supabase
      .from('bets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error(countError);
      return NextResponse.json({ error: 'Could not check existing bets' }, { status: 500 });
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: 'Sample data is only available when you have no bets yet.' },
        { status: 400 }
      );
    }

    const subscription = await getUserSubscription(userId);
    if (subscription.tier === 'free') {
      const usage = await checkUsageLimit(userId, subscription, 'bet', 'month');
      if (usage.currentUsage + DEMO_COUNT > usage.limit) {
        return NextResponse.json(
          {
            error: `Sample data needs ${DEMO_COUNT} bet slots; you only have ${usage.remaining} left this month on the free plan.`,
          },
          { status: 400 }
        );
      }
    }

    const rows = buildDemoBetRows().map((b) => ({
      ...b,
      user_id: userId,
    }));

    const { error: insertError } = await supabase.from('bets').insert(rows);

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: 'Failed to insert sample bets' }, { status: 500 });
    }

    if (subscription.tier === 'free') {
      await incrementUsage(userId, 'bet', 'month', DEMO_COUNT);
    }

    return NextResponse.json({ ok: true, inserted: DEMO_COUNT });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
});
