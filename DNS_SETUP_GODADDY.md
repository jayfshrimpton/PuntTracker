# DNS Configuration Guide: GoDaddy Nameservers with Vercel Hosting

## ⚠️ Critical Issue

If you changed your DNS nameservers from Vercel back to GoDaddy, you **MUST** add DNS records in GoDaddy that point to Vercel. Without these records, your domain won't resolve correctly, causing:

- ❌ White screen / blank pages
- ❌ PWA showing "domain not in use"
- ❌ Routing issues and redirects
- ❌ Domain appearing as "available for purchase"

## ✅ Solution: Configure DNS Records in GoDaddy

### Step 1: Get Your Vercel DNS Configuration

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Find your domain (e.g., `puntersjournal.com.au`)
5. Click on the domain to see DNS configuration

### Step 2: Add DNS Records in GoDaddy

1. Log in to [GoDaddy](https://godaddy.com)
2. Go to **My Products** → **Domains**
3. Click on your domain name
4. Click **DNS** or **Manage DNS**

### Step 3: Add Required DNS Records

You need to add these records in GoDaddy:

#### Option A: Using A Records (Recommended for root domain)

Add these **A Records**:

| Type | Name | Value | TTL |
|-----|------|-------|-----|
| A | @ | `76.76.21.21` | 600 (or default) |
| A | www | `76.76.21.21` | 600 (or default) |

**Note**: The IP address `76.76.21.21` is Vercel's edge network IP. This is the standard IP for Vercel deployments.

#### Option B: Using CNAME Records (Alternative)

If A records don't work, you can use CNAME:

| Type | Name | Value | TTL |
|-----|------|-------|-----|
| CNAME | www | `cname.vercel-dns.com` | 600 (or default) |

**Note**: Root domains (@) cannot use CNAME records. You'll need to use A records for the root domain.

### Step 4: Verify DNS Records

After adding the records:

1. Wait 5-10 minutes for DNS propagation
2. Check DNS propagation using:
   - [whatsmydns.net](https://www.whatsmydns.net/)
   - [dnschecker.org](https://dnschecker.org/)
3. Enter your domain and check if A records point to `76.76.21.21`

### Step 5: Verify Domain in Vercel

1. Go back to Vercel Dashboard → Settings → Domains
2. Make sure your domain shows as **"Valid Configuration"** ✅
3. If it shows an error, wait a few more minutes for DNS propagation

## 📧 Email DNS Records (Resend)

Since you're using Resend for email, you also need these DNS records in GoDaddy:

### SPF Record (TXT)

| Type | Name | Value | TTL |
|-----|------|-------|-----|
| TXT | @ | `v=spf1 include:_spf.resend.com ~all` | 600 |

### DKIM Records (TXT)

Get these from your Resend dashboard:

1. Go to [Resend Domains](https://resend.com/domains)
2. Click on your domain
3. Copy the **DKIM records** (usually 3 TXT records)
4. Add each one in GoDaddy DNS

Example format:
```
Type: TXT
Name: resend._domainkey
Value: [long string from Resend]
TTL: 600
```

### DMARC Record (TXT) - Optional but Recommended

| Type | Name | Value | TTL |
|-----|------|-------|-----|
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com.au` | 600 |

## 🔍 Troubleshooting

### Issue: Domain still not working after adding DNS records

**Solutions:**
1. **Wait longer**: DNS can take up to 48 hours to fully propagate globally
2. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check DNS propagation**: Use [whatsmydns.net](https://www.whatsmydns.net/)
4. **Verify records in GoDaddy**: Make sure they're saved correctly
5. **Check Vercel**: Ensure domain is added and verified in Vercel

### Issue: PWA still shows "domain not in use"

**Solutions:**
1. This is a DNS propagation issue - wait 24-48 hours
2. Clear browser cache and service worker cache
3. Visit `/clear-cache` on your site to clear PWA cache
4. Uninstall and reinstall the PWA after DNS propagates

### Issue: White screen on `/lander` route

**Solutions:**
1. The code changes we made should fix this (middleware redirect)
2. Clear service worker cache: Visit `/clear-cache`
3. Wait for DNS propagation to complete
4. Hard refresh your browser

### Issue: DNS records not saving in GoDaddy

**Solutions:**
1. Make sure you're in the correct DNS management section
2. Check that you have the right permissions
3. Try removing and re-adding records
4. Contact GoDaddy support if issues persist

## ✅ Verification Checklist

After configuring DNS, verify:

- [ ] A records added in GoDaddy pointing to `76.76.21.21`
- [ ] DNS propagation shows correct IP (check with whatsmydns.net)
- [ ] Domain shows as "Valid Configuration" in Vercel
- [ ] Website loads correctly at your domain
- [ ] Email DNS records (SPF, DKIM) added for Resend
- [ ] Domain verified in Resend dashboard
- [ ] PWA works correctly (may take 24-48 hours)

## 🚀 Quick Fix Steps Summary

1. ✅ Add A records in GoDaddy: `@` and `www` → `76.76.21.21`
2. ✅ Add email DNS records (SPF, DKIM) for Resend
3. ✅ Wait 5-10 minutes (or up to 48 hours for full propagation)
4. ✅ Verify DNS propagation using whatsmydns.net
5. ✅ Check Vercel dashboard shows domain as valid
6. ✅ Clear browser cache and test your site
7. ✅ Visit `/clear-cache` to clear service worker cache

## 📞 Need Help?

If issues persist after 48 hours:

1. **Check Vercel logs**: Dashboard → Deployments → View logs
2. **Verify DNS records**: Use [mxtoolbox.com](https://mxtoolbox.com/) to check DNS
3. **Contact support**: 
   - Vercel support for hosting issues
   - GoDaddy support for DNS configuration
   - Resend support for email DNS issues

## 🔄 Alternative: Switch Back to Vercel Nameservers

If you prefer to let Vercel manage DNS:

1. Go to Vercel Dashboard → Settings → Domains
2. Click on your domain
3. Follow instructions to change nameservers back to Vercel
4. Update nameservers in GoDaddy to point to Vercel
5. Vercel will automatically configure all DNS records

**Note**: If you switch back to Vercel nameservers, you'll need to add email DNS records (SPF, DKIM) in Vercel's DNS settings instead of GoDaddy.

