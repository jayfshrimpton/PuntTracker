'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      
      // Check for hash fragments (Supabase password reset uses hash fragments)
      const hash = window.location.hash;
      
      if (hash && hash.includes('type=recovery')) {
        // This is a password recovery link - redirect to reset-password
        // The hash will be preserved in the URL
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

      // Handle other auth callbacks
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash,
        });

        if (!error) {
          router.replace(next);
        } else {
          router.replace('/login?error=auth_failed');
        }
        return;
      }

      // If no hash or query params, check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
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

