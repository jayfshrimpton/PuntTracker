'use client';

import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Shortcut {
  keys: string[];
  description: string;
}

const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modifierKey = isMac ? 'Cmd' : 'Ctrl';

const shortcuts: Shortcut[] = [
  { keys: [modifierKey, 'B'], description: 'Add new bet' },
  { keys: [modifierKey, 'I'], description: 'Chat with AI' },
  { keys: [modifierKey, 'H'], description: 'Go to dashboard' },
  { keys: [modifierKey, 'Alt', '/'], description: 'Show keyboard shortcuts' },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Alt + / to toggle shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === '/') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex fixed bottom-6 left-6 z-50 items-center gap-2 px-4 py-3 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg shadow-xl transition-all hover:scale-105 border border-primary/20 backdrop-blur-sm"
        title={`Keyboard shortcuts (${modifierKey}+Alt+/)`}
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5" />
        <span className="text-sm font-medium">Shortcuts</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Keyboard className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="text-sm font-medium text-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1.5">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex}>
                    <kbd className="px-2.5 py-1.5 text-xs font-semibold text-foreground bg-background border border-border rounded-md shadow-sm">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-muted-foreground">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-background border border-border rounded">Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}

