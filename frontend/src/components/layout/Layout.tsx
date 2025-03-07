"use client";

import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

// Enum for sidebar modes
enum SidebarMode {
  Floating = "floating",
  Horizontal = "horizontal"
}

export function Layout({ children }: LayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(64);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(SidebarMode.Floating);
  const [contentPadding, setContentPadding] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarWidth(0);
        setSidebarMode(SidebarMode.Horizontal);
      } else {
        // Check localStorage for sidebar preference
        const horizontalSidebar = localStorage.getItem("horizontalSidebar") === "true";
        setSidebarMode(horizontalSidebar ? SidebarMode.Horizontal : SidebarMode.Floating);
        
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

    // Listen for horizontal sidebar preference changes
    const handleHorizontalSidebarChange = (event: CustomEvent) => {
      setSidebarMode(event.detail.enabled ? SidebarMode.Horizontal : SidebarMode.Floating);
    };

    // Listen for content padding changes from floating sidebar
    const handleContentPaddingChange = (event: CustomEvent) => {
      setContentPadding({
        left: event.detail.left || 0,
        right: event.detail.right || 0
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("sidebar-toggle", handleSidebarToggle);
    window.addEventListener("horizontalSidebarChange", 
      handleHorizontalSidebarChange as EventListener);
    window.addEventListener("contentPaddingChange", 
      handleContentPaddingChange as EventListener);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sidebar-toggle", handleSidebarToggle);
      window.removeEventListener("horizontalSidebarChange", 
        handleHorizontalSidebarChange as EventListener);
      window.removeEventListener("contentPaddingChange", 
        handleContentPaddingChange as EventListener);
    };
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main 
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarMode === SidebarMode.Horizontal && "ml-0"
        )}
        style={{ 
          paddingLeft: contentPadding.left,
          paddingRight: contentPadding.right,
          marginLeft: sidebarMode === SidebarMode.Horizontal ? 0 : isMobile ? 0 : sidebarWidth
        }}
      >
        {children}
      </main>
    </div>
  );
}
