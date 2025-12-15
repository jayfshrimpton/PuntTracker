'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setNeedsVerification(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setNeedsVerification(true);
          setError('Please verify your email address to log in.');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendStatus('sending');
    try {
      const supabase = createClient();
      // Use environment variable if available, otherwise use current origin
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback`,
        },
      });

      if (error) throw error;

      setResendStatus('success');
    } catch (err) {
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to Punter&apos;s Journal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700 dark:text-gray-300">
            Track your horse racing bets with comprehensive statistics
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder:text-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder:text-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
              {needsVerification && (
                <div className="mt-3">
                  {resendStatus === 'success' ? (
                    <p className="text-sm text-green-600 font-medium">
                      Verification email sent! Please check your inbox (and spam folder).
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendStatus === 'sending'}
                      className="text-sm font-medium text-red-800 underline hover:text-red-900"
                    >
                      {resendStatus === 'sending' ? 'Sending...' : 'Resend verification email'}
                    </button>
                  )}
                  {resendStatus === 'error' && (
                    <p className="mt-1 text-xs text-red-600">
                      Failed to send email. Please try again later.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
