# Debug Password Reset Redirect Issue

## Current Issue

Password reset link redirects to main page (`/`) instead of `/reset-password` even after adding redirect URL in Supabase.

## Debugging Steps

### Step 1: Check the Email Link

1. **Open the password reset email**
2. **Right-click the reset link** → **Copy link address**
3. **Paste it somewhere** to see the full URL

**What to look for:**
- Does it include `#access_token=` and `type=recovery`?
- What's the base URL? (should be `https://puntersjournal.com.au`)
- What's the path? (should be `/reset-password` or `/`)

### Step 2: Check Browser Console

1. **Open DevTools** (F12 or Right-click → Inspect)
2. **Go to Console tab**
3. **Click the password reset link** from email
4. **Look for debug messages**:
   - `[Password Reset] Detected:` - Shows what was detected
   - `[Password Reset] Redirecting to /reset-password` - Shows redirect attempt
   - `[PasswordRecoveryRedirect] Checking:` - Shows component check

### Step 3: Check Network Tab

1. **Open DevTools** → **Network tab**
2. **Click the password reset link**
3. **Look for redirects** (301/302 status codes)
4. **Check the final URL** after all redirects

### Step 4: Check Current URL

When you land on the main page, check:

1. **Look at the browser address bar**
2. **What's the full URL?**
   - Is there a hash fragment? (`#access_token=...`)
   - Is there a query string? (`?token_hash=...`)
   - What's the pathname? (`/` or `/reset-password`)

### Step 5: Manual Test

Try manually navigating to see if the redirect script works:

1. **Go to**: `https://puntersjournal.com.au/#access_token=test&type=recovery`
2. **Check console** - should see redirect message
3. **Should redirect to**: `/reset-password#access_token=test&type=recovery`

## Common Issues & Solutions

### Issue 1: Hash Fragment Missing

**Symptom**: URL is `https://puntersjournal.com.au/` with no hash

**Cause**: Supabase is redirecting to Site URL without preserving hash

**Solution**: 
- Check Supabase email template uses `{{ .ConfirmationURL }}` or `{{ .RedirectTo }}`
- Verify redirect URL in Supabase matches exactly
- Try using wildcard: `https://puntersjournal.com.au/**`

### Issue 2: Script Not Running

**Symptom**: No console messages, no redirect

**Cause**: Script might be blocked or not loading

**Solution**:
- Check browser console for errors
- Try disabling browser extensions
- Try incognito/private window
- Check if JavaScript is enabled

### Issue 3: Redirect Loop

**Symptom**: Page keeps redirecting

**Cause**: Script redirecting but Supabase redirecting back

**Solution**:
- Check if `/reset-password` is in Supabase Redirect URLs
- Verify Site URL is correct
- Check for multiple redirect scripts running

### Issue 4: Hash Appears After Page Load

**Symptom**: Hash appears in URL after a delay

**Cause**: Supabase processes hash asynchronously

**Solution**: 
- Script now checks multiple times with delays
- Should catch it automatically
- Check console for timing messages

## What to Report

If issue persists, please provide:

1. **Full email link** (you can redact the token part)
2. **Browser console output** (screenshot or copy-paste)
3. **Network tab** showing redirects
4. **Final URL** when you land on main page
5. **Browser and version** (Chrome, Firefox, etc.)

## Quick Fixes to Try

1. **Clear browser cache** and try again
2. **Try incognito/private window**
3. **Try different browser**
4. **Check Supabase Redirect URLs** - make sure it's saved
5. **Request new password reset** - old link might be expired

## Expected Behavior

When clicking password reset link:

1. **Email link**: `https://puntersjournal.com.au/reset-password#access_token=...&type=recovery`
2. **Script detects hash** immediately
3. **Redirects to**: `/reset-password#access_token=...&type=recovery`
4. **Reset password page** loads and processes token
5. **Shows password reset form**

If any step fails, check the debug messages in console to see where it's failing.



