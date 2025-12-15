'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    // Check if service workers are supported
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      const registerServiceWorker = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log(
              '[PWA] Service Worker registered successfully:',
              registration.scope
            );

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Check every hour

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (
                    newWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    // New service worker available, prompt user to reload
                    console.log('[PWA] New service worker available');
                    // You could show a toast notification here
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      };

      // Register immediately if page is already loaded, otherwise wait for load
      if (document.readyState === 'complete') {
        registerServiceWorker();
      } else {
        window.addEventListener('load', registerServiceWorker);
      }

      // Handle service worker controller change (page refresh after update)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // Handle beforeinstallprompt for custom install prompt
      let deferredPrompt: any;
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        console.log('[PWA] Install prompt available');
        // Store in window for potential use by other components
        (window as any).deferredPrompt = deferredPrompt;
      });

      // Track when app is installed
      window.addEventListener('appinstalled', () => {
        console.log('[PWA] App installed successfully');
        deferredPrompt = null;
        (window as any).deferredPrompt = null;
      });
    }
  }, []);

  return null;
}



