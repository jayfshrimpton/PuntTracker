# Email Notifications Setup Guide

This guide explains how to set up email notifications for monthly summaries in PuntTracker.

## Prerequisites

1. **Resend Account**: Sign up at [resend.com](https://resend.com) (free tier available)
2. **Supabase Service Role Key**: Get this from your Supabase project settings

## Setup Steps

### 1. Install Dependencies

The Resend package has already been installed. If you need to reinstall:

```bash
npm install resend
```

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file (or your deployment platform):

```env
# Resend API Key (get from resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email sender address (must be verified in Resend)
FROM_EMAIL=noreply@yourdomain.com

# Your app URL (for email links)
NEXT_PUBLIC_APP_URL=https://your-app-url.com

# Secret token for protecting the cron endpoint
CRON_SECRET=your-secret-token-here

# Supabase Service Role Key (for cron job to access all users)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important**: 
- The `FROM_EMAIL` must be a verified domain in Resend
- The `CRON_SECRET` should be a long, random string (use a password generator)
- The `SUPABASE_SERVICE_ROLE_KEY` is sensitive - never expose it in client-side code

### 3. Set Up Database Schema

Run the SQL in `email-preferences-schema.sql` in your Supabase SQL Editor. This will:

- Create a `profiles` table for user preferences
- Set up Row Level Security policies
- Create a trigger to automatically create profiles for new users
- Enable email notification preferences (default: enabled)

### 4. Verify Domain in Resend

1. Go to [resend.com/domains](https://resend.com/domains)
2. Add and verify your domain
3. Update DNS records as instructed
4. Once verified, you can use emails from that domain

### 5. Test Email Sending

You can test the email functionality by calling the API endpoint:

```bash
# Test sending a monthly summary for the current user
curl -X POST https://your-app-url.com/api/email/monthly-summary \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie"
```

Or test it from your dashboard by making a request from the browser console (while logged in).

### 6. Set Up Cron Job

To automatically send monthly summaries, set up a cron job that calls the endpoint on the 1st of each month.

#### Option A: Using Vercel Cron (Recommended if deployed on Vercel)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-monthly-summaries",
      "schedule": "0 9 1 * *"
    }
  ]
}
```

This runs at 9 AM UTC on the 1st of each month.

Then add the authorization header in your Vercel environment variables or use Vercel's cron job configuration.

#### Option B: Using External Cron Service (cron-job.org, EasyCron, etc.)

1. Sign up for a cron service
2. Create a new cron job:
   - **URL**: `https://your-app-url.com/api/cron/send-monthly-summaries`
   - **Schedule**: First day of each month (e.g., `0 9 1 * *`)
   - **Method**: GET
   - **Headers**: 
     - `Authorization: Bearer your-cron-secret-token`
3. Save and activate

#### Option C: Manual Trigger

You can manually trigger the cron job by calling:

```bash
curl -X GET https://your-app-url.com/api/cron/send-monthly-summaries \
  -H "Authorization: Bearer your-cron-secret-token"
```

## API Endpoints

### POST `/api/email/monthly-summary`

Sends a monthly summary email to the authenticated user for the previous month.

**Authentication**: Required (user must be logged in)

**Response**:
```json
{
  "success": true,
  "message": "Monthly summary email sent successfully"
}
```

### GET `/api/cron/send-monthly-summaries`

Sends monthly summary emails to all users who have bets in the previous month.

**Authentication**: Requires `Authorization: Bearer {CRON_SECRET}` header

**Response**:
```json
{
  "success": true,
  "message": "Monthly summaries processed",
  "results": {
    "total": 10,
    "sent": 8,
    "failed": 1,
    "skipped": 1,
    "errors": ["User user@example.com: Email sending failed"]
  }
}
```

## User Preferences

Users can control email notifications through the `profiles` table:

- `email_notifications_enabled`: Boolean flag (default: `true`)
- Users can update this through a settings page (to be implemented)

## Email Template

The monthly summary email includes:

- Total Profit/Loss for the month
- Total Turnover
- Total Bets, Winning Bets, Losing Bets
- Strike Rate, ROI, POT
- Best Win and Worst Loss
- Average Odds
- Link to view full dashboard

The email is sent in both HTML and plain text formats.

## Troubleshooting

### Emails not sending

1. Check Resend API key is correct
2. Verify domain is verified in Resend
3. Check `FROM_EMAIL` matches verified domain
4. Check Resend dashboard for error logs

### Cron job not working

1. Verify `CRON_SECRET` matches in both environment and request
2. Check cron service logs
3. Verify Supabase service role key is correct
4. Check server logs for errors

### Users not receiving emails

1. Check if user has `email_notifications_enabled = true` in profiles
2. Verify user has bets in the previous month
3. Check email wasn't marked as spam
4. Verify user email is valid

## Security Notes

- The cron endpoint is protected by a secret token - never expose `CRON_SECRET`
- The service role key bypasses RLS - only use server-side
- Email addresses are never exposed in error messages to unauthorized users
- All API routes validate authentication before processing

