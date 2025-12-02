import { createClient } from '@/lib/supabase/server';
import { stripe, PAYMENTS_ENABLED } from '@/lib/stripe/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    // Check if payments are enabled
    if (!PAYMENTS_ENABLED) {
        // Return 200 to acknowledge receipt but don't process
        return new NextResponse('Payments disabled', { status: 200 });
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
    } catch (error: any) {
        console.error(`Webhook signature verification failed: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const supabase = createClient();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.mode === 'subscription') {
                    const subscriptionId = session.subscription as string;
                    const customerId = session.customer as string;
                    const userId = session.metadata?.userId;

                    if (userId) {
                        // Update profile with stripe_customer_id if not already set
                        await supabase
                            .from('profiles')
                            .update({ stripe_customer_id: customerId })
                            .eq('id', userId);
                    }
                }
                break;
            }
            case 'invoice.payment_succeeded':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                // Map Stripe status to our status
                // Stripe statuses: trialing, active, incomplete, incomplete_expired, past_due, unpaid, canceled, paused

                const subscriptionData = {
                    id: subscription.id,
                    user_id: subscription.metadata?.userId, // We need to ensure metadata is passed to subscription
                    status: subscription.status,
                    price_id: subscription.items.data[0].price.id,
                    quantity: subscription.items.data[0].quantity,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
                    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
                    current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
                    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                    created: new Date(subscription.created * 1000).toISOString(),
                    ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
                    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
                    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                    metadata: subscription.metadata,
                };

                // If user_id is missing in subscription metadata, try to find it via customer
                if (!subscriptionData.user_id) {
                    const customerId = subscription.customer as string;
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('stripe_customer_id', customerId)
                        .single();

                    if (profile) {
                        subscriptionData.user_id = profile.id;
                    } else {
                        console.error(`User not found for customer ${customerId}`);
                        // If we can't find the user, we can't save the subscription properly linked
                        // But we should probably still save it or log it
                        break;
                    }
                }

                const { error } = await supabase
                    .from('subscriptions')
                    .upsert(subscriptionData);

                if (error) {
                    console.error('Error upserting subscription:', error);
                    throw error;
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error: any) {
        console.error(`Error processing webhook: ${error.message}`);
        // Return 200 to acknowledge receipt even if processing failed, to prevent Stripe retries if it's a logic error
        // But for critical errors we might want to return 500? 
        // User requirement: "Webhook handler must NEVER throw uncaught errors"
        return new NextResponse('Webhook handler error', { status: 200 });
    }

    return new NextResponse(null, { status: 200 });
}
