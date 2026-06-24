import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendMonthlySummary } from '@/lib/resend';

export const dynamic = 'force-dynamic';

interface EmailSendRequest {
  type: 'summary';
  to: string;
  data: {
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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: EmailSendRequest = await request.json();
    const { type, to, data } = body;

    if (type !== 'summary') {
      return NextResponse.json(
        { error: 'Invalid email type. Only summary emails are supported via this endpoint.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (user.email !== to) {
      return NextResponse.json(
        { error: 'You can only send summary emails to your own address' },
        { status: 403 }
      );
    }

    if (!data.summaryData) {
      return NextResponse.json(
        { error: 'summaryData is required for summary emails' },
        { status: 400 }
      );
    }

    const result = await sendMonthlySummary({
      to,
      userName: data.userName,
      summaryData: data.summaryData,
    });

    if (!result.success) {
      console.error('Failed to send summary email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'summary email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
