# Error Handling Guide

This guide explains common errors you might see in Supabase logs and how to handle them.

## Common Supabase Errors

### 1. Internal Infrastructure Errors (Safe to Ignore)

**Examples:**
- `prometheus server shut down` / `http: Server closed`
- `config reloader is exiting` / `context canceled`

**What they mean:**
- These are internal Supabase infrastructure logs
- Prometheus is Supabase's monitoring/metrics service
- Config reloader manages configuration changes
- These indicate normal shutdown/restart operations

**Action Required:**
- ✅ **No action needed** - These are informational logs from Supabase's internal systems
- They don't affect your application functionality
- You can safely ignore or filter these in your logs

### 2. Deprecation Warning: GOTRUE_JWT_ADMIN_GROUP_NAME

**Error Message:**
```
DEPRECATION NOTICE: GOTRUE_JWT_ADMIN_GROUP_NAME not supported by Supabase's GoTrue, will be removed soon
```

**What it means:**
- This is a deprecation warning from Supabase's internal configuration
- It's not an error in your application code
- Supabase will handle this internally

**Action Required:**
- ✅ **No action needed** - This is just a warning and doesn't affect functionality
- Supabase will update their configuration in a future release

### 3. Rate Limiting Error (429)

**Error Message:**
```
429: For security purposes, you can only request this after 5 seconds.
```

**What it means:**
- Supabase enforces rate limits on authentication requests
- Magic link requests can only be made once every 5 seconds per user
- This prevents abuse and spam

**When it happens:**
- User clicks "Send magic link" button multiple times quickly
- Cron job sends verification reminders too frequently
- Automated retry logic triggers too quickly

**How it's handled:**
- ✅ **Cron job** (`send-verification-reminder`) now processes users sequentially with 6-second delays
- ✅ **UI buttons** should be disabled after clicking to prevent double-clicks
- ✅ **Error handling** catches rate limit errors gracefully

**Best Practices:**
1. **For Users:**
   - Wait at least 5 seconds between magic link requests
   - Don't click the button multiple times
   - Check your email (including spam folder) before requesting again

2. **For Developers:**
   - Add loading states to buttons to prevent double-clicks
   - Show user-friendly error messages for rate limits
   - Implement exponential backoff for retries

### 4. Authentication Errors

**Common authentication errors:**

#### "Email not confirmed"
- User needs to verify their email address
- Solution: Resend verification email

#### "Invalid login credentials"
- Wrong email or password
- Solution: User should check their credentials

#### "User not found"
- Email doesn't exist in the system
- Solution: User should sign up first

#### "Session expired"
- User's session has timed out
- Solution: User needs to log in again

## Error Handling in Code

### Rate Limiting

```typescript
// Example: Handle rate limiting in UI
try {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    if (error.message.includes('429') || error.message.includes('5 seconds')) {
      setError('Please wait 5 seconds before requesting another magic link.');
    } else {
      setError(error.message);
    }
  }
} catch (err) {
  setError('An unexpected error occurred');
}
```

### Preventing Double Clicks

```typescript
// Disable button while processing
const [loading, setLoading] = useState(false);

const handleRequest = async () => {
  if (loading) return; // Prevent double-clicks
  setLoading(true);
  // ... make request
  setLoading(false);
};
```

## Monitoring

Check Supabase logs regularly for:
- Rate limiting errors (429) - indicates users clicking too fast
- Authentication failures - may indicate configuration issues
- Deprecation warnings - usually safe to ignore but good to be aware

## Troubleshooting

### High Rate of 429 Errors

**Possible causes:**
1. Users clicking buttons multiple times
2. Cron job running too frequently
3. Automated retry logic

**Solutions:**
1. Add UI feedback (loading states, disabled buttons)
2. Increase delays in cron jobs
3. Implement exponential backoff

### Authentication Not Working

**Check:**
1. Supabase project is active
2. Environment variables are set correctly
3. Redirect URLs are configured in Supabase
4. Email templates are set up correctly

## Summary

- **Internal infrastructure errors**: Safe to ignore (Prometheus, config reloader, etc.)
- **Deprecation warnings**: Safe to ignore
- **Rate limiting (429)**: Normal security feature, handled in code
- **Authentication errors**: Usually user-related, provide clear error messages

## Log Filtering Recommendations

If you want to reduce noise in your logs, filter out:
- Prometheus server messages
- Config reloader messages
- Deprecation warnings
- Focus on: Authentication errors, rate limits, and application-specific errors

