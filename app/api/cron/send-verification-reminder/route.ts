import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendVerificationReminderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Basic authorization check (e.g., for Vercel Cron)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();

        // Calculate time range: 24 to 48 hours ago
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        // List users who are not verified and created within the time range
        // Note: listUsers isn't fully flexible with complex filters, so we might need to fetch a batch and filter in code
        // or use a direct DB query if we had access to the DB directly.
        // For now, we'll fetch a page of users and filter. Ideally, this should be a DB query.

        // Since listUsers doesn't support "created_at" range filtering directly in a simple way,
        // and we can't easily query `auth.users` via the client without direct DB access or an RPC function,
        // we will try to list users and filter. This is not scalable for millions of users but fine for a small app.

        const { data: { users }, error } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000, // Limit to 1000 for now
        });

        if (error) {
            throw error;
        }

        const unverifiedUsers = users.filter((user) => {
            const createdAt = new Date(user.created_at);
            return (
                !user.email_confirmed_at &&
                createdAt >= fortyEightHoursAgo &&
                createdAt <= twentyFourHoursAgo
            );
        });

        // Process users sequentially with rate limiting to avoid 429 errors
        // Supabase has a 5-second rate limit between magic link requests
        const results = [];
        for (let i = 0; i < unverifiedUsers.length; i++) {
            const user = unverifiedUsers[i];
            
            // Add delay between requests (except for the first one)
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 6000)); // 6 seconds to be safe
            }

            try {
                if (!user.email) {
                    results.push({ status: 'rejected', reason: { success: false, error: 'No email' } });
                    continue;
                }

                // Generate a verification link
                // Note: We use 'magiclink' because 'signup' requires a password (which we don't have/want to reset)
                // and 'magiclink' effectively verifies the email by logging the user in.
                // This is a safe way to verify existing users without resetting credentials.

                const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
                    type: 'magiclink',
                    email: user.email,
                    options: {
                        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
                    },
                });

                if (linkError) {
                    // Handle rate limiting specifically
                    if (linkError.message?.includes('429') || linkError.message?.includes('5 seconds')) {
                        console.warn(`Rate limit hit for ${user.email}, skipping...`);
                        results.push({ status: 'rejected', reason: { success: false, error: 'Rate limited' } });
                        continue;
                    }
                    results.push({ status: 'rejected', reason: { success: false, error: linkError.message } });
                    continue;
                }

                if (!linkData.properties?.action_link) {
                    results.push({ status: 'rejected', reason: { success: false, error: 'Failed to generate link' } });
                    continue;
                }

                const emailResult = await sendVerificationReminderEmail({
                    userEmail: user.email,
                    userName: user.user_metadata?.full_name || user.user_metadata?.name,
                    verificationLink: linkData.properties.action_link,
                });

                results.push({ status: 'fulfilled', value: emailResult });
            } catch (error) {
                results.push({ 
                    status: 'rejected', 
                    reason: { success: false, error: error instanceof Error ? error.message : 'Unknown error' } 
                });
            }
        }

        const successCount = results.filter((r) => r.status === 'fulfilled' && r.value?.success).length;
        const failureCount = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.success)).length;

        return NextResponse.json({
            success: true,
            processed: unverifiedUsers.length,
            sent: successCount,
            failed: failureCount,
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
