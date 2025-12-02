import { createClient } from '@/lib/supabase/server';
import { stripe, getOrCreateStripeCustomer, PAYMENTS_ENABLED } from '@/lib/stripe/stripe';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    // Check if payments are enabled
    if (!PAYMENTS_ENABLED) {
        return new NextResponse(
            JSON.stringify({ message: 'Payments are currently disabled. Please contact support.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { priceId, quantity = 1, metadata = {} } = await req.json();

        if (!priceId) {
            return new NextResponse('Price ID is required', { status: 400 });
        }

        // Verify the price exists before creating checkout session
        try {
            const price = await stripe.prices.retrieve(priceId);
            console.log(`Price verified: ${price.id}, active: ${price.active}, product: ${price.product}`);
            
            // Double-check price is active
            if (!price.active) {
                return new NextResponse(
                    JSON.stringify({ 
                        message: `Price ID "${priceId}" exists but is not active. Please activate it in Stripe Dashboard.` 
                    }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }
        } catch (priceError: any) {
            console.error(`Price ID ${priceId} not found:`, priceError.message);
            console.error(`Stripe API Key mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live'}`);
            console.error(`Full error:`, JSON.stringify(priceError, null, 2));
            
            // Try to list prices to help debug
            try {
                const allPrices = await stripe.prices.list({ limit: 10 });
                console.log(`Available prices in account:`, allPrices.data.map(p => ({ id: p.id, active: p.active })));
            } catch (listError) {
                console.error('Could not list prices:', listError);
            }
            
            return new NextResponse(
                JSON.stringify({ 
                    message: `Price ID "${priceId}" not found. Please verify it exists in your Stripe ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live'} account. Visit /api/stripe/debug to see available prices.` 
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const customerId = await getOrCreateStripeCustomer(user.id, user.email!);

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity,
                },
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            subscription_data: {
                metadata: {
                    ...metadata,
                    userId: user.id,
                },
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            metadata: {
                userId: user.id,
                ...metadata,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        
        // Provide more helpful error messages
        let errorMessage = error.message || 'Internal Server Error';
        let statusCode = 500;
        
        if (error.type === 'StripeInvalidRequestError') {
            if (error.code === 'resource_missing' && error.param === 'line_items[0][price]') {
                errorMessage = `Price ID not found. Please verify the price exists in your Stripe ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live'} account.`;
                statusCode = 400;
            }
        }
        
        return new NextResponse(
            JSON.stringify({ message: errorMessage }),
            { status: statusCode, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
