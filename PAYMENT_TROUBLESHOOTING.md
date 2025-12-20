# Payment Checkout Not Working - Troubleshooting Guide

## Issue: Subscribe Button Does Nothing

If clicking the subscribe button doesn't take you to Stripe checkout, follow these steps:

## Step 1: Check Environment Variables in Vercel

**CRITICAL**: `NEXT_PUBLIC_*` variables are embedded at **build time**. If you changed them after deployment, you MUST redeploy!

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Verify these are set to `true` (not `false`):
   - `ENABLE_PAYMENTS` = `true`
   - `NEXT_PUBLIC_ENABLE_PAYMENTS` = `true`
3. **Make sure they're set for Production environment**
4. **Redeploy** after changing (environment variables only apply to new builds)

## Step 2: Check Browser Console

1. Open your production site
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Click the subscribe button
5. Look for any errors (red messages)

**Common errors:**
- `Payments are currently disabled` → Environment variable not set correctly
- `Unauthorized` → Not logged in
- `Price ID not found` → Wrong Stripe price ID or wrong Stripe account (test vs live)

## Step 3: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Click the subscribe button
4. Look for a request to `/api/stripe/create-checkout`
5. Click on it to see the response

**What to check:**
- **Status Code**: 
  - `503` = Payments disabled (check env vars)
  - `401` = Not logged in
  - `400` = Price ID issue or other error
  - `200` = Success (should redirect to Stripe)
- **Response Body**: Will show the error message

## Step 4: Verify You're Logged In

The checkout requires authentication. Make sure:
1. You're logged into your account
2. Try logging out and back in
3. Check that your session is valid

## Step 5: Check Stripe Configuration

1. **Verify Stripe Keys Match Mode**:
   - If using **test mode**: Keys should start with `sk_test_` and `pk_test_`
   - If using **live mode**: Keys should start with `sk_live_` and `pk_live_`
   - Check in Vercel: `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

2. **Verify Price IDs**:
   - Go to `/api/stripe/debug` on your production site (if available)
   - Or check Stripe Dashboard → Products → Your Product → Pricing
   - Make sure the Price IDs in `app/pricing/page.tsx` match your Stripe account
   - Make sure you're checking the correct Stripe account (test vs live)

3. **Verify Price is Active**:
   - In Stripe Dashboard, make sure the price is **active** (not archived)

## Step 6: Quick Fix Checklist

Run through this checklist:

- [ ] `ENABLE_PAYMENTS=true` in Vercel (Production environment)
- [ ] `NEXT_PUBLIC_ENABLE_PAYMENTS=true` in Vercel (Production environment)
- [ ] **Redeployed after setting env vars** (critical!)
- [ ] Logged into your account
- [ ] Stripe keys match the mode you're using (test/live)
- [ ] Price IDs in code match your Stripe account
- [ ] Prices are active in Stripe Dashboard
- [ ] No JavaScript errors in browser console
- [ ] Network request to `/api/stripe/create-checkout` is being made

## Step 7: Test the API Directly

You can test the checkout API directly:

```bash
# Replace with your production URL and a valid auth token
curl -X POST https://your-domain.com/api/stripe/create-checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"priceId": "price_1SZVqG7Uv9v0RZydSebiiCsw"}'
```

**Note**: You'll need to be authenticated. The easiest way is to test through the browser while logged in.

## Common Issues & Solutions

### Issue: Button is disabled/grayed out
**Solution**: `NEXT_PUBLIC_ENABLE_PAYMENTS` is not set to `true` or you need to redeploy

### Issue: Button clicks but nothing happens
**Solution**: Check browser console for errors. Likely `NEXT_PUBLIC_ENABLE_PAYMENTS` is false or API is returning an error

### Issue: "Payments are currently disabled" toast appears
**Solution**: `NEXT_PUBLIC_ENABLE_PAYMENTS` is not `true`. Set it in Vercel and redeploy.

### Issue: "Unauthorized" error
**Solution**: You're not logged in. Log in and try again.

### Issue: "Price ID not found" error
**Solution**: 
- Check that Price IDs in `app/pricing/page.tsx` match your Stripe account
- Make sure you're using the correct Stripe account (test vs live mode)
- Verify the price exists and is active in Stripe Dashboard

### Issue: Redirects to Stripe but shows error
**Solution**: This is a Stripe-side issue. Check:
- Stripe Dashboard for error logs
- Webhook configuration
- Product/Price configuration in Stripe

## Still Not Working?

1. **Check Vercel Deployment Logs**:
   - Go to Vercel Dashboard → Deployments → Latest → View Function Logs
   - Look for errors when the API is called

2. **Check Vercel Environment Variables**:
   - Make absolutely sure both payment flags are set to `true`
   - Make sure they're set for **Production** environment
   - Double-check there are no typos (should be exactly `true`, not `True` or `TRUE`)

3. **Hard Refresh Browser**:
   - Clear cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - The old JavaScript bundle might be cached

4. **Check if Build Included Env Vars**:
   - In Next.js, `NEXT_PUBLIC_*` vars are embedded at build time
   - If you set them after the build, they won't work until you rebuild
   - **Always redeploy after changing `NEXT_PUBLIC_*` variables**

