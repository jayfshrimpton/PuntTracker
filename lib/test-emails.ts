import { sendVerificationEmail, sendPasswordResetEmail, sendMonthlySummary } from './resend';

const TEST_EMAIL = 'jayfshrimpton@gmail.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://puntersjournal.com.au';

/**
 * Test verification email
 */
export async function testVerificationEmail(): Promise<{ success: boolean; error?: string }> {
  const verificationUrl = `${APP_URL}/auth/callback?token_hash=test_token&type=signup`;
  
  return await sendVerificationEmail({
    to: TEST_EMAIL,
    verificationUrl,
    userName: 'Test User',
  });
}

/**
 * Test password reset email
 */
export async function testPasswordResetEmail(): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${APP_URL}/reset-password?token_hash=test_token&type=recovery`;
  
  return await sendPasswordResetEmail({
    to: TEST_EMAIL,
    resetUrl,
    userName: 'Test User',
  });
}

/**
 * Test monthly summary email
 */
export async function testMonthlySummaryEmail(): Promise<{ success: boolean; error?: string }> {
  const summaryData = {
    totalBets: 45,
    profit: 145.50,
    roi: 12.5,
    strikeRate: 62.2,
    bestBet: {
      horse: 'Thunder Strike',
      profit: 87.50,
      venue: 'Flemington',
    },
    worstBet: {
      horse: 'Slow Poke',
      loss: -25.00,
      venue: 'Randwick',
    },
    topVenue: {
      name: 'Flemington',
      profit: 234.75,
    },
  };

  return await sendMonthlySummary({
    to: TEST_EMAIL,
    userName: 'Test User',
    summaryData,
  });
}

/**
 * Test all email types
 */
export async function testAllEmails(): Promise<{
  verification: { success: boolean; error?: string };
  passwordReset: { success: boolean; error?: string };
  monthlySummary: { success: boolean; error?: string };
}> {
  console.log('Testing all email types...');
  
  const results = {
    verification: await testVerificationEmail(),
    passwordReset: await testPasswordResetEmail(),
    monthlySummary: await testMonthlySummaryEmail(),
  };

  console.log('Email test results:', results);
  return results;
}

