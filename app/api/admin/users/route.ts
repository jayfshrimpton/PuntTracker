import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
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

    // Use service client to bypass RLS for admin access
    let supabaseService: ReturnType<typeof createServiceClient>;
    try {
      supabaseService = createServiceClient();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
          details: 'This is required for admin operations.'
        },
        { status: 500 }
      );
    }

    const supabase = supabaseService; // Use service client for all queries
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const search = searchParams.get('search') || '';
    const tierFilter = searchParams.get('tier') || 'all';
    const specialPricingFilter = searchParams.get('specialPricing') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let profiles: any[] = [];
    let count = 0;

    // If searching, also check auth.users for users without profiles
    if (search) {
      try {
        // Search in auth.users using service client
        const { data: { users: authUsers } } = await supabaseService.auth.admin.listUsers();
      
      // Filter auth users by email search
      const matchingAuthUsers = authUsers?.filter(user => 
        user.email?.toLowerCase().includes(search.toLowerCase())
      ) || [];

      // Get profile IDs that already exist
      const existingProfileIds = new Set<string>();
      
      // First, get existing profiles
      let profileQuery = supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `, { count: 'exact' });

      if (search) {
        profileQuery = profileQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      const { data: existingProfiles, error: profileError, count: profileCount } = await profileQuery;

      if (profileError) {
        throw profileError;
      }

      existingProfiles?.forEach(p => existingProfileIds.add(p.id));
      profiles = existingProfiles || [];
      count = profileCount || 0;

        // Add auth users that don't have profiles yet
        for (const authUser of matchingAuthUsers) {
          if (authUser.id && !existingProfileIds.has(authUser.id) && authUser.email) {
            profiles.push({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
              created_at: authUser.created_at,
            });
            count++;
          }
        }
      } catch (error) {
        console.error('Error searching auth.users:', error);
        // Continue with just profiles
      }

      // Apply pagination to search results
      const startIdx = offset;
      const endIdx = offset + limit;
      profiles = profiles.slice(startIdx, endIdx);
    } else {
      // No search - just get profiles normally
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `, { count: 'exact' });

      // Apply sorting
      if (sortBy === 'bets_count') {
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
      } else {
        query = query.order(sortBy as any, { ascending: sortOrder === 'asc' });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: profileData, error: profileError, count: profileCount } = await query;

      if (profileError) {
        throw profileError;
      }

      profiles = profileData || [];
      count = profileCount || 0;
    }

    // Get subscriptions for all users
    const userIds = profiles?.map(p => p.id) || [];
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('user_id, tier, status, special_pricing, current_price')
      .in('user_id', userIds);

    // Create a map of user_id -> subscription
    const subscriptionMap = new Map<string, any>();
    subscriptions?.forEach((sub) => {
      subscriptionMap.set(sub.user_id, sub);
    });

    // Get bets count for each user
    const { data: betsData } = await supabase
      .from('bets')
      .select('user_id')
      .in('user_id', userIds);

    const betsCountMap = new Map<string, number>();
    betsData?.forEach((bet) => {
      betsCountMap.set(bet.user_id, (betsCountMap.get(bet.user_id) || 0) + 1);
    });

    // Format response
    let formattedUsers = profiles.map((profile: any) => {
      const subscription = subscriptionMap.get(profile.id) || {
        tier: 'free',
        status: 'active',
        special_pricing: null,
        current_price: null,
      };

      return {
        id: profile.id,
        email: profile.email,
        name: profile.full_name || 'N/A',
        tier: subscription.tier,
        status: subscription.status,
        specialPricing: subscription.special_pricing,
        currentPrice: subscription.current_price,
        betsCount: betsCountMap.get(profile.id) || 0,
        joinedDate: profile.created_at,
      };
    });

    // Apply tier filter (after fetching)
    if (tierFilter !== 'all') {
      formattedUsers = formattedUsers.filter(u => u.tier === tierFilter);
    }

    // Apply special pricing filter
    if (specialPricingFilter !== 'all') {
      formattedUsers = formattedUsers.filter(u => u.specialPricing === specialPricingFilter);
    }

    // Re-sort if needed (for bets_count)
    if (sortBy === 'bets_count') {
      formattedUsers.sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.betsCount - b.betsCount 
          : b.betsCount - a.betsCount;
      });
    } else if (!search) {
      // Re-sort if we didn't already sort in the query (for non-search cases)
      formattedUsers.sort((a, b) => {
        const aVal = a[sortBy as keyof typeof a];
        const bVal = b[sortBy as keyof typeof b];
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

