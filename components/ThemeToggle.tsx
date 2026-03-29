'use client';

import { useTheme } from '@/lib/theme';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
  /** One icon button; use in tight mobile headers */
  variant?: 'full' | 'compact';
  className?: string;
};

export default function ThemeToggle({ variant = 'full', className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (variant === 'compact') {
    const isDark = resolvedTheme === 'dark';
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={cn(
          'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-border',
          'bg-card text-foreground shadow-sm ring-1 ring-border/60',
          'hover:bg-muted active:scale-95 transition-transform',
          'dark:bg-card dark:ring-border/80',
          className
        )}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-amber-500 drop-shadow-sm" strokeWidth={2.25} />
        ) : (
          <Moon className="h-5 w-5 text-indigo-700 dark:text-indigo-300 drop-shadow-sm" strokeWidth={2.25} />
        )}
      </button>
    );
  }

  const themes: Array<{ value: 'light' | 'dark'; icon: React.ReactNode; label: string }> = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const activeLight = theme === 'light' || (theme === 'system' && resolvedTheme === 'light');
  const activeDark = theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark');

  return (
    <div className={cn('relative inline-block', className)}>
      <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card p-1 shadow-sm dark:bg-muted/40">
        {themes.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => handleThemeChange(t.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              (t.value === 'light' ? activeLight : activeDark)
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-foreground hover:bg-muted'
            )}
            title={`Switch to ${t.label} mode`}
            aria-label={`Switch to ${t.label} mode`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
