import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendVerificationEmail, sendPasswordResetEmail, sendMonthlySummary } from '@/lib/resend';

export const dynamic = 'force-dynamic';

interface EmailSendRequest {
  type: 'verification' | 'reset' | 'summary';
  to: string;
  data: {
    verificationUrl?: string;
    resetUrl?: string;
    userName?: string;
    summaryData?: {
      totalBets: number;
      profit: number;
      roi: number;
      strikeRate: number;
      bestBet?: { horse: string; profit: number; venue?: string };
      worstBet?: { horse: string; loss: number; venue?: string };
      topVenue?: { name: string; profit: number };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // For verification and reset emails, allow unauthenticated requests
    // For summary emails, require authentication
    const body: EmailSendRequest = await request.json();
    const { type, to, data } = body;

    // Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // For summary emails, require authentication
    if (type === 'summary') {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Verify user is requesting their own email or is admin
      if (user.email !== to) {
        // Check if user is admin (you can add admin check here)
        // For now, only allow users to send to their own email
        return NextResponse.json(
          { error: 'You can only send summary emails to your own address' },
          { status: 403 }
        );
      }
    }

    // Rate limiting: Check if user has sent too many emails recently
    // (Simple in-memory rate limiting - in production, use Redis or similar)
    // For now, we'll rely on Resend's rate limiting

    let result;

    switch (type) {
      case 'verification':
        if (!data.verificationUrl) {
          return NextResponse.json(
            { error: 'verificationUrl is required for verification emails' },
            { status: 400 }
          );
        }
        result = await sendVerificationEmail({
          to,
          verificationUrl: data.verificationUrl,
          userName: data.userName,
        });
        break;

      case 'reset':
        if (!data.resetUrl) {
          return NextResponse.json(
            { error: 'resetUrl is required for password reset emails' },
            { status: 400 }
          );
        }
        result = await sendPasswordResetEmail({
          to,
          resetUrl: data.resetUrl,
          userName: data.userName,
        });
        break;

      case 'summary':
        if (!data.summaryData) {
          return NextResponse.json(
            { error: 'summaryData is required for summary emails' },
            { status: 400 }
          );
        }
        result = await sendMonthlySummary({
          to,
          userName: data.userName,
          summaryData: data.summaryData,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Must be verification, reset, or summary' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${type} email sent successfully`,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

