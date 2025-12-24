import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
    const { action, ...params } = body;

    const supabase = createClient();

    if (action === 'grant_beta_testers_pro') {
      // Grant all beta testers Pro access
      const { data: betaTesters } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('special_pricing', 'beta_tester')
        .eq('tier', 'free');

      const userIds = betaTesters?.map(b => b.user_id) || [];

      if (userIds.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No beta testers found to upgrade',
          count: 0,
        });
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          tier: 'pro',
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .in('user_id', userIds);

      if (error) {
        throw error;
      }

      // Log bulk action
      await supabase.from('admin_audit_log').insert({
        admin_id: 'system',
        action: 'bulk_action',
        reason: `Bulk upgrade: ${userIds.length} beta testers to Pro`,
        metadata: { action: 'grant_beta_testers_pro', count: userIds.length },
      });

      return NextResponse.json({
        success: true,
        message: `Upgraded ${userIds.length} beta testers to Pro`,
        count: userIds.length,
      });
    }

    if (action === 'lock_founding_members') {
      // Lock founding member pricing for users who signed up before a certain date
      const { maxSpots, cutoffDate } = params;

      const cutoff = cutoffDate ? new Date(cutoffDate) : new Date('2024-01-01');

      // Get users who signed up before cutoff date and don't have special pricing
      const { data: eligibleUsers } = await supabase
        .from('profiles')
        .select('id, created_at')
        .lt('created_at', cutoff.toISOString())
        .limit(maxSpots || 100);

      const userIds = eligibleUsers?.map(u => u.id) || [];

      if (userIds.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No eligible users found',
          count: 0,
        });
      }

      // Update or create subscriptions with founding_member pricing
      for (const userId of userIds) {
        const { data: existing } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existing) {
          await supabase
            .from('user_subscriptions')
            .update({
              special_pricing: 'founding_member',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('user_subscriptions')
            .insert({
              user_id: userId,
              tier: 'pro',
              status: 'active',
              special_pricing: 'founding_member',
            });
        }
      }

      // Log bulk action
      await supabase.from('admin_audit_log').insert({
        admin_id: 'system',
        action: 'bulk_action',
        reason: `Bulk action: Locked founding member pricing for ${userIds.length} users`,
        metadata: { action: 'lock_founding_members', count: userIds.length, cutoffDate: cutoff.toISOString() },
      });

      return NextResponse.json({
        success: true,
        message: `Locked founding member pricing for ${userIds.length} users`,
        count: userIds.length,
      });
    }

    if (action === 'revoke_access') {
      const { userId, newTier, reason } = params;

      if (!userId || !newTier || !reason) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Get current subscription
      const { data: current } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', userId)
        .single();

      const oldTier = current?.tier || 'free';

      // Update subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          tier: newTier,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Log action
      await supabase.from('admin_audit_log').insert({
        admin_id: 'system',
        action: 'revoke_access',
        user_id: userId,
        old_tier: oldTier,
        new_tier: newTier,
        reason,
      });

      return NextResponse.json({
        success: true,
        message: 'Access revoked successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

