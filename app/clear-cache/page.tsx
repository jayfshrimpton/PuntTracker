'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearCachePage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('Clearing cache...');

  useEffect(() => {
    const clearCache = async () => {
      try {
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log('Service worker unregistered:', registration.scope);
          }
        }

        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => {
              console.log('Deleting cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        }

        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        setStatus('Cache cleared successfully! Redirecting...');
        
        // Redirect to home after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error) {
        console.error('Error clearing cache:', error);
        setStatus('Error clearing cache. Please try again.');
      }
    };

    clearCache();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
}

