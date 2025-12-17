# Quick Start: Email Setup Guide

## 🔐 Step 1: Get Your Cron Secret

The **CRON_SECRET** is just a random string you create yourself. It's used to protect your cron endpoints from unauthorized access.

### Generate a Cron Secret

**Option 1: Use Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Use Online Generator**
- Visit: https://randomkeygen.com/
- Use a "CodeIgniter Encryption Keys" or "Fort Knox Passwords"
- Copy a long random string (at least 32 characters)

**Option 3: Use PowerShell (Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Example Cron Secret:**
```
CRON_SECRET=a7f3b9c2d8e4f1a6b9c3d7e2f5a8b1c4d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4
```

**Important:** 
- Keep this secret secure
- Use different secrets for development and production
- Never commit secrets to git

---

## 📧 Step 2: Get Your Resend API Key

### 1. Sign Up for Resend (if you haven't)

1. Go to [resend.com](https://resend.com)
2. Click **"Sign Up"** (free tier available - 3,000 emails/month)
3. Verify your email address

### 2. Get Your API Key

1. Log in to [Resend Dashboard](https://resend.com/login)
2. Go to **API Keys** (in the left sidebar)
3. Click **"Create API Key"**
4. Give it a name (e.g., "PuntTracker Production")
5. Copy the API key (starts with `re_`)
   - ⚠️ **Important:** You can only see it once! Copy it immediately.

**Example API Key:**
```
RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz
```

### 3. Verify Your Domain (Required)

To send emails from `@puntersjournal.com.au`, you need to verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **"Add Domain"**
3. Enter: `puntersjournal.com.au`
4. Add the DNS records Resend provides:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT) - Optional but recommended
5. Wait for verification (usually takes a few minutes)
6. Once verified ✅, you can send emails from `noreply@puntersjournal.com.au`

**Note:** If you haven't verified your domain yet, you can still test with Resend's test domain, but emails will come from `onboarding@resend.dev`

---

## ⚙️ Step 3: Set Up Environment Variables

### Local Development (`.env.local`)

Create or update `.env.local` in your project root:

```env
# Resend API Key (from resend.com)
RESEND_API_KEY=re_your_actual_api_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email sender (must match verified domain in Resend)
FROM_EMAIL=noreply@puntersjournal.com.au

# Cron secret (generate using methods above)
CRON_SECRET=your_generated_secret_here

# Optional: Admin secret for test endpoints
ADMIN_SECRET=your_admin_secret_here
```

### Production (Vercel)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - `RESEND_API_KEY` = Your Resend API key
   - `NEXT_PUBLIC_APP_URL` = `https://puntersjournal.com.au`
   - `FROM_EMAIL` = `noreply@puntersjournal.com.au`
   - `CRON_SECRET` = Your generated secret
   - `ADMIN_SECRET` = Your admin secret (optional)

**Important:** 
- Set environment to **Production** (and Preview if needed)
- Click **Save** after adding each variable
- Redeploy your app after adding variables

---

## 🧪 Step 4: Test Your Setup

### Test 1: Send a Test Email

**Option A: Using the Test Endpoint**

```bash
# Test verification email
curl -X GET "http://localhost:3000/api/test/emails?type=verification" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Test password reset email
curl -X GET "http://localhost:3000/api/test/emails?type=reset" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Test monthly summary email
curl -X GET "http://localhost:3000/api/test/emails?type=summary" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Test all emails
curl -X GET "http://localhost:3000/api/test/emails?type=all" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

**Option B: Using Code**

Create a test file `test-email.ts`:

```typescript
import { sendVerificationEmail } from './lib/resend';

async function test() {
  const result = await sendVerificationEmail({
    to: 'jayfshrimpton@gmail.com',
    verificationUrl: 'https://puntersjournal.com.au/auth/callback?token_hash=test&type=signup',
    userName: 'Test User',
  });
  
  console.log('Email sent:', result);
}

test();
```

Run it:
```bash
npx tsx test-email.ts
```

### Test 2: Check Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Click **"Emails"** in the sidebar
3. You should see your test emails
4. Click on an email to see:
   - Delivery status
   - Opens/clicks (if tracking enabled)
   - Any errors

### Test 3: Verify Email Delivery

- Check your inbox (and spam folder)
- Emails should arrive within seconds
- If not in inbox, check spam and Resend dashboard for errors

---

## 📝 Step 5: Send Emails in Your Code

### Example 1: Send Verification Email

```typescript
import { sendVerificationEmail } from '@/lib/resend';

// In your signup handler
const result = await sendVerificationEmail({
  to: user.email,
  verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token_hash=${token}&type=signup`,
  userName: user.name, // optional
});

if (!result.success) {
  console.error('Failed to send email:', result.error);
}
```

### Example 2: Send Password Reset Email

```typescript
import { sendPasswordResetEmail } from '@/lib/resend';

// In your password reset handler
const result = await sendPasswordResetEmail({
  to: user.email,
  resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token_hash=${token}&type=recovery`,
  userName: user.name, // optional
});
```

### Example 3: Send Monthly Summary

```typescript
import { sendMonthlySummary } from '@/lib/resend';

// In your cron job or API route
const result = await sendMonthlySummary({
  to: user.email,
  userName: user.name,
  summaryData: {
    totalBets: 45,
    profit: 145.50,
    roi: 12.5,
    strikeRate: 62.2,
    bestBet: {
      horse: 'Thunder Strike',
      profit: 87.50,
      venue: 'Flemington',
    },
    worstBet: {
      horse: 'Slow Poke',
      loss: -25.00,
      venue: 'Randwick',
    },
    topVenue: {
      name: 'Flemington',
      profit: 234.75,
    },
  },
});
```

### Example 4: Use the API Endpoint

```typescript
// POST /api/emails/send
const response = await fetch('/api/emails/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'verification',
    to: 'user@example.com',
    data: {
      verificationUrl: 'https://puntersjournal.com.au/auth/callback?token_hash=xxx&type=signup',
      userName: 'John Doe',
    },
  }),
});

const result = await response.json();
```

---

## 🔍 Troubleshooting

### "RESEND_API_KEY is not configured"

**Solution:** Make sure you've added `RESEND_API_KEY` to your `.env.local` file and restarted your dev server.

```bash
# Stop your dev server (Ctrl+C)
# Restart it
npm run dev
```

### "Domain not verified"

**Solution:** 
1. Go to Resend Dashboard → Domains
2. Verify your domain is verified ✅
3. Make sure `FROM_EMAIL` matches your verified domain
4. Wait a few minutes for DNS propagation

### "Unauthorized" when testing cron

**Solution:** Make sure you're using the correct `CRON_SECRET`:

```bash
curl -X GET "http://localhost:3000/api/cron/monthly-summary" \
  -H "Authorization: Bearer YOUR_ACTUAL_CRON_SECRET"
```

### Emails going to spam

**Solutions:**
1. Verify SPF/DKIM records are correctly set in DNS
2. Check domain reputation in Resend dashboard
3. Warm up your domain (start with small volumes)
4. Ensure email content isn't spammy

### Emails not sending

**Check:**
1. Resend API key is correct
2. Domain is verified in Resend
3. `FROM_EMAIL` matches verified domain
4. Check Resend dashboard for error logs
5. Check application console for errors

---

## 📚 Quick Reference

### Environment Variables Checklist

- [ ] `RESEND_API_KEY` - From resend.com API Keys
- [ ] `NEXT_PUBLIC_APP_URL` - Your app URL
- [ ] `FROM_EMAIL` - Must match verified domain
- [ ] `CRON_SECRET` - Random string you generate
- [ ] `ADMIN_SECRET` - Random string for test endpoints (optional)

### Resend Dashboard Links

- [Resend Dashboard](https://resend.com/emails)
- [API Keys](https://resend.com/api-keys)
- [Domains](https://resend.com/domains)
- [Documentation](https://resend.com/docs)

### Test Email Address

Default test emails go to: `jayfshrimpton@gmail.com`

Change this in `lib/test-emails.ts` if needed.

---

## ✅ Success Checklist

After setup, verify:

- [ ] Resend API key is set and working
- [ ] Domain is verified in Resend
- [ ] Test email sends successfully
- [ ] Email arrives in inbox (not spam)
- [ ] Cron secret is set and protects endpoints
- [ ] Environment variables are set in Vercel (for production)

You're all set! 🎉

