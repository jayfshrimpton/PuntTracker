import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { appTierFromStripeSubscription } from '@/lib/stripe/price-tier';

type ServiceClient = SupabaseClient;

/**
 * Resolves Supabase user id from subscription metadata or profiles.stripe_customer_id.
 */
export async function resolveUserIdForStripeSubscription(
  supabase: ServiceClient,
  subscription: Stripe.Subscription
): Promise<string | null> {
  const fromMeta = subscription.metadata?.userId;
  if (fromMeta) return fromMeta;

  const customerId = subscription.customer as string | undefined;
  if (!customerId) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  return profile?.id ?? null;
}

function subscriptionRow(subscription: Stripe.Subscription, userId: string) {
  const primary = subscription.items.data[0];
  if (!primary) return null;

  const priceId = primary.price;
  const price_id =
    typeof priceId === 'string' ? priceId : priceId?.id ?? null;

  return {
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    price_id,
    quantity: primary.quantity ?? 1,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    current_period_start: new Date(
      primary.current_period_start * 1000
    ).toISOString(),
    current_period_end: new Date(
      primary.current_period_end * 1000
    ).toISOString(),
    created: new Date(subscription.created * 1000).toISOString(),
    ended_at: subscription.ended_at
      ? new Date(subscription.ended_at * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    metadata: subscription.metadata,
  };
}

/**
 * Mirrors Stripe into `subscriptions` and updates entitlement in `user_subscriptions`
 * (the table used by getUserSubscription / feature gating).
 */
export async function syncStripeSubscriptionToDatabase(
  supabase: ServiceClient,
  subscription: Stripe.Subscription
): Promise<{ ok: boolean; error?: string }> {
  const userId = await resolveUserIdForStripeSubscription(supabase, subscription);

  if (!userId) {
    const customerId = subscription.customer as string;
    console.error(
      `[stripe] Cannot sync subscription ${subscription.id}: no userId in metadata and no profile for customer ${customerId}`
    );
    return { ok: false, error: 'user_not_found' };
  }

  const row = subscriptionRow(subscription, userId);
  if (!row) {
    return { ok: false, error: 'subscription_has_no_items' };
  }

  const { error: subError } = await supabase.from('subscriptions').upsert(row);

  if (subError) {
    console.error('[stripe] subscriptions upsert error:', subError);
    return { ok: false, error: subError.message };
  }

  const tier = appTierFromStripeSubscription(subscription);
  const customerId = subscription.customer as string;

  const { error: tierError } = await supabase.from('user_subscriptions').upsert(
    {
      user_id: userId,
      tier,
      status: subscription.status,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (tierError) {
    console.error('[stripe] user_subscriptions upsert error:', tierError);
    return { ok: false, error: tierError.message };
  }

  return { ok: true };
}
