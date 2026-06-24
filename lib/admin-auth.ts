import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_session';
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const ADMIN_SESSION_VERSION = 'v1';

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function getAdminSecret(): string | null {
  return process.env.ADMIN_SECRET_KEY ?? null;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function signHmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function signAdminSession(nonce: string, issuedAt: number): Promise<string> {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error('ADMIN_SECRET_KEY is not configured');
  }
  const payload = `${ADMIN_SESSION_VERSION}:${issuedAt}:${nonce}`;
  const signature = await signHmac(secret, payload);
  return `${payload}:${signature}`;
}

async function verifyAdminSessionToken(token: string): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) {
    return false;
  }

  const parts = token.split(':');
  if (parts.length !== 4 || parts[0] !== ADMIN_SESSION_VERSION) {
    return false;
  }

  const issuedAt = Number(parts[1]);
  const nonce = parts[2];
  const signature = parts[3];

  if (!nonce || !Number.isFinite(issuedAt)) {
    return false;
  }

  const ageMs = Date.now() - issuedAt;
  if (ageMs < 0 || ageMs > ADMIN_COOKIE_MAX_AGE * 1000) {
    return false;
  }

  const expected = await signHmac(
    secret,
    `${ADMIN_SESSION_VERSION}:${issuedAt}:${nonce}`
  );

  return safeEqual(signature, expected);
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Verifies signed admin session cookie from request.
 */
export async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (!adminCookie?.value) {
    return false;
  }
  return verifyAdminSessionToken(adminCookie.value);
}

/**
 * Creates a signed admin session token for the httpOnly cookie.
 */
export async function createAdminSessionToken(): Promise<string> {
  const nonce = randomHex(16);
  return signAdminSession(nonce, Date.now());
}

/**
 * Sets admin session cookie on a response.
 */
export async function setAdminSessionCookie(response: NextResponse): Promise<void> {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: await createAdminSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Clears admin session cookie on a response.
 */
export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Middleware helper to require admin authentication.
 * Returns null if authorized, or a redirect response if not.
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
 * Verifies admin password against ADMIN_SECRET_KEY (timing-safe).
 */
export function verifyAdminPassword(password: string): boolean {
  const adminSecret = getAdminSecret();
  if (!adminSecret) {
    return false;
  }
  return safeEqual(password, adminSecret);
}

/**
 * Basic in-memory rate limiting for admin login attempts.
 */
export function checkAdminLoginRateLimit(request: NextRequest): { allowed: boolean; retryAfterSec?: number } {
  const ip = getClientIp(request);
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true };
}
