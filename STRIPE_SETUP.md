# Stripe Payment Setup Guide

This guide explains how to set up Stripe payments for Punter's Journal and how to disable payments when not ready for production.

## Required Stripe API Keys

You need to add the following environment variables to your `.env.local` file (for local development) and your deployment platform (for production):

### 1. Stripe Secret Key (Server-side) - REQUIRED

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

**Where to get it:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API keys**
3. Copy the **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)

**Important:** 
- Use `sk_test_...` for development/testing
- Use `sk_live_...` for production (only after testing thoroughly)
- Never expose this key in client-side code or commit it to version control
- This is required for creating checkout sessions and managing subscriptions

### 1b. Stripe Publishable Key (Client-side) - OPTIONAL

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

**Where to get it:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API keys**
3. Copy the **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)

**Important:**
- Currently **not required** for the checkout flow (we use server-side Checkout Sessions)
- Useful if you want to add client-side Stripe.js features in the future
- Safe to expose in client-side code (it's meant to be public)
- Must match the mode (test/live) of your Secret Key

### 2. Stripe Webhook Secret (Server-side)

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Where to get it:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → Webhooks**
3. Click **Add endpoint** (or edit existing endpoint)
4. Set endpoint URL to: `https://your-domain.com/api/stripe/webhook`
5. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. After creating the endpoint, click on it and copy the **Signing secret** (starts with `whsec_`)

**Important:**
- You'll need separate webhook endpoints for test and live modes
- The webhook secret is different for each endpoint

### 3. App URL (Public)

```env
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

**Where to set it:**
- For local development: `http://localhost:3000`
- For production: Your actual domain (e.g., `https://puntersjournal.com.au`)

This is used for redirect URLs after checkout and subscription management.

### 4. Payment Feature Flag (Optional)

```env
ENABLE_PAYMENTS=false
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```

**Purpose:** 
- Set to `false` to disable payments (default behavior)
- Set to `true` to enable payments when ready

**Important:**
- `ENABLE_PAYMENTS` is used server-side (in API routes)
- `NEXT_PUBLIC_ENABLE_PAYMENTS` is used client-side (in React components)
- Both should be set to the same value

## Complete Environment Variables Example

```env
# Stripe Configuration (Required)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Configuration (Optional - for future client-side features)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Feature Flag (set to false to disable payments)
ENABLE_PAYMENTS=false
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```

## Disabling Payments for Production

To ensure payments are **NOT active** when pushing to production:

1. **Set the feature flag to `false`** in your production environment variables:
   ```env
   ENABLE_PAYMENTS=false
   NEXT_PUBLIC_ENABLE_PAYMENTS=false
   ```

2. **What happens when payments are disabled:**
   - The pricing page will show "Coming Soon" on paid plan buttons
   - Users will see a banner message: "Paid plans are coming soon. Free plan is available now!"
   - The checkout API will return a 503 error if somehow called
   - All payment functionality is safely disabled

3. **When ready to enable payments:**
   - Set both flags to `true` in your production environment
   - Ensure you have valid Stripe API keys configured
   - Test thoroughly in test mode first
   - Switch to live keys only after testing is complete

## Setting Up Stripe Products and Prices

Before enabling payments, you need to create products and prices in Stripe:

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create products for your plans (e.g., "Pro Plan", "Elite Plan")
3. Add prices to each product:
   - For monthly plans: Set billing period to "Monthly"
   - For yearly plans: Set billing period to "Yearly"
4. **IMPORTANT: Get the Price ID (NOT the Product ID)**
   - Click on your product in the Stripe Dashboard
   - Under the "Pricing" section, you'll see the prices you created
   - Click on the price you want to use
   - Copy the **Price ID** (it starts with `price_...`, NOT `prod_...`)
   - The Product ID (starts with `prod_...`) is NOT what you need for checkout
5. Update the `priceId` values in `app/pricing/page.tsx`:
   ```typescript
   {
       name: 'Pro',
       priceId: 'price_1Qxxxxxxxxxxxxx', // Must start with 'price_', NOT 'prod_'
   }
   ```

**Common Mistake:** Using Product IDs (`prod_...`) instead of Price IDs (`price_...`) will cause the error: "No such price: 'prod_...'". Always use Price IDs for checkout sessions.

## Testing Stripe Integration

1. **Use Test Mode:**
   - Always use `sk_test_...` keys for development
   - Use Stripe's test card numbers: `4242 4242 4242 4242`
   - Any future expiry date and any 3-digit CVC

2. **Test Webhooks Locally:**
   - Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks to your local server:
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
   - This will give you a webhook secret starting with `whsec_` for local testing

3. **Verify Integration:**
   - Test the checkout flow end-to-end
   - Verify webhook events are being received and processed
   - Check that subscriptions are being saved to your database

## Security Best Practices

1. **Never commit API keys to version control**
   - Add `.env.local` to `.gitignore` (should already be there)
   - Use environment variables in your deployment platform

2. **Use different keys for test and production**
   - Test mode keys (`sk_test_...`) for development
   - Live mode keys (`sk_live_...`) for production

3. **Rotate keys if compromised**
   - Go to Stripe Dashboard → Developers → API keys
   - Revoke compromised keys and generate new ones

4. **Monitor webhook events**
   - Check Stripe Dashboard → Developers → Webhooks for failed events
   - Set up alerts for webhook failures

## Troubleshooting

### "STRIPE_SECRET_KEY is not configured" error
- Make sure `STRIPE_SECRET_KEY` is set in your environment variables
- Restart your development server after adding environment variables

### Webhook signature verification failed
- Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from your webhook endpoint
- Make sure you're using the correct secret for test vs. live mode

### Payments still working when disabled
- Check that both `ENABLE_PAYMENTS` and `NEXT_PUBLIC_ENABLE_PAYMENTS` are set to `false`
- Restart your server after changing environment variables
- Clear browser cache if testing client-side changes

## Next Steps

1. Add the required environment variables to your `.env.local` file
2. Set `ENABLE_PAYMENTS=false` to keep payments disabled
3. Create Stripe products and prices when ready
4. Test the integration thoroughly before enabling payments
5. Switch to live keys only when ready for production launch

