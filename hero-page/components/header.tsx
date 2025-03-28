"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { PresentationIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface HeaderProps {
  title: string
  subtitle: string
  sections: {
    id: string
    title: string
  }[]
  currentSectionIndex: number
  isPresentationMode: boolean
  onSectionClick: (index: number) => void
  onStartPresentation: () => void
}

export default function Header({
  title,
  subtitle,
  sections,
  currentSectionIndex,
  isPresentationMode,
  onSectionClick,
  onStartPresentation,
}: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Simple fade-in animation without GSAP
  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.style.opacity = "0"
      headerRef.current.style.transform = "translateY(-20px)"

      setTimeout(() => {
        if (headerRef.current) {
          headerRef.current.style.transition = "opacity 0.5s ease, transform 0.5s ease"
          headerRef.current.style.opacity = "1"
          headerRef.current.style.transform = "translateY(0)"
        }
      }, 100)
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 md:px-10 py-4 md:py-6",
        isScrolled || isPresentationMode ? "bg-[#17345A]/80 backdrop-blur-md shadow-lg py-3 md:py-4" : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <Image 
              src="/fluffify_logo.png" 
              alt="Fuzzify Logo" 
              width={40} 
              height={40} 
              className="rounded-full"
            />
            <span className="text-white font-medium text-xl md:text-2xl tracking-tight" style={{ fontFamily: 'var(--font-aclonica)'}}>
              Fuzzify
            </span>
          </div>
          {subtitle && <span className="hidden md:inline-block text-white/60 text-sm ml-4">{subtitle}</span>}
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionClick(index)}
              className={cn(
                "text-white/80 hover:text-white text-sm font-medium transition-all duration-300 relative",
                currentSectionIndex === index && isPresentationMode ? "text-white font-semibold" : "",
              )}
            >
              {section.title}
              <span
                className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300",
                  currentSectionIndex === index && isPresentationMode ? "w-full" : "group-hover:w-full",
                )}
              ></span>
            </button>
          ))}
        </nav>

        <Button
          onClick={onStartPresentation}
          className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 border border-white/20 flex items-center gap-2 group relative overflow-hidden"
        >
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transform scale-0 group-hover:scale-100 rounded-full transition-transform duration-500 ease-out"></span>
          {isPresentationMode ? (
            <>
              <X className="h-4 w-4 relative z-10" />
              <span className="hidden sm:inline relative z-10">Exit Presentation</span>
            </>
          ) : (
            <>
              <PresentationIcon className="h-4 w-4 relative z-10" />
              <span className="hidden sm:inline relative z-10">Start Presentation</span>
            </>
          )}
        </Button>
      </div>
    </header>
  )
}

