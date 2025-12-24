# Stripe Coupon/Promotion Code "Invalid" Error - Troubleshooting

## The Problem

When entering a coupon/promotion code in Stripe Checkout, it shows as "invalid". This is usually a Stripe configuration issue, not a code issue.

## Common Causes

1. **Coupon doesn't exist** in your Stripe account
2. **Coupon is in the wrong mode** (test vs live)
3. **Coupon is not active** (archived or deleted)
4. **Coupon has restrictions** that don't match:
   - Product restrictions (only works with specific products)
   - Customer restrictions (only works for specific customers)
   - Expired (past redemption end date)
   - Usage limit reached (max redemptions exceeded)
   - Minimum amount requirements not met

## Quick Diagnostic Steps

### Step 1: Check Stripe Mode

1. Go to **Vercel Dashboard** → Environment Variables
2. Check `STRIPE_SECRET_KEY`:
   - `sk_test_...` = **Test mode**
   - `sk_live_...` = **Live mode**

3. **The coupon must be in the SAME mode!**

### Step 2: Verify Coupon Exists in Stripe

1. Go to **Stripe Dashboard**
2. Navigate to **Products** → **Coupons** (or **Promotions**)
3. Search for your coupon code
4. Check if it exists and is **active**

### Step 3: Check Coupon Settings

Click on the coupon in Stripe Dashboard and verify:

#### ✅ **Status**
- Must be **Active** (not archived)

#### ✅ **Redemption**
- **Redemption end date**: Not expired
- **Max redemptions**: Not reached (if set)
- **Times redeemed**: Less than max (if limit exists)

#### ✅ **Restrictions**
- **Applies to**: 
  - If set to "Specific products", make sure your products are included
  - If set to "All products", should work
- **Minimum amount**: Your subscription price must meet this (if set)
- **First time customers only**: Check if this applies

#### ✅ **Duration**
- **Once**: Can only be used once per customer
- **Forever**: Can be reused
- **Repeating**: Check the duration settings

### Step 4: Test the Coupon

1. **In Test Mode** (if using test keys):
   - Go to Stripe Dashboard → **Test mode** (toggle in top right)
   - Products → Coupons
   - Find your coupon
   - Try using it in a test checkout

2. **In Live Mode** (if using live keys):
   - Go to Stripe Dashboard → **Live mode** (toggle in top right)
   - Products → Coupons
   - Find your coupon
   - Try using it in checkout

## Common Issues & Solutions

### Issue 1: Coupon Doesn't Exist

**Symptom**: Can't find the coupon in Stripe Dashboard

**Solution**: Create the coupon:
1. Go to Stripe Dashboard → Products → **Coupons**
2. Click **"Create coupon"**
3. Enter:
   - **Code**: The exact code users will enter (case-sensitive!)
   - **Discount**: Percentage or fixed amount
   - **Duration**: Once, Forever, or Repeating
4. Click **"Create coupon"**

### Issue 2: Wrong Stripe Mode

**Symptom**: Coupon exists but in wrong mode (test vs live)

**Solution**:
- **Option A**: Create the coupon in the correct mode
  - If using test keys, create coupon in **Test mode**
  - If using live keys, create coupon in **Live mode**

- **Option B**: Switch Stripe keys to match where coupon exists
  - If coupon is in test mode, use `sk_test_...` key
  - If coupon is in live mode, use `sk_live_...` key

### Issue 3: Coupon is Archived/Inactive

**Symptom**: Coupon exists but shows as inactive or archived

**Solution**:
1. Go to Stripe Dashboard → Products → Coupons
2. Find the coupon
3. Click on it
4. If archived, click **"Restore"** or **"Activate"**

### Issue 4: Product Restrictions

**Symptom**: Coupon exists but doesn't apply to your products

**Solution**:
1. Go to Stripe Dashboard → Products → Coupons
2. Click on your coupon
3. Check **"Applies to"** section:
   - If set to **"Specific products"**, add your Pro/Elite products
   - Or change to **"All products"** to apply to everything

### Issue 5: Expired or Usage Limit Reached

**Symptom**: Coupon was working but now shows invalid

**Solution**:
1. Check **"Redemption end date"**: Has it expired?
2. Check **"Max redemptions"**: Has the limit been reached?
3. If expired, create a new coupon or extend the end date
4. If limit reached, increase max redemptions or create new coupon

### Issue 6: Minimum Amount Not Met

**Symptom**: Coupon exists but doesn't apply

**Solution**:
1. Check if coupon has a **"Minimum amount"** requirement
2. Your subscription price must be equal to or greater than this amount
3. Either:
   - Remove the minimum amount requirement, OR
   - Increase your subscription price to meet the minimum

## Step-by-Step Fix

1. **Identify your Stripe mode**:
   - Check `STRIPE_SECRET_KEY` in Vercel
   - Note if it's test (`sk_test_...`) or live (`sk_live_...`)

2. **Go to Stripe Dashboard**:
   - Toggle to the correct mode (test/live) in top right
   - Navigate to **Products** → **Coupons**

3. **Find or create your coupon**:
   - Search for the coupon code
   - If not found, create it
   - Make sure it's **Active**

4. **Check coupon settings**:
   - Status: Active ✅
   - Not expired ✅
   - Usage limit not reached ✅
   - Applies to your products ✅
   - No minimum amount (or price meets minimum) ✅

5. **Test the coupon**:
   - Try entering it in checkout
   - If still invalid, check the exact error message

## Creating a New Coupon

If you need to create a new coupon:

1. **Stripe Dashboard** → **Products** → **Coupons** → **Create coupon**

2. **Basic Settings**:
   - **Code**: Enter the code (e.g., `LAUNCH20`)
   - **Name**: Internal name (optional)
   - **Discount**: 
     - Percentage (e.g., 20% off)
     - Fixed amount (e.g., $5 off)

3. **Duration**:
   - **Once**: Customer can use once
   - **Forever**: Customer can reuse
   - **Repeating**: For X months

4. **Restrictions** (optional):
   - **Applies to**: All products or specific products
   - **Minimum amount**: Minimum purchase required
   - **First time customers only**: Check if needed

5. **Redemption**:
   - **Redemption end date**: When coupon expires (optional)
   - **Max redemptions**: Total times it can be used (optional)

6. Click **"Create coupon"**

## Testing Coupons

### Test Mode Testing

1. Make sure you're in **Test mode** in Stripe Dashboard
2. Create a test coupon
3. Use test card: `4242 4242 4242 4242`
4. Enter the coupon code in checkout
5. Verify it applies correctly

### Live Mode Testing

1. Make sure you're in **Live mode** in Stripe Dashboard
2. Create the coupon
3. Test with a real card (small amount)
4. Verify it applies correctly

## Important Notes

- **Coupon codes are case-sensitive** in Stripe
- **Test and Live modes are separate** - coupons don't transfer between them
- **Promotion codes** (newer Stripe feature) work similarly but have different settings
- **Archived coupons** cannot be used even if restored (create new one)

## Still Not Working?

1. **Check Stripe Dashboard logs**:
   - Go to Stripe Dashboard → **Developers** → **Logs**
   - Look for errors related to coupon validation

2. **Verify checkout session**:
   - The checkout session is created with `allow_promotion_codes: true` ✅
   - This is already set in your code

3. **Try a simple test coupon**:
   - Create a new coupon with no restrictions
   - Code: `TEST10`
   - 10% off, Forever duration
   - Applies to all products
   - No minimum amount
   - No expiration
   - Test if this works

4. **Check the exact error**:
   - In Stripe Checkout, the error message might give more details
   - Common messages:
     - "This coupon does not apply to any of the items in your cart"
     - "This coupon has expired"
     - "This coupon has reached its redemption limit"




