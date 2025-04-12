"use client";

import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { HomeIcon } from "lucide-react";

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
  const pathname = usePathname();
  
  // Check if current path is the login page
  const isLoginPage = pathname === "/login";

  const mainRef = useRef<HTMLElement>(null);

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
      console.log("Content padding change:", event.detail);
      setContentPadding({
        left: event.detail.left || 0,
        right: event.detail.right || 0
      });
      
      // Apply the padding directly to the main element for immediate effect
      if (mainRef.current) {
        mainRef.current.style.paddingLeft = event.detail.left ? `${Math.max(event.detail.left - 64, 0)}px` : '';
        mainRef.current.style.paddingRight = event.detail.right ? `${Math.max(event.detail.right - 64, 0)}px` : '';
      }
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
      {!isLoginPage && <Sidebar />}
      <main 
        ref={mainRef}
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarMode === SidebarMode.Horizontal && "ml-0",
          contentPadding.left || contentPadding.right ? "" : "container mx-auto px-2 sm:px-3 md:px-4 lg:px-6",
          isLoginPage && "container mx-auto px-2 sm:px-3 md:px-4 lg:px-6" // Always use container for login page
        )}
        style={{ 
          paddingLeft: isLoginPage ? undefined : (contentPadding.left ? `${Math.max(contentPadding.left - (isMobile ? 8 : 16), 0)}px` : undefined),
          paddingRight: isLoginPage ? undefined : (contentPadding.right ? `${Math.max(contentPadding.right - (isMobile ? 8 : 16), 0)}px` : undefined),
          maxWidth: isLoginPage ? "1600px" : (contentPadding.left || contentPadding.right ? "100%" : "1600px"),
          width: "100%",
          transition: "padding 0.4s ease-out, margin 0.4s ease-out"
        }}
      >
        {children}
      </main>
      
      {/* Persistent Message in Bottom Left */}
      <div className="fixed bottom-3 left-3 z-50 max-w-[calc(100vw-24px)] sm:max-w-sm p-2 sm:p-3 text-xs sm:text-sm bg-background/80 backdrop-blur-sm border border-border rounded-md shadow-md">
        <a href={typeof window !== 'undefined' ? window.location.origin : '/'} className="flex items-center text-primary hover:underline mt-2">
          <HomeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span>Back To Landing Page</span>
        </a>
        <p className="text-muted-foreground">
          You are viewing the static version of the Fuzzify web app. If you would like the most up to date features, interface, and full functionality visit: <a href="https://github.com/AndrewPBerg/Fuzzify" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">github.com/AndrewPBerg/Fuzzify</a> to run locally.
        </p>
      </div>
    </div>
  );
}
