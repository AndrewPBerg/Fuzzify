import { useCallback,useState, useEffect, useRef, memo } from "react";
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

// Define Position type
type Position = {
  x: number;
  y: number;
};

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Domains", href: "/domains", icon: Globe },
  { name: "Schedule", href: "/schedule", icon: Clock },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Mobile navigation component
const MobileNavigation = memo(({ pathname }: { pathname: string }) => {
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
      </div>
    </>
  );
});

MobileNavigation.displayName = "MobileNavigation";

// Memoize navigation items to prevent re-renders
const NavigationItems = memo(({ pathname, isCollapsed }: { pathname: string, isCollapsed: boolean }) => {
  if (isCollapsed) return null;
  
  return (
    <div className="flex flex-col gap-1.5 py-1">
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState<Position>(() => {
    // Initialize position from localStorage or default
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarPosition");
      return saved ? JSON.parse(saved) : { x: 5, y: 5 };
    }
    return { x: 5, y: 5 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; startPosition: Position } | null>(null);
  const pathname = usePathname();

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

      setPosition(newPosition);
    });
  }, [isDragging]);

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

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  if (isMobile) {
    return <MobileNavigation pathname={pathname} />;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={sidebarRef}
        className={cn(
          "fixed z-50 rounded-2xl p-2 bg-background/95 backdrop-blur-lg",
          "border border-border shadow-lg",
          "flex flex-col gap-2 transition-all duration-300",
          isDragging && "opacity-80 pointer-events-none",
          isCollapsed ? "h-auto" : "h-auto"
        )}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {/* Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "handle cursor-grab active:cursor-grabbing",
            "rounded-xl bg-muted/50 hover:bg-muted px-2 py-1.5",
            "transition-colors duration-200",
            "flex items-center justify-center"
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

        <NavigationItems pathname={pathname} isCollapsed={isCollapsed} />

        {/* Theme toggle */}
        {!isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeToggle className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted" />
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
              className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4.5 w-4.5 text-muted-foreground" />
              ) : (
                <ChevronsLeft className="h-4.5 w-4.5 text-muted-foreground" />
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
