# Password Reset Redirect Fix

## Problem

When clicking the password reset link from email, users are redirected to the landing page (`/`) instead of the reset password page (`/reset-password`).

## Root Cause

Supabase password reset emails redirect to the **Site URL** configured in Supabase Dashboard if the `redirectTo` URL is not in the **Redirect URLs** allowlist. Even if you specify `redirectTo: /reset-password`, Supabase will fall back to the Site URL if it's not explicitly allowed.

## Solution

### Step 1: Add Redirect URL in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. In the **Redirect URLs** section, add:
   ```
   https://puntersjournal.com.au/reset-password
   ```
5. Also add for development (if needed):
   ```
   http://localhost:3000/reset-password
   ```
6. Click **Save**

**Important**: The URL must match exactly, including:
- Protocol (`https://` or `http://`)
- Domain (no trailing slash)
- Path (`/reset-password`)

### Step 2: Verify Site URL

1. In the same **URL Configuration** section
2. Check that **Site URL** is set to:
   ```
   https://puntersjournal.com.au
   ```
   (or `http://localhost:3000` for development)

### Step 3: Code Changes Applied

The following code changes have been made to handle edge cases:

1. **Immediate Hash Detection Script** (`app/layout.tsx`):
   - Added script that runs immediately (before React loads)
   - Catches password recovery hash fragments
   - Redirects to `/reset-password` immediately

2. **Improved PasswordRecoveryRedirect Component** (`components/PasswordRecoveryRedirect.tsx`):
   - Enhanced to catch hash fragments more reliably
   - Handles both hash fragments and query parameters
   - Uses `window.location.replace` for immediate redirect

3. **Reset Password Page** (`app/reset-password/page.tsx`):
   - Already handles hash fragments correctly
   - Validates recovery tokens
   - Shows appropriate error messages

## Testing

After adding the redirect URL in Supabase:

1. **Request Password Reset**:
   - Go to `/forgot-password`
   - Enter your email
   - Click "Send reset link"

2. **Click Email Link**:
   - Open the password reset email
   - Click the reset link
   - Should redirect to `/reset-password` (not `/`)

3. **Verify**:
   - URL should be: `https://puntersjournal.com.au/reset-password#access_token=...&type=recovery`
   - Page should show "Set new password" form
   - Not the landing page

## Troubleshooting

### Still Redirecting to Landing Page

1. **Check Supabase Redirect URLs**:
   - Verify `/reset-password` is in the list
   - Check URL matches exactly (no trailing slash, correct protocol)

2. **Check Browser Console**:
   - Open DevTools → Console
   - Look for any errors or redirects
   - Check if hash fragment is present in URL

3. **Check Network Tab**:
   - Open DevTools → Network
   - Look for redirects (301/302)
   - Verify final URL

4. **Clear Browser Cache**:
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear cookies for your domain
   - Try incognito/private window

### Hash Fragment Missing

If the URL doesn't have a hash fragment (`#access_token=...`):

1. **Check Supabase Email Template**:
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Select "Reset Password" template
   - Verify it uses `{{ .ConfirmationURL }}` or `{{ .RedirectTo }}`
   - The URL should include hash fragments

2. **Check Email Link**:
   - Right-click the link in email → Copy link address
   - Verify it includes `#access_token=` and `type=recovery`
   - If not, Supabase email template might be wrong

### Token Invalid/Expired

If you see "Invalid or expired link":

1. **Request New Reset Link**:
   - Links expire after 1 hour
   - Request a new one from `/forgot-password`

2. **Check Token Expiry**:
   - Supabase default is 1 hour
   - Can be changed in Supabase Dashboard → Authentication → Settings

## Additional Notes

- The immediate script in `app/layout.tsx` runs before React hydrates, ensuring hash fragments are caught immediately
- The `PasswordRecoveryRedirect` component provides a fallback for edge cases
- Both hash fragments (`#access_token=...`) and query parameters (`?token_hash=...`) are supported

## Verification Checklist

- [ ] `/reset-password` added to Supabase Redirect URLs
- [ ] Site URL set correctly in Supabase
- [ ] Password reset email received
- [ ] Email link includes hash fragment
- [ ] Clicking link redirects to `/reset-password`
- [ ] Reset password form displays correctly
- [ ] Password can be reset successfully







