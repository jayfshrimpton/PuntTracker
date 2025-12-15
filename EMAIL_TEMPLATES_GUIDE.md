# Email Templates Guide

This guide explains how to use the email templates for Punter's Journal authentication flows.

## Available Templates

The following email templates are available in `lib/email-templates.ts`:

1. **Confirm Sign Up** - `confirmSignUpTemplate`
   - Sent when a user signs up and needs to confirm their email address

2. **Invite User** - `inviteUserTemplate`
   - Sent to invite users who don't yet have an account to sign up

3. **Magic Link** - `magicLinkTemplate`
   - Sent when a user requests a passwordless sign-in link

4. **Change Email Address** - `changeEmailAddressTemplate`
   - Sent when a user changes their email address and needs to verify the new one

5. **Reset Password** - `resetPasswordTemplate`
   - Sent when a user requests a password reset

6. **Reauthentication** - `reauthenticationTemplate`
   - Sent when a user needs to re-authenticate before performing a sensitive action

## Using with Supabase Auth

### Step 1: Access Email Templates in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select the template type you want to customize (e.g., "Confirm signup", "Magic Link", etc.)

### Step 2: Copy Template Content

1. Open `lib/email-templates.ts` in your project
2. Copy the HTML content from the template you need
3. Paste it into the corresponding Supabase email template editor

### Step 3: Template Variables

Supabase uses the following variables that are automatically replaced:

- `{{ .ConfirmationURL }}` - The confirmation/verification link
- `{{ .Email }}` - The user's email address
- `{{ .Token }}` - The verification token (if needed)
- `{{ .TokenHash }}` - The hashed token (if needed)
- `{{ .SiteURL }}` - Your site URL
- `{{ .RedirectTo }}` - Redirect URL after confirmation

### Step 4: Customize Subject Lines

In Supabase, you can also customize the email subject lines:

- **Confirm signup**: "Confirm Your Email - Punter's Journal"
- **Invite user**: "You're Invited to Punter's Journal"
- **Magic Link**: "Sign In to Punter's Journal"
- **Change email address**: "Verify Your New Email - Punter's Journal"
- **Reset password**: "Reset Your Punter's Journal Password"
- **Reauthentication**: "Verify Your Identity - Punter's Journal"

## Template Features

All templates include:

- ✅ Responsive design (mobile-friendly)
- ✅ Modern gradient header with Punter's Journal branding
- ✅ Clear call-to-action buttons
- ✅ Alternative text link for accessibility
- ✅ Security notices where appropriate
- ✅ Consistent footer with support information
- ✅ Professional styling with proper spacing

## Design Consistency

All templates follow the same design pattern:

- **Colors**: Blue to purple gradient (`#2563eb` to `#8b5cf6`)
- **Font**: System font stack for optimal rendering
- **Layout**: Centered, max-width 600px container
- **Border radius**: 12px for modern look
- **Shadows**: Subtle box shadows for depth

## Testing Templates

### Test in Supabase

1. Use Supabase's "Send test email" feature in the template editor
2. Verify the email renders correctly in different email clients
3. Test the confirmation links work properly

### Test Locally

You can also test templates programmatically:

```typescript
import { confirmSignUpTemplate } from '@/lib/email-templates';

// Replace variables manually for testing
const testTemplate = confirmSignUpTemplate.replace(
  '{{ .ConfirmationURL }}',
  'https://your-app.com/auth/confirm?token=test123'
);
```

## Security Considerations

- All templates include security notices where appropriate
- Links expire after 1 hour (configured in Supabase)
- Magic links are single-use only
- Users are warned if they didn't request the action

## Customization

To customize templates:

1. Edit the HTML in `lib/email-templates.ts`
2. Maintain the same variable placeholders (`{{ .ConfirmationURL }}`, etc.)
3. Keep the responsive table structure for email client compatibility
4. Test thoroughly before deploying

## Email Client Compatibility

These templates are designed to work with:

- ✅ Gmail (web, iOS, Android)
- ✅ Outlook (web, desktop, mobile)
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Most modern email clients

The templates use table-based layouts (required for email) and inline styles (required for email client compatibility).

