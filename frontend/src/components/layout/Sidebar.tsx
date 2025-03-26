import { useCallback, useState, useEffect, useRef, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Globe, 
  Settings,
  Clock,
  User,
  ChevronsLeft,
  ChevronsRight,
  GripHorizontal
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/ui/ThemeProvider";
import { toast } from "sonner";
import { userStorage } from "@/lib/api/users";

// Define Position type
type Position = {
  x: number;
  y: number;
};

// Constants for sidebar locking
const LOCK_THRESHOLD = 20; // Distance from edge to trigger lock
const SNAP_ANIMATION_DURATION = 300; // ms

// Enum for lock positions
enum LockPosition {
  None = "none",
  Left = "left",
  Right = "right"
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Domains", href: "/domains", icon: Globe },
  { name: "Schedule", href: "/schedule", icon: Clock },
  { name: "Settings", href: "/settings", icon: Settings },
];



// Horizontal sidebar component
const HorizontalSidebar = memo(({ pathname }: { pathname: string }) => {
  const currentUser = userStorage.getCurrentUser();
  
  return (
    <>
      {/* Add a spacer div to prevent content from being hidden under the navbar */}
      <div className="h-16" />
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "h-16 px-4 bg-background/95 backdrop-blur-lg",
        "border-b border-border",
        "flex items-center justify-between",
        "transition-all duration-300"
      )}>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-full shrink-0",
                      "transition-colors duration-200",
                      "hover:bg-muted",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground bg-muted/50"
                    )}
                  >
                    <item.icon 
                      size={18} 
                      className={cn(
                        "transition-colors duration-200",
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      )} 
                    />
                    <span className="sr-only">{item.name}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                  <span>{item.name}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          <ThemeToggle className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted">
                <User className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="sr-only">Account menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="w-56 mt-1">
              <DropdownMenuLabel>{currentUser.username}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="text-destructive">
                <Link href="/login" onClick={() => { localStorage.clear(); }}>
                  <span>Logout</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
});

HorizontalSidebar.displayName = "HorizontalSidebar";

// Memoize navigation items to prevent re-renders
const NavigationItems = memo(({ pathname, isCollapsed }: { pathname: string, isCollapsed: boolean }) => {
  if (isCollapsed) return null;
  
  return (
    <div className="flex flex-col gap-1.5">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Tooltip key={item.name}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-200",
                  "hover:bg-muted",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground bg-muted/50"
                )}
              >
                <item.icon 
                  size={18} 
                  className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
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
  );
});

NavigationItems.displayName = "NavigationItems";

export function Sidebar() {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [useHorizontalSidebar, setUseHorizontalSidebar] = useState(false);
  const [lockPosition, setLockPosition] = useState<LockPosition>(LockPosition.Left);
  const [isSnapping, setIsSnapping] = useState(false);
  const [position, setPosition] = useState<Position>(() => {
    // Initialize position from localStorage or default to left edge
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarPosition");
      // Default to left edge (x: 0) instead of x: 5
      return saved ? JSON.parse(saved) : { x: 0, y: 5 };
    }
    return { x: 0, y: 5 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; startPosition: Position } | null>(null);
  const pathname = usePathname();
  const currentUser = userStorage.getCurrentUser();

  // Check for horizontal sidebar preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      // If on mobile, always use horizontal sidebar
      if (isMobile) {
        setUseHorizontalSidebar(true);
        return;
      }
      
      // Otherwise, check user preference from settings
      const horizontalSidebarPref = localStorage.getItem("horizontalSidebar");
      setUseHorizontalSidebar(horizontalSidebarPref === "true");

      // Listen for changes to horizontal sidebar preference
      const handleHorizontalSidebarChange = (event: CustomEvent) => {
        setUseHorizontalSidebar(event.detail.enabled);
      };

      window.addEventListener("horizontalSidebarChange", 
        handleHorizontalSidebarChange as EventListener);
      
      return () => {
        window.removeEventListener("horizontalSidebarChange", 
          handleHorizontalSidebarChange as EventListener);
      };
    }
  }, [isMobile]);

  // Apply initial content padding for default left-locked sidebar
  useEffect(() => {
    // Skip if using horizontal sidebar or if sidebar is not left-locked
    if (useHorizontalSidebar || lockPosition !== LockPosition.Left) {
      return;
    }

    // Need to wait for the sidebar ref to be available
    const applyInitialPadding = () => {
      if (sidebarRef.current) {
        const sidebarWidth = sidebarRef.current.offsetWidth;
        // Dispatch content padding change event
        window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
          detail: { left: Math.max(sidebarWidth - 16, 0), right: 0 } 
        }));
      }
    };

    // Apply the padding on the next tick to ensure the sidebar has rendered
    setTimeout(applyInitialPadding, 0);
  }, [useHorizontalSidebar, lockPosition, sidebarRef.current]);

  // Reset body padding when component unmounts or when using horizontal sidebar
  useEffect(() => {
    // Reset any padding when using horizontal sidebar
    if (useHorizontalSidebar && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
        detail: { left: 0, right: 0 } 
      }));
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
          detail: { left: 0, right: 0 } 
        }));
      }
    };
  }, [useHorizontalSidebar]);

  // Apply content padding when sidebar is locked
  useEffect(() => {
    if (lockPosition === LockPosition.None || useHorizontalSidebar) {
      // Reset padding by dispatching event with zero values
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
          detail: { left: 0, right: 0 } 
        }));
        
        // Also reset any direct style modifications
        document.body.style.removeProperty('padding-left');
        document.body.style.removeProperty('padding-right');
      }
      return;
    }

    // Get sidebar width and dispatch appropriate padding values
    if (sidebarRef.current) {
      const sidebarWidth = sidebarRef.current.offsetWidth;
      
      // When locked to an edge, use the exact sidebar width for a flush fit
      // and set the opposite side to 0 for asymmetric padding
      if (lockPosition === LockPosition.Left) {
        // Dispatch event for components that listen to it
        window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
          detail: { left: Math.max(sidebarWidth - 16, 0), right: 0 } 
        }));
        
        // Also apply directly to body for immediate effect
        document.body.style.paddingLeft = `${Math.max(sidebarWidth - 16, 0)}px`;
        document.body.style.paddingRight = '0px';
      } else if (lockPosition === LockPosition.Right) {
        // Dispatch event for components that listen to it
        window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
          detail: { left: 0, right: Math.max(sidebarWidth - 16, 0) } 
        }));
        
        // Also apply directly to body for immediate effect
        document.body.style.paddingLeft = '0px';
        document.body.style.paddingRight = `${Math.max(sidebarWidth - 16, 0)}px`;
      }
    }
  }, [lockPosition, position.x, useHorizontalSidebar]);

  // Function to check if sidebar should lock to an edge
  const checkForEdgeLock = useCallback((newPosition: Position) => {
    if (sidebarRef.current) {
      const windowWidth = window.innerWidth;
      const sidebarWidth = sidebarRef.current.offsetWidth;
      
      // Check for left edge lock
      if (newPosition.x <= LOCK_THRESHOLD) {
        // Close to left edge - lock it
        setIsSnapping(true);
        
        // Animate to edge
        setTimeout(() => {
          setPosition({ ...newPosition, x: 0 });
          setLockPosition(LockPosition.Left);
          setIsSnapping(false);
          
          // Update content padding immediately for a smooth transition
          // Left padding = sidebar width, right padding = 0 for asymmetric padding
          window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
            detail: { left: Math.max(sidebarWidth - 16, 0), right: 0 } 
          }));
        }, 0);
        
        return true;
      }
      
      // Check for right edge lock
      if (newPosition.x >= windowWidth - sidebarWidth - LOCK_THRESHOLD) {
        // Close to right edge - lock it
        setIsSnapping(true);
        
        // Animate to edge
        setTimeout(() => {
          setPosition({ ...newPosition, x: windowWidth - sidebarWidth });
          setLockPosition(LockPosition.Right);
          setIsSnapping(false);
          
          // Update content padding immediately for a smooth transition
          // Left padding = 0, right padding = sidebar width for asymmetric padding
          window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
            detail: { left: 0, right: Math.max(sidebarWidth - 16, 0) } 
          }));
          
          // Also apply directly to body for immediate effect
          document.body.style.paddingLeft = '0px';
          document.body.style.paddingRight = `${Math.max(sidebarWidth - 16, 0)}px`;
        }, 0);
        
        return true;
      }
      
      // If we're locked but dragged away from the edge, unlock
      if (lockPosition !== LockPosition.None && 
          newPosition.x > LOCK_THRESHOLD && 
          newPosition.x < windowWidth - sidebarWidth - LOCK_THRESHOLD) {
        setLockPosition(LockPosition.None);
        
        // Reset content padding immediately
        window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
          detail: { left: 0, right: 0 } 
        }));
      }
    }
    
    return false;
  }, [lockPosition]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPosition: position
    };
    setIsDragging(true);

    // Add cursor styles to body during drag
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      if (!dragStartRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // Calculate new position
      const newPosition = {
        x: dragStartRef.current.startPosition.x + deltaX,
        y: dragStartRef.current.startPosition.y + deltaY
      };

      // Bound position within viewport
      if (sidebarRef.current) {
        const rect = sidebarRef.current.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
        newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
      }

      // Check if we should lock to edge
      const isLocking = checkForEdgeLock(newPosition);
      
      if (!isLocking) {
        setPosition(newPosition);
      }

      // Update content padding if sidebar is locked
      if (lockPosition !== LockPosition.None && sidebarRef.current && !isLocking) {
        const sidebarWidth = sidebarRef.current.offsetWidth;
        
        if (lockPosition === LockPosition.Left) {
          // For left-locked sidebar, add the exact position for a flush fit
          // Maintain asymmetric padding with right side = 0
          window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
            detail: { left: Math.max(sidebarWidth + newPosition.x - 16, 0), right: 0 } 
          }));
        } else if (lockPosition === LockPosition.Right) {
          const windowWidth = window.innerWidth;
          const rightSpace = windowWidth - newPosition.x - sidebarWidth;
          // For right-locked sidebar, add the exact position for a flush fit
          // Maintain asymmetric padding with left side = 0
          window.dispatchEvent(new CustomEvent("contentPaddingChange", { 
            detail: { left: 0, right: Math.max(sidebarWidth + rightSpace - 16, 0) } 
          }));
          
          // Apply the padding directly to ensure it takes effect immediately
          if (typeof document !== "undefined") {
            document.documentElement.style.setProperty('--right-padding', `${Math.max(sidebarWidth + rightSpace - 16, 0)}px`);
          }
        }
      }
    });
  }, [isDragging, lockPosition, checkForEdgeLock]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    dragStartRef.current = null;

    // Save position to localStorage
    localStorage.setItem("sidebarPosition", JSON.stringify(position));

    // Reset cursor styles
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isDragging, position]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Attach and cleanup event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // If using horizontal sidebar (mobile or user preference), render horizontal version
  if (useHorizontalSidebar) {
    return <HorizontalSidebar pathname={pathname} />;
  }

  // Otherwise render the floating sidebar
  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={sidebarRef}
        className={cn(
          "fixed z-50 p-2 bg-background/95 backdrop-blur-lg",
          "border border-border shadow-lg",
          "flex flex-col gap-2",
          isDragging && "opacity-80 pointer-events-none",
          isCollapsed ? "h-auto" : "h-auto",
          lockPosition === LockPosition.None && "rounded-2xl",
          lockPosition === LockPosition.Left && "border-primary/50 rounded-l-none rounded-r-2xl border-l-0 shadow-none",
          lockPosition === LockPosition.Right && "border-primary/50 rounded-r-none rounded-l-2xl border-r-0 shadow-none",
          isSnapping ? "transition-all duration-300" : "transition-transform duration-200"
        )}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          transition: isDragging ? 'none' : isSnapping 
            ? `all ${SNAP_ANIMATION_DURATION}ms ease-out` 
            : 'transform 0.2s ease-out'
        }}
      >
        {/* Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "handle cursor-grab active:cursor-grabbing",
            "rounded-xl bg-muted/50 hover:bg-muted px-2 py-1.5",
            "transition-colors duration-200",
            "flex items-center justify-center",
            // Make drag handle less prominent when sidebar is locked to edges
            lockPosition !== LockPosition.None && "opacity-80 hover:opacity-100"
          )}
        >
          <GripHorizontal className="h-4 w-4 text-muted-foreground/50" />
        </div>

        {/* Account dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted cursor-pointer">
              <User className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="sr-only">Account menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align={lockPosition === LockPosition.Right ? "end" : "start"} 
            side={lockPosition === LockPosition.Right ? "left" : "right"} 
            className="w-56 mt-1"
          >
            <DropdownMenuLabel>{currentUser.username}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-destructive">
              <Link href="/login" onClick={() => { localStorage.clear(); }}>
                <span>Logout</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <NavigationItems pathname={pathname} isCollapsed={isCollapsed} />

        {/* Theme toggle */}
        {!isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeToggle className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted" />
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side={lockPosition === LockPosition.Right ? "left" : "right"} 
              sideOffset={8}
            >
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
              className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4.5 w-4.5 text-muted-foreground" />
              ) : (
                <ChevronsLeft className="h-4.5 w-4.5 text-muted-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent 
            side={lockPosition === LockPosition.Right ? "left" : "right"} 
            sideOffset={8}
          >
            <span>{isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
