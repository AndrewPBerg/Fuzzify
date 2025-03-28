"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface PresentationControlsProps {
  currentIndex: number
  totalSlides: number
  onNext: () => void
  onPrev: () => void
  onExit: () => void
}

export default function PresentationControls({
  currentIndex,
  totalSlides,
  onNext,
  onPrev,
  onExit,
}: PresentationControlsProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 p-2 bg-[#17345A]/90 backdrop-blur border border-white/10 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="h-8 w-8 p-0 text-white transition-all duration-300 hover:bg-white/10 disabled:opacity-30"
        aria-label="Previous slide"
        title="Previous slide"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>

      <div className="text-xs px-2 min-w-[60px] text-center text-white/80" aria-live="polite">
        {currentIndex + 1}/{totalSlides}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={currentIndex === totalSlides - 1}
        className="h-8 w-8 p-0 text-white transition-all duration-300 hover:bg-white/10 disabled:opacity-30"
        aria-label="Next slide"
        title="Next slide"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>

      <div className="w-px h-4 bg-white/20 mx-1" aria-hidden="true"></div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onExit}
        className="h-8 w-8 p-0 text-white transition-all duration-300 hover:bg-white/10 hover:text-red-400"
        aria-label="Exit presentation"
        title="Exit presentation"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Exit presentation</span>
      </Button>
    </div>
  )
}

