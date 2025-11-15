'use client';

import { useTheme } from '@/lib/theme';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }> = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
    { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' },
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    console.log('Theme toggle clicked:', newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-1 bg-white/10 dark:bg-gray-800/50 rounded-lg p-1 backdrop-blur-sm">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => handleThemeChange(t.value)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${
                theme === t.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/50'
              }
            `}
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

