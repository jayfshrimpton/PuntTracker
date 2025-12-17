import { Resend } from 'resend';

// Lazy initialization of Resend client to avoid errors during build
let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// Email sender addresses
const EMAIL_FROM = {
  noreply: process.env.FROM_EMAIL || 'noreply@puntersjournal.com.au',
  updates: process.env.UPDATES_EMAIL || 'updates@puntersjournal.com.au',
  insights: process.env.INSIGHTS_EMAIL || 'insights@puntersjournal.com.au',
  jay: 'jayfshrimpton@gmail.com', // For testing/admin
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://puntersjournal.com.au';

// ============================================================================
// VERIFICATION EMAIL
// ============================================================================

export interface VerificationEmailParams {
  to: string;
  verificationUrl: string;
  userName?: string;
}

export async function sendVerificationEmail(
  params: VerificationEmailParams
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  try {
    const html = generateVerificationEmailHTML(params);
    const text = generateVerificationEmailText(params);

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM.noreply,
      to: params.to,
      subject: "Verify your email address - Punter's Journal 🏇",
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function generateVerificationEmailHTML(params: VerificationEmailParams): string {
  const { verificationUrl, userName } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email - Punter's Journal</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🏇 Punter's Journal</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">G'day${userName ? ` ${userName}` : ''}!</h2>
              
              <p style="color: #666; font-size: 16px; margin: 0 0 20px 0; line-height: 1.7;">
                Thanks for signing up for Punter's Journal! We're stoked to have you on board, mate.
              </p>
              
              <p style="color: #666; font-size: 16px; margin: 0 0 30px 0; line-height: 1.7;">
                To get started, please verify your email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Warning box -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 30px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ Link expires:</strong> This verification link will expire in 24 hours. If it expires, you can request a new one from the login page.
                </p>
              </div>
              
              <!-- Alternative link -->
              <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all; text-decoration: underline;">${verificationUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">
                If you didn't create an account with Punter's Journal, you can safely ignore this email.
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Punter's Journal. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateVerificationEmailText(params: VerificationEmailParams): string {
  const { verificationUrl, userName } = params;

  return `
🏇 Punter's Journal - Verify Your Email

G'day${userName ? ` ${userName}` : ''}!

Thanks for signing up for Punter's Journal! We're stoked to have you on board, mate.

To get started, please verify your email address by clicking the link below:

${verificationUrl}

⚠️ Link expires: This verification link will expire in 24 hours. If it expires, you can request a new one from the login page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you didn't create an account with Punter's Journal, you can safely ignore this email.

© ${new Date().getFullYear()} Punter's Journal. All rights reserved.
  `.trim();
}

// ============================================================================
// PASSWORD RESET EMAIL
// ============================================================================

export interface PasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName?: string;
}

export async function sendPasswordResetEmail(
  params: PasswordResetEmailParams
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  try {
    const html = generatePasswordResetEmailHTML(params);
    const text = generatePasswordResetEmailText(params);

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM.noreply,
      to: params.to,
      subject: "Password Reset Request - Punter's Journal 🏇",
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function generatePasswordResetEmailHTML(params: PasswordResetEmailParams): string {
  const { resetUrl, userName } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password - Punter's Journal</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🏇 Punter's Journal</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
              
              <p style="color: #666; font-size: 16px; margin: 0 0 20px 0; line-height: 1.7;">
                G'day${userName ? ` ${userName}` : ''},
              </p>
              
              <p style="color: #666; font-size: 16px; margin: 0 0 30px 0; line-height: 1.7;">
                We received a request to reset your password for your Punter's Journal account. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Warning box -->
              <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 15px; margin: 30px 0;">
                <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⏰ This link expires in 1 hour</strong> for security reasons. If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.
                </p>
              </div>
              
              <!-- Alternative link -->
              <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #2563eb; word-break: break-all; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">
                <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Punter's Journal. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generatePasswordResetEmailText(params: PasswordResetEmailParams): string {
  const { resetUrl, userName } = params;

  return `
🏇 Punter's Journal - Password Reset Request

G'day${userName ? ` ${userName}` : ''},

We received a request to reset your password for your Punter's Journal account. Click the link below to create a new password:

${resetUrl}

⏰ This link expires in 1 hour for security reasons. If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Security Note: If you didn't request this password reset, please ignore this email. Your account remains secure.

© ${new Date().getFullYear()} Punter's Journal. All rights reserved.
  `.trim();
}

// ============================================================================
// MONTHLY SUMMARY EMAIL
// ============================================================================

export interface MonthlySummaryData {
  totalBets: number;
  profit: number;
  roi: number;
  strikeRate: number;
  bestBet?: { horse: string; profit: number; venue?: string };
  worstBet?: { horse: string; loss: number; venue?: string };
  topVenue?: { name: string; profit: number };
}

export interface MonthlySummaryEmailParams {
  to: string;
  userName?: string;
  summaryData: MonthlySummaryData;
}

export async function sendMonthlySummary(
  params: MonthlySummaryEmailParams
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  try {
    const html = generateMonthlySummaryHTML(params);
    const text = generateMonthlySummaryText(params);
    
    const profitSign = params.summaryData.profit >= 0 ? '+' : '';
    const emoji = params.summaryData.profit >= 0 ? '🎉' : '📊';

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM.insights,
      to: params.to,
      subject: `Your Monthly Punt Summary - ${emoji} ${profitSign}$${Math.abs(params.summaryData.profit).toFixed(2)}`,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function generateMonthlySummaryHTML(params: MonthlySummaryEmailParams): string {
  const { userName, summaryData } = params;
  const profitColor = summaryData.profit >= 0 ? '#10b981' : '#ef4444';
  const profitSign = summaryData.profit >= 0 ? '+' : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Summary - Punter's Journal</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🏇 Punter's Journal</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Monthly Punt Summary</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">G'day${userName ? ` ${userName}` : ''}!</h2>
              
              <p style="color: #666; font-size: 16px; margin: 0 0 30px 0; line-height: 1.7;">
                Here's your monthly betting summary. Let's see how you went this month, legend!
              </p>
              
              <!-- Total P&L Card -->
              <div style="background: linear-gradient(135deg, ${profitColor}15 0%, ${profitColor}05 100%); border-left: 4px solid ${profitColor}; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Total Profit/Loss</p>
                <h3 style="margin: 0; color: ${profitColor}; font-size: 42px; font-weight: bold; line-height: 1;">
                  ${profitSign}$${Math.abs(summaryData.profit).toFixed(2)}
                </h3>
              </div>
              
              <!-- Stats Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="50%" style="padding-right: 10px;">
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; text-align: center;">
                      <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Total Bets</p>
                      <p style="margin: 10px 0 0 0; color: #333; font-size: 28px; font-weight: bold;">${summaryData.totalBets}</p>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 10px;">
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; text-align: center;">
                      <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Strike Rate</p>
                      <p style="margin: 10px 0 0 0; color: #333; font-size: 28px; font-weight: bold;">${summaryData.strikeRate.toFixed(1)}%</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 15px;">
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; text-align: center;">
                      <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">ROI</p>
                      <p style="margin: 10px 0 0 0; color: #333; font-size: 28px; font-weight: bold;">${summaryData.roi.toFixed(2)}%</p>
                    </div>
                  </td>
                </tr>
              </table>
              
              ${summaryData.bestBet ? `
              <!-- Best Bet Highlight -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                <p style="margin: 0 0 8px 0; color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🏆 Best Bet</p>
                <p style="margin: 0; color: #15803d; font-size: 18px; font-weight: 600;">${summaryData.bestBet.horse}${summaryData.bestBet.venue ? ` @ ${summaryData.bestBet.venue}` : ''}</p>
                <p style="margin: 5px 0 0 0; color: #166534; font-size: 16px;">+$${summaryData.bestBet.profit.toFixed(2)}</p>
              </div>
              ` : ''}
              
              ${summaryData.worstBet ? `
              <!-- Worst Bet Highlight -->
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📉 Worst Bet</p>
                <p style="margin: 0; color: #dc2626; font-size: 18px; font-weight: 600;">${summaryData.worstBet.horse}${summaryData.worstBet.venue ? ` @ ${summaryData.worstBet.venue}` : ''}</p>
                <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 16px;">-$${Math.abs(summaryData.worstBet.loss).toFixed(2)}</p>
              </div>
              ` : ''}
              
              ${summaryData.topVenue ? `
              <!-- Top Venue Highlight -->
              <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🎯 Best Venue</p>
                <p style="margin: 0; color: #2563eb; font-size: 18px; font-weight: 600;">${summaryData.topVenue.name}</p>
                <p style="margin: 5px 0 0 0; color: #1e40af; font-size: 16px;">${summaryData.topVenue.profit >= 0 ? '+' : ''}$${summaryData.topVenue.profit.toFixed(2)}</p>
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${APP_URL}/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);">
                      View Full Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">
                This is an automated monthly summary from Punter's Journal.<br>
                You can manage your email preferences in your dashboard settings.
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Punter's Journal. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateMonthlySummaryText(params: MonthlySummaryEmailParams): string {
  const { userName, summaryData } = params;
  const profitSign = summaryData.profit >= 0 ? '+' : '';

  return `
🏇 Punter's Journal - Monthly Punt Summary

G'day${userName ? ` ${userName}` : ''}!

Here's your monthly betting summary. Let's see how you went this month, legend!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL PROFIT/LOSS: ${profitSign}$${Math.abs(summaryData.profit).toFixed(2)}

Total Bets: ${summaryData.totalBets}
Strike Rate: ${summaryData.strikeRate.toFixed(1)}%
ROI: ${summaryData.roi.toFixed(2)}%

${summaryData.bestBet ? `🏆 Best Bet: ${summaryData.bestBet.horse}${summaryData.bestBet.venue ? ` @ ${summaryData.bestBet.venue}` : ''} (+$${summaryData.bestBet.profit.toFixed(2)})\n` : ''}${summaryData.worstBet ? `📉 Worst Bet: ${summaryData.worstBet.horse}${summaryData.worstBet.venue ? ` @ ${summaryData.worstBet.venue}` : ''} (-$${Math.abs(summaryData.worstBet.loss).toFixed(2)})\n` : ''}${summaryData.topVenue ? `🎯 Best Venue: ${summaryData.topVenue.name} (${summaryData.topVenue.profit >= 0 ? '+' : ''}$${summaryData.topVenue.profit.toFixed(2)})\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View your full dashboard: ${APP_URL}/dashboard

This is an automated monthly summary from Punter's Journal.
You can manage your email preferences in your dashboard settings.

© ${new Date().getFullYear()} Punter's Journal. All rights reserved.
  `.trim();
}

