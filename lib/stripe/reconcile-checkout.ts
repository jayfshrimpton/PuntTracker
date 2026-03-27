import { createServiceClient } from '@/lib/supabase/service';
import { stripe } from '@/lib/stripe/stripe';
import { syncStripeSubscriptionToDatabase } from '@/lib/stripe/sync-subscription';
import { clearSubscriptionCache } from '@/lib/subscription-guard';
import type Stripe from 'stripe';

/**
 * After Checkout redirect, verify the session belongs to this user and sync DB rows.
 */
export async function syncUserAfterCheckoutSession(
  sessionId: string,
  userId: string
): Promise<{ ok: boolean; reason?: string }> {
  let service: ReturnType<typeof createServiceClient>;
  try {
    service = createServiceClient();
  } catch {
    return { ok: false, reason: 'no_service_client' };
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });

  const customerId = session.customer as string | null;
  const ownsByMetadata = session.metadata?.userId === userId;

  let ownsByCustomer = false;
  if (!ownsByMetadata && customerId) {
    const { data: profile } = await service
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();
    ownsByCustomer = profile?.stripe_customer_id === customerId;
  }

  if (!ownsByMetadata && !ownsByCustomer) {
    return { ok: false, reason: 'session_forbidden' };
  }

  if (session.mode !== 'subscription') {
    return { ok: false, reason: 'not_subscription' };
  }

  const subRef = session.subscription;
  const subscription: Stripe.Subscription | null =
    subRef == null
      ? null
      : typeof subRef === 'string'
        ? await stripe.subscriptions.retrieve(subRef)
        : subRef;

  if (!subscription) {
    return { ok: false, reason: 'no_subscription' };
  }

  if (customerId) {
    await service
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

  const result = await syncStripeSubscriptionToDatabase(service, subscription);
  if (!result.ok) {
    return { ok: false, reason: result.error };
  }

  clearSubscriptionCache(userId);
  return { ok: true };
}
