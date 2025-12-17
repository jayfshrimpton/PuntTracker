# Cron Jobs Setup Guide with Resend API

This guide walks you through setting up automated email cron jobs using Resend API for Punter's Journal.

## Overview

The application includes automated email functionality:

1. **Welcome Email** - Automatically sent when a user verifies their email address (triggered immediately)
2. **Monthly Summary Emails** - Sends betting summaries to users on the 1st of each month (cron job)
3. **Verification Reminder Emails** - Sends reminders to unverified users 24-48 hours after signup (cron job)

## Prerequisites

✅ **Completed**: DNS records added to your domain  
✅ **Completed**: Domain verified in Resend  
✅ **Next**: Configure environment variables and deploy

## Step 1: Verify Resend Domain Setup

Since you've added DNS records, verify your domain is fully verified in Resend:

1. Go to [Resend Domains](https://resend.com/domains)
2. Check that your domain shows as **Verified** ✅
3. If not verified, wait a few minutes for DNS propagation (can take up to 48 hours)

## Step 2: Configure Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

### Required Variables

```env
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email sender (must match your verified domain)
FROM_EMAIL=noreply@yourdomain.com.au

# Your app URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com.au

# Secret token for cron job authentication
CRON_SECRET=your-long-random-secret-string-here

# Supabase Service Role Key (for accessing all users)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### How to Add in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (from [Resend API Keys](https://resend.com/api-keys))
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
5. Repeat for all variables above
6. **Important**: Generate a secure `CRON_SECRET` using a password generator (at least 32 characters)

## Step 3: Verify vercel.json Configuration

The `vercel.json` file is already configured with:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-monthly-summaries",
      "schedule": "0 9 1 * *"
    },
    {
      "path": "/api/cron/send-verification-reminder",
      "schedule": "0 10 * * *"
    }
  ]
}
```

**Cron Schedule Details:**
- **Monthly Summaries**: `0 9 1 * *` = 9:00 AM UTC on the 1st of each month
- **Verification Reminders**: `0 10 * * *` = 10:00 AM UTC daily

## Step 4: Deploy to Vercel

After adding environment variables:

1. Commit and push your changes (if `vercel.json` is new)
2. Vercel will automatically deploy
3. Or manually trigger a redeploy:
   - Go to **Deployments** tab
   - Click **⋯** on latest deployment
   - Click **Redeploy**

## Step 5: Verify Cron Jobs Are Active

After deployment, verify cron jobs are set up:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Cron Jobs**
2. You should see two cron jobs listed:
   - `/api/cron/send-monthly-summaries` (Monthly)
   - `/api/cron/send-verification-reminder` (Daily)

**Note**: Cron jobs may take a few minutes to appear after deployment.

## Step 6: Test the Cron Jobs

### Test Monthly Summary Cron Job

```bash
curl -X GET https://yourdomain.com.au/api/cron/send-monthly-summaries \
  -H "Authorization: Bearer your-cron-secret-token"
```

Expected response:
```json
{
  "success": true,
  "message": "Monthly summaries processed",
  "results": {
    "total": 5,
    "sent": 5,
    "failed": 0,
    "skipped": 0,
    "errors": []
  }
}
```

### Test Verification Reminder Cron Job

```bash
curl -X GET https://yourdomain.com.au/api/cron/send-verification-reminder \
  -H "Authorization: Bearer your-cron-secret-token"
```

Expected response:
```json
{
  "success": true,
  "processed": 2,
  "sent": 2,
  "failed": 0
}
```

## Email Details

### Welcome Email (Automatic)

**Trigger**: Sent automatically when a user verifies their email address

**What it does**:
- Triggered immediately after email verification is completed
- Sent only to newly verified users (within 10 minutes of verification)
- Includes welcome message, getting started tips, and links to dashboard

**Email includes**:
- Welcome message
- Overview of features
- Quick tips for getting started
- Links to dashboard and getting started guide

**Note**: This is not a cron job - it's triggered automatically via the `/api/email/welcome` endpoint when users verify their email.

### Monthly Summary Email (`/api/cron/send-monthly-summaries`)

**Schedule**: 1st of each month at 9:00 AM UTC

**What it does**:
- Finds all users with bets in the previous month
- Calculates monthly statistics (profit, ROI, strike rate, etc.)
- Sends personalized email summary to each user
- Respects user email preferences (`email_notifications_enabled`)

**Email includes**:
- Total Profit/Loss
- Total Turnover
- Total Bets, Winning Bets, Losing Bets
- Strike Rate, ROI, POT
- Best Win and Worst Loss
- Average Odds
- Link to dashboard

### Verification Reminder Email (`/api/cron/send-verification-reminder`)

**Schedule**: Daily at 10:00 AM UTC

**What it does**:
- Finds users who signed up 24-48 hours ago
- Checks if they haven't verified their email
- Sends a verification reminder email with magic link
- Includes rate limiting to avoid Supabase API limits

**Email includes**:
- Welcome message
- Verification link (magic link)
- Security notice
- Link to dashboard

## Monitoring Cron Jobs

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on a deployment
3. Click **Functions** tab
4. Look for cron job executions and logs

### Check Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/emails)
2. View sent emails and delivery status
3. Check for any bounce or delivery errors

### Check Supabase Logs

1. Go to Supabase Dashboard → **Logs**
2. Monitor database queries and API calls
3. Check for any errors in cron job execution

## Troubleshooting

### Cron Jobs Not Running

**Problem**: Cron jobs don't appear in Vercel dashboard

**Solutions**:
1. Verify `vercel.json` is in the project root
2. Ensure the file is committed and pushed to git
3. Redeploy the application
4. Wait a few minutes for cron jobs to register

### Emails Not Sending

**Problem**: Cron job runs but emails aren't sent

**Check**:
1. ✅ `RESEND_API_KEY` is set correctly
2. ✅ `FROM_EMAIL` matches verified domain
3. ✅ Domain is verified in Resend
4. ✅ Check Resend dashboard for error logs
5. ✅ Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

### Authentication Errors

**Problem**: Cron endpoints return 401 Unauthorized

**Solutions**:
1. Verify `CRON_SECRET` is set in Vercel environment variables
2. Check that the secret matches when testing manually
3. Ensure environment variable is set for Production environment
4. Redeploy after adding/updating `CRON_SECRET`

### No Users Receiving Emails

**Problem**: Cron job runs successfully but no emails sent

**Check**:
1. Users have `email_notifications_enabled = true` in profiles
2. Users have bets in the previous month (for monthly summaries)
3. Users exist in the time range (for verification reminders)
4. User emails are valid and not blocked

### Rate Limiting Issues

**Problem**: Verification reminder cron hits rate limits

**Note**: The verification reminder cron includes built-in rate limiting (6 seconds between requests) to avoid Supabase API limits. If you have many unverified users, the cron may take longer to complete.

## Security Best Practices

1. **Never expose `CRON_SECRET`** - Keep it private and rotate periodically
2. **Use service role key only server-side** - Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
3. **Monitor cron job logs** - Check for suspicious activity
4. **Rotate secrets regularly** - Update `CRON_SECRET` every 90 days
5. **Limit cron job access** - Only Vercel should be able to call these endpoints

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `RESEND_API_KEY` - Your Resend API key
- [ ] `FROM_EMAIL` - Email address from verified domain
- [ ] `NEXT_PUBLIC_APP_URL` - Your app URL
- [ ] `CRON_SECRET` - Secure random string (32+ characters)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

## Next Steps

After setup:

1. ✅ Monitor first cron job execution
2. ✅ Check email delivery in Resend dashboard
3. ✅ Verify users receive emails correctly
4. ✅ Set up email preferences UI (optional)
5. ✅ Monitor cron job performance over time

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Resend email logs
3. Check Supabase logs
4. Review error messages in cron job responses
5. Verify all environment variables are set correctly

## Additional Resources

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Resend API Documentation](https://resend.com/docs)
- [Supabase Admin API](https://supabase.com/docs/reference/javascript/auth-admin-api)

