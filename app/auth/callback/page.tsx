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
        // Supabase processes hash fragments automatically when getSession() is called
        // First, trigger processing by calling getSession
        await supabase.auth.getSession();
        
        // Wait a moment for Supabase to process the hash
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Now wait for the session to be established using a promise-based approach
        const waitForSession = new Promise<{ session: any; user: any } | null>((resolve) => {
          let resolved = false;
          
          // Set up auth state change listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session && !resolved) {
              // Also verify we have a user
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                resolved = true;
                subscription.unsubscribe();
                resolve({ session, user });
              }
            }
          });

          // Also poll for session as a fallback (in case event doesn't fire)
          let attempts = 0;
          const maxAttempts = 40; // 4 seconds total
          const checkSession = async () => {
            if (resolved) return;
            
            const { data: { session } } = await supabase.auth.getSession();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (session && user) {
              resolved = true;
              subscription.unsubscribe();
              resolve({ session, user });
              return;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(checkSession, 100);
            } else {
              resolved = true;
              subscription.unsubscribe();
              resolve(null);
            }
          };
          
          // Start checking immediately
          checkSession();
          
          // Timeout after 6 seconds
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              subscription.unsubscribe();
              resolve(null);
            }
          }, 6000);
        });

        const authResult = await waitForSession;

        if (authResult && authResult.session && authResult.user) {
          // Clear the hash from URL to prevent reprocessing
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          
          // Wait a moment for cookies to be set
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Use window.location.href for a full page reload to ensure cookies are synced
          // This is important because router.replace does client-side navigation
          // and cookies might not be synced properly
          window.location.href = next;
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
          // Wait for session to be established
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Use full page reload to ensure cookies are synced
            window.location.href = next;
          } else {
            router.replace('/login?error=session_failed');
          }
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
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { session } } = await supabase.auth.getSession();
          const { data: { user } } = await supabase.auth.getUser();
          if (session && user) {
            // Use full page reload to ensure cookies are synced
            window.location.href = next;
          } else {
            router.replace('/login?error=session_failed');
          }
        } else {
          router.replace('/login?error=auth_failed');
        }
        return;
      }

      // If no hash or query params, check if we have a session
      // Wait a moment in case Supabase is still processing (hash might have been cleared)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for session - Supabase might have processed the hash already
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
          window.location.href = '/reset-password';
        } else {
          // Use full page reload to ensure cookies are synced
          window.location.href = '/dashboard';
        }
      } else {
        // No session found - redirect to login with error message
        router.replace('/login?error=no_session');
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

