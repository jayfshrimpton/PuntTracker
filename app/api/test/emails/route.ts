import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedInternalRequest } from '@/lib/cron-auth';
import { testVerificationEmail, testPasswordResetEmail, testMonthlySummaryEmail, testLaunchAnnouncementEmail, testAllEmails } from '@/lib/test-emails';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedInternalRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let result;

    switch (type) {
      case 'verification':
        result = await testVerificationEmail();
        break;

      case 'reset':
      case 'password-reset':
        result = await testPasswordResetEmail();
        break;

      case 'summary':
      case 'monthly-summary':
        result = await testMonthlySummaryEmail();
        break;

      case 'launch':
      case 'launch-announcement':
        result = await testLaunchAnnouncementEmail();
        break;

      case 'all':
        result = await testAllEmails();
        break;

      default:
        return NextResponse.json(
          {
            error: 'Invalid type parameter',
            usage: 'Use ?type=verification|reset|summary|launch|all',
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type: type || 'all',
      result,
    });
  } catch (error) {
    console.error('Error testing emails:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

