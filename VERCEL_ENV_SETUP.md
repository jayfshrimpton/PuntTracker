# Vercel Environment Variables Setup Guide

This guide shows you how to set up all required environment variables in Vercel while ensuring **payments remain disabled** for your live version.

## Step-by-Step: Setting Environment Variables in Vercel

### 1. Access Vercel Project Settings

1. Go to [vercel.com](https://vercel.com) and log in
2. Navigate to your project dashboard
3. Click on your **PuntTracker** project
4. Click on **Settings** in the top navigation
5. Click on **Environment Variables** in the left sidebar

### 2. Required Environment Variables

Add the following environment variables one by one. **Make sure to set them for Production, Preview, AND Development** (or at least Production):

#### **Supabase Configuration (Required)**

```
NEXT_PUBLIC_SUPABASE_URL
```
- **Value**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- **Where to find**: Supabase Dashboard → Settings → API → Project URL

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- **Value**: Your Supabase anon/public key (long string starting with `eyJ...`)
- **Where to find**: Supabase Dashboard → Settings → API → anon public key

#### **Stripe Configuration (Required for app to build, but payments will be disabled)**

```
STRIPE_SECRET_KEY
```
- **Value**: Your Stripe test secret key (starts with `sk_test_...`)
- **Where to find**: [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys → Secret key
- **Important**: Use **test mode** keys (`sk_test_...`) for now, NOT live keys (`sk_live_...`)

```
STRIPE_WEBHOOK_SECRET
```
- **Value**: Your Stripe webhook signing secret (starts with `whsec_...`)
- **Where to find**: 
  1. Stripe Dashboard → Developers → Webhooks
  2. Create/select your webhook endpoint
  3. Copy the "Signing secret"
- **Note**: You'll need to create a webhook endpoint pointing to `https://your-domain.vercel.app/api/stripe/webhook`

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
- **Value**: Your Stripe test publishable key (starts with `pk_test_...`)
- **Where to find**: Stripe Dashboard → Developers → API keys → Publishable key
- **Note**: Optional but recommended

#### **App Configuration**

```
NEXT_PUBLIC_APP_URL
```
- **Value**: Your Vercel deployment URL (e.g., `https://puntracker.vercel.app`)
- **Note**: Update this after your first deployment if you have a custom domain

#### **Payment Feature Flags (CRITICAL - Set to false to disable payments)**

```
ENABLE_PAYMENTS
```
- **Value**: `false` ⚠️ **MUST BE SET TO `false`**
- **Purpose**: Server-side payment control

```
NEXT_PUBLIC_ENABLE_PAYMENTS
```
- **Value**: `false` ⚠️ **MUST BE SET TO `false`**
- **Purpose**: Client-side payment control

#### **Optional: Email Configuration (if using email features)**

```
RESEND_API_KEY
```
- **Value**: Your Resend API key (if using email features)
- **Where to find**: [Resend Dashboard](https://resend.com/api-keys)

```
FROM_EMAIL
```
- **Value**: Your sender email address (e.g., `noreply@yourdomain.com`)
- **Note**: Must be verified in Resend

#### **Optional: AI Insights (if using Gemini AI)**

```
GEMINI_API_KEY
```
- **Value**: Your Google Gemini API key
- **Where to find**: [Google AI Studio](https://makersuite.google.com/app/apikey)

#### **Optional: Cron Jobs**

```
CRON_SECRET
```
- **Value**: A random secret string for securing cron endpoints
- **Generate**: Use any random string generator or create a long random password

### 3. How to Add Each Variable in Vercel

For each environment variable:

1. Click **Add New** button
2. Enter the **Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
3. Enter the **Value** (paste your actual value)
4. **IMPORTANT**: Select which environments to apply to:
   - ✅ **Production** (your live site)
   - ✅ **Preview** (pull request previews)
   - ✅ **Development** (optional, for local dev)
5. Click **Save**

### 4. Critical Settings for Disabling Payments

**Double-check these two variables are set to `false`:**

```
ENABLE_PAYMENTS=false
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```

When these are set to `false`:
- ✅ Payment buttons will show "Coming Soon" or be disabled
- ✅ Checkout API will return errors if called
- ✅ Webhook processing is disabled
- ✅ Users cannot complete any payments
- ✅ Pricing page shows a "Payments Disabled" message

### 5. Verify Your Settings

After adding all variables:

1. Scroll through your environment variables list
2. Verify all required variables are present
3. **Especially verify** that `ENABLE_PAYMENTS` and `NEXT_PUBLIC_ENABLE_PAYMENTS` are both set to `false`
4. Make sure they're enabled for **Production** environment

### 6. Redeploy Your Application

After adding/updating environment variables:

1. Go to your project's **Deployments** tab
2. Click the **⋯** (three dots) menu on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

**Note**: Environment variables are only available to new deployments. You must redeploy after adding/updating them.

## Complete Environment Variables Checklist

Use this checklist to ensure you have everything:

### Required for Basic Functionality
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `STRIPE_SECRET_KEY` (test mode: `sk_test_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` (starts with `whsec_...`)
- [ ] `NEXT_PUBLIC_APP_URL` (your Vercel URL)
- [ ] `ENABLE_PAYMENTS=false` ⚠️ **CRITICAL**
- [ ] `NEXT_PUBLIC_ENABLE_PAYMENTS=false` ⚠️ **CRITICAL**

### Optional but Recommended
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test mode: `pk_test_...`)
- [ ] `RESEND_API_KEY` (if using email)
- [ ] `FROM_EMAIL` (if using email)
- [ ] `GEMINI_API_KEY` (if using AI insights)
- [ ] `CRON_SECRET` (if using cron jobs)

## Security Best Practices

1. **Never use live Stripe keys** (`sk_live_...`) until you're ready for real payments
2. **Always use test mode** (`sk_test_...`) during development
3. **Keep payment flags set to `false`** until you're ready to launch
4. **Don't share your environment variables** or commit them to git
5. **Rotate keys** if you suspect they've been compromised

## Testing That Payments Are Disabled

After deployment, verify payments are disabled:

1. Visit your pricing page: `https://your-app.vercel.app/pricing`
2. You should see a banner: "Paid plans are coming soon. Free plan is available now!"
3. Try clicking a "Subscribe" button - it should show a disabled state or error message
4. The checkout API should return a 503 error if somehow called

## When You're Ready to Enable Payments

1. **Test thoroughly** in test mode first
2. **Update environment variables** in Vercel:
   - Set `ENABLE_PAYMENTS=true`
   - Set `NEXT_PUBLIC_ENABLE_PAYMENTS=true`
3. **Switch to live Stripe keys**:
   - Replace `STRIPE_SECRET_KEY` with live key (`sk_live_...`)
   - Replace `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with live key (`pk_live_...`)
   - Update `STRIPE_WEBHOOK_SECRET` with live webhook secret
4. **Redeploy** your application
5. **Test** the payment flow with real (but small) test transactions

## Troubleshooting

### Build fails with "Module not found" errors
- Make sure all required environment variables are set
- Redeploy after adding variables

### Payments still work when they shouldn't
- Verify both `ENABLE_PAYMENTS` and `NEXT_PUBLIC_ENABLE_PAYMENTS` are `false`
- Check that they're set for Production environment
- Redeploy your application

### Stripe errors
- Make sure you're using test mode keys (`sk_test_...`, `pk_test_...`)
- Verify webhook secret matches your Stripe webhook endpoint
- Check that webhook URL in Stripe points to your Vercel deployment

## Need Help?

- Check the `STRIPE_SETUP.md` file for detailed Stripe configuration
- Review `README.md` for general setup instructions
- Check Vercel logs in the Deployments tab for specific errors

