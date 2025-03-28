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

export function PresentationControls({ currentIndex, totalSlides, onNext, onPrev, onExit }: PresentationControlsProps) {
  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-1 p-2 bg-[#17345A]/90 backdrop-blur border border-white/10 rounded-lg shadow-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="h-8 w-8 p-0 text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>

      <div className="text-xs px-2 min-w-[60px] text-center text-white/80">
        {currentIndex + 1}/{totalSlides}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={currentIndex === totalSlides - 1}
        className="h-8 w-8 p-0 text-white"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>

      <div className="w-px h-4 bg-white/20 mx-1"></div>

      <Button variant="ghost" size="sm" onClick={onExit} className="h-8 w-8 p-0 text-white">
        <X className="h-4 w-4" />
        <span className="sr-only">Exit presentation</span>
      </Button>
    </div>
  )
}

