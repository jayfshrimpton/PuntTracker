# Configure Supabase to Use Resend SMTP

## Problem

When you use `supabase.auth.resetPasswordForEmail()`, Supabase sends emails through its own email service, not Resend. This means:
- ❌ Password reset emails don't show up in Resend dashboard
- ❌ You can't track email delivery/analytics
- ❌ Emails might not be delivered if Supabase email service has issues

## Solution: Configure Supabase SMTP Settings

Configure Supabase to send all authentication emails (password reset, verification, etc.) through Resend SMTP.

### Step 1: Get Your Resend SMTP Credentials

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click on your verified domain (e.g., `puntersjournal.com.au`)
3. Go to the **SMTP** tab
4. You'll see SMTP credentials:
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL) or `587` (TLS)
   - **Username**: `resend`
   - **Password**: Your Resend API key (starts with `re_`)

**Note**: If you don't see SMTP settings, you can also use:
- **Host**: `smtp.resend.com`
- **Port**: `465` (recommended) or `587`
- **Username**: `resend`
- **Password**: Your Resend API key from [Resend API Keys](https://resend.com/api-keys)

### Step 2: Configure Supabase SMTP Settings

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **SMTP Settings** (or **Settings** → **Auth** → **SMTP Settings**)
4. Enable **Custom SMTP**
5. Fill in the following:

```
SMTP Host: smtp.resend.com
SMTP Port: 465 (or 587 if 465 doesn't work)
SMTP User: resend
SMTP Password: [Your Resend API Key - starts with re_]
Sender Email: noreply@puntersjournal.com.au
Sender Name: Punter's Journal
```

6. **Important Settings**:
   - ✅ Enable **Custom SMTP**
   - ✅ Use **SSL** (for port 465) or **TLS** (for port 587)
   - ✅ **Sender Email** must match your verified domain in Resend
   - ✅ **Sender Name** can be anything (e.g., "Punter's Journal")

7. Click **Save** or **Test Connection**

### Step 3: Test the Configuration

1. After saving, Supabase should show a "Test Connection" button
2. Click it to verify the SMTP connection works
3. If successful, you'll see a green checkmark ✅

### Step 4: Verify Email Templates

1. Still in Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Check that your email templates are set up correctly
3. You can customize the templates using the ones in `lib/email-templates.ts`

### Step 5: Test Password Reset

1. Go to your app's forgot password page
2. Enter your email address
3. Click "Send reset link"
4. **Check Resend Dashboard**:
   - Go to [Resend Dashboard](https://resend.com/emails)
   - You should now see the password reset email in the logs
   - Check delivery status, opens, clicks, etc.

## Troubleshooting

### Issue: "SMTP connection failed" or "Authentication failed"

**Solutions:**
1. **Double-check your Resend API key**:
   - Make sure you're using the full API key (starts with `re_`)
   - Copy it directly from [Resend API Keys](https://resend.com/api-keys)
   - Don't include any extra spaces or characters

2. **Try different port**:
   - If port `465` doesn't work, try `587`
   - If using `587`, make sure **TLS** is enabled (not SSL)

3. **Verify sender email**:
   - The sender email must be from your verified domain in Resend
   - Check [Resend Domains](https://resend.com/domains) to confirm domain is verified

4. **Check Resend account status**:
   - Make sure your Resend account is active
   - Check if you've hit any rate limits

### Issue: Emails still not showing in Resend

**Solutions:**
1. **Wait a few minutes**: Sometimes there's a delay
2. **Check spam folder**: Emails might be going to spam
3. **Verify SMTP is enabled**: Go back to Supabase SMTP settings and make sure "Custom SMTP" is enabled
4. **Check Supabase logs**: Go to Supabase Dashboard → Logs → Auth Logs to see if there are any errors

### Issue: "Sender email not verified" error

**Solutions:**
1. **Verify domain in Resend**:
   - Go to [Resend Domains](https://resend.com/domains)
   - Make sure your domain shows as "Verified" ✅
   - If not verified, check DNS records are correct

2. **Use correct sender email**:
   - Must be from your verified domain (e.g., `noreply@puntersjournal.com.au`)
   - Cannot use generic emails like `gmail.com` or `outlook.com`

## Benefits of Using Resend SMTP

Once configured, you'll get:

✅ **Email Analytics**: Track opens, clicks, bounces in Resend dashboard  
✅ **Better Deliverability**: Resend has excellent email delivery rates  
✅ **Unified Email Management**: All emails (auth + custom) in one place  
✅ **Email Logs**: See all authentication emails sent  
✅ **Domain Reputation**: Build reputation with your verified domain  

## Alternative: Custom API Route (Advanced)

If you prefer to handle password resets completely through Resend (without Supabase SMTP), you would need to:

1. Create a custom API route that intercepts password reset requests
2. Generate the reset token manually
3. Send email through Resend
4. Handle the reset flow manually

However, using Supabase SMTP is much simpler and recommended.

## Verification Checklist

After setup, verify:

- [ ] SMTP settings saved in Supabase
- [ ] Test connection successful in Supabase
- [ ] Sender email matches verified domain in Resend
- [ ] Password reset email appears in Resend dashboard
- [ ] Email is delivered to inbox (check spam if not in inbox)
- [ ] Email links work correctly

## Next Steps

After configuring SMTP:

1. **Test all email flows**:
   - Password reset
   - Email verification
   - Magic link (if using)

2. **Monitor Resend dashboard** for:
   - Delivery rates
   - Bounce rates
   - Open rates
   - Click rates

3. **Customize email templates** in Supabase if needed (using templates from `lib/email-templates.ts`)




