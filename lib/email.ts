import { Resend } from 'resend';
import { MonthlyStats } from './stats';
import { format } from 'date-fns';

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

export interface MonthlySummaryEmailData {
  userEmail: string;
  userName?: string;
  month: string;
  year: number;
  stats: MonthlyStats;
  totalBets: number;
}

export async function sendMonthlySummaryEmail(data: MonthlySummaryEmailData): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  if (!process.env.FROM_EMAIL) {
    return { success: false, error: 'FROM_EMAIL is not configured' };
  }

  try {
    const html = generateMonthlySummaryHTML(data);
    const text = generateMonthlySummaryText(data);

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: data.userEmail,
      subject: `Your ${data.month} ${data.year} Betting Summary - Punter's Journal`,
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

function generateMonthlySummaryHTML(data: MonthlySummaryEmailData): string {
  const { stats, month, year, userName } = data;
  const profitColor = stats.totalProfit >= 0 ? '#10b981' : '#ef4444';
  const profitSign = stats.totalProfit >= 0 ? '+' : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Summary - ${month} ${year}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Punter's Journal</h1>
      <p style="color: #666; margin: 5px 0 0 0; font-size: 16px;">Monthly Betting Summary</p>
    </div>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px; text-align: center;">
      <h2 style="color: white; margin: 0 0 10px 0; font-size: 24px;">${month} ${year}</h2>
      ${userName ? `<p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Hello, ${userName}!</p>` : ''}
    </div>

    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid ${profitColor};">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Total Profit/Loss</p>
          <h3 style="margin: 5px 0 0 0; color: ${profitColor}; font-size: 32px; font-weight: bold;">
            ${profitSign}$${Math.abs(stats.totalProfit).toFixed(2)}
          </h3>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Total Turnover</p>
          <h3 style="margin: 5px 0 0 0; color: #333; font-size: 24px; font-weight: bold;">
            $${stats.totalStake.toFixed(2)}
          </h3>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Total Bets</p>
        <p style="margin: 5px 0 0 0; color: #333; font-size: 24px; font-weight: bold;">${stats.totalBets}</p>
      </div>
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Strike Rate</p>
        <p style="margin: 5px 0 0 0; color: #333; font-size: 24px; font-weight: bold;">${stats.strikeRate.toFixed(1)}%</p>
      </div>
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">ROI</p>
        <p style="margin: 5px 0 0 0; color: #333; font-size: 24px; font-weight: bold;">${stats.roi.toFixed(2)}%</p>
      </div>
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">POT</p>
        <p style="margin: 5px 0 0 0; color: #333; font-size: 24px; font-weight: bold;">${stats.pot.toFixed(2)}%</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
        <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Winning Bets</p>
        <p style="margin: 5px 0 0 0; color: #10b981; font-size: 20px; font-weight: bold;">${stats.winningBets}</p>
      </div>
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
        <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Losing Bets</p>
        <p style="margin: 5px 0 0 0; color: #ef4444; font-size: 20px; font-weight: bold;">${stats.losingBets}</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
        <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Best Win</p>
        <p style="margin: 5px 0 0 0; color: #10b981; font-size: 20px; font-weight: bold;">$${stats.bestWin.toFixed(2)}</p>
      </div>
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px;">
        <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Worst Loss</p>
        <p style="margin: 5px 0 0 0; color: #ef4444; font-size: 20px; font-weight: bold;">$${Math.abs(stats.worstLoss).toFixed(2)}</p>
      </div>
    </div>

    <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Average Odds</p>
      <p style="margin: 5px 0 0 0; color: #333; font-size: 20px; font-weight: bold;">${stats.averageOdds.toFixed(2)}</p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/dashboard" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
        View Full Dashboard
      </a>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        This is an automated monthly summary from Punter's Journal.<br>
        You can manage your email preferences in your dashboard settings.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function generateMonthlySummaryText(data: MonthlySummaryEmailData): string {
  const { stats, month, year, userName } = data;
  const profitSign = stats.totalProfit >= 0 ? '+' : '';

  return `
Punter's Journal - Monthly Betting Summary
${month} ${year}
${userName ? `Hello, ${userName}!\n` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL PROFIT/LOSS: ${profitSign}$${Math.abs(stats.totalProfit).toFixed(2)}
TOTAL TURNOVER: $${stats.totalStake.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Bets: ${stats.totalBets}
Winning Bets: ${stats.winningBets}
Losing Bets: ${stats.losingBets}
Strike Rate: ${stats.strikeRate.toFixed(1)}%
ROI: ${stats.roi.toFixed(2)}%
POT: ${stats.pot.toFixed(2)}%

Best Win: $${stats.bestWin.toFixed(2)}
Worst Loss: $${Math.abs(stats.worstLoss).toFixed(2)}
Average Odds: ${stats.averageOdds.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View your full dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/dashboard

This is an automated monthly summary from Punter's Journal.
  `.trim();
}


export interface VerificationReminderEmailData {
  userEmail: string;
  userName?: string;
  verificationLink: string;
}

export async function sendVerificationReminderEmail(data: VerificationReminderEmailData): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  if (!process.env.FROM_EMAIL) {
    return { success: false, error: 'FROM_EMAIL is not configured' };
  }

  try {
    const html = generateVerificationReminderHTML(data);
    const text = generateVerificationReminderText(data);

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: data.userEmail,
      subject: "Quick verification needed for Punter's Journal",
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

function generateVerificationReminderHTML(data: VerificationReminderEmailData): string {
  const { userName, verificationLink } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Punter's Journal account</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Punter's Journal</h1>
    </div>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">Verify your email address</h2>
      ${userName ? `<p style="color: #666; margin: 0 0 15px 0; font-size: 16px;">Hi ${userName},</p>` : ''}
      <p style="color: #666; margin: 0; font-size: 16px;">
        Thanks for signing up for Punter's Journal! Please verify your email address to secure your account and access all features.
      </p>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${verificationLink}" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);">
        Verify Email Address
      </a>
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
      <p style="color: #666; font-size: 14px; margin: 0;">
        Or copy and paste this link into your browser:
      </p>
      <p style="color: #2563eb; font-size: 14px; margin: 5px 0 0 0; word-break: break-all;">
        <a href="${verificationLink}" style="color: #2563eb;">${verificationLink}</a>
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        If you didn't create an account with Punter's Journal, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function generateVerificationReminderText(data: VerificationReminderEmailData): string {
  const { userName, verificationLink } = data;

  return `
Punter's Journal - Verify your email address

${userName ? `Hi ${userName},\n` : ''}
Thanks for signing up for Punter's Journal! Please verify your email address to secure your account and access all features.

Verify Email Address: ${verificationLink}

If you didn't create an account with Punter's Journal, you can safely ignore this email.
  `.trim();
}

export interface WelcomeEmailData {
  userEmail: string;
  userName?: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  if (!process.env.FROM_EMAIL) {
    return { success: false, error: 'FROM_EMAIL is not configured' };
  }

  try {
    const html = generateWelcomeEmailHTML(data);
    const text = generateWelcomeEmailText(data);

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: data.userEmail,
      subject: "Welcome to Punter's Journal! 🐴",
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

function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  const { userName } = data;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/dashboard`;
  const gettingStartedUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/getting-started`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Punter's Journal</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🐴 Punter's Journal</h1>
      <p style="color: #666; margin: 5px 0 0 0; font-size: 16px;">Welcome to the Community!</p>
    </div>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 30px; margin-bottom: 30px; text-align: center;">
      <h2 style="color: white; margin: 0 0 10px 0; font-size: 28px;">Welcome Aboard! 🎉</h2>
      ${userName ? `<p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 18px;">Hi ${userName}!</p>` : ''}
      <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 16px;">
        Your email has been verified and your account is now active!
      </p>
    </div>

    <div style="margin-bottom: 30px;">
      <p style="color: #333; font-size: 16px; margin: 0 0 15px 0;">
        ${userName ? `Hi ${userName},` : 'Hi there,'}
      </p>
      <p style="color: #666; font-size: 16px; margin: 0 0 15px 0; line-height: 1.7;">
        Welcome to <strong>Punter's Journal</strong> - your personal betting tracker designed specifically for Aussie punters! We're thrilled to have you join our community.
      </p>
      <p style="color: #666; font-size: 16px; margin: 0 0 15px 0; line-height: 1.7;">
        You're all set to start tracking your bets, analyzing your performance, and taking your punting to the next level.
      </p>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
      <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
        ✨ What You Can Do Now:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #15803d; font-size: 15px; line-height: 1.8;">
        <li style="margin-bottom: 10px;">Track all your bets in one place</li>
        <li style="margin-bottom: 10px;">Analyze your performance with detailed insights</li>
        <li style="margin-bottom: 10px;">Monitor your ROI, strike rate, and POT</li>
        <li style="margin-bottom: 10px;">Set bankroll goals and track your progress</li>
        <li style="margin-bottom: 10px;">Get monthly summaries delivered to your inbox</li>
      </ul>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${dashboardUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08); margin-right: 10px;">
        Go to Dashboard
      </a>
      <a href="${gettingStartedUrl}" 
         style="display: inline-block; background-color: white; color: #667eea; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; border: 2px solid #667eea; margin-left: 10px;">
        Getting Started Guide
      </a>
    </div>

    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
        💡 Quick Tips:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Start by adding your first bet - it only takes a few seconds!</li>
        <li style="margin-bottom: 8px;">Use bet templates to save time on common bet types</li>
        <li style="margin-bottom: 8px;">Check out the insights page to see your performance trends</li>
        <li style="margin-bottom: 8px;">Set up your bankroll goals to stay on track</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        Questions? Reply to this email or visit our help center.<br>
        We're here to help you succeed!
      </p>
    </div>

    <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        Happy punting! 🐴<br>
        The Punter's Journal Team
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function generateWelcomeEmailText(data: WelcomeEmailData): string {
  const { userName } = data;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/dashboard`;
  const gettingStartedUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/getting-started`;

  return `
Welcome to Punter's Journal! 🐴

${userName ? `Hi ${userName},` : 'Hi there,'}

Your email has been verified and your account is now active!

Welcome to Punter's Journal - your personal betting tracker designed specifically for Aussie punters! We're thrilled to have you join our community.

You're all set to start tracking your bets, analyzing your performance, and taking your punting to the next level.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ What You Can Do Now:

• Track all your bets in one place
• Analyze your performance with detailed insights
• Monitor your ROI, strike rate, and POT
• Set bankroll goals and track your progress
• Get monthly summaries delivered to your inbox

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Get Started:
Dashboard: ${dashboardUrl}
Getting Started Guide: ${gettingStartedUrl}

💡 Quick Tips:
• Start by adding your first bet - it only takes a few seconds!
• Use bet templates to save time on common bet types
• Check out the insights page to see your performance trends
• Set up your bankroll goals to stay on track

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Reply to this email or visit our help center.
We're here to help you succeed!

Happy punting! 🐴
The Punter's Journal Team
  `.trim();
}
