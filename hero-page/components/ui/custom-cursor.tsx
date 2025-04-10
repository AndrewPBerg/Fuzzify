"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  
  // Skip rendering if we're in the demo-app
  const isInDemoApp = pathname?.includes("/demo-app")
  
  useEffect(() => {
    // Don't attach listeners if we're in the demo app
    if (isInDemoApp) return
    
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    document.addEventListener("mousemove", updatePosition)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousemove", updatePosition)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isInDemoApp])

  // Don't render the cursor if it's not visible or if we're in the demo app
  if (!isVisible || isInDemoApp) return null

  return (
    <div
      className="fixed top-0 left-0 w-3 h-3 rounded-full bg-red-600 shadow-[0_0_5px_2px_rgba(220,38,38,0.6)] z-[9999] pointer-events-none"
      style={{
        transform: `translate(${position.x - 1.5}px, ${position.y - 1.5}px)`,
      }}
    />
  )
} 