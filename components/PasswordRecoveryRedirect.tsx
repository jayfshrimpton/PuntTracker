'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Client component that checks for password recovery hash fragments
 * and redirects to the reset password page if found.
 * This is needed because hash fragments are client-side only and
 * server components can't access them.
 */
export default function PasswordRecoveryRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check on the root path
    if (pathname !== '/') {
      return;
    }

    // Check for password recovery hash fragments
    const hash = window.location.hash;
    
    if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
      // Redirect to reset-password with the hash preserved
      router.replace(`/reset-password${hash}`);
    }
  }, [pathname, router]);

  return null;
}

