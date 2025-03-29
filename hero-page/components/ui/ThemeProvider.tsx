"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(false);
  
  // Check if we're on the login page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we're on the login page
      const isOnLoginPage = window.location.pathname === '/login';
      setIsLoginPage(isOnLoginPage);
      
      // When navigating away from login page, re-read theme from localStorage
      // This ensures theme applied during login is respected
      if (!isOnLoginPage && mounted) {
        const savedTheme = localStorage.getItem(storageKey) as Theme;
        if (savedTheme) {
          setTheme(savedTheme);
        }
      }
    }
  }, [mounted, storageKey]);
  
  // Once mounted on client, we can use localStorage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    // Always load from localStorage if available, regardless of page
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    // Add listener for storage changes to sync theme across tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        setTheme(e.newValue as Theme);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
    
    // We no longer need to listen for theme change events that force light mode
    // instead, we'll use the normal theme setting mechanism via setTheme
  }, [storageKey, setTheme]);

  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    
    // Only modify classes if the theme has changed from what's already applied
    // This helps prevent unnecessary flashes
    const isDark = root.classList.contains('dark');
    const currentTheme = isDark ? 'dark' : 'light';
    
    let newTheme = theme;
    
    // Determine the actual theme if set to system
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      newTheme = mediaQuery.matches ? "dark" : "light";
      
      // Listen for system theme changes
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark");
        root.classList.add(e.matches ? "dark" : "light");
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    
    // Only update classes if the theme is actually changing
    if (newTheme !== currentTheme) {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // Save to localStorage regardless of page
      if (mounted) {
        localStorage.setItem(storageKey, theme);
      }
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
