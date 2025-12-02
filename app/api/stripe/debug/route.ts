import { stripe } from '@/lib/stripe/stripe';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to verify Stripe connection and list available prices
 * Remove this endpoint before production!
 */
export async function GET() {
    try {
        const apiKey = process.env.STRIPE_SECRET_KEY;
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        const isTestMode = apiKey?.startsWith('sk_test_');

        // Get account info
        const account = await stripe.accounts.retrieve();

        // List all prices (including inactive ones for debugging)
        const prices = await stripe.prices.list({ limit: 100 });

        // List all products (including inactive ones for debugging)
        const products = await stripe.products.list({ limit: 100 });

        return NextResponse.json({
            account: {
                id: account.id,
                email: account.email,
                country: account.country,
            },
            mode: isTestMode ? 'test' : 'live',
            apiKeyPrefix: apiKey?.substring(0, 10) + '...',
            publishableKeyConfigured: !!publishableKey,
            publishableKeyPrefix: publishableKey ? publishableKey.substring(0, 10) + '...' : 'not set',
            prices: prices.data.map(price => ({
                id: price.id,
                product: price.product,
                unit_amount: price.unit_amount,
                currency: price.currency,
                recurring: price.recurring,
                active: price.active,
                created: new Date(price.created * 1000).toISOString(),
            })),
            products: products.data.map(product => ({
                id: product.id,
                name: product.name,
                active: product.active,
                default_price: product.default_price,
                created: new Date(product.created * 1000).toISOString(),
            })),
            totalPrices: prices.data.length,
            totalProducts: products.data.length,
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            type: error.type,
            code: error.code,
        }, { status: 500 });
    }
}

