/**
 * Email Templates for Punter's Journal Authentication
 * 
 * These templates are available in two formats:
 * 1. Supabase Auth format (with {{ .ConfirmationURL }} placeholders) - for use in Supabase Dashboard
 * 2. Resend format (as functions with JavaScript template literals) - for use with Resend API
 * 
 * To use with Supabase:
 * 1. Go to Authentication > Email Templates in Supabase Dashboard
 * 2. Copy the HTML content from the Supabase template constants
 * 3. Paste into Supabase template editor
 * 
 * To use with Resend:
 * Import and call the Resend template functions (e.g., generateConfirmSignUpHTML)
 */

/**
 * Confirm Sign Up - Ask users to confirm their email address after signing up
 */
export const confirmSignUpTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email - Punter's Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Welcome to Punter's Journal!
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thanks for signing up! We're excited to have you join the community of Aussie punters tracking their bets.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                To get started, please confirm your email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                {{ .ConfirmationURL }}
              </p>
              
              <!-- Security notice -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #dbeafe;">
                <p style="margin: 0 0 10px; color: #1e40af; font-size: 14px; font-weight: 600;">
                  ✨ What's Next?
                </p>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                  Once confirmed, you'll be able to track your bets, analyze your performance, and get insights to improve your punting strategy.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          Didn't sign up? You can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Invite User - Invite users who don't yet have an account to sign up
 */
export const inviteUserTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Punter's Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                You're Invited!
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                You've been invited to join Punter's Journal, the premier betting tracker for Aussie punters.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Click the button below to accept your invitation and create your account:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                {{ .ConfirmationURL }}
              </p>
              
              <!-- Features -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #f0fdf4;">
                <p style="margin: 0 0 15px; color: #166534; font-size: 14px; font-weight: 600;">
                  🎯 What You'll Get:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #15803d; font-size: 14px; line-height: 1.8;">
                  <li>Track all your bets in one place</li>
                  <li>Analyze your performance with detailed insights</li>
                  <li>Get personalized recommendations</li>
                  <li>Monitor your bankroll and ROI</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          This invitation was sent to {{ .Email }}. If you weren't expecting this, you can safely ignore it.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Magic Link - Allow users to sign in via a one-time link sent to their email
 */
export const magicLinkTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to Punter's Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Sign In to Your Account
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to sign in to your Punter's Journal account using this email address.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Click the button below to sign in securely (no password needed!):
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Sign In to Punter's Journal
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                {{ .ConfirmationURL }}
              </p>
              
              <!-- Security notice -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #fef3c7;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">
                  🔒 Security Notice
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  This magic link expires in 1 hour and can only be used once. If you didn't request this sign-in link, you can safely ignore this email. Your account remains secure.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          Didn't request this? Your account is still secure.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Change Email Address - Ask users to verify their new email address after changing it
 */
export const changeEmailAddressTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your New Email - Punter's Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Verify Your New Email Address
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to change the email address associated with your Punter's Journal account to this address.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                To complete the change, please verify this new email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Verify New Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                {{ .ConfirmationURL }}
              </p>
              
              <!-- Security notice -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #fef3c7;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">
                  🔒 Security Notice
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  This verification link expires in 1 hour. If you didn't request to change your email address, please contact support immediately. Your account email will not be changed until you verify this new address.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          Didn't request this change? Contact support immediately.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Reset Password - Allow users to reset their password if they forget it
 * 
 * IMPORTANT: This template uses {{ .ConfirmationURL }} which Supabase will replace
 * with the actual password reset link. The ConfirmationURL includes the redirectTo
 * parameter set in resetPasswordForEmail() call, which should point to /reset-password.
 * 
 * For this to work correctly:
 * 1. The redirectTo URL must be in Supabase's allowed Redirect URLs list
 * 2. Go to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 * 3. Add: https://yourdomain.com/reset-password
 * 4. Also add: http://localhost:3000/reset-password (for development)
 * 
 * If the redirect URL is not in the allowed list, Supabase will ignore redirectTo
 * and redirect to the Site URL instead, which won't allow password updates.
 */
export const resetPasswordTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Punter's Journal Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Reset Your Password
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your Punter's Journal account.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                {{ .ConfirmationURL }}
              </p>
              
              <!-- Security notice -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #fef3c7;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">
                  🔒 Security Notice
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          Didn't request this? Your account is still secure.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Reauthentication - Ask users to re-authenticate before performing a sensitive action
 */
export const reauthenticationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Identity - Punter's Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Verify Your Identity
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We need to verify your identity before you can complete a sensitive action on your Punter's Journal account.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Click the button below to verify your identity and continue:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Verify Identity
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                {{ .ConfirmationURL }}
              </p>
              
              <!-- Security notice -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #fef3c7;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">
                  🔒 Security Notice
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  This verification link expires in 1 hour and can only be used once. If you didn't initiate this action, please contact support immediately.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          Didn't request this? Contact support immediately.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ============================================================================
// RESEND-COMPATIBLE TEMPLATE FUNCTIONS
// ============================================================================
// These functions convert the Supabase templates to Resend-compatible format
// by replacing {{ .ConfirmationURL }} with JavaScript template literal variables

/**
 * Generate Confirm Sign Up email HTML for Resend
 */
export function generateConfirmSignUpHTML(params: {
  confirmationUrl: string;
  email?: string;
  userName?: string;
}): string {
  const { confirmationUrl } = params;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email - Punter's Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Welcome to Punter's Journal!
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thanks for signing up! We're excited to have you join the community of Aussie punters tracking their bets.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                To get started, please confirm your email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${confirmationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                ${confirmationUrl}
              </p>
              
              <!-- Security notice -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #dbeafe;">
                <p style="margin: 0 0 10px; color: #1e40af; font-size: 14px; font-weight: 600;">
                  ✨ What's Next?
                </p>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                  Once confirmed, you'll be able to track your bets, analyze your performance, and get insights to improve your punting strategy.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          Didn't sign up? You can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate Invite User email HTML for Resend
 */
export function generateInviteUserHTML(params: {
  confirmationUrl: string;
  email: string;
  userName?: string;
}): string {
  const { confirmationUrl, email } = params;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Punter's Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                You're Invited!
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                You've been invited to join Punter's Journal, the premier betting tracker for Aussie punters.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Click the button below to accept your invitation and create your account:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${confirmationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                ${confirmationUrl}
              </p>
              
              <!-- Features -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #f0fdf4;">
                <p style="margin: 0 0 15px; color: #166534; font-size: 14px; font-weight: 600;">
                  🎯 What You'll Get:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #15803d; font-size: 14px; line-height: 1.8;">
                  <li>Track all your bets in one place</li>
                  <li>Analyze your performance with detailed insights</li>
                  <li>Get personalized recommendations</li>
                  <li>Monitor your bankroll and ROI</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          This invitation was sent to ${email}. If you weren't expecting this, you can safely ignore it.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate Magic Link email HTML for Resend
 */
export function generateMagicLinkHTML(params: {
  confirmationUrl: string;
  email?: string;
  userName?: string;
}): string {
  const { confirmationUrl } = params;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to Punter's Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Sign In to Your Account
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to sign in to your Punter's Journal account using this email address.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Click the button below to sign in securely (no password needed!):
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${confirmationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Sign In to Punter's Journal
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                ${confirmationUrl}
              </p>
              
              <!-- Security notice -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #fef3c7;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">
                  🔒 Security Notice
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  This magic link expires in 1 hour and can only be used once. If you didn't request this sign-in link, you can safely ignore this email. Your account remains secure.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          Didn't request this? Your account is still secure.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate Change Email Address email HTML for Resend
 */
export function generateChangeEmailAddressHTML(params: {
  confirmationUrl: string;
  email?: string;
  userName?: string;
}): string {
  const { confirmationUrl } = params;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your New Email - Punter's Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Verify Your New Email Address
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to change the email address associated with your Punter's Journal account to this address.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                To complete the change, please verify this new email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${confirmationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Verify New Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                ${confirmationUrl}
              </p>
              
              <!-- Security notice -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #fef3c7;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">
                  🔒 Security Notice
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  This verification link expires in 1 hour. If you didn't request to change your email address, please contact support immediately. Your account email will not be changed until you verify this new address.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          Didn't request this change? Contact support immediately.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate Reset Password email HTML for Resend
 * 
 * IMPORTANT: The confirmationUrl parameter should be the full password reset link
 * that includes the redirectTo parameter pointing to /reset-password.
 * 
 * Example: https://yourdomain.com/reset-password#access_token=xxx&type=recovery
 * 
 * This ensures users are taken directly to the reset-password page where they can
 * update their password.
 */
export function generateResetPasswordHTML(params: {
  confirmationUrl: string;
  email?: string;
  userName?: string;
}): string {
  const { confirmationUrl } = params;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Punter's Journal Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Reset Your Password
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your Punter's Journal account.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${confirmationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                ${confirmationUrl}
              </p>
              
              <!-- Security notice -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #fef3c7;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">
                  🔒 Security Notice
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          Didn't request this? Your account is still secure.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate Reauthentication email HTML for Resend
 */
export function generateReauthenticationHTML(params: {
  confirmationUrl: string;
  email?: string;
  userName?: string;
}): string {
  const { confirmationUrl } = params;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Identity - Punter's Journal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🐴 Punter's Journal
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                Verify Your Identity
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We need to verify your identity before you can complete a sensitive action on your Punter's Journal account.
              </p>
              
              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Click the button below to verify your identity and continue:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${confirmationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Verify Identity
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative link -->
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Button not working? Copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 12px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4b5563;">
                ${confirmationUrl}
              </p>
              
              <!-- Security notice -->
              <div style="margin: 0; padding: 20px; border-top: 1px solid #e5e7eb; border-radius: 6px; background-color: #fef3c7;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">
                  🔒 Security Notice
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  This verification link expires in 1 hour and can only be used once. If you didn't initiate this action, please contact support immediately.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Questions? Reply to this email or contact support.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Punter's Journal. Built for Aussie punters.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Security notice -->
        <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
          Didn't request this? Contact support immediately.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

