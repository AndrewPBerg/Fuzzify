import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Globe, 
  Settings,
  Clock,
  User,
  ChevronsLeft,
  ChevronsRight
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Domains", href: "/domains", icon: Globe },
  { name: "Schedule", href: "/schedule", icon: Clock },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 5, y: 5 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (sidebarRef.current && e.target === sidebarRef.current) {
      setIsDragging(true);
      dragRef.current = { 
        startX: e.clientX - position.x, 
        startY: e.clientY - position.y 
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragRef.current) {
      const newX = e.clientX - dragRef.current.startX;
      const newY = e.clientY - dragRef.current.startY;
      
      // Keep sidebar within viewport
      const maxX = window.innerWidth - (sidebarRef.current?.offsetWidth || 60);
      const maxY = window.innerHeight - (sidebarRef.current?.offsetHeight || 300);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  // Add mouse move and mouse up event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <TooltipProvider delayDuration={300}>
      {/* Low-profile sidebar with draggable support */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed z-50 rounded-full p-1.5 bg-sidebar/70 backdrop-blur-lg",
          "border border-sidebar-border/30 shadow-sm cursor-move",
          "flex flex-col gap-1.5 transition-all duration-300",
          isDragging && "opacity-80",
          isCollapsed ? "h-auto" : "h-auto"
        )}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Account dropdown at the top */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-sidebar-accent/40 hover:bg-sidebar-accent/80 cursor-pointer">
              <User className="h-4.5 w-4.5 text-sidebar-foreground/90" />
              <span className="sr-only">Account menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-56 mt-1">
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

        {/* Navigation - conditionally render based on collapse state */}
        {!isCollapsed && (
          <div className="flex flex-col gap-1.5 py-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center h-9 w-9 rounded-full transition-all duration-200 cursor-pointer",
                        "hover:bg-sidebar-accent/80",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-primary" 
                          : "text-sidebar-foreground/70 bg-sidebar-accent/40"
                      )}
                    >
                      <item.icon 
                        size={18} 
                        className={cn(
                          "transition-all duration-200",
                          isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"
                        )} 
                      />
                      <span className="sr-only">{item.name}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <span>{item.name}</span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* Theme toggle - only visible when not collapsed */}
        {!isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeToggle className="h-9 w-9 rounded-full bg-sidebar-accent/40 hover:bg-sidebar-accent/80" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span>Toggle Theme</span>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Collapse toggle button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-9 w-9 rounded-full bg-sidebar-accent/40 hover:bg-sidebar-accent/80 cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4.5 w-4.5 text-sidebar-foreground/90" />
              ) : (
                <ChevronsLeft className="h-4.5 w-4.5 text-sidebar-foreground/90" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span>{isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
