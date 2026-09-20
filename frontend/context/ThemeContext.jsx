'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('skillsprint_theme');
    const initial = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'light');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only theme restore (needs window/localStorage, unavailable during SSR)
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'night');
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'night' : 'light';
    setTheme(next);
    localStorage.setItem('skillsprint_theme', next);
    document.documentElement.classList.toggle('dark', next === 'night');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
