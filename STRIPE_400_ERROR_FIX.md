# Fixing 400 Bad Request Error on Stripe Checkout

## The Problem

You're getting a `400 (Bad Request)` error when clicking the subscribe button. This usually means:

1. **Price ID doesn't exist** in your Stripe account
2. **Price ID is in the wrong Stripe account** (test vs live)
3. **Price ID exists but is not active**
4. **Wrong Stripe keys** (using test keys but price is in live account, or vice versa)

## Quick Diagnostic Steps

### Step 1: Check What Prices Are Available

Visit this URL on your production site:
```
https://www.puntersjournal.com.au/api/stripe/debug
```

This will show you:
- Which Stripe mode you're using (test vs live)
- All available Price IDs in your account
- Which prices are active

### Step 2: Compare with Code

Check the Price IDs in your code (`app/pricing/page.tsx`):
- Pro plan: `price_1SZVqG7Uv9v0RZydSebiiCsw`
- Elite plan: `price_1SZVQM7Uv9v0RZydzVRWIcPs`

**Do these match the Price IDs shown in `/api/stripe/debug`?**

### Step 3: Check Stripe Account Mode

In Vercel, check your `STRIPE_SECRET_KEY`:
- If it starts with `sk_test_` → You're using **test mode**
- If it starts with `sk_live_` → You're using **live mode**

**The Price IDs in your code must be from the SAME mode!**

## Common Issues & Solutions

### Issue 1: Price IDs Don't Match

**Symptom**: `/api/stripe/debug` shows different Price IDs than in your code

**Solution**:
1. Go to Stripe Dashboard → Products
2. Find your Pro and Elite products
3. Click on each product → Go to "Pricing" section
4. Copy the **Price ID** (starts with `price_`)
5. Update `app/pricing/page.tsx` with the correct Price IDs
6. Redeploy

### Issue 2: Wrong Stripe Mode

**Symptom**: Price IDs exist but in the wrong account (test vs live)

**Solution**:
- **Option A**: Use the Price IDs from the correct mode
  - If using test mode, get Price IDs from test mode products
  - If using live mode, get Price IDs from live mode products
  
- **Option B**: Switch Stripe keys to match where your prices are
  - If prices are in test mode, use `sk_test_...` key
  - If prices are in live mode, use `sk_live_...` key

### Issue 3: Prices Are Not Active

**Symptom**: `/api/stripe/debug` shows prices but `active: false`

**Solution**:
1. Go to Stripe Dashboard → Products
2. Find the product with the inactive price
3. Click on it → Go to "Pricing"
4. Click the three dots (⋯) next to the price
5. Select "Activate" or "Restore"

### Issue 4: No Prices Exist

**Symptom**: `/api/stripe/debug` shows no prices or empty array

**Solution**: Create products and prices in Stripe:
1. Go to Stripe Dashboard → Products
2. Click "Add product"
3. Create "Pro" product:
   - Name: "Pro Plan"
   - Pricing: Recurring, $15/month
   - Save and copy the **Price ID** (starts with `price_`)
4. Create "Elite" product:
   - Name: "Elite Plan"
   - Pricing: Recurring, $25/month
   - Save and copy the **Price ID**
5. Update `app/pricing/page.tsx` with the new Price IDs
6. Redeploy

## Step-by-Step Fix

1. **Visit debug endpoint**:
   ```
   https://www.puntersjournal.com.au/api/stripe/debug
   ```

2. **Note the mode** (test or live) and available Price IDs

3. **Check your Vercel environment variables**:
   - `STRIPE_SECRET_KEY` - Does it match the mode?
   - `ENABLE_PAYMENTS` - Is it set to `true`?
   - `NEXT_PUBLIC_ENABLE_PAYMENTS` - Is it set to `true`?

4. **Update Price IDs in code** if needed:
   - Edit `app/pricing/page.tsx`
   - Replace the `priceId` values with ones from `/api/stripe/debug`

5. **Redeploy** your application

6. **Test again** - Click subscribe button

## Verify Your Setup

After fixing, verify:

- [ ] `/api/stripe/debug` shows prices that match your code
- [ ] Stripe mode (test/live) matches your keys
- [ ] All prices show `active: true`
- [ ] `ENABLE_PAYMENTS=true` in Vercel
- [ ] `NEXT_PUBLIC_ENABLE_PAYMENTS=true` in Vercel
- [ ] Redeployed after making changes

## Still Not Working?

1. **Check browser console** for the full error message
2. **Check Vercel function logs**:
   - Go to Vercel Dashboard → Deployments → Latest → Functions
   - Look for errors in `/api/stripe/create-checkout`
3. **Check Network tab**:
   - Open DevTools → Network
   - Click subscribe button
   - Click on the `/api/stripe/create-checkout` request
   - Check the Response tab for the actual error message

