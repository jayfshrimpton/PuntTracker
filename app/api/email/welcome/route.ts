import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user's email is verified
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Email not verified' },
        { status: 400 }
      );
    }

    // Check if email was verified recently (within last 10 minutes)
    // This helps ensure we only send welcome email right after verification
    const emailConfirmedAt = new Date(user.email_confirmed_at);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    // Also check if user was created recently (within last hour)
    // This ensures we only send to newly verified users, not existing users
    const userCreatedAt = new Date(user.created_at);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Only send if:
    // 1. Email was verified recently (within 10 minutes)
    // 2. User account was created recently (within 1 hour)
    // This prevents sending welcome emails to users who verified long ago
    if (emailConfirmedAt < tenMinutesAgo || userCreatedAt < oneHourAgo) {
      return NextResponse.json(
        { 
          message: 'Welcome email already sent or user verified too long ago',
          skipped: true 
        },
        { status: 200 }
      );
    }

    // Get user profile for name
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name, welcome_email_sent')
      .eq('id', user.id)
      .single();

    // Optional: Check if we've already sent welcome email (if tracking field exists)
    // For now, we'll rely on the time-based check above
    // If you want to add a welcome_email_sent field to profiles, uncomment this:
    // if (userData?.welcome_email_sent) {
    //   return NextResponse.json(
    //     { message: 'Welcome email already sent', skipped: true },
    //     { status: 200 }
    //   );
    // }

    // Send welcome email
    const emailResult = await sendWelcomeEmail({
      userEmail: user.email!,
      userName: userData?.full_name || undefined,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    // Optional: Mark welcome email as sent in profiles table
    // Uncomment this if you add welcome_email_sent field to profiles:
    // await supabase
    //   .from('profiles')
    //   .update({ welcome_email_sent: true })
    //   .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

