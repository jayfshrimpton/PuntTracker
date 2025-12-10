'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Cmd on Mac
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const shortcuts: Shortcut[] = [
      {
        key: 'b',
        ctrl: true,
        action: () => {
          sessionStorage.setItem('focusBetForm', 'true');
          router.push('/bets');
        },
        description: 'Add new bet',
      },
      {
        key: 'i',
        ctrl: true,
        action: () => {
          sessionStorage.setItem('focusChatInput', 'true');
          router.push('/insights');
        },
        description: 'Chat with AI',
      },
      {
        key: 'h',
        ctrl: true,
        action: () => {
          router.push('/dashboard');
        },
        description: 'Go to dashboard',
      },
      {
        key: '/',
        ctrl: true,
        alt: true,
        action: () => {
          // Handled by KeyboardShortcutsHelp component
        },
        description: 'Show keyboard shortcuts',
      },
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs, textareas, or contenteditable elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.tagName === 'BUTTON' && !target.hasAttribute('data-shortcut-enabled'))
      ) {
        // Allow shortcuts if user is holding Ctrl/Cmd and pressing certain keys
        if (!e.ctrlKey && !e.metaKey) {
          return;
        }
        // Still allow navigation shortcuts even when in input fields
        if (e.key.toLowerCase() !== 'b' && e.key.toLowerCase() !== 'i' && e.key.toLowerCase() !== 'h' && (e.key !== '/' || !e.altKey)) {
          return;
        }
      }

      const shortcut = shortcuts.find((s) => {
        const keyMatch = s.key.toLowerCase() === e.key.toLowerCase();
        const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = s.alt ? e.altKey : !e.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, pathname]);
}

