"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Globe, 
  Settings,
  Clock,
  Menu
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Domains", href: "/domains", icon: Globe },
  { name: "Schedule", href: "/schedule", icon: Clock },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isMobile && expanded && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "sidebar-glass fixed top-0 bottom-0 left-0 z-50 flex flex-col",
          "transition-all duration-300 ease-in-out",
          expanded ? "w-64" : "w-16",
          isMobile && !expanded && "left-[-4rem]",
          isMobile && expanded && "left-0"
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">DM</span>
            </div>
            {expanded && (
              <span className="ml-3 text-lg font-semibold text-sidebar-foreground transition-opacity duration-200">
                DomainMaster
              </span>
            )}
          </div>
          
          {/* User account dropdown - replaced icon with a button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Account menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Organization Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Team</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 flex flex-col gap-2 px-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                  "group hover:bg-sidebar-accent/70",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-primary font-medium" 
                    : "text-sidebar-foreground/70"
                )}
              >
                <item.icon 
                  size={20} 
                  className={cn(
                    "flex-shrink-0 transition-all duration-200",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                  )} 
                />
                {expanded && (
                  <span className="text-sm transition-opacity duration-200">
                    {item.name}
                  </span>
                )}
                {isActive && expanded && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="p-4 flex items-center justify-between">
          <ThemeToggle className={cn(
            "transition-opacity duration-200",
            !expanded && "opacity-0 pointer-events-none"
          )} />
          
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors duration-200"
          >
            {expanded ? (
              <ChevronLeft size={16} className="text-sidebar-foreground" />
            ) : (
              <ChevronRight size={16} className="text-sidebar-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile toggle button */}
      {isMobile && !expanded && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-sidebar-background/90 backdrop-blur-lg border border-sidebar-border/50 shadow-lg"
        >
          <ChevronRight size={18} className="text-sidebar-foreground" />
        </button>
      )}

      {/* Mobile account button */}
      {isMobile && !expanded && (
        <div className="fixed top-4 right-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Account menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Organization Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Team</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  );
}
