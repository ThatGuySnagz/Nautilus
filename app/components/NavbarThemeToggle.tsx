'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import Icon from './Icon';

export default function NavbarThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Sync icon with the actual current class (set by the early script)
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const currentlyDark = root.classList.contains('dark');
    const newIsDark = !currentlyDark;

    setIsDark(newIsDark);

    if (newIsDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon>
        {isDark ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Icon>
    </button>
  );
}
