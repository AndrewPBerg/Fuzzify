"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  title: string;
  message: string;
  severity?: "warning" | "error" | "info";
  className?: string;
}

export function AlertBanner({
  title,
  message,
  severity = "warning",
  className,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "glass-card rounded-lg p-4 flex items-start gap-3 animate-scale-in",
        severity === "error" && "border-rose-500/30 bg-rose-500/5",
        severity === "warning" && "border-amber-500/30 bg-amber-500/5",
        severity === "info" && "border-blue-500/30 bg-blue-500/5",
        className
      )}
    >
      <div
        className={cn(
          "p-1.5 rounded-full flex-shrink-0",
          severity === "error" && "bg-rose-500/10 text-rose-500",
          severity === "warning" && "bg-amber-500/10 text-amber-500",
          severity === "info" && "bg-blue-500/10 text-blue-500"
        )}
      >
        <AlertTriangle size={16} />
      </div>
      <div className="flex-1">
        <h3 className={cn(
          "font-medium text-sm mb-0.5",
          severity === "error" && "text-rose-500",
          severity === "warning" && "text-amber-500",
          severity === "info" && "text-blue-500"
        )}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
