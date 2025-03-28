"use client"

import { useEffect, useRef, useState } from "react"
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
  const [isMounted, setIsMounted] = useState(false)

  // Initialize shield icons
  useEffect(() => {
    setIsMounted(true)
    if (!containerRef.current) return

    // Determine if on mobile
    const isMobile = window.innerWidth < 768
    
    // Create random shield icons - fewer on mobile
    const icons: ShieldIcon[] = []
    const count = isMobile 
      ? Math.min(8, Math.floor(window.innerWidth / 120)) // Fewer on mobile
      : Math.min(15, Math.floor(window.innerWidth / 100))

    for (let i = 0; i < count; i++) {
      // Smaller icons on mobile
      const sizeBase = isMobile ? 15 : 20
      const sizeVariation = isMobile ? 20 : 30
      
      icons.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        size: sizeBase + Math.random() * sizeVariation, // px
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

        // Slight horizontal movement - less movement on mobile for better performance
        const horizontalFactor = window.innerWidth < 768 ? 0.05 : 0.1
        const newX = icon.x + Math.sin(newY / 20) * horizontalFactor

        // Slow rotation - slower on mobile for better performance
        const rotationSpeed = window.innerWidth < 768 ? 0.03 : 0.05
        const newRotation = icon.rotation + rotationSpeed

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

    // Handle resize
    const handleResize = () => {
      // Clear current animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // Reinitialize icons with new screen size
      const isMobile = window.innerWidth < 768
      const count = isMobile 
        ? Math.min(8, Math.floor(window.innerWidth / 120))
        : Math.min(15, Math.floor(window.innerWidth / 100))
      
      // Update icons based on new screen size
      const icons: ShieldIcon[] = []
      for (let i = 0; i < count; i++) {
        const sizeBase = isMobile ? 15 : 20
        const sizeVariation = isMobile ? 20 : 30
        
        icons.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: sizeBase + Math.random() * sizeVariation,
          speed: 0.05 + Math.random() * 0.1,
          opacity: 0.03 + Math.random() * 0.07,
          rotation: Math.random() * 360,
        })
      }
      
      iconsRef.current = icons
      
      // Restart animation
      animationRef.current = requestAnimationFrame(animate)
    }
    
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {isMounted && iconsRef.current.map((icon) => (
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

