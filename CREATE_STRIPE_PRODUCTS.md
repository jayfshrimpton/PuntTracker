# How to Create Stripe Products and Prices

Your Stripe account is connected, but you need to create the products and prices. Follow these steps:

## Step 1: Go to Stripe Dashboard

1. Open [Stripe Dashboard](https://dashboard.stripe.com)
2. **IMPORTANT**: Make sure you're in **Test Mode** (toggle in top right should say "Test mode")
3. Navigate to **Products** in the left sidebar

## Step 2: Create Pro Plan Product

1. Click **"+ Add product"** button
2. Fill in:
   - **Name**: `Pro Plan`
   - **Description**: `For serious bettors`
3. Under **Pricing**, click **"Add pricing"**
4. Set up the price:
   - **Price**: `15.00`
   - **Currency**: `AUD` (or your preferred currency)
   - **Billing period**: `Monthly` (recurring)
   - **Price description**: `$15/month`
5. Click **"Save product"**
6. **Copy the Price ID** (starts with `price_...`) - you'll need this!

## Step 3: Create Elite Plan Product

1. Click **"+ Add product"** again
2. Fill in:
   - **Name**: `Elite Plan`
   - **Description**: `Best value for pros`
3. Under **Pricing**, click **"Add pricing"**
4. Set up the price:
   - **Price**: `25.00`
   - **Currency**: `AUD` (or your preferred currency)
   - **Billing period**: `Monthly` (recurring)
   - **Price description**: `$25/month`
5. Click **"Save product"**
6. **Copy the Price ID** (starts with `price_...`) - you'll need this!

## Step 4: Get the Price IDs

For each product you created:

1. Click on the product name
2. Under the **Pricing** section, you'll see the price you created
3. Click on the price
4. At the top of the price details page, you'll see the **Price ID**
5. Copy the entire Price ID (it starts with `price_`)

**Important**: 
- You need the **Price ID**, NOT the Product ID
- Price IDs start with `price_`
- Product IDs start with `prod_` (don't use these!)

## Step 5: Update Your Code

1. Open `app/pricing/page.tsx`
2. Replace the placeholder Price IDs with your actual Price IDs:

```typescript
{
    name: 'Pro',
    priceId: 'price_YOUR_ACTUAL_PRICE_ID_HERE', // Replace this
    // ...
},
{
    name: 'Elite',
    priceId: 'price_YOUR_ACTUAL_PRICE_ID_HERE', // Replace this
    // ...
}
```

## Step 6: Verify

1. Restart your development server
2. Visit `http://localhost:3000/api/stripe/debug` again
3. You should now see your products and prices listed
4. Try the checkout flow again

## Troubleshooting

### Products don't show up in debug endpoint
- Make sure you're in **Test Mode** in Stripe Dashboard
- Make sure your `STRIPE_SECRET_KEY` starts with `sk_test_`
- Refresh the debug page after creating products

### Price ID doesn't work
- Double-check you copied the entire Price ID
- Make sure it starts with `price_` (not `prod_`)
- Verify the price is active (not archived)
- Make sure you're using test mode Price IDs with test mode API keys

### Still having issues?
- Check that your `.env.local` file has the correct `STRIPE_SECRET_KEY`
- Make sure you restarted your dev server after updating environment variables
- Verify the Price IDs match exactly what's shown in Stripe Dashboard

