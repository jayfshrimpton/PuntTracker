# Resend Email Integration Setup Guide

This guide documents the complete Resend email integration for PuntTracker.

## ✅ Implementation Complete

All email functionality has been implemented and is ready to use.

## 📁 Files Created/Updated

### Core Email Functions
- **`lib/resend.ts`** - Main email utility with three email functions:
  - `sendVerificationEmail()` - Email verification for new signups
  - `sendPasswordResetEmail()` - Password reset emails
  - `sendMonthlySummary()` - Monthly summary emails for Pro/Elite users

### API Routes
- **`app/api/emails/send/route.ts`** - Manual email sending endpoint
- **`app/api/cron/monthly-summary/route.ts`** - Automated monthly summary cron job
- **`app/api/test/emails/route.ts`** - Testing endpoint for emails
- **`app/auth/callback/route.ts`** - Server-side auth callback handler

### Testing Utilities
- **`lib/test-emails.ts`** - Helper functions for testing emails

### Configuration
- **`vercel.json`** - Updated with monthly summary cron schedule

## 🔧 Environment Variables Required

Add these to your `.env.local` (and Vercel environment variables):

```env
# Resend API Key (get from resend.com)
RESEND_API_KEY=re_your_actual_key_here

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://puntersjournal.com.au

# Email sender address (must be verified domain in Resend)
FROM_EMAIL=noreply@puntersjournal.com.au

# Optional: Additional email addresses
UPDATES_EMAIL=updates@puntersjournal.com.au
INSIGHTS_EMAIL=insights@puntersjournal.com.au

# Cron secret for protecting cron endpoints
CRON_SECRET=your_random_secret_here

# Optional: Admin secret for test endpoints
ADMIN_SECRET=your_admin_secret_here
```

## 📧 Email Functions

### 1. Verification Email

**Function:** `sendVerificationEmail(params)`

**Usage:**
```typescript
import { sendVerificationEmail } from '@/lib/resend';

await sendVerificationEmail({
  to: 'user@example.com',
  verificationUrl: 'https://puntersjournal.com.au/auth/callback?token_hash=xxx&type=signup',
  userName: 'John Doe', // optional
});
```

**Features:**
- Professional HTML template with PuntTracker branding
- Mobile-responsive design
- 24-hour expiration warning
- Alternative plain text link
- Australian tone ("G'day mate")

### 2. Password Reset Email

**Function:** `sendPasswordResetEmail(params)`

**Usage:**
```typescript
import { sendPasswordResetEmail } from '@/lib/resend';

await sendPasswordResetEmail({
  to: 'user@example.com',
  resetUrl: 'https://puntersjournal.com.au/reset-password?token_hash=xxx&type=recovery',
  userName: 'John Doe', // optional
});
```

**Features:**
- Clear "Password Reset Request" heading
- Prominent CTA button
- 1-hour expiration warning
- Security note if not requested
- Mobile-responsive

### 3. Monthly Summary Email

**Function:** `sendMonthlySummary(params)`

**Usage:**
```typescript
import { sendMonthlySummary } from '@/lib/resend';

await sendMonthlySummary({
  to: 'user@example.com',
  userName: 'John Doe', // optional
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

**Features:**
- Subject line includes emoji and P&L: "Your Monthly Punt Summary - 🎉 +$145.50"
- Visual stat cards (Total P&L, Bets, Strike Rate, ROI)
- Highlight boxes for best/worst bets and top venue
- "View Full Dashboard" CTA
- Professional gradient design

## 🔄 Integration with Supabase Auth

### Email Verification Flow

1. User signs up → Supabase sends verification email (can use Supabase templates or Resend)
2. User clicks link → Redirects to `/auth/callback?token_hash=xxx&type=signup`
3. `app/auth/callback/route.ts` handles verification
4. User redirected to dashboard with success message

### Password Reset Flow

1. User requests reset → `app/forgot-password/page.tsx` calls `supabase.auth.resetPasswordForEmail()`
2. Supabase sends reset email (can use Supabase templates or Resend)
3. User clicks link → Redirects to `/reset-password` with hash
4. `app/reset-password/page.tsx` handles password update

**Note:** Currently, Supabase handles password reset emails automatically. To use Resend instead:
- Option 1: Configure Supabase email templates to use Resend SMTP
- Option 2: Create a custom API route that intercepts password reset requests

## 🤖 Monthly Summary Cron Job

### Automatic Execution

The cron job runs automatically on the 1st of each month at 9am AEST (11pm UTC on the 1st).

**Schedule:** `0 23 1 * *` (in `vercel.json`)

### What It Does

1. Fetches all Pro/Elite subscribers from `subscriptions` table
2. For each subscriber:
   - Gets their bets from the last month
   - Calculates monthly stats
   - Finds best/worst bets and top venue
   - Sends monthly summary email
3. Skips users who:
   - Have disabled email notifications
   - Have no bets in the last month
   - Don't have a valid email address

### Manual Testing

You can manually trigger the cron job:

```bash
curl -X GET "https://your-domain.com/api/cron/monthly-summary" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 🧪 Testing Emails

### Test Endpoint

Use the test endpoint to send sample emails:

```bash
# Test verification email
curl "https://your-domain.com/api/test/emails?type=verification" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Test password reset email
curl "https://your-domain.com/api/test/emails?type=reset" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Test monthly summary email
curl "https://your-domain.com/api/test/emails?type=summary" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Test all emails
curl "https://your-domain.com/api/test/emails?type=all" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

**Note:** Test emails are sent to `jayfshrimpton@gmail.com` by default (configured in `lib/test-emails.ts`).

### Manual Email Sending API

Send emails programmatically:

```typescript
// POST /api/emails/send
{
  "type": "verification" | "reset" | "summary",
  "to": "user@example.com",
  "data": {
    "verificationUrl": "...", // for verification
    "resetUrl": "...", // for reset
    "userName": "...", // optional
    "summaryData": { ... } // for summary
  }
}
```

## 📋 Supabase Email Template Configuration

### Option 1: Use Supabase Templates (Current)

Supabase sends emails using its own templates. You can customize these in:
- Supabase Dashboard → Authentication → Email Templates

### Option 2: Use Resend SMTP (Recommended)

1. Go to Supabase Dashboard → Authentication → SMTP Settings
2. Configure SMTP:
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) or `587` (TLS)
   - Username: `resend`
   - Password: Your Resend API key
   - Sender email: `noreply@puntersjournal.com.au` (must be verified in Resend)

This way, Supabase will send emails through Resend, giving you better deliverability and analytics.

## ✅ Testing Checklist

After setup, test:

1. ✅ **Verification Email**
   - Sign up a new user
   - Check email inbox
   - Click verification link
   - Verify redirects to dashboard

2. ✅ **Password Reset Email**
   - Request password reset
   - Check email inbox
   - Click reset link
   - Verify redirects to reset password page
   - Complete password reset

3. ✅ **Monthly Summary Email**
   - Wait for cron job or trigger manually
   - Check Pro/Elite user inboxes
   - Verify email renders correctly on:
     - Desktop Gmail
     - Mobile Gmail
     - Outlook
     - Apple Mail

4. ✅ **Email Links**
   - All links use absolute URLs
   - Links work correctly
   - Redirects function properly

5. ✅ **Spam Testing**
   - Check emails don't go to spam
   - Verify SPF/DKIM records in Resend
   - Check email headers

## 🔒 Security Considerations

- ✅ `RESEND_API_KEY` never exposed to client
- ✅ Email addresses validated before sending
- ✅ Cron routes protected with `CRON_SECRET`
- ✅ Test endpoints protected with `ADMIN_SECRET`
- ✅ Rate limiting handled by Resend (100 emails/day on free tier)

## 📊 Monitoring

### Resend Dashboard

Monitor email delivery:
- Go to [Resend Dashboard](https://resend.com/emails)
- View sent emails, delivery status, opens, clicks
- Check for bounces or spam reports

### Application Logs

Check server logs for:
- Email sending errors
- Cron job execution results
- Failed email deliveries

## 🐛 Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain is verified in Resend
3. Check `FROM_EMAIL` matches verified domain
4. Review Resend dashboard for error logs
5. Check application logs for errors

### Cron Job Not Running

1. Verify `CRON_SECRET` is set in Vercel
2. Check `vercel.json` cron schedule is correct
3. Verify cron job path matches route file
4. Check Vercel cron logs

### Emails Going to Spam

1. Verify SPF/DKIM records in Resend
2. Check domain reputation
3. Ensure email content isn't spammy
4. Warm up domain if new

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Vercel Cron Documentation](https://vercel.com/docs/cron-jobs)

## 🎉 Success Criteria

- ✅ All three email types send successfully
- ✅ Emails render properly on mobile and desktop
- ✅ Supabase auth flow works with custom emails
- ✅ Monthly summaries automatically send to Pro/Elite users
- ✅ Professional appearance matching PuntTracker brand
- ✅ No emails go to spam folder
- ✅ Proper error handling and logging throughout

