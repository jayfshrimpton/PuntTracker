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
    // Check immediately on mount (before React hydration completes)
    const checkHash = () => {
      if (typeof window === 'undefined') return false;
      
      const hash = window.location.hash;
      const search = window.location.search;
      const currentPathname = window.location.pathname;
      
      // Only redirect if we're NOT already on /reset-password
      if (currentPathname === '/reset-password') {
        return false;
      }
      
      // Debug logging
      if (hash || search.includes('token_hash') || search.includes('type=recovery')) {
        console.log('[PasswordRecoveryRedirect] Checking:', { hash, search, pathname: currentPathname });
      }
      
      // Check for password recovery hash fragments
      if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
        console.log('[PasswordRecoveryRedirect] Redirecting to /reset-password');
        window.location.replace(`/reset-password${hash}${search}`);
        return true;
      }
      
      // Also check for query parameters (alternative format)
      const urlParams = new URLSearchParams(search);
      const token_hash = urlParams.get('token_hash');
      const type = urlParams.get('type');
      
      if (token_hash && type === 'recovery') {
        console.log('[PasswordRecoveryRedirect] Redirecting to /reset-password with query params');
        window.location.replace(`/reset-password?token_hash=${token_hash}&type=recovery`);
        return true;
      }
      
      return false;
    };

    // Check immediately
    if (checkHash()) {
      return;
    }

    // Check multiple times with increasing delays (hash might appear after page load)
    const timeouts: NodeJS.Timeout[] = [];
    [50, 100, 200, 500, 1000].forEach((delay) => {
      const timeoutId = setTimeout(() => {
        if (checkHash()) {
          // Clear remaining timeouts if redirect happened
          timeouts.forEach(clearTimeout);
        }
      }, delay);
      timeouts.push(timeoutId);
    });

    // Listen for hash changes
    const handleHashChange = () => {
      checkHash();
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname, router]);

  return null;
}







