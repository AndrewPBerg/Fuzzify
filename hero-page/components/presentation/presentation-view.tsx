"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Header from "@/components/header"
import PresentationControls from "@/components/presentation/presentation-controls"
import { cn } from "@/lib/utils"

interface Section {
  id: string
  title: string
  component: React.ReactNode
}

interface PresentationViewProps {
  title: string
  subtitle: string
  sections: Section[]
}

export default function PresentationView({ title, subtitle, sections }: PresentationViewProps) {
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Handle presentation mode toggle
  const togglePresentationMode = () => {
    if (!isPresentationMode) {
      try {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
          // Continue with presentation mode even if fullscreen fails
          setIsPresentationMode(true)
          setCurrentSectionIndex(0)
        })
      } catch (error) {
        console.error("Fullscreen API error:", error)
        // Continue with presentation mode even if fullscreen fails
        setIsPresentationMode(true)
        setCurrentSectionIndex(0)
      }
    } else {
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch((err) => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`)
          })
        }
      } catch (error) {
        console.error("Fullscreen API error:", error)
      }
      setIsPresentationMode(false)
    }
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPresentationMode) {
        setIsPresentationMode(false)
      } else if (document.fullscreenElement && !isPresentationMode) {
        setIsPresentationMode(true)
        setCurrentSectionIndex(0)
      }
    }

    try {
      document.addEventListener("fullscreenchange", handleFullscreenChange)
    } catch (error) {
      console.error("Fullscreen event listener error:", error)
    }

    return () => {
      try {
        document.removeEventListener("fullscreenchange", handleFullscreenChange)
      } catch (error) {
        console.error("Fullscreen event listener removal error:", error)
      }
    }
  }, [isPresentationMode])

  // Navigation functions
  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  // Scroll to section in normal mode
  const scrollToSection = (index: number) => {
    if (isPresentationMode) {
      setCurrentSectionIndex(index)
    } else {
      const sectionElement = document.getElementById(sections[index].id)
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  // Handle keyboard navigation in presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentationMode) return

      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        goToNextSection()
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        goToPrevSection()
      } else if (e.key === "Escape") {
        togglePresentationMode()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPresentationMode, currentSectionIndex])

  return (
    <div className={cn("w-full", isPresentationMode ? "fixed inset-0 bg-[#17345A] z-50" : "")}>
      {/* Header with navigation */}
      <Header
        title={title}
        subtitle={subtitle}
        sections={sections}
        currentSectionIndex={currentSectionIndex}
        isPresentationMode={isPresentationMode}
        onSectionClick={scrollToSection}
        onStartPresentation={togglePresentationMode}
      />

      {/* Main content */}
      <div className={cn("relative z-10", isPresentationMode ? "pt-20 h-[calc(100vh-8rem)]" : "")}>
        {isPresentationMode ? (
          // Presentation mode - show only current section
          <div className="h-full flex items-center justify-center px-6 md:px-10">
            <div className="w-full max-w-7xl animate-fade-in">{sections[currentSectionIndex].component}</div>
          </div>
        ) : (
          // Normal mode - show all sections
          <div>
            {sections.map((section, index) => (
              <div key={section.id} id={section.id} ref={(el) => (sectionRefs.current[index] = el)}>
                {section.component}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Presentation controls */}
      {isPresentationMode && (
        <PresentationControls
          currentIndex={currentSectionIndex}
          totalSlides={sections.length}
          onNext={goToNextSection}
          onPrev={goToPrevSection}
          onExit={togglePresentationMode}
        />
      )}
    </div>
  )
}

