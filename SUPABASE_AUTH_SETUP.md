# Supabase Authentication Setup Guide

This guide explains how to configure Supabase authentication to work correctly with both localhost (development) and production.

## Critical Configuration Steps

### 1. Configure Site URL in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **URL Configuration**
3. Set the **Site URL**:
   - For **development**: `http://localhost:3000`
   - For **production**: `https://your-production-domain.com`
   
   **Important**: You can only set ONE Site URL at a time. For development, temporarily change it to `http://localhost:3000`.

### 2. Add Redirect URLs

In the same **URL Configuration** section, add these URLs to the **Redirect URLs** list:

**For Development:**
```
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
```

**For Production:**
```
https://your-production-domain.com/auth/callback
https://your-production-domain.com/reset-password
```

**Important**: 
- Add BOTH localhost URLs if you're developing locally
- Add BOTH production URLs for your live site
- Supabase will ONLY redirect to URLs in this allowed list
- If a redirect URL is not in this list, Supabase will use the Site URL instead

### 3. Set Environment Variable

Make sure you have `NEXT_PUBLIC_APP_URL` set in your `.env.local` file:

**For Development (.env.local):**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Production (Vercel/Deployment):**
```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### 4. Email Templates Configuration

When setting up email templates in Supabase:

1. Go to **Authentication** → **Email Templates**
2. The templates use `{{ .ConfirmationURL }}` which automatically includes the correct redirect URL
3. Make sure your email templates don't hardcode URLs

## Troubleshooting

### Problem: Password reset links redirect to production instead of localhost

**Solution:**
1. Check that `http://localhost:3000/reset-password` is in your Supabase **Redirect URLs**
2. Check that your **Site URL** is set to `http://localhost:3000` (for development)
3. Verify `NEXT_PUBLIC_APP_URL=http://localhost:3000` in your `.env.local`
4. Restart your Next.js dev server after changing environment variables

### Problem: Signup confirmation links go to wrong URL

**Solution:**
1. Ensure `http://localhost:3000/auth/callback` is in **Redirect URLs**
2. Check that `emailRedirectTo` in signup code uses the correct base URL
3. Verify environment variables are set correctly

### Problem: "Redirect URL not allowed" error

**Solution:**
- Add the exact URL (including path) to the **Redirect URLs** list in Supabase
- URLs are case-sensitive and must match exactly
- Include the protocol (`http://` or `https://`)

## Quick Checklist

Before testing authentication flows:

- [ ] Site URL is set correctly for your environment
- [ ] All redirect URLs are added to the allowed list
- [ ] `NEXT_PUBLIC_APP_URL` is set in `.env.local` (for localhost) or environment variables (for production)
- [ ] Next.js dev server has been restarted after changing environment variables
- [ ] Email templates in Supabase use `{{ .ConfirmationURL }}` variable

## Switching Between Development and Production

When switching between localhost and production:

1. **For Local Development:**
   - Set Supabase Site URL to `http://localhost:3000`
   - Ensure localhost URLs are in Redirect URLs
   - Set `NEXT_PUBLIC_APP_URL=http://localhost:3000` in `.env.local`

2. **For Production:**
   - Set Supabase Site URL to your production domain
   - Ensure production URLs are in Redirect URLs
   - Set `NEXT_PUBLIC_APP_URL` to your production domain in Vercel/deployment environment variables

**Note**: You may need to maintain both localhost and production URLs in the Redirect URLs list simultaneously if you're actively developing.

