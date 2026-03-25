'use client';

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/** Home marketing page is always light; user theme applies again after they leave. */
function isPublicLandingPath(pathname: string | null): boolean {
  return pathname === '/' || pathname === '';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const didInit = useRef(false);

  const applyTheme = useCallback((newTheme: Theme, persist: boolean) => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    const resolved = isPublicLandingPath(pathname)
      ? 'light'
      : getResolvedTheme(newTheme);

    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    setResolvedTheme(resolved);

    if (persist) {
      try {
        localStorage.setItem('theme', newTheme);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [pathname]);

  useLayoutEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      let initialTheme: Theme = 'light';
      try {
        const saved = localStorage.getItem('theme') as Theme | null;
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          initialTheme = saved;
        }
      } catch {
        // Ignore localStorage errors
      }
      if (initialTheme !== theme) {
        setThemeState(initialTheme);
      }
      applyTheme(initialTheme, false);
      return;
    }
    applyTheme(theme, true);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system', false);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
