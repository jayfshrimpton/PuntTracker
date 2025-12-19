'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  // Check if we're on the landing page - use pathname directly (it's safe in client components)
  // During SSR, pathname will be '/', and on client it will match, so no hydration mismatch
  const isLandingPage = pathname === '/';

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme, forceDark = false) => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    // Force dark mode on landing page
    const resolved = forceDark || isLandingPage ? 'dark' : getResolvedTheme(newTheme);
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the resolved theme class
    root.classList.add(resolved);
    setResolvedTheme(resolved);
    
    // Debug logging
    console.log('Theme applied:', { newTheme, resolved, classes: root.classList.toString(), isLandingPage });
    
    // Save to localStorage (but don't save if forcing dark for landing page)
    if (!forceDark && !isLandingPage) {
      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [isLandingPage]);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    
    // Check if HTML already has a theme class (from initial script)
    const html = document.documentElement;
    const hasDark = html.classList.contains('dark');
    const hasLight = html.classList.contains('light');
    
    // Load theme from localStorage
    let initialTheme: Theme = 'dark'; // Default to dark mode for dashboard on first visit
    try {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        initialTheme = saved;
      } else if (hasDark || hasLight) {
        // If no saved theme but HTML has a class, infer from the class
        initialTheme = hasDark ? 'dark' : 'light';
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    setThemeState(initialTheme);
    // Apply theme (force dark on landing page)
    applyTheme(initialTheme, isLandingPage);
  }, [applyTheme, isLandingPage]);

  // Update theme when state changes or pathname changes
  useEffect(() => {
    if (!mounted) return;
    // Force dark mode on landing page, otherwise use the theme
    applyTheme(theme, isLandingPage);
  }, [theme, mounted, applyTheme, isLandingPage]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (!mounted || theme !== 'system' || typeof window === 'undefined' || isLandingPage) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system', false);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted, applyTheme, isLandingPage]);

  // Wrapped setTheme function
  const setTheme = useCallback((newTheme: Theme) => {
    // Don't allow theme changes on landing page
    if (isLandingPage) {
      console.log('Theme changes disabled on landing page');
      return;
    }
    console.log('setTheme called with:', newTheme);
    setThemeState(newTheme);
    // Immediately apply the theme (don't wait for state update)
    applyTheme(newTheme, false);
  }, [applyTheme, isLandingPage]);

  // Always provide the context, even before mount
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

