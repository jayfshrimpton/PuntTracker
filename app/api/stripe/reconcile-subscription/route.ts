import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { stripe, PAYMENTS_ENABLED } from '@/lib/stripe/stripe';
import { syncStripeSubscriptionToDatabase } from '@/lib/stripe/sync-subscription';
import { clearSubscriptionCache } from '@/lib/subscription-guard';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

/**
 * Pulls the latest subscription from Stripe for the logged-in user and
 * updates `subscriptions` + `user_subscriptions`. Use if webhooks were missed
 * or the account was stuck on Free after a successful payment.
 */
export const POST = withAuth(async (_req: NextRequest, userId: string) => {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json(
      { error: 'Payments are not enabled.' },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profile?.stripe_customer_id) {
    return NextResponse.json(
      {
        error: 'No Stripe customer on file',
        message:
          'We could not find billing details for your account. If you just paid, wait a minute and try again, or contact support.',
      },
      { status: 400 }
    );
  }

  let service: ReturnType<typeof createServiceClient>;
  try {
    service = createServiceClient();
  } catch {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Stripe.Subscription (not DOM Push API `Subscription`, which breaks inference)
  const subscriptionRows = (
    await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 20,
    })
  ).data as Stripe.Subscription[];

  if (!subscriptionRows.length) {
    return NextResponse.json(
      {
        error: 'No subscriptions found',
        message:
          'Stripe has no subscription for this account. Use Pricing to subscribe, or contact support if you were charged.',
      },
      { status: 404 }
    );
  }

  const latestItemPeriodEnd = (s: Stripe.Subscription) => {
    const ends = s.items.data.map((i) => i.current_period_end);
    return ends.length ? Math.max(...ends) : s.created;
  };

  const priority = (s: (typeof subscriptionRows)[0]) => {
    if (s.status === 'active' || s.status === 'trialing') return 2;
    if (s.status === 'past_due' || s.status === 'unpaid') return 1;
    return 0;
  };

  subscriptionRows.sort((a, b) => {
    const p = priority(b) - priority(a);
    if (p !== 0) return p;
    return latestItemPeriodEnd(b) - latestItemPeriodEnd(a);
  });

  const chosen = subscriptionRows[0];
  const result = await syncStripeSubscriptionToDatabase(service, chosen);

  if (!result.ok) {
    return NextResponse.json(
      { error: 'Sync failed', message: result.error },
      { status: 500 }
    );
  }

  clearSubscriptionCache(userId);

  return NextResponse.json({ ok: true, subscriptionId: chosen.id, status: chosen.status });
});
