"use client";

import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(64);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarWidth(0);
      } else {
        // Check localStorage for sidebar state
        const sidebarExpanded = localStorage.getItem("sidebar-expanded") === "true";
        setSidebarWidth(sidebarExpanded ? 256 : 64);
      }
    };

    // Set initial sidebar width
    handleResize();

    // Listen for sidebar toggle events
    const handleSidebarToggle = () => {
      const sidebarExpanded = localStorage.getItem("sidebar-expanded") === "true";
      if (!isMobile) {
        setSidebarWidth(sidebarExpanded ? 256 : 64);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebar-toggle", handleSidebarToggle);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebar-toggle", handleSidebarToggle);
    };
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main 
        className={cn(
          "min-h-screen transition-all duration-300",
          isMobile ? "ml-0" : `ml-[${sidebarWidth}px]`
        )}
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}
