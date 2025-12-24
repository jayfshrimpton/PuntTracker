import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    if (!(await verifyAdminSession(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const actionFilter = searchParams.get('action') || 'all';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build query - fetch audit logs first, then profiles separately
    let query = supabase
      .from('admin_audit_log')
      .select(`
        id,
        admin_id,
        action,
        user_id,
        old_tier,
        new_tier,
        reason,
        metadata,
        created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (actionFilter !== 'all') {
      query = query.eq('action', actionFilter);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: logs, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get unique user IDs from logs
    const userIds = [...new Set(logs?.map((log: any) => log.user_id).filter(Boolean) || [])];
    
    // Fetch profiles for these users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    // Create a map of user_id -> email
    const emailMap = new Map<string, string>();
    profiles?.forEach((profile) => {
      emailMap.set(profile.id, profile.email);
    });

    // Format response
    const formattedLogs = logs?.map((log: any) => ({
      id: log.id,
      date: log.created_at,
      admin: log.admin_id,
      action: log.action,
      userEmail: log.user_id ? (emailMap.get(log.user_id) || 'N/A') : 'N/A',
      oldTier: log.old_tier || 'N/A',
      newTier: log.new_tier || 'N/A',
      reason: log.reason,
      metadata: log.metadata,
    })) || [];

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin audit log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

