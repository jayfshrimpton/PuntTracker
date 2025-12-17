# Email Delivery Troubleshooting Guide

## Problem: Email Shows "Delivered" in Resend but Not Received

If Resend shows the email as "sent and delivered" but you didn't receive it, follow these steps:

## Step 1: Check Resend Event Logs

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Click on the specific email that was sent
3. Check the **Events** tab for detailed delivery information:
   - **Delivered**: Email reached recipient's mail server
   - **Opened**: Email was opened (if tracking enabled)
   - **Clicked**: Links were clicked
   - **Bounced**: Email was rejected
   - **Complained**: Marked as spam
   - **Rejected**: Rejected before delivery

**Important**: "Delivered" means the email reached the recipient's mail server, but it may still be filtered before reaching the inbox.

## Step 2: Check All Email Folders

### Gmail Users:
- ✅ **Inbox** (all tabs: Primary, Social, Promotions, Updates)
- ✅ **Spam/Junk**
- ✅ **All Mail** (search for sender or subject)
- ✅ **Trash**
- ✅ **Archive**

### Outlook Users:
- ✅ **Inbox** (Focused and Other tabs)
- ✅ **Junk Email**
- ✅ **Deleted Items**
- ✅ **Archive**

### Other Providers:
- Check all folders including:
  - Spam/Junk
  - Trash/Deleted
  - Archive
  - Any custom folders

## Step 3: Search for the Email

Use your email client's search function:

**Search terms to try:**
- Sender: `noreply@puntersjournal.com.au`
- Subject: `Password Reset` or `Reset`
- Keywords: `Punter's Journal` or `reset password`

## Step 4: Check Email Provider Filters

### Gmail:
1. Go to **Settings** → **Filters and Blocked Addresses**
2. Check if there are any filters blocking emails from `puntersjournal.com.au`
3. Go to **Settings** → **See all settings** → **Filters and Blocked Addresses**
4. Check for rules that might be moving emails

### Outlook:
1. Go to **Settings** → **Mail** → **Rules**
2. Check for rules that might be filtering emails
3. Go to **Junk Email** settings and check blocked senders

### Other Providers:
- Check spam filters, block lists, and email rules

## Step 5: Whitelist the Sender

Add the sender to your contacts/whitelist:

**Sender Email**: `noreply@puntersjournal.com.au`

### Gmail:
1. Open an email from the sender (if you can find one)
2. Click the three dots menu
3. Select **Add to contacts** or **Filter messages like this**
4. Create a filter to never send to spam

### Outlook:
1. Go to **Settings** → **Mail** → **Junk Email**
2. Add `puntersjournal.com.au` to **Safe Senders**

## Step 6: Check Domain Reputation

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click on your domain (`puntersjournal.com.au`)
3. Check:
   - ✅ Domain is **Verified**
   - ✅ SPF record is valid
   - ✅ DKIM records are valid
   - ✅ DMARC record is set (optional but recommended)
   - ✅ No reputation issues

## Step 7: Verify DNS Records

Make sure your DNS records are correct:

### SPF Record (TXT):
```
v=spf1 include:_spf.resend.com ~all
```

### DKIM Records (TXT):
- Should be provided by Resend in the domain settings
- Usually 3 records like: `resend._domainkey`

### DMARC Record (TXT) - Optional:
```
v=DMARC1; p=none; rua=mailto:dmarc@puntersjournal.com.au
```

**Check DNS records:**
- Use [MXToolbox](https://mxtoolbox.com/spf.aspx) to verify SPF
- Use [DKIM Validator](https://www.dmarcanalyzer.com/dkim-check/) to verify DKIM

## Step 8: Check Email Provider Quarantine

Some email providers have a quarantine system:

### Microsoft 365 / Outlook:
- Check **Quarantine** in Security & Compliance center
- Check **Junk Email** folder

### Gmail:
- Check **Spam** folder
- Check **All Mail** with search

### Corporate Email:
- Contact IT/admin to check email security gateway/quarantine

## Step 9: Test with Different Email Address

Try sending a password reset to a different email address:
- Personal Gmail
- Outlook
- Yahoo
- Another provider

This helps determine if the issue is:
- **Email-specific**: Problem with that particular email account
- **Provider-specific**: Problem with that email provider
- **Domain-wide**: Problem with your domain/Resend configuration

## Step 10: Check Resend Rate Limits

1. Go to [Resend Dashboard](https://resend.com)
2. Check your account limits:
   - Free tier: 100 emails/day
   - Check if you've hit the limit
   - Check if account is suspended

## Step 11: Review Email Content

Check if the email content might be triggering spam filters:

1. Go to Resend Dashboard → Click on the email
2. Review the email content:
   - Avoid spam trigger words
   - Ensure proper HTML structure
   - Check for broken links
   - Verify sender name/email

## Step 12: Check Supabase SMTP Configuration

Verify Supabase SMTP settings:

1. Go to Supabase Dashboard → Authentication → SMTP Settings
2. Verify:
   - ✅ Custom SMTP is **enabled**
   - ✅ Sender email matches verified domain
   - ✅ SMTP credentials are correct
   - ✅ Test connection is successful

## Step 13: Check Email Headers

If you can access the email (even in spam), check the headers:

**Look for:**
- `SPF: PASS` - SPF authentication passed
- `DKIM: PASS` - DKIM authentication passed
- `DMARC: PASS` - DMARC authentication passed
- `X-Spam-Score` - Lower is better (should be < 5)

## Step 14: Contact Support

If none of the above works:

### Resend Support:
1. Go to [Resend Support](https://resend.com/support)
2. Provide:
   - Email ID from Resend dashboard
   - Recipient email address
   - Timestamp of when email was sent
   - Screenshot of Resend event logs

### Email Provider Support:
- Contact your email provider's support
- Ask them to check:
  - Email filtering/quarantine
  - Block lists
  - Delivery logs

## Common Causes & Solutions

### Cause 1: Email Provider Filtering
**Solution**: Whitelist sender, check spam folders, review filters

### Cause 2: Domain Reputation (New Domain)
**Solution**: 
- Domain needs time to build reputation
- Send regular emails to build trust
- Ensure SPF/DKIM/DMARC are properly configured

### Cause 3: Email Content Triggers Spam Filters
**Solution**:
- Review email content
- Avoid spam trigger words
- Ensure proper HTML structure

### Cause 4: DNS Records Not Properly Configured
**Solution**:
- Verify SPF/DKIM/DMARC records
- Wait 24-48 hours for DNS propagation
- Use DNS checkers to verify

### Cause 5: Email Provider Quarantine
**Solution**:
- Check quarantine/spam folders
- Contact email provider support
- Whitelist domain

## Prevention Tips

1. **Warm up your domain**: Send regular emails to build reputation
2. **Maintain good sending practices**: 
   - Don't send to invalid emails
   - Handle bounces properly
   - Respect unsubscribe requests
3. **Monitor Resend dashboard**: Check bounce rates, complaints
4. **Keep DNS records updated**: Ensure SPF/DKIM/DMARC are valid
5. **Use verified domain**: Always send from verified domain in Resend

## Quick Diagnostic Checklist

- [ ] Checked all email folders (including spam, promotions, etc.)
- [ ] Searched for email using sender/subject
- [ ] Checked Resend event logs for delivery status
- [ ] Verified DNS records (SPF/DKIM/DMARC)
- [ ] Checked email provider filters/rules
- [ ] Whitelisted sender email
- [ ] Tested with different email address
- [ ] Verified Supabase SMTP configuration
- [ ] Checked Resend rate limits
- [ ] Reviewed email content for spam triggers

## Next Steps

1. **Immediate**: Check Resend event logs for detailed delivery information
2. **Short-term**: Whitelist sender, check all folders, verify DNS
3. **Long-term**: Build domain reputation, monitor delivery rates

If the issue persists after trying all steps, contact Resend support with the email ID and event log details.

