import { NextResponse } from 'next/server';
import { checkFeatureAccess } from '@/utils/subscription';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const feature = searchParams.get('feature') as 'unlimited_bets' | 'ai_insights' | 'csv_import_export' | null;

        if (!feature) {
            return NextResponse.json(
                { error: 'Feature parameter is required' },
                { status: 400 }
            );
        }

        const hasAccess = await checkFeatureAccess(feature);

        return NextResponse.json({ hasAccess });
    } catch (error: any) {
        console.error('Error checking feature access:', error);
        return NextResponse.json(
            { error: 'Failed to check feature access' },
            { status: 500 }
        );
    }
}

