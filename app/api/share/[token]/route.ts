import { NextRequest, NextResponse } from 'next/server';
import { fetchPublicSharePayloadByToken } from '@/lib/share-by-token';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: { token: string } }
) {
  try {
    const result = await fetchPublicSharePayloadByToken(context.params.token);

    if (result.ok) {
      return NextResponse.json(result.payload);
    }

    if (result.reason === 'not_configured') {
      return NextResponse.json(
        { error: 'Sharing is not configured (missing service role key).' },
        { status: 503 }
      );
    }

    if (result.reason === 'error') {
      return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
