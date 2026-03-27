import { createServiceClient } from '@/lib/supabase/service';
import { stripe, PAYMENTS_ENABLED } from '@/lib/stripe/stripe';
import { syncStripeSubscriptionToDatabase } from '@/lib/stripe/sync-subscription';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

async function processStripeSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  subscription: Stripe.Subscription
) {
  const result = await syncStripeSubscriptionToDatabase(supabase, subscription);
  if (!result.ok) {
    console.error('[stripe] syncStripeSubscriptionToDatabase failed:', result.error);
  }
}

export async function POST(req: Request) {
  if (!PAYMENTS_ENABLED) {
    return new NextResponse('Payments disabled', { status: 200 });
  }

  let supabase: ReturnType<typeof createServiceClient>;
  try {
    supabase = createServiceClient();
  } catch (e) {
    console.error('[stripe] Webhook: missing service role key', e);
    return new NextResponse('Server misconfigured', { status: 500 });
  }

  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Webhook signature verification failed: ${message}`);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const userId = session.metadata?.userId;
        const customerId = session.customer as string | undefined;
        const subscriptionId = session.subscription as string | undefined;

        if (userId && customerId) {
          await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId);
        }

        if (subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          await processStripeSubscription(supabase, subscription);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await processStripeSubscription(supabase, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & {
          /** Present on older API / webhook payloads */
          subscription?: string | Stripe.Subscription | null;
        };
        const subRef =
          invoice.parent?.subscription_details?.subscription ??
          invoice.subscription;
        const subscriptionId =
          typeof subRef === 'string' ? subRef : subRef?.id;
        if (!subscriptionId) break;

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        await processStripeSubscription(supabase, subscription);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error processing webhook: ${message}`);
    return new NextResponse('Webhook handler error', { status: 200 });
  }

  return new NextResponse(null, { status: 200 });
}
