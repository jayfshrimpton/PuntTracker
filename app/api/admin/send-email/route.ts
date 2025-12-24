import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    if (!(await verifyAdminSession(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, emailType } = body;

    if (!userId || !emailType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and emailType' },
        { status: 400 }
      );
    }

    // Use service client to bypass RLS
    let supabase: ReturnType<typeof createServiceClient>;
    try {
      supabase = createServiceClient();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
          details: 'This is required for admin operations.'
        },
        { status: 500 }
      );
    }

    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    let userEmail: string;
    let userName: string | undefined;

    if (profile && profile.email) {
      userEmail = profile.email;
      userName = profile.full_name;
    } else {
      // Fallback to auth.users
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      if (!user || !user.email) {
        return NextResponse.json(
          { error: 'User not found or has no email' },
          { status: 404 }
        );
      }
      userEmail = user.email;
      userName = user.user_metadata?.full_name || user.user_metadata?.name;
    }

    // Generate appropriate email based on type
    let result: { success: boolean; error?: string };

    switch (emailType) {
      case 'password_reset': {
        // Generate password reset link using Supabase
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: userEmail,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
          },
        });

        if (linkError || !linkData.properties?.action_link) {
          return NextResponse.json(
            { error: 'Failed to generate password reset link', details: linkError?.message },
            { status: 500 }
          );
        }

        // Import email function dynamically to avoid circular dependencies
        const { sendPasswordResetEmail } = await import('@/lib/resend');
        result = await sendPasswordResetEmail({
          to: userEmail,
          resetUrl: linkData.properties.action_link,
          userName,
        });
        break;
      }

      case 'verification': {
        // Generate verification link using Supabase
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: userEmail,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
          },
        });

        if (linkError || !linkData.properties?.action_link) {
          return NextResponse.json(
            { error: 'Failed to generate verification link', details: linkError?.message },
            { status: 500 }
          );
        }

        const { sendVerificationEmail } = await import('@/lib/resend');
        result = await sendVerificationEmail({
          to: userEmail,
          verificationUrl: linkData.properties.action_link,
          userName,
        });
        break;
      }

      case 'welcome': {
        const { sendWelcomeEmail } = await import('@/lib/email');
        result = await sendWelcomeEmail({
          userEmail,
          userName,
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Must be password_reset, verification, or welcome' },
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
      message: `${emailType} email sent successfully to ${userEmail}`,
    });
  } catch (error) {
    console.error('Admin send email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

