import { cn } from "@/lib/utils"
import type React from "react"

interface GradientTextProps {
  children: React.ReactNode
  className?: string
}

export function GradientText({ children, className }: GradientTextProps) {
  const gradientClass = "bg-gradient-to-r from-[#14B8A6] via-[#0EA5E9] to-[#17345A] bg-clip-text text-transparent"

  return <span className={cn(gradientClass, className)}>{children}</span>
}

