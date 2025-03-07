import { useCallback,useState, useEffect, useRef } from "react";
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

export function Sidebar() {
  const [isMobile, setIsMobile] = useState(false);
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
  // const dragRef = useRef<{
  //   isDragging: boolean
  //   startX: number
  //   startY: number
  //   startPositionX: number
  //   startPositionY: number
  // }>({
  //   isDragging: false,
  //   startX: 0,
  //   startY: 0,
  //   startPositionX: 0,
  //   startPositionY: 0,
  // });

  const pathname = usePathname();

  const dragRef = useRef<{
    isDragging: boolean
    startX: number
    startY: number
    startPositionX: number
    startPositionY: number
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPositionX: 0,
    startPositionY: 0,
  })
  
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      const sidebar = sidebarRef.current
      if (!sidebar) return
  
      dragRef.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startPositionX: position.x,
        startPositionY: position.y,
      }
      setIsDragging(true)
    },
    [position],
  )
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current.isDragging) return
  
    const sidebar = sidebarRef.current
    if (!sidebar) return
  
    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY
  
    // Calculate new position
    let newX = dragRef.current.startPositionX + deltaX
    let newY = dragRef.current.startPositionY + deltaY
  
    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const sidebarRect = sidebar.getBoundingClientRect()
  
    // Bound the position within the viewport
    newX = Math.max(0, Math.min(newX, viewportWidth - sidebarRect.width))
    newY = Math.max(0, Math.min(newY, viewportHeight - sidebarRect.height))
  
    setPosition({ x: newX, y: newY })
  }, [])
  
  const handleMouseUp = useCallback(() => {
    if (!dragRef.current.isDragging) return
  
    dragRef.current.isDragging = false
    setIsDragging(false)
    localStorage.setItem("sidebarPosition", JSON.stringify(position))
  }, [position])
  
  // Add and remove event listeners
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])
  
  // // Handle responsive behavior
  // useEffect(() => {
  //   const handleResize = () => {
  //     const newIsMobile = window.innerWidth < 768;
  //     setIsMobile(newIsMobile);
      
  //     // If switching to mobile, reset position to a mobile-friendly location
  //     if (newIsMobile && !isMobile) {
  //       setPosition({ x: 5, y: 5 });
  //     }
  //   };

  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, [isMobile]);

  // // Save position to localStorage whenever it changes
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     localStorage.setItem("sidebarPosition", JSON.stringify(position));
  //   }
  // }, [position]);

  // // Handle dragging
  // const handleMouseDown = (e: React.MouseEvent) => {
  //   if (sidebarRef.current && e.target === sidebarRef.current) {
  //     setIsDragging(true);
  //     dragRef.current = {
  //       isDragging: true,
  //       startX: e.clientX,
  //       startY: e.clientY,
  //       startPositionX: position.x,
  //       startPositionY: position.y
  //     };
      
  //     // Prevent text selection during drag
  //     e.preventDefault();
  //   }
  // };

  // const handleTouchStart = (e: React.TouchEvent) => {
  //   if (sidebarRef.current && e.target === sidebarRef.current) {
  //     setIsDragging(true);
  //     const touch = e.touches[0];
  //     dragRef.current = {
  //       isDragging: true,
  //       startX: touch.clientX,
  //       startY: touch.clientY,
  //       startPositionX: position.x,
  //       startPositionY: position.y
  //     };
  //   }
  // };

  // const handleMouseMove = (e: MouseEvent) => {
  //   if (isDragging && dragRef.current.isDragging) {
  //     const deltaX = e.clientX - dragRef.current.startX;
  //     const deltaY = e.clientY - dragRef.current.startY;
      
  //     updatePosition(
  //       dragRef.current.startPositionX + deltaX,
  //       dragRef.current.startPositionY + deltaY
  //     );
  //   }
  // };

  // const handleTouchMove = (e: TouchEvent) => {
  //   if (isDragging && dragRef.current.isDragging) {
  //     const touch = e.touches[0];
  //     const deltaX = touch.clientX - dragRef.current.startX;
  //     const deltaY = touch.clientY - dragRef.current.startY;
      
  //     updatePosition(
  //       dragRef.current.startPositionX + deltaX,
  //       dragRef.current.startPositionY + deltaY
  //     );
      
  //     // Prevent scrolling while dragging
  //     e.preventDefault();
  //   }
  // };

  // const updatePosition = (x: number, y: number) => {
  //   // Keep sidebar within viewport
  //   const sidebarWidth = sidebarRef.current?.offsetWidth || 60;
  //   const sidebarHeight = sidebarRef.current?.offsetHeight || 300;
    
  //   const maxX = window.innerWidth - sidebarWidth;
  //   const maxY = window.innerHeight - sidebarHeight;
    
  //   setPosition({
  //     x: Math.max(0, Math.min(x, maxX)),
  //     y: Math.max(0, Math.min(y, maxY))
  //   });
  // };

  // const handleMouseUp = () => {
  //   setIsDragging(false);
  //   dragRef.current.isDragging = false;
  // };

  // const handleTouchEnd = () => {
  //   setIsDragging(false);
  //   dragRef.current.isDragging = false;
  // };

  // // Add event listeners
  // useEffect(() => {
  //   document.addEventListener('mousemove', handleMouseMove);
  //   document.addEventListener('mouseup', handleMouseUp);
  //   document.addEventListener('touchmove', handleTouchMove, { passive: false });
  //   document.addEventListener('touchend', handleTouchEnd);
    
  //   return () => {
  //     document.removeEventListener('mousemove', handleMouseMove);
  //     document.removeEventListener('mouseup', handleMouseUp);
  //     document.removeEventListener('touchmove', handleTouchMove);
  //     document.removeEventListener('touchend', handleTouchEnd);
  //   };
  // }, [isDragging]);

  // // Ensure sidebar stays within viewport on window resize
  // useEffect(() => {
  //   const handleWindowResize = () => {
  //     if (sidebarRef.current) {
  //       const sidebarWidth = sidebarRef.current.offsetWidth;
  //       const sidebarHeight = sidebarRef.current.offsetHeight;
        
  //       const maxX = window.innerWidth - sidebarWidth;
  //       const maxY = window.innerHeight - sidebarHeight;
        
  //       // If sidebar is outside viewport after resize, reposition it
  //       if (position.x > maxX || position.y > maxY) {
  //         setPosition({
  //           x: Math.min(position.x, maxX),
  //           y: Math.min(position.y, maxY)
  //         });
  //       }
  //     }
  //   };
    
  //   window.addEventListener('resize', handleWindowResize);
  //   return () => window.removeEventListener('resize', handleWindowResize);
  // }, [position]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={sidebarRef}
        className={cn(
          "fixed z-50 rounded-2xl p-2 bg-background/95 backdrop-blur-lg",
          "border border-border shadow-lg",
          "flex flex-col gap-2 transition-all duration-300",
          isDragging && "opacity-80",
          isCollapsed ? "h-auto" : "h-auto"
        )}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
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

        {/* Navigation */}
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
        )}

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
