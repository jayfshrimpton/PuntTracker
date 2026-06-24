import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  setAdminSessionCookie,
  checkAdminLoginRateLimit,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkAdminLoginRateLimit(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again later.' },
        {
          status: 429,
          headers: rateLimit.retryAfterSec
            ? { 'Retry-After': String(rateLimit.retryAfterSec) }
            : undefined,
        }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, message: 'Admin access granted' },
      { status: 200 }
    );

    await setAdminSessionCookie(response);

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
