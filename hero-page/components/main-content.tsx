"use client"

import { useState, useEffect, useRef } from "react"
import Header from "@/components/header"
import PresentationControls from "@/components/presentation-controls"
import { StoryGuide } from "@/components/presentation/story-guide"
import HeroSection from "@/components/sections/hero-section"
import AboutSection from "@/components/sections/about-section"
import TechStackSection from "@/components/sections/tech-stack-section"
import TeamSection from "@/components/sections/team-section"
import DemoSection from "@/components/sections/demo-section"
import { cn } from "@/lib/utils"

interface Section {
  id: string
  title: string
}

interface MainContentProps {
  title: string
  subtitle?: string
  sections: Section[]
}

export default function MainContent({ title, subtitle = "", sections }: MainContentProps) {
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  // Track if we need to refresh animations
  const shouldRefreshAnimations = useRef(false)

  // Handle presentation mode toggle
  const togglePresentationMode = () => {
    if (!isPresentationMode) {
      try {
        document.documentElement
          .requestFullscreen()
          .then(() => {
            setIsPresentationMode(true)
            setCurrentSectionIndex(0)
          })
          .catch((err) => {
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
      
      // Mark that we need to refresh animations
      shouldRefreshAnimations.current = true
      
      // First mark as transitioning
      setIsTransitioning(true)
      
      // After a short delay, exit presentation mode
      setTimeout(() => {
        setIsPresentationMode(false)
        
        // End transition after changing mode
        setTimeout(() => {
          setIsTransitioning(false)
        }, 300)
      }, 300)
    }
  }

  // Navigation functions with transitions
  const goToSection = (index: number) => {
    if (index === currentSectionIndex) return

    setIsTransitioning(true)

    // After a short delay, change the section
    setTimeout(() => {
      setCurrentSectionIndex(index)

      // After changing section, end transition
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }, 300)
  }

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      goToSection(currentSectionIndex + 1)
    }
  }

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      goToSection(currentSectionIndex - 1)
    }
  }

  // Scroll to section in normal mode
  const scrollToSection = (index: number) => {
    if (isPresentationMode) {
      goToSection(index)
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
      if (!isPresentationMode || isTransitioning) return

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
  }, [isPresentationMode, currentSectionIndex, isTransitioning])

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPresentationMode) {
        // If exiting fullscreen outside our toggle function, ensure we properly exit presentation mode
        shouldRefreshAnimations.current = true
        setIsTransitioning(true)
        
        setTimeout(() => {
          setIsPresentationMode(false)
          
          setTimeout(() => {
            setIsTransitioning(false)
          }, 300)
        }, 300)
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

  // Effect to handle refreshing animations after exiting presentation mode
  useEffect(() => {
    if (!isTransitioning && !isPresentationMode && shouldRefreshAnimations.current) {
      shouldRefreshAnimations.current = false
      
      // Force a reflow to trigger animations
      if (contentRef.current) {
        // Dispatch a custom event that section components can listen for
        const refreshEvent = new CustomEvent('refreshAnimations')
        window.dispatchEvent(refreshEvent)
        
        // Add a class momentarily to force reflow
        contentRef.current.classList.add('animation-refresh')
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.classList.remove('animation-refresh')
          }
        }, 50)
      }
    }
  }, [isPresentationMode, isTransitioning])

  // Map sections to components
  const sectionComponents = [
    <HeroSection key="hero" id="hero" />,
    <AboutSection key="about" id="about" />,
    <TechStackSection key="tech-stack" id="tech-stack" />,
    <TeamSection key="team" id="team" />,
    <DemoSection key="demo" id="demo" />,
  ]

  return (
    <>
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
      <div 
        ref={contentRef} 
        className={cn(
          "relative z-10", 
          isPresentationMode ? "pt-16 sm:pt-20 h-screen sm:h-[calc(100vh-8rem)]" : ""
        )}
      >
        {isPresentationMode ? (
          // Presentation mode - show only current section
          <div className="h-full flex items-center justify-center px-4 sm:px-6 md:px-10">
            <div
              className={cn(
                "w-full max-w-7xl transition-all duration-600",
                isTransitioning ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100",
              )}
            >
              {sectionComponents[currentSectionIndex]}
            </div>
          </div>
        ) : (
          // Normal mode - show all sections
          <div 
            className={cn(
              "transition-opacity duration-300",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}
            style={{ willChange: 'opacity, transform' }}
          >
            {sectionComponents}
            
            {/* Mobile navigation dots */}
            <div className="fixed bottom-4 left-0 right-0 flex justify-center z-30 md:hidden">
              <div className="flex gap-2 bg-[#17345A]/80 backdrop-blur-md py-2 px-4 rounded-full">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(index)}
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: currentSectionIndex === index 
                        ? 'rgba(255, 255, 255, 0.9)' 
                        : 'rgba(255, 255, 255, 0.3)'
                    }}
                    aria-label={`Go to ${section.title} section`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Presentation controls */}
      {isPresentationMode && (
        <PresentationControls
          currentIndex={currentSectionIndex}
          totalSlides={sections.length}
          onPrev={goToPrevSection}
          onNext={goToNextSection}
          onExit={togglePresentationMode}
        />
      )}
    </>
  )
}

