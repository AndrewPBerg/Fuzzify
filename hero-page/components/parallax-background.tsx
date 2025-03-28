"use client"

import { useEffect, useRef } from "react"

export default function ParallaxBackground() {
  const layer1Ref = useRef<HTMLDivElement>(null)
  const layer2Ref = useRef<HTMLDivElement>(null)
  const layer3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simple parallax effect without GSAP
    const handleScroll = () => {
      if (!layer1Ref.current || !layer2Ref.current || !layer3Ref.current) return

      const scrollY = window.scrollY

      // Apply parallax effect with different speeds
      layer1Ref.current.style.transform = `translateY(${scrollY * 0.1}px)`
      layer2Ref.current.style.transform = `translateY(${scrollY * 0.2}px)`
      layer3Ref.current.style.transform = `translateY(${scrollY * 0.3}px)`
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#17345A] via-[#4D6A8F] to-[#788EAC] opacity-90"></div>

      {/* Parallax layers */}
      <div
        ref={layer1Ref}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(120, 142, 172, 0.3) 0%, transparent 50%)`,
        }}
      ></div>

      <div
        ref={layer2Ref}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 60%, rgba(77, 106, 143, 0.4) 0%, transparent 60%)`,
        }}
      ></div>

      <div
        ref={layer3Ref}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(23, 52, 90, 0.2) 0%, transparent 70%)`,
        }}
      ></div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), 
                            linear-gradient(to bottom, #fff 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      ></div>
    </div>
  )
}

