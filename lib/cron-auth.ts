import { NextRequest } from 'next/server';

/**
 * Fail-closed cron/internal auth. Returns false when the secret env var is unset
 * or the request does not present a valid Bearer token (or Vercel cron header).
 */
export function isAuthorizedCronRequest(request: NextRequest | Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  const vercelCronSecret = request.headers.get('x-vercel-cron-secret');

  return authHeader === `Bearer ${cronSecret}` || vercelCronSecret === cronSecret;
}

/**
 * Fail-closed admin/test route auth using ADMIN_SECRET or CRON_SECRET.
 */
export function isAuthorizedInternalRequest(request: NextRequest | Request): boolean {
  const adminSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;
  if (!adminSecret) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${adminSecret}`;
}
