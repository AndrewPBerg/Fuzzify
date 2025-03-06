"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe2, Home, Settings, Search, Database, Menu, X, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";

const sidebarNavItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Domains",
    href: "/domains",
    icon: Globe2,
  },
  {
    title: "Search",
    href: "/search",
    icon: Search,
  },
  {
    title: "Database",
    href: "/database",
    icon: Database,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed left-4 top-4 z-50">
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          "bg-background/80 backdrop-blur-lg",
          "rounded-2xl shadow-lg border",
          isExpanded ? "w-64" : "w-16",
          "overflow-hidden",
          "flex flex-col h-[calc(100vh-2rem)]"
        )}
      >
        <div className="flex-1 space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2 px-2">
              {isExpanded && (
                <h2 className="text-lg font-semibold">Domain Manager</h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="space-y-1">
              <ScrollArea className="h-[calc(100vh-14rem)] px-2">
                {sidebarNavItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      pathname === item.href && "bg-secondary",
                      !isExpanded && "justify-center p-0 h-12"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {isExpanded && <span>{item.title}</span>}
                    </Link>
                  </Button>
                ))}
              </ScrollArea>
            </div>
          </div>
        </div>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-full h-8",
              isExpanded ? "justify-start px-2" : "justify-center"
            )}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                {isExpanded && <span className="ml-2">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                {isExpanded && <span className="ml-2">Dark Mode</span>}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}