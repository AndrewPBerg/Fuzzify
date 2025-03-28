"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SectionProgressProps {
  sections: { id: string; title: string }[]
  currentSectionIndex: number
  isPresentationMode: boolean
  onSectionClick: (index: number) => void
}

export function SectionProgress({
  sections,
  currentSectionIndex,
  isPresentationMode,
  onSectionClick,
}: SectionProgressProps) {
  const [activeSection, setActiveSection] = useState(currentSectionIndex)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Update active section based on scroll position in normal mode
  useEffect(() => {
    if (isPresentationMode) {
      setActiveSection(currentSectionIndex)
      setScrollProgress((currentSectionIndex / (sections.length - 1)) * 100)
      return
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3

      // Find the current section based on scroll position
      let currentIndex = 0
      sections.forEach((section, index) => {
        const element = document.getElementById(section.id)
        if (element && scrollPosition >= element.offsetTop) {
          currentIndex = index
        }
      })

      setActiveSection(currentIndex)

      // Calculate overall scroll progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / scrollHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener("scroll", handleScroll)
  }, [sections, currentSectionIndex, isPresentationMode])

  return (
    <div
      className={cn(
        "fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-opacity duration-300",
        isPresentationMode ? "opacity-100" : "opacity-0 md:opacity-100",
      )}
    >
      {/* Progress bar */}
      <div className="w-1 h-60 bg-white/10 rounded-full relative mx-auto mb-4">
        <div
          className="absolute top-0 left-0 w-full bg-primary rounded-full transition-all duration-300"
          style={{ height: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Section indicators */}
      <div className="flex flex-col items-center gap-4">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(index)}
            className="group relative flex items-center"
            aria-label={`Go to ${section.title} section`}
          >
            {/* Indicator dot */}
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                activeSection === index ? "bg-primary scale-125" : "bg-white/30 group-hover:bg-white/50",
              )}
            ></div>

            {/* Section title tooltip */}
            <span className="absolute right-full mr-3 px-2 py-1 rounded bg-background/80 backdrop-blur-sm text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {section.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

