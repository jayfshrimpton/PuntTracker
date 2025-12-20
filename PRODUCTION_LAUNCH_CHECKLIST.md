# 🚀 Production Launch Checklist - 15 Minute Guide

## ⚡ CRITICAL: Set These in Vercel NOW

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Make sure all variables are set for **Production** environment (and Preview if needed).

### 1. Supabase Configuration (REQUIRED)

```
NEXT_PUBLIC_SUPABASE_URL
```
- **Value**: Your production Supabase project URL
- **Where**: Supabase Dashboard → Settings → API → Project URL
- **Example**: `https://xxxxx.supabase.co`

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- **Value**: Your Supabase anon/public key
- **Where**: Supabase Dashboard → Settings → API → anon public key
- **Format**: Long string starting with `eyJ...`

### 2. App URL (CRITICAL - Change from localhost!)

```
NEXT_PUBLIC_APP_URL
```
- **Value**: Your production domain (e.g., `https://puntersjournal.com.au`)
- **⚠️ MUST be your production domain, NOT localhost!**
- Used for: Email links, redirects, OAuth callbacks

```
NEXT_PUBLIC_SITE_URL
```
- **Value**: Same as above (e.g., `https://puntersjournal.com.au`)
- **Optional but recommended** - used for SEO (sitemap, robots.txt)

### 3. Stripe Configuration

```
STRIPE_SECRET_KEY
```
- **Value**: Your Stripe secret key
- **⚠️ If launching with payments DISABLED**: Use test key (`sk_test_...`)
- **⚠️ If launching with payments ENABLED**: Use live key (`sk_live_...`)

```
STRIPE_WEBHOOK_SECRET
```
- **Value**: Your Stripe webhook signing secret (starts with `whsec_...`)
- **Where**: Stripe Dashboard → Developers → Webhooks → [Your webhook] → Signing secret
- **⚠️ IMPORTANT**: Update webhook URL in Stripe to point to production:
  - `https://your-production-domain.com/api/stripe/webhook`

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
- **Value**: Your Stripe publishable key
- **Test mode**: `pk_test_...`
- **Live mode**: `pk_live_...`

### 4. Payment Feature Flags (CRITICAL!)

```
ENABLE_PAYMENTS
```
- **Value**: `false` (if payments disabled) OR `true` (if payments enabled)
- **⚠️ Set to `false` if you don't want payments active yet**

```
NEXT_PUBLIC_ENABLE_PAYMENTS
```
- **Value**: Same as above (`false` or `true`)
- **⚠️ Must match `ENABLE_PAYMENTS`**

### 5. Email Configuration (REQUIRED for cron jobs)

```
RESEND_API_KEY
```
- **Value**: Your Resend API key (starts with `re_...`)
- **Where**: [Resend Dashboard](https://resend.com/api-keys)

```
FROM_EMAIL
```
- **Value**: Your verified sender email (e.g., `noreply@puntersjournal.com.au`)
- **⚠️ Must match a verified domain in Resend**

```
SUPABASE_SERVICE_ROLE_KEY
```
- **Value**: Your Supabase service role key
- **Where**: Supabase Dashboard → Settings → API → service_role key
- **⚠️ SECURITY**: Never expose this in client-side code
- **Purpose**: Required for cron jobs to access all users

### 6. Cron Jobs Security

```
CRON_SECRET
```
- **Value**: A secure random string (32+ characters)
- **Purpose**: Protects cron endpoints from unauthorized access
- **Generate**: Use a password generator

### 7. Optional: AI Features

```
GEMINI_API_KEY
```
- **Value**: Your Google Gemini API key (if using AI insights)
- **Where**: [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## 🔧 Supabase Dashboard Changes

### 1. Update Site URL

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **URL Configuration**
3. Set **Site URL** to your production domain:
   ```
   https://puntersjournal.com.au
   ```
   (Replace with your actual domain)

### 2. Add Production Redirect URLs

In the same **URL Configuration** section, add these to **Redirect URLs**:

```
https://your-production-domain.com/auth/callback
https://your-production-domain.com/reset-password
```

**⚠️ Keep localhost URLs if you're still developing locally:**
```
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
```

---

## 💳 Stripe Dashboard Changes

### 1. Update Webhook Endpoint

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Find your webhook endpoint (or create a new one)
3. Update the endpoint URL to:
   ```
   https://your-production-domain.com/api/stripe/webhook
   ```
4. Make sure you're using the correct mode (Test or Live)
5. Copy the **Signing secret** and update `STRIPE_WEBHOOK_SECRET` in Vercel

### 2. Verify Stripe Keys

- **If payments are DISABLED**: Use test mode keys (`sk_test_...`, `pk_test_...`)
- **If payments are ENABLED**: Use live mode keys (`sk_live_...`, `pk_live_...`)

---

## 📧 Resend Email Configuration

### Verify Domain

1. Go to **Resend Dashboard** → **Domains**
2. Ensure your domain (e.g., `puntersjournal.com.au`) is verified
3. Verify DNS records are correct:
   - SPF Record (TXT)
   - DKIM Record (TXT)
   - DMARC Record (TXT) - Optional

### Verify FROM_EMAIL

- Make sure `FROM_EMAIL` in Vercel matches a verified domain
- Example: If domain is `puntersjournal.com.au`, use `noreply@puntersjournal.com.au`

---

## ✅ Final Verification Steps

### 1. Double-Check All Environment Variables

In Vercel, verify:
- [ ] All variables are set for **Production** environment
- [ ] `NEXT_PUBLIC_APP_URL` is your production domain (NOT localhost)
- [ ] `ENABLE_PAYMENTS` and `NEXT_PUBLIC_ENABLE_PAYMENTS` are set correctly
- [ ] All Supabase keys are from your production project
- [ ] Stripe keys match your intended mode (test/live)

### 2. Redeploy Application

**⚠️ CRITICAL**: After updating environment variables, you MUST redeploy:

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. OR push a new commit to trigger deployment

**Environment variables only apply to NEW deployments!**

### 3. Test Critical Flows

After deployment, test:

- [ ] **Authentication**: Sign up, login, password reset
- [ ] **Email links**: Click email verification and password reset links
- [ ] **Redirects**: Verify OAuth callbacks work
- [ ] **Payments**: If enabled, test checkout flow (use test mode first!)
- [ ] **Cron jobs**: Verify automated emails are working (may take time)

---

## 🚨 Common Mistakes to Avoid

1. **❌ Using localhost URLs in production**
   - `NEXT_PUBLIC_APP_URL` must be your production domain

2. **❌ Forgetting to redeploy after changing env vars**
   - Changes only apply to new deployments

3. **❌ Wrong Supabase Site URL**
   - Must match your production domain

4. **❌ Missing redirect URLs in Supabase**
   - Add both `/auth/callback` and `/reset-password`

5. **❌ Wrong Stripe webhook URL**
   - Must point to production domain

6. **❌ Using test keys when payments are enabled**
   - Use live keys (`sk_live_...`) for real payments

---

## 📋 Quick Reference: All Environment Variables

Copy this list and check off each one in Vercel:

### Required for Basic Functionality
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` ⚠️ **MUST BE PRODUCTION DOMAIN**
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `ENABLE_PAYMENTS` (set to `false` or `true`)
- [ ] `NEXT_PUBLIC_ENABLE_PAYMENTS` (must match above)

### Required for Email/Cron Jobs
- [ ] `RESEND_API_KEY`
- [ ] `FROM_EMAIL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `CRON_SECRET`

### Optional but Recommended
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `GEMINI_API_KEY` (if using AI)

---

## 🎯 5-Minute Quick Setup

If you're in a rush, focus on these **CRITICAL** ones first:

1. **Vercel Environment Variables** (most important):
   - `NEXT_PUBLIC_APP_URL` = Your production domain
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
   - `ENABLE_PAYMENTS` = `false` (if disabling payments)
   - `NEXT_PUBLIC_ENABLE_PAYMENTS` = `false` (if disabling payments)

2. **Supabase Dashboard**:
   - Site URL = Your production domain
   - Add redirect URLs: `/auth/callback` and `/reset-password`

3. **Redeploy** in Vercel

4. **Test** authentication flow

---

## 📞 Need Help?

- Check `VERCEL_ENV_SETUP.md` for detailed setup
- Check `SUPABASE_AUTH_SETUP.md` for auth configuration
- Check `STRIPE_SETUP.md` for payment setup
- Check Vercel deployment logs for errors

---

**Good luck with your launch! 🚀**

