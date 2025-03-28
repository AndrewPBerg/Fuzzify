"use client"

import { useEffect, useRef } from "react"
import { Shield } from "lucide-react"

interface ShieldIcon {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  rotation: number
}

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const iconsRef = useRef<ShieldIcon[]>([])
  const animationRef = useRef<number>()

  // Initialize shield icons
  useEffect(() => {
    if (!containerRef.current) return

    // Create random shield icons
    const icons: ShieldIcon[] = []
    const count = Math.min(15, Math.floor(window.innerWidth / 100)) // Responsive count

    for (let i = 0; i < count; i++) {
      icons.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        size: 20 + Math.random() * 30, // px
        speed: 0.05 + Math.random() * 0.1,
        opacity: 0.03 + Math.random() * 0.07,
        rotation: Math.random() * 360,
      })
    }

    iconsRef.current = icons

    // Animation function
    const animate = () => {
      iconsRef.current = iconsRef.current.map((icon) => {
        // Move icon upward
        let newY = icon.y - icon.speed

        // Reset position if it goes off screen
        if (newY < -10) {
          newY = 110
          icon.x = Math.random() * 100
        }

        // Slight horizontal movement
        const newX = icon.x + Math.sin(newY / 20) * 0.1

        // Slow rotation
        const newRotation = icon.rotation + 0.05

        return {
          ...icon,
          y: newY,
          x: newX,
          rotation: newRotation,
        }
      })

      // Force re-render
      if (containerRef.current) {
        const icons = containerRef.current.querySelectorAll(".shield-icon")
        iconsRef.current.forEach((icon, index) => {
          if (icons[index]) {
            const element = icons[index] as HTMLElement
            element.style.transform = `translate(${icon.x}vw, ${icon.y}vh) rotate(${icon.rotation}deg)`
          }
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {iconsRef.current.map((icon) => (
        <div
          key={icon.id}
          className="shield-icon absolute"
          style={{
            width: `${icon.size}px`,
            height: `${icon.size}px`,
            opacity: icon.opacity,
            transform: `translate(${icon.x}vw, ${icon.y}vh) rotate(${icon.rotation}deg)`,
            transition: "transform 0.1s linear",
            color: "#17345A",
          }}
        >
          <Shield className="w-full h-full" />
        </div>
      ))}
    </div>
  )
}

