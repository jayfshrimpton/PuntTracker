'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let resolved = false;

    // Check if we have the necessary hash parameters from Supabase
    const checkToken = async () => {
      if (resolved) return;
      
      // Supabase password reset uses hash fragments in the URL
      // Check if there's a hash in the URL (Supabase redirects with hash)
      const hash = window.location.hash;
      
      // Check for hash fragment first (before Supabase processes it)
      if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
        // Set up auth state change listener to catch PASSWORD_RECOVERY event
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' && session) {
            resolved = true;
            setIsValidToken(true);
            setCheckingToken(false);
          }
        });
        subscription = data?.subscription ?? null;

        // Also check session after a short delay as fallback
        timeoutId = setTimeout(async () => {
          if (resolved) return;
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // If we have a session and we're on reset-password page with recovery hash,
            // it's likely a recovery session
            resolved = true;
            setIsValidToken(true);
            setCheckingToken(false);
          } else {
            resolved = true;
            setIsValidToken(false);
            setCheckingToken(false);
          }
        }, 1500);
        return;
      }
      
      // No hash fragment - check if we already have a recovery session
      // This handles cases where Supabase already processed the hash
      // Wait a moment for Supabase to process the hash if it exists
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If we have a session and we're on /reset-password page, it's likely a recovery session
        // Recovery sessions in Supabase allow password updates
        // Regular authenticated sessions cannot update password without re-authentication
        // So if updateUser() works, it was a recovery session; if it fails, we'll show an error
        
        // Set as valid - the password update will validate if it's actually a recovery session
        resolved = true;
        setIsValidToken(true);
        setCheckingToken(false);
      } else {
        // No hash and no session means invalid/expired link
        resolved = true;
        setIsValidToken(false);
        setCheckingToken(false);
      }
    };

    // Check immediately
    checkToken();

    // Cleanup function
    return () => {
      resolved = true;
      if (subscription) {
        subscription.unsubscribe();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      // Update the user's password
      // This will only work if we have a valid recovery session
      // Regular authenticated sessions cannot update password without re-authentication
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        // If update fails, it might not be a recovery session
        // Common errors:
        // - "New password should be different from the old password"
        // - "Password update requires reauthentication" (if not recovery session)
        setError(error.message || 'Failed to update password. Please request a new reset link.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  // Show loading state while checking token
  if (isValidToken === null || checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              Invalid or expired link
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-4">
              <Link
                href="/forgot-password"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                Request new reset link
              </Link>
              <div>
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              Password reset successful
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700 dark:text-gray-300">
            Enter your new password below
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder:text-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="New password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder:text-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

