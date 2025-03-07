"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("light");

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    
    // Set initial value
    setSystemTheme(mediaQuery.matches ? "dark" : "light");
    
    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);
    
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-9 h-9", className)} />;
  }

  const toggleTheme = () => {
    // Cycle through themes: light -> dark -> system -> light
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  // Determine which icon to show based on current theme
  const actualTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm",
        "border border-border/50 hover:bg-background/90 transition-colors duration-200",
        className
      )}
      aria-label="Toggle theme"
    >
      <Sun
        size={18}
        className={cn(
          "text-primary absolute transition-all duration-300",
          theme === "light" ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}
      />
      <Moon
        size={18}
        className={cn(
          "text-primary absolute transition-all duration-300",
          theme === "dark" ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}
      />
      <Monitor
        size={18}
        className={cn(
          "text-primary absolute transition-all duration-300",
          theme === "system" ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}
      />
    </button>
  );
}
