import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'oled' | 'light';

const STORAGE_KEY = 'sangam-theme';

function getSystemPreference(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'oled' || saved === 'light') return saved;
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return getSavedTheme() || getSystemPreference();
  });

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Cycle through themes
  const cycleTheme = useCallback(() => {
    const order: Theme[] = ['dark', 'oled', 'light'];
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    setTheme(next);
  }, [theme, setTheme]);

  const themeLabel = theme === 'dark' ? '🌙 Dark' : theme === 'oled' ? '◉ OLED' : '☀ Light';
  const themeIcon = theme === 'dark' ? 'moon' : theme === 'oled' ? 'monitor' : 'sun';

  return { theme, setTheme, cycleTheme, themeLabel, themeIcon };
}
