"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface StoryGuideProps {
  currentSectionIndex: number
  isPresentationMode: boolean
}

export function StoryGuide({ currentSectionIndex, isPresentationMode }: StoryGuideProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState("")

  // Story messages for each section
  const storyMessages = [
    "Welcome to DNS Fuzzing - discover how we protect your digital identity",
    "Learn about our advanced security tools and why they matter",
    "Built with cutting-edge technologies for performance and reliability",
    "Meet our team of security experts dedicated to your protection",
    "See DNS Fuzzing in action and try it for yourself",
  ]

  useEffect(() => {
    if (!isPresentationMode) return

    // Show story guide when section changes
    setIsVisible(false)

    setTimeout(() => {
      setMessage(storyMessages[currentSectionIndex])
      setIsVisible(true)

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 5000)

      return () => clearTimeout(timer)
    }, 500)
  }, [currentSectionIndex, isPresentationMode])

  if (!isPresentationMode) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-40 max-w-xs bg-background/80 backdrop-blur-md rounded-lg border border-white/10 p-4 shadow-lg transition-all duration-500",
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-10 pointer-events-none",
      )}
    >
      <div className="flex items-start gap-3">
        <ChevronRight className="h-5 w-5 text-primary mt-0.5 animate-pulse" />
        <p className="text-sm text-white/90">{message}</p>
      </div>

      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={cn("h-full bg-primary rounded-full animate-progress", isVisible ? "w-0" : "w-0")}></div>
      </div>
    </div>
  )
}

