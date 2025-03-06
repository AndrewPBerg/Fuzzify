"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-9 h-9", className)} />;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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
          theme === "dark" ? "opacity-0 scale-50" : "opacity-100 scale-100"
        )}
      />
      <Moon
        size={18}
        className={cn(
          "text-primary absolute transition-all duration-300",
          theme === "dark" ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}
      />
    </button>
  );
}
