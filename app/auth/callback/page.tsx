'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      
      // Check for hash fragments FIRST (before Supabase processes them)
      const hash = window.location.hash;
      
      // IMMEDIATELY check for recovery type in hash and redirect
      if (hash && hash.includes('type=recovery')) {
        // Password recovery - redirect immediately to reset-password with hash preserved
        // Don't wait for Supabase to process, just redirect with the hash
        router.replace(`/reset-password${hash}`);
        return;
      }
      
      // Check for query parameters (alternative format)
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const next = searchParams.get('next') || '/dashboard';

      if (token_hash && type === 'recovery') {
        // Handle password recovery with query parameters
        const { error } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token_hash,
        });

        if (!error) {
          router.replace('/reset-password');
        } else {
          router.replace('/forgot-password?error=invalid_token');
        }
        return;
      }

      // Now handle hash fragments for other auth types (magic link, signup, etc.)
      if (hash) {
        // Supabase processes hash fragments automatically
        // Wait for Supabase to process the hash and establish session
        // Use onAuthStateChange to detect when session is ready
        let sessionEstablished = false;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            sessionEstablished = true;
          }
        });

        // Wait up to 2 seconds for session to be established
        for (let i = 0; i < 20; i++) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            sessionEstablished = true;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Clean up subscription
        subscription.unsubscribe();

        if (sessionEstablished) {
          // Verify we have a valid session before redirecting
          const { data: { session: finalSession } } = await supabase.auth.getSession();
          if (finalSession) {
            // Refresh router to ensure session is synced
            router.refresh();
            // Small delay to ensure refresh completes
            await new Promise(resolve => setTimeout(resolve, 200));
            router.replace(next);
          } else {
            router.replace('/login?error=session_failed');
          }
        } else {
          router.replace('/login?error=authentication_timeout');
        }
        return;
      }

      // Handle signup confirmation with query parameters
      if (token_hash && type === 'signup') {
        const { error } = await supabase.auth.verifyOtp({
          type: 'signup',
          token_hash,
        });

        if (!error) {
          router.replace(next);
        } else {
          router.replace('/login?error=verification_failed');
        }
        return;
      }

      // Handle other auth callbacks (magic link, etc.) with query parameters
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash,
        });

        if (!error) {
          // Wait for session to be established
          await new Promise(resolve => setTimeout(resolve, 300));
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Refresh router to ensure session is synced
            router.refresh();
            await new Promise(resolve => setTimeout(resolve, 200));
            router.replace(next);
          } else {
            router.replace('/login?error=session_failed');
          }
        } else {
          router.replace('/login?error=auth_failed');
        }
        return;
      }

      // If no hash or query params, check if we have a session
      // BUT: Check if this might be a recovery session that was already processed
      // Recovery sessions should still go to reset-password
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if this is a recovery session by listening to auth state changes
        // If we have a session but no hash/params, it might be a recovery session
        // that was already processed. In that case, we should check the URL path
        // or redirect to reset-password if we came from a recovery flow
        const urlParams = new URLSearchParams(window.location.search);
        const fromRecovery = urlParams.get('from') === 'recovery' || 
                           sessionStorage.getItem('password_recovery') === 'true';
        
        if (fromRecovery) {
          router.replace('/reset-password');
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Processing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

