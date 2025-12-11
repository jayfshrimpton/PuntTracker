import Stripe from 'stripe';

// Feature flag to enable/disable payments
export const PAYMENTS_ENABLED = process.env.ENABLE_PAYMENTS === 'true';

// Lazy initialization to avoid errors during build when env vars might not be available
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
    if (!stripeInstance) {
        const apiKey = process.env.STRIPE_SECRET_KEY;
        if (!apiKey) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }
        stripeInstance = new Stripe(apiKey, {
            apiVersion: '2025-11-17.clover',
            appInfo: {
                name: "Punter's Journal",
                version: '0.1.0',
            },
        });
    }
    return stripeInstance;
}

export const stripe = getStripe();

export async function getOrCreateStripeCustomer(uuid: string, email: string) {
    // 1. Check if we already have a stripe_customer_id in profiles
    // Note: This requires supabase-admin client or similar if running server-side
    // For now, we assume this is called where we can access the DB or we query Stripe directly

    // Alternative: Search Stripe for customer by email
    const customers = await stripe.customers.list({ email: email, limit: 1 });

    if (customers.data.length > 0) {
        return customers.data[0].id;
    }

    // 2. If not found, create a new customer
    const customer = await stripe.customers.create({
        email: email,
        metadata: {
            supabaseUUID: uuid,
        },
    });

    return customer.id;
}
