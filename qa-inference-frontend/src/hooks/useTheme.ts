import { useEffect, useState } from 'react';
import type { ThemeMode } from '../types/settings';

const THEME_STORAGE_KEY = 'qa_inference_theme_preference';

export function useTheme(defaultMode: ThemeMode = 'system') {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return defaultMode;
  });

  const [resolvedDark, setResolvedDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolved = () => {
      const systemDark = mediaQuery.matches;
      const isDark = theme === 'system' ? systemDark : theme === 'dark';
      setResolvedDark(isDark);

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateResolved();

    const listener = () => {
      if (theme === 'system') {
        updateResolved();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const updateTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      updateTheme('light');
    } else if (theme === 'light') {
      updateTheme('dark');
    } else {
      // If system, switch to opposite of current resolved
      updateTheme(resolvedDark ? 'light' : 'dark');
    }
  };

  return {
    theme,
    isDark: resolvedDark,
    setTheme: updateTheme,
    toggleTheme,
  };
}
