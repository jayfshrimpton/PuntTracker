'use client';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';

export function KeyboardShortcuts() {
  useKeyboardShortcuts();
  return <KeyboardShortcutsHelp />;
}

