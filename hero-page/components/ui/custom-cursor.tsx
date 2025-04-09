"use client"

import { useState, useEffect } from "react"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
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
  }, [])

  // Don't render the cursor if it's not visible
  if (!isVisible) return null

  return (
    <div
      className="fixed top-0 left-0 w-3 h-3 rounded-full bg-red-600 shadow-[0_0_5px_2px_rgba(220,38,38,0.6)] z-[9999] pointer-events-none"
      style={{
        transform: `translate(${position.x - 1.5}px, ${position.y - 1.5}px)`,
      }}
    />
  )
} 