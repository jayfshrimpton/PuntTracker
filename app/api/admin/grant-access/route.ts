import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { verifyAdminSession } from '@/lib/admin-auth';
import { sendAccessGrantedEmail } from '@/lib/email';

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
    const { userId, email, tier, reason } = body;

    // Validate inputs
    if ((!userId && !email) || !tier || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields (userId or email, tier, reason)' },
        { status: 400 }
      );
    }

    let supabaseService: ReturnType<typeof createServiceClient>;
    try {
      supabaseService = createServiceClient();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
          details: 'This is required for admin operations like granting access by email.'
        },
        { status: 500 }
      );
    }
    
    let finalUserId = userId;

    // If email provided, look up user by email
    if (email && !userId) {
      const { data: { users } } = await supabaseService.auth.admin.listUsers();
      const matchingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (!matchingUser) {
        return NextResponse.json(
          { error: 'User not found with that email' },
          { status: 404 }
        );
      }

      finalUserId = matchingUser.id;

      // Ensure profile exists for this user
      const { data: existingProfile } = await supabaseService
        .from('profiles')
        .select('id')
        .eq('id', finalUserId)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabaseService
          .from('profiles')
          .insert({
            id: finalUserId,
            email: matchingUser.email,
            full_name: matchingUser.user_metadata?.full_name || matchingUser.user_metadata?.name || null,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Continue anyway - subscription can still be created
        }
      }
    }

    if (!['free', 'pro', 'elite'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be free, pro, or elite' },
        { status: 400 }
      );
    }

    // Get current subscription
    const { data: currentSubscription } = await supabaseService
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', finalUserId)
      .single();

    const oldTier = currentSubscription?.tier || 'free';

    // Update or create subscription - only set tier and status
    // Pricing is handled in Stripe
    const updateData: any = {
      tier,
      status: 'active',
      special_pricing: null, // Clear special pricing - handled in Stripe
      current_price: null, // Clear custom price - handled in Stripe
      updated_at: new Date().toISOString(),
    };

    if (currentSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabaseService
        .from('user_subscriptions')
        .update(updateData)
        .eq('user_id', finalUserId);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabaseService
        .from('user_subscriptions')
        .insert({
          user_id: finalUserId,
          ...updateData,
        });

      if (insertError) {
        throw insertError;
      }
    }

    // Get user email for audit log
    let userEmail = email;
    if (!userEmail) {
      const { data: profile } = await supabaseService
        .from('profiles')
        .select('email')
        .eq('id', finalUserId)
        .single();
      userEmail = profile?.email;
      
      // Fallback to auth.users if profile doesn't have email
      if (!userEmail) {
        const { data: { user } } = await supabaseService.auth.admin.getUserById(finalUserId);
        userEmail = user?.email || 'N/A';
      }
    }

    // Create audit log entry
    const { error: auditError } = await supabaseService
      .from('admin_audit_log')
      .insert({
        admin_id: 'system', // Could be enhanced to track actual admin user
        action: 'grant_access',
        user_id: finalUserId,
        old_tier: oldTier,
        new_tier: tier,
        reason,
        metadata: {
          grantedByEmail: email || undefined,
        },
      });

    if (auditError) {
      console.error('Audit log error:', auditError);
      // Don't fail the request if audit logging fails
    }

    // Send email notification to user
    if (userEmail && userEmail !== 'N/A' && tier !== 'free') {
      try {
        await sendAccessGrantedEmail({
          userEmail: userEmail,
          tier,
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Access granted successfully',
    });
  } catch (error) {
    console.error('Grant access error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

