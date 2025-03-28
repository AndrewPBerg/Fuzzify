"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PresentationControls } from "./presentation-controls"
import { PresentationHeader } from "./presentation-header"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Section {
  id: string
  title: string
  component: React.ReactNode
}

interface PresentationProps {
  title: string
  subtitle: string
  sections: Section[]
}

export function Presentation({ title, subtitle, sections }: PresentationProps) {
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Handle presentation mode toggle
  const togglePresentationMode = () => {
    if (!isPresentationMode) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`)
        })
      }
    }
    setIsPresentationMode(!isPresentationMode)
    setCurrentSectionIndex(0)
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPresentationMode) {
        setIsPresentationMode(false)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
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
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth" })
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
    <div
      className={cn("w-full transition-all duration-500", isPresentationMode ? "fixed inset-0 bg-background z-50" : "")}
    >
      {/* Header with navigation */}
      <PresentationHeader
        title={title}
        subtitle={subtitle}
        sections={sections}
        currentSectionIndex={currentSectionIndex}
        isPresentationMode={isPresentationMode}
        onSectionClick={(index) => (isPresentationMode ? setCurrentSectionIndex(index) : scrollToSection(index))}
        onTogglePresentationMode={togglePresentationMode}
      />

      {/* Main content */}
      <div
        className={cn(
          "container mx-auto transition-all duration-500",
          isPresentationMode ? "pt-20 h-[calc(100vh-8rem)]" : "",
        )}
      >
        {isPresentationMode ? (
          // Presentation mode - show only current section
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-6xl animate-fade-in">{sections[currentSectionIndex].component}</div>
          </div>
        ) : (
          // Normal mode - show all sections
          <div className="py-10 space-y-32">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => (sectionRefs.current[index] = el)}
                className="min-h-[80vh] flex flex-col justify-center py-10"
              >
                <h2 className="text-3xl font-bold mb-10">{section.title}</h2>
                {section.component}

                {/* Scroll indicator (except for last section) */}
                {index < sections.length - 1 && (
                  <div className="flex justify-center mt-20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="animate-bounce"
                      onClick={() => scrollToSection(index + 1)}
                    >
                      <ChevronDown className="h-6 w-6" />
                      <span className="sr-only">Scroll to next section</span>
                    </Button>
                  </div>
                )}
              </section>
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

