import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ADMIN_COOKIE_NAME = 'admin_session';
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Admin emails that have automatic access
const ADMIN_EMAILS = [
  'jayfshrimpton@gmail.com',
  // Add more admin emails here as needed
];

/**
 * Verifies admin session cookie from request
 * Also checks if user is logged in with an admin email
 */
export async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  // First check cookie-based admin session
  const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  
  if (adminCookie?.value) {
    const adminSecret = process.env.ADMIN_SECRET_KEY;
    if (adminSecret && adminCookie.value === adminSecret) {
      return true;
    }
  }

  // Also check if user is logged in with an admin email
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return true;
    }
  } catch (error) {
    // If there's an error checking auth, fall through to return false
    console.error('Error checking admin email:', error);
  }

  return false;
}

/**
 * Creates admin session cookie
 */
export function createAdminSession(): NextResponse {
  const adminSecret = process.env.ADMIN_SECRET_KEY;
  if (!adminSecret) {
    throw new Error('ADMIN_SECRET_KEY is not configured');
  }

  const response = NextResponse.next();
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: adminSecret,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: '/',
  });

  return response;
}

/**
 * Clears admin session cookie
 */
export function clearAdminSession(): NextResponse {
  const response = NextResponse.next();
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}

/**
 * Middleware helper to require admin authentication
 * Returns null if authorized, or a redirect response if not
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const isAdmin = await verifyAdminSession(request);
  
  if (!isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  return null;
}

/**
 * Verifies admin password against ADMIN_SECRET_KEY
 */
export function verifyAdminPassword(password: string): boolean {
  const adminSecret = process.env.ADMIN_SECRET_KEY;
  if (!adminSecret) {
    return false;
  }
  return password === adminSecret;
}

