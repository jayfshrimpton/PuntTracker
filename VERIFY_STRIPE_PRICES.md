# How to Verify Stripe Price IDs

If you're getting "No such price" errors, follow these steps to verify your Price IDs are correct:

## Step 1: Verify You're Using Test Mode Keys

Check your `.env.local` file:
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # Must start with sk_test_ for test mode
```

**Important:** 
- Test mode keys start with `sk_test_`
- Live mode keys start with `sk_live_`
- Price IDs are different between test and live modes

## Step 2: Verify Price IDs in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Make sure you're in Test Mode** (toggle in the top right should say "Test mode")
3. Navigate to **Products** → Click on your product (e.g., "Pro Plan")
4. Under the **Pricing** section, you'll see your prices
5. Click on the price you want to use (e.g., "$15.00 / month")
6. In the price details page, you'll see the **Price ID** at the top
7. Copy the **entire Price ID** (it should start with `price_`)

## Step 3: Verify Price is Active

Make sure the price is:
- ✅ **Active** (not archived)
- ✅ **In the correct mode** (test mode if using test keys)
- ✅ **Belongs to the correct product**

## Step 4: Common Issues

### Issue: "No such price" error
**Possible causes:**
1. Using a Price ID from live mode with test mode keys (or vice versa)
2. Price ID copied incorrectly (missing characters)
3. Price was archived or deleted
4. Using Price ID from a different Stripe account

**Solution:**
- Double-check you're copying the entire Price ID
- Verify you're in the correct mode (test/live) in Stripe Dashboard
- Make sure your `STRIPE_SECRET_KEY` matches the mode (test vs live)

### Issue: Price ID looks correct but still doesn't work
**Check:**
1. Restart your development server after updating environment variables
2. Clear browser cache
3. Verify the Price ID in Stripe Dashboard matches exactly what's in your code

## Quick Verification Script

You can verify a Price ID exists using the Stripe CLI:

```bash
# Install Stripe CLI if you haven't: https://stripe.com/docs/stripe-cli
stripe prices retrieve price_1SZVQM7Uv9v0RZydzVRWIcPs
```

This will show you the price details if it exists, or an error if it doesn't.

## Your Current Price IDs

Based on your code, you're using:
- **Pro Plan:** `price_1SZVPa7Uv9v0RZydwwmLva6B`
- **Elite Plan:** `price_1SZVQM7Uv9v0RZydzVRWIcPs`

**To verify these:**
1. Go to Stripe Dashboard → Products
2. Find your products
3. Click on each product → Click on the price
4. Compare the Price ID shown with what's in your code
5. Make sure they match exactly

## Still Having Issues?

If the Price IDs are correct but you're still getting errors:

1. **Check your Stripe account mode:**
   - Look at the top right of Stripe Dashboard
   - Should say "Test mode" if using test keys

2. **Verify your API key:**
   - Go to Stripe Dashboard → Developers → API keys
   - Make sure you're copying the **Secret key** (not Publishable key)
   - Test mode secret key starts with `sk_test_`

3. **Check for typos:**
   - Price IDs are case-sensitive
   - Make sure there are no extra spaces or characters

4. **Try creating a new price:**
   - If the price was deleted, create a new one
   - Copy the new Price ID and update your code

