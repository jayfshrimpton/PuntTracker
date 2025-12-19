# Supabase Redirect URL Troubleshooting

## Problem: "Add a valid URL" Error

When trying to add `https://puntersjournal.com.au/reset-password` to Supabase Redirect URLs, you get an error saying "add a valid URL".

## Solutions to Try

### Solution 1: Use Wildcard Pattern (Recommended)

Instead of adding the specific path, use a wildcard to allow all paths under your domain:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. In **Redirect URLs**, add:
   ```
   https://puntersjournal.com.au/**
   ```
3. Click **Save**

The `**` wildcard allows all paths under your domain, including:
- `/reset-password`
- `/auth/callback`
- Any other paths you need

**Note**: Some Supabase versions might use `*` instead of `**`. Try both if one doesn't work.

### Solution 2: Add Base Domain First

Sometimes Supabase requires the base domain to be added first:

1. Add the base domain:
   ```
   https://puntersjournal.com.au
   ```
2. Then add the wildcard:
   ```
   https://puntersjournal.com.au/**
   ```

### Solution 3: Check for Trailing Slash

Try with a trailing slash:

```
https://puntersjournal.com.au/reset-password/
```

### Solution 4: Verify URL Format

Make sure:
- ✅ Protocol is `https://` (not `http://` for production)
- ✅ No spaces before or after the URL
- ✅ No special characters (copy-paste might introduce hidden characters)
- ✅ Domain is correct: `puntersjournal.com.au` (not `.com` or other variation)

### Solution 5: Try Different Format

Some Supabase versions accept different formats. Try:

1. **With wildcard**:
   ```
   https://puntersjournal.com.au/*
   ```

2. **Multiple specific paths** (if wildcards don't work):
   ```
   https://puntersjournal.com.au/auth/callback
   https://puntersjournal.com.au/reset-password
   ```

3. **Without protocol** (unlikely, but some systems accept this):
   ```
   puntersjournal.com.au/reset-password
   ```

## Why This Happens

Supabase validates redirect URLs to prevent open redirect vulnerabilities. The validation might:
- Require wildcards for paths
- Have specific format requirements
- Reject certain URL patterns

## Workaround: Code-Based Solution

**Good news**: Even if you can't add the specific URL to Supabase, the code changes I made will still work!

The immediate redirect script in `app/layout.tsx` catches password reset hash fragments **before** Supabase processes them, so it will redirect to `/reset-password` regardless of what Supabase's redirect URL is set to.

However, it's still **recommended** to add the redirect URL in Supabase for:
- Better security
- Proper Supabase session handling
- Compliance with Supabase best practices

## Verification

After adding the redirect URL (or wildcard):

1. **Check Supabase Dashboard**:
   - Go to Authentication → URL Configuration
   - Verify the URL appears in the Redirect URLs list
   - Make sure there are no error indicators

2. **Test Password Reset**:
   - Request a password reset
   - Click the link in the email
   - Should redirect to `/reset-password` (not `/`)

3. **Check Browser Console**:
   - Open DevTools → Console
   - Look for any redirect errors
   - Verify the final URL is correct

## Alternative: Use Site URL Only

If you can't add redirect URLs at all, you can:

1. Set **Site URL** to: `https://puntersjournal.com.au`
2. Let Supabase redirect to the Site URL (which will be `/`)
3. The code script will catch the hash fragment and redirect to `/reset-password`

This works because:
- Supabase redirects to Site URL with hash fragment: `https://puntersjournal.com.au/#access_token=...&type=recovery`
- The immediate script in `app/layout.tsx` detects the hash
- It redirects to `/reset-password#access_token=...&type=recovery`
- The reset password page processes the hash

## Recommended Configuration

For best results, use this configuration:

**Site URL**:
```
https://puntersjournal.com.au
```

**Redirect URLs**:
```
https://puntersjournal.com.au/**
```

This allows:
- All paths under your domain
- Password reset to work correctly
- Auth callbacks to work correctly
- Future paths to work without reconfiguration

## Still Having Issues?

If none of these work:

1. **Check Supabase Version**: Some older versions have different URL validation
2. **Contact Supabase Support**: They can help with URL validation issues
3. **Use Code Workaround**: The immediate redirect script will handle it regardless

## Quick Test

To verify the code-based solution works without Supabase redirect URL:

1. Request a password reset
2. Click the link in email
3. Check browser console - you should see redirect to `/reset-password`
4. The reset password form should appear

Even if Supabase redirects to `/`, the script will catch it and redirect to `/reset-password`.



